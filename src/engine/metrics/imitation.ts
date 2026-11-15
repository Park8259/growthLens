// 동작 모방 — Pose 랜드마크로 팔 들기·박수를 검출합니다.
// stimulusTimestamp(ms) 이후 아이가 모방 동작을 하면 지연 시간을 반환합니다.

import type { AnalysisResult } from "../../types/analysis";
import { extractPoseLandmarks, identifyPersons, LM, type Landmark } from "../pose";
import { measureAmbient } from "./ambient";

const WINDOW_SEC = 15;       // 감시 창
const HOLD_SEC = 0.3;        // 팔 들기: 연속 유지 최소 시간
const CLAP_WINDOW_SEC = 1;   // 박수: 1초 내 접근-분리 2회 이상
const MIN_VIS = 0.5;         // 랜드마크 최소 visibility

/** 어깨 너비 (normalized). 양쪽 중 하나라도 visibility < MIN_VIS면 null */
function shoulderWidth(lm: Landmark[]): number | null {
  const ls = lm[LM.L_SHOULDER];
  const rs = lm[LM.R_SHOULDER];
  if (ls[3] < MIN_VIS || rs[3] < MIN_VIS) return null;
  return Math.abs(rs[0] - ls[0]);
}

/** 팔 들기 판정 (한쪽이라도 만족하면 true) */
function isArmRaised(lm: Landmark[]): boolean {
  const check = (
    shoulder: Landmark, elbow: Landmark, wrist: Landmark
  ): boolean => {
    if (shoulder[3] < MIN_VIS || elbow[3] < MIN_VIS || wrist[3] < MIN_VIS) return false;
    // 이미지 y는 아래 방향. 손목이 팔꿈치보다 위(y가 작음), 팔꿈치가 어깨 근처 이상
    const wristAboveElbow = wrist[1] < elbow[1] - 0.02;
    const elbowNearShoulder = elbow[1] < shoulder[1] + 0.05;
    // 팔꿈치-어깨 벡터와 수직(y축) 사이 각도 ≥ 30도
    const dx = elbow[0] - shoulder[0];
    const dy = elbow[1] - shoulder[1]; // 보통 음수(위쪽)
    const angleDeg = Math.abs(Math.atan2(Math.abs(dx), Math.abs(dy)) * (180 / Math.PI));
    return wristAboveElbow && elbowNearShoulder && angleDeg >= 30;
  };
  return (
    check(lm[LM.L_SHOULDER], lm[LM.L_ELBOW], lm[LM.L_WRIST]) ||
    check(lm[LM.R_SHOULDER], lm[LM.R_ELBOW], lm[LM.R_WRIST])
  );
}

/** 두 손목 사이 거리 / 어깨 너비 < 0.35 이면 손이 가까운 상태 */
function handsClose(lm: Landmark[]): boolean {
  const lw = lm[LM.L_WRIST];
  const rw = lm[LM.R_WRIST];
  if (lw[3] < MIN_VIS || rw[3] < MIN_VIS) return false;
  const sw = shoulderWidth(lm) ?? 0.3;
  const dist = Math.sqrt((lw[0] - rw[0]) ** 2 + (lw[1] - rw[1]) ** 2);
  return dist / sw < 0.35;
}

/** 상반신 평균 visibility (무효 판정용) */
function torsoVisibility(lm: Landmark[]): number {
  const idxs = [LM.L_SHOULDER, LM.R_SHOULDER, LM.L_ELBOW, LM.R_ELBOW, LM.L_WRIST, LM.R_WRIST];
  return idxs.reduce((s, i) => s + lm[i][3], 0) / idxs.length;
}

export async function analyzeImitation(
  videoBlob: Blob,
  stimulusTimestamp: number  // ms, 녹화 시작 기준
): Promise<AnalysisResult> {
  const [track, ambient] = await Promise.all([
    extractPoseLandmarks(videoBlob),
    measureAmbient(videoBlob),
  ]);

  const { fps, frames } = track;
  const windowStart = stimulusTimestamp / 1000;
  const windowEnd = windowStart + WINDOW_SEC;

  const windowFrames = frames
    .filter((f) => f.t >= windowStart && f.t < windowEnd)
    .map((f) => ({ t: f.t, lm: identifyPersons(f).child }));

  // 무효: 아이 상반신 visibility 낮음
  const validFrames = windowFrames.filter((f) => f.lm && torsoVisibility(f.lm) >= MIN_VIS);
  if (validFrames.length / Math.max(1, windowFrames.length) < 0.5) {
    return { status: "retry_needed", retryReason: "아이 몸이 충분히 보이지 않았습니다" };
  }

  const holdFrames = Math.round(HOLD_SEC * fps);

  // 팔 들기 감지 — holdFrames 이상 연속 유지
  let armRun = 0;
  for (const { t, lm } of windowFrames) {
    if (lm && isArmRaised(lm)) {
      armRun++;
      if (armRun >= holdFrames) {
        const latencySec = t - holdFrames / fps - windowStart;
        return {
          status: "success",
          metric: {
            value: Math.round(Math.max(0, latencySec) * 100) / 100,
            unit: "seconds",
            label: "모방까지의 지연",
          },
          ambient,
          detail: { imitated: true, attempts: 1, actionType: "arm_raise" },
        };
      }
    } else {
      armRun = 0;
    }
  }

  // 박수 감지 — 1초 창 내 close→open 전환 2회 이상
  const clapWin = Math.round(CLAP_WINDOW_SEC * fps);
  const closeSeq = windowFrames.map((f) => (f.lm ? handsClose(f.lm) : false));

  for (let i = clapWin; i < closeSeq.length; i++) {
    const slice = closeSeq.slice(i - clapWin, i);
    let transitions = 0;
    for (let j = 1; j < slice.length; j++) {
      if (!slice[j - 1] && slice[j]) transitions++;
    }
    if (transitions >= 2) {
      const t = windowFrames[i].t;
      const latencySec = t - CLAP_WINDOW_SEC - windowStart;
      return {
        status: "success",
        metric: {
          value: Math.round(Math.max(0, latencySec) * 100) / 100,
          unit: "seconds",
          label: "모방까지의 지연",
        },
        ambient,
        detail: { imitated: true, attempts: 1, actionType: "clap" },
      };
    }
  }

  // 감지 실패
  return {
    status: "success",
    metric: { value: WINDOW_SEC, unit: "seconds", label: "모방까지의 지연" },
    ambient,
    detail: { imitated: false, attempts: 1 },
  };
}
