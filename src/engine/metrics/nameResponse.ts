// 호명반응 — FaceLandmarker의 yaw로 고개 돌림을 감지합니다.
// stimulusTimestamp(ms, 녹화 시작 기준) 이후 10초 내에
// yaw 변화량 > 25도 AND 각속도 > 30도/초이면 반응으로 인정합니다.

import type { AnalysisResult, FaceTrace } from "../../types/analysis";
import { extractFaceLandmarks, type FaceFrame } from "../face";

const WINDOW_SEC = 10;      // 각 시도별 감시 창
const YAW_DELTA_DEG = 25;   // 반응 판정 최소 변화량(도)
const YAW_VEL_DEG_S = 30;   // 반응 판정 최소 각속도(도/초)
const RETRY_SEC = 5;        // 반응 없을 때 재시도 간격(초)
const MAX_ATTEMPTS = 3;
const MIN_DETECT_RATIO = 0.7; // 감시 창 내 얼굴 검출 비율 최소값

export async function analyzeNameResponse(
  videoBlob: Blob,
  stimulusTimestamp: number  // ms, 녹화 시작 기준
): Promise<AnalysisResult> {
  const track = await extractFaceLandmarks(videoBlob);
  const { frames } = track;

  // 무효: 얼굴 전체 검출율 < 70%
  const totalDetected = frames.filter((f) => f.detected).length;
  if (totalDetected / frames.length < MIN_DETECT_RATIO) {
    return {
      status: "retry_needed",
      retryReason: "아이 얼굴이 충분히 보이지 않았습니다",
    };
  }

  const t0BaseSec = stimulusTimestamp / 1000;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const windowStart = t0BaseSec + attempt * RETRY_SEC;
    const windowEnd = windowStart + WINDOW_SEC;

    // 감시 창 내 프레임 필터
    const windowFrames = frames.filter(
      (f) => f.t >= windowStart && f.t < windowEnd && f.yaw !== null
    );
    if (windowFrames.length === 0) continue;

    const detectedInWindow = windowFrames.filter((f) => f.detected).length;
    if (detectedInWindow / windowFrames.length < MIN_DETECT_RATIO) continue;

    // 기준 yaw: 창 시작 직후 첫 유효 프레임
    const refYaw = windowFrames[0].yaw!;

    for (let i = 1; i < windowFrames.length; i++) {
      const cur = windowFrames[i];
      const prev = windowFrames[i - 1];
      if (cur.yaw === null || prev.yaw === null) continue;

      const delta = Math.abs(cur.yaw - refYaw);
      const dt = cur.t - prev.t;
      const vel = dt > 0 ? Math.abs(cur.yaw - prev.yaw) / dt : 0;

      if (delta >= YAW_DELTA_DEG && vel >= YAW_VEL_DEG_S) {
        const latencySec = cur.t - windowStart;
        return {
          status: "success",
          metric: {
            value: Math.round(latencySec * 100) / 100,
            unit: "seconds",
            label: "호명 후 반응 지연",
          },
          detail: {
            responded: true,
            attempts: attempt + 1,
            yawDeltaDeg: Math.round(delta * 10) / 10,
          },
          trace: toTrace(frames, t0BaseSec, cur.t),
        };
      }
    }
  }

  // 최대 시도 후 반응 없음
  return {
    status: "success",
    metric: {
      value: RETRY_SEC * MAX_ATTEMPTS,
      unit: "seconds",
      label: "호명 후 반응 지연",
    },
    detail: {
      responded: false,
      attempts: MAX_ATTEMPTS,
    },
    trace: toTrace(frames, t0BaseSec, null),
  };
}

/** 결과 화면 다시 보기용 좌표 (측정에는 쓰지 않음) */
function toTrace(frames: FaceFrame[], stimulusSec: number, responseSec: number | null): FaceTrace {
  return {
    kind: "face",
    frames: frames.map((f) => ({ t: f.t, yaw: f.yaw, pts: f.pts })),
    stimulusSec,
    responseSec,
  };
}
