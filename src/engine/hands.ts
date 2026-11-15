// MediaPipe Hands 연동 — 녹화 영상에서 손 랜드마크 추출 (브라우저 전용)
// 지표 판정(집기 횟수 등)은 metrics/ 에서 이 결과를 받아 처리합니다.

import {
  FilesetResolver,
  HandLandmarker,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import { forEachVideoFrame, type VideoInfo } from "./video";

const WASM_PATH = "/mediapipe/wasm";
export const HAND_MODEL = "hand_landmarker";
const MODEL_PATH = `/models/${HAND_MODEL}.task`;
export const DEFAULT_HAND_FPS = 15;

/** 손 랜드마크 번호 (MediaPipe Hands 기준, 21개) */
export const HLM = {
  WRIST: 0,
  THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
  INDEX_MCP: 5, INDEX_PIP: 6, INDEX_DIP: 7, INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_DIP: 11, MIDDLE_TIP: 12,
  RING_MCP: 13, RING_PIP: 14, RING_DIP: 15, RING_TIP: 16,
  PINKY_MCP: 17, PINKY_PIP: 18, PINKY_DIP: 19, PINKY_TIP: 20,
} as const;

/** 손 랜드마크 하나: [x, y, z] (비율 좌표, visibility 없음) */
export type HandLandmark = [number, number, number];

export interface HandFrame {
  t: number;
  hands: { lm: HandLandmark[]; handedness: "Left" | "Right" }[] | null;
}

export interface HandTrack extends VideoInfo {
  model: string;
  fps: number;
  frames: HandFrame[];
}

let landmarkerPromise: Promise<HandLandmarker> | null = null;
let lastTimestampMs = 0;

function getHandLandmarker(): Promise<HandLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
      const create = (delegate: "GPU" | "CPU") =>
        HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_PATH, delegate },
          runningMode: "VIDEO",
          numHands: 2,
        });
      try {
        return await create("GPU");
      } catch {
        return await create("CPU");
      }
    })();
    landmarkerPromise.catch(() => {
      landmarkerPromise = null;
    });
  }
  return landmarkerPromise;
}

const r4 = (n: number) => Math.round(n * 10000) / 10000;

function toHandFrame(
  t: number,
  landmarks: NormalizedLandmark[][],
  handednesses: { categoryName: string }[][]
): HandFrame {
  if (landmarks.length === 0) return { t: r4(t), hands: null };
  return {
    t: r4(t),
    hands: landmarks.map((lms, i) => ({
      lm: lms.map((p) => [r4(p.x), r4(p.y), r4(p.z)]),
      handedness: (handednesses[i]?.[0]?.categoryName === "Right" ? "Right" : "Left"),
    })),
  };
}

export async function extractHandLandmarks(
  videoBlob: Blob,
  options: { fps?: number; onProgress?: (ratio: number) => void } = {}
): Promise<HandTrack> {
  const fps = options.fps ?? DEFAULT_HAND_FPS;
  const landmarker = await getHandLandmarker();
  const frames: HandFrame[] = [];

  const info = await forEachVideoFrame(
    videoBlob,
    fps,
    (video, t) => {
      lastTimestampMs += 1000 / fps;
      const result = landmarker.detectForVideo(video, lastTimestampMs);
      frames.push(toHandFrame(t, result.landmarks, result.handednesses));
    },
    options.onProgress
  );

  return { ...info, model: HAND_MODEL, fps, frames };
}
