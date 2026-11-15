// 공 주고받기 — ObjectDetector로 공을 추적하고 소유권 전환을 감지합니다.
// 소유권: 공 bbox와 각 사람 bbox의 IoU가 가장 큰 쪽

import { FilesetResolver, ObjectDetector } from "@mediapipe/tasks-vision";
import type { AnalysisResult } from "../../types/analysis";
import { extractPoseLandmarks, identifyPersons, type Landmark } from "../pose";
import { forEachVideoFrame } from "../video";
import { measureAmbient } from "./ambient";

const WASM_PATH = "/mediapipe/wasm";
const MODEL_PATH = "/models/efficientdet_lite0.tflite";
const DEFAULT_FPS = 15;
const BALL_CATEGORY = "sports ball";
const MIN_BALL_SCORE = 0.3;
const MIN_BALL_DETECTED_RATIO = 0.5;

type Owner = "child" | "caregiver" | "none";
type Box = { x1: number; y1: number; x2: number; y2: number };

let detectorPromise: Promise<ObjectDetector> | null = null;
let detTimestampMs = 0;

function getDetector(): Promise<ObjectDetector> {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
      const create = (delegate: "GPU" | "CPU") =>
        ObjectDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_PATH, delegate },
          runningMode: "VIDEO",
          scoreThreshold: MIN_BALL_SCORE,
          categoryAllowlist: [BALL_CATEGORY],
        });
      try { return await create("GPU"); }
      catch { return await create("CPU"); }
    })();
    detectorPromise.catch(() => { detectorPromise = null; });
  }
  return detectorPromise;
}

function personBox(lm: Landmark[]): Box | null {
  const vis = lm.filter((l) => l[3] > 0.3);
  if (vis.length === 0) return null;
  const xs = vis.map((l) => l[0]);
  const ys = vis.map((l) => l[1]);
  return { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
}

function iou(a: Box, b: Box): number {
  const ix1 = Math.max(a.x1, b.x1), iy1 = Math.max(a.y1, b.y1);
  const ix2 = Math.min(a.x2, b.x2), iy2 = Math.min(a.y2, b.y2);
  const inter = Math.max(0, ix2 - ix1) * Math.max(0, iy2 - iy1);
  if (inter === 0) return 0;
  const areaA = (a.x2 - a.x1) * (a.y2 - a.y1);
  const areaB = (b.x2 - b.x1) * (b.y2 - b.y1);
  return inter / (areaA + areaB - inter);
}

export async function analyzeBallPlay(videoBlob: Blob): Promise<AnalysisResult> {
  const [poseTrack, detector, ambient] = await Promise.all([
    extractPoseLandmarks(videoBlob),
    getDetector(),
    measureAmbient(videoBlob),
  ]);

  const { frames } = poseTrack;
  const ballBoxes: (Box | null)[] = [];

  // ObjectDetector는 별도로 순회 (Pose와 동일한 프레임 간격 사용)
  let frameIdx = 0;
  await forEachVideoFrame(videoBlob, DEFAULT_FPS, (video, _t) => {
    detTimestampMs += 1000 / DEFAULT_FPS;
    const result = detector.detectForVideo(video, detTimestampMs);
    const ball = result.detections
      .filter((d) => d.categories.some((c) => c.categoryName === BALL_CATEGORY))
      .sort((a, b) => (b.categories[0]?.score ?? 0) - (a.categories[0]?.score ?? 0))[0];

    if (ball?.boundingBox) {
      const { originX: x1, originY: y1, width, height } = ball.boundingBox;
      ballBoxes[frameIdx] = { x1, y1, x2: x1 + width, y2: y1 + height };
    } else {
      ballBoxes[frameIdx] = null;
    }
    frameIdx++;
  });

  const detectedCount = ballBoxes.filter(Boolean).length;
  const ballDetectedRatio = detectedCount / Math.max(1, ballBoxes.length);

  if (ballDetectedRatio < MIN_BALL_DETECTED_RATIO) {
    return {
      status: "retry_needed",
      retryReason: "공이 화면에 충분히 보이지 않았습니다",
    };
  }

  // 소유권 시계열
  const ownerSeq: Owner[] = frames.map((frame, i) => {
    const ball = ballBoxes[i] ?? null;
    if (!ball) return "none";
    const { child, caregiver } = identifyPersons(frame);
    const childBox = child ? personBox(child) : null;
    const careBox = caregiver ? personBox(caregiver) : null;
    const childIoU = childBox ? iou(ball, childBox) : 0;
    const careIoU = careBox ? iou(ball, careBox) : 0;
    if (childIoU === 0 && careIoU === 0) return "none";
    return childIoU >= careIoU ? "child" : "caregiver";
  });

  // 소유권 전환 감지: child → caregiver (유효 상호작용)
  let transferCount = 0;
  let totalTransferSec = 0;
  let childStart: number | null = null;
  let prevOwner: Owner = "none";

  for (let i = 0; i < ownerSeq.length; i++) {
    const owner = ownerSeq[i];
    if (owner === "child" && prevOwner !== "child") {
      childStart = frames[i].t;
    } else if (owner === "caregiver" && prevOwner === "child" && childStart !== null) {
      transferCount++;
      totalTransferSec += frames[i].t - childStart;
      childStart = null;
    }
    prevOwner = owner;
  }

  const avgTransferSec =
    transferCount > 0 ? Math.round((totalTransferSec / transferCount) * 100) / 100 : undefined;

  return {
    status: "success",
    metric: {
      value: transferCount,
      unit: "count",
      label: "주고받은 횟수",
    },
    ambient,
    detail: {
      transferred: transferCount > 0,
      ...(avgTransferSec !== undefined ? { transferTimeSec: avgTransferSec } : {}),
      transferCount,
      ballDetectedRatio: Math.round(ballDetectedRatio * 100) / 100,
    },
  };
}
