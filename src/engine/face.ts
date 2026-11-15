// MediaPipe FaceLandmarker — 머리 방향(yaw) 추출 (브라우저 전용)
// nameResponse 과제에서 호명 후 고개 돌림 감지에 사용합니다.

import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import { forEachVideoFrame, type VideoInfo } from "./video";

const WASM_PATH = "/mediapipe/wasm";
const MODEL_PATH = "/models/face_landmarker.task";
export const DEFAULT_FACE_FPS = 15;

export interface FaceFrame {
  t: number;
  /** 머리 좌우 각도(도). 양수 = 오른쪽, 음수 = 왼쪽. 얼굴 미검출 시 null */
  yaw: number | null;
  detected: boolean;
}

export interface FaceTrack extends VideoInfo {
  fps: number;
  frames: FaceFrame[];
}

let faceLandmarkerPromise: Promise<FaceLandmarker> | null = null;
let faceTimestampMs = 0;

function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (!faceLandmarkerPromise) {
    faceLandmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
      const create = (delegate: "GPU" | "CPU") =>
        FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_PATH, delegate },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFacialTransformationMatrixes: true,
        });
      try { return await create("GPU"); }
      catch { return await create("CPU"); }
    })();
    faceLandmarkerPromise.catch(() => { faceLandmarkerPromise = null; });
  }
  return faceLandmarkerPromise;
}

/**
 * 4×4 열 우선(column-major) 변환 행렬에서 yaw(Y축 회전) 추출.
 * ZYX Euler: sin(yaw) = R[0][2] = data[8] (column-major에서 col=2, row=0)
 */
function extractYaw(data: ArrayLike<number>): number {
  const sinYaw = Math.max(-1, Math.min(1, data[8]));
  return Math.asin(sinYaw) * (180 / Math.PI);
}

export async function extractFaceLandmarks(
  videoBlob: Blob,
  options: { fps?: number; onProgress?: (ratio: number) => void } = {}
): Promise<FaceTrack> {
  const fps = options.fps ?? DEFAULT_FACE_FPS;
  const landmarker = await getFaceLandmarker();
  const frames: FaceFrame[] = [];

  const info = await forEachVideoFrame(videoBlob, fps, (video, t) => {
    faceTimestampMs += 1000 / fps;
    const result = landmarker.detectForVideo(video, faceTimestampMs);
    const matrix = result.facialTransformationMatrixes?.[0];
    frames.push({
      t: Math.round(t * 10000) / 10000,
      yaw: matrix ? extractYaw(matrix.data) : null,
      detected: result.faceLandmarks.length > 0,
    });
  }, options.onProgress);

  return { ...info, fps, frames };
}
