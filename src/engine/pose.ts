// MediaPipe Pose 연동 — 녹화 영상에서 관절 좌표 추출 (브라우저 전용)
// 지표 판정은 metrics/ 에서 이 결과를 받아 처리합니다.

import {
  FilesetResolver,
  PoseLandmarker,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import { forEachVideoFrame, type VideoInfo } from "./video";

const WASM_PATH = "/mediapipe/wasm";
export const POSE_MODEL = "pose_landmarker_full";
const MODEL_PATH = `/models/${POSE_MODEL}.task`;

export const DEFAULT_POSE_FPS = 15;

/** [x, y, z, visibility]  x·y: 0~1 비율, 왼쪽위=(0,0) */
export type Landmark = [number, number, number, number];

/** 프레임 하나. poses[0]=아이(작은 bbox), poses[1]=보호자(큰 bbox). 1인이면 길이 1 */
export interface PoseFrame {
  t: number;
  poses: Landmark[][];
}

export interface PoseTrack extends VideoInfo {
  model: string;
  fps: number;
  frames: PoseFrame[];
}

/** identifyPersons 반환 타입 */
export interface PersonPoses {
  child: Landmark[] | null;
  caregiver: Landmark[] | null;
}

/** 자주 쓰는 관절 번호 (MediaPipe Pose 기준, 왼쪽 = 아이 기준 왼쪽) */
export const LM = {
  NOSE: 0,
  L_EAR: 7,
  R_EAR: 8,
  L_SHOULDER: 11,
  R_SHOULDER: 12,
  L_ELBOW: 13,
  R_ELBOW: 14,
  L_WRIST: 15,
  R_WRIST: 16,
  L_HIP: 23,
  R_HIP: 24,
  L_KNEE: 25,
  R_KNEE: 26,
  L_ANKLE: 27,
  R_ANKLE: 28,
} as const;

let landmarkerPromise: Promise<PoseLandmarker> | null = null;
let lastTimestampMs = 0;

function getPoseLandmarker(): Promise<PoseLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
      const create = (delegate: "GPU" | "CPU") =>
        PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_PATH, delegate },
          runningMode: "VIDEO",
          numPoses: 2,
        });
      try {
        return await create("GPU");
      } catch {
        return await create("CPU");
      }
    })();
    landmarkerPromise.catch(() => { landmarkerPromise = null; });
  }
  return landmarkerPromise;
}

const r4 = (n: number) => Math.round(n * 10000) / 10000;

function toLandmarkArray(lms: NormalizedLandmark[]): Landmark[] {
  return lms.map((p) => [r4(p.x), r4(p.y), r4(p.z), r4(p.visibility ?? 0)]);
}

/** visibility > 0.3 인 랜드마크 기준 바운딩박스 세로 길이 */
function bboxHeight(lm: Landmark[]): number {
  const ys = lm.filter((l) => l[3] > 0.3).map((l) => l[1]);
  if (ys.length === 0) return 0;
  return Math.max(...ys) - Math.min(...ys);
}

/**
 * 프레임 내 poses를 아이·보호자로 분류합니다.
 * 바운딩박스 높이가 큰 쪽이 보호자(어른), 작은 쪽이 아이입니다.
 */
export function identifyPersons(frame: PoseFrame): PersonPoses {
  if (frame.poses.length === 0) return { child: null, caregiver: null };
  if (frame.poses.length === 1) return { child: frame.poses[0], caregiver: null };
  const [a, b] = frame.poses;
  if (bboxHeight(a) <= bboxHeight(b)) {
    return { child: a, caregiver: b };
  }
  return { child: b, caregiver: a };
}

/** 녹화 영상 → 프레임별 관절 좌표 (최대 2인) */
export async function extractPoseLandmarks(
  videoBlob: Blob,
  options: { fps?: number; onProgress?: (ratio: number) => void } = {}
): Promise<PoseTrack> {
  const fps = options.fps ?? DEFAULT_POSE_FPS;
  const landmarker = await getPoseLandmarker();
  const frames: PoseFrame[] = [];

  const info = await forEachVideoFrame(
    videoBlob,
    fps,
    (video, t) => {
      lastTimestampMs += 1000 / fps;
      const result = landmarker.detectForVideo(video, lastTimestampMs);
      frames.push({
        t: r4(t),
        poses: result.landmarks.map(toLandmarkArray),
      });
    },
    options.onProgress
  );

  return { ...info, model: POSE_MODEL, fps, frames };
}
