// MediaPipe Pose 연동 — 녹화 영상에서 관절 좌표 추출 (브라우저 전용)
// 지표 판정(서기 시간 등)은 metrics/ 에서 이 결과를 받아 처리합니다.

import {
  FilesetResolver,
  PoseLandmarker,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import { forEachVideoFrame, type VideoInfo } from "./video";

const WASM_PATH = "/mediapipe/wasm"; // npm install 때 public/mediapipe/wasm 으로 복사됨
export const POSE_MODEL = "pose_landmarker_full";
const MODEL_PATH = `/models/${POSE_MODEL}.task`; // public/models/

/** 기본 추출 간격. 개인 프로젝트 검증(영상 9개)에서 쓴 값 */
export const DEFAULT_POSE_FPS = 15;

/** 관절 하나: [x, y, z, visibility]
 *  x, y: 화면 비율(0~1), 왼쪽 위가 (0,0)
 *  z: 골반 중심 기준 깊이(작을수록 카메라에 가까움)
 *  visibility: 0~1, 낮으면 가려져서 추정한 값 */
export type Landmark = [number, number, number, number];

/** 프레임 하나 */
export interface PoseFrame {
  t: number; // 영상 안에서의 시각(초)
  lm: Landmark[] | null; // 관절 33개, 사람이 없으면 null
}

/** 영상 하나의 추출 결과 */
export interface PoseTrack extends VideoInfo {
  model: string; // 사용한 MediaPipe 모델
  fps: number; // 추출 간격
  frames: PoseFrame[]; // 시간순
}

/** 자주 쓰는 관절 번호 (MediaPipe Pose 기준, 왼쪽 = 아이 기준 왼쪽) */
export const LM = {
  NOSE: 0,
  L_SHOULDER: 11,
  R_SHOULDER: 12,
  L_ELBOW: 13,
  R_ELBOW: 14,
  L_WRIST: 15,
  R_WRIST: 16,
  L_INDEX: 19,
  R_INDEX: 20,
  L_HIP: 23,
  R_HIP: 24,
  L_KNEE: 25,
  R_KNEE: 26,
  L_ANKLE: 27,
  R_ANKLE: 28,
  L_HEEL: 29,
  R_HEEL: 30,
  L_FOOT: 31,
  R_FOOT: 32,
} as const;

// 모델은 한 번만 불러와서 재사용합니다.
let landmarkerPromise: Promise<PoseLandmarker> | null = null;
// VIDEO 모드는 같은 모델에 넘기는 시각(ms)이 계속 커져야 해서, 영상이 바뀌어도 이어서 셉니다.
let lastTimestampMs = 0;

/** VIDEO 모드 모델 생성. GPU가 안 되는 PC는 CPU로 대체 */
function getPoseLandmarker(): Promise<PoseLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
      const create = (delegate: "GPU" | "CPU") =>
        PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_PATH, delegate },
          runningMode: "VIDEO",
          numPoses: 1,
        });
      try {
        return await create("GPU");
      } catch {
        return await create("CPU");
      }
    })();
    // 실패하면 다음 호출 때 다시 시도
    landmarkerPromise.catch(() => {
      landmarkerPromise = null;
    });
  }
  return landmarkerPromise;
}

const r4 = (n: number) => Math.round(n * 10000) / 10000; // 소수 4자리

function toPoseFrame(t: number, pose: NormalizedLandmark[] | undefined): PoseFrame {
  return {
    t: r4(t),
    lm: pose
      ? pose.map((p) => [r4(p.x), r4(p.y), r4(p.z), r4(p.visibility ?? 0)])
      : null,
  };
}

/** 녹화 영상 → 프레임별 관절 좌표 */
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
      frames.push(toPoseFrame(t, result.landmarks[0]));
    },
    options.onProgress
  );

  return { ...info, model: POSE_MODEL, fps, frames };
}
