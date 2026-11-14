// 대근육 지표: 독립 서기 유지 시간
// 흐름: 프레임 좌표 → 서기 여부(프레임별) → 0.6초 다듬기 → 서기 구간 → 가장 긴 구간(초)
//
// 판정 규칙과 기준값은 개인 프로토타입에서 실제 아기 영상 9개로 조정한 값입니다.
// 전제: 카메라가 아이와 비슷한 높이에서, 전신이 나오게 촬영
// 한계: 가구나 사람을 잡고 선 것도 서기로 셉니다 (지지물 감지는 아직 없음)

import type { AnalysisResult } from "../../types/analysis";
import { extractPoseLandmarks, LM, type PoseFrame } from "../pose";
import { angleAt, dist, mid, tiltFromUp, toPx, type Pt } from "../geometry";

/** 판정 기준값. 길이 기준은 모두 '몸통 길이(어깨 중점~골반 중점)' 대비 비율 */
export const STANDING_THRESHOLDS = {
  minVisibility: 0.5, // 이보다 낮은 관절은 계산에서 제외
  standMaxTilt: 35, // 상체 기울기(°) 한계
  standAnkleBelowHip: 0.7, // 발목이 골반보다 몸통 길이의 70% 이상 아래
  standAnkleBelowHipNoKnee: 1.0, // 무릎이 안 보일 때는 더 엄격하게. 서기 ≈ 1.4(프로토타입 실측),
  //   1.0은 앉은 자세를 거르기 위한 추정값 — 실제 영상으로 확인 필요
  standKneeAngle: 140, // 무릎이 거의 펴짐(°)
  smoothWindowSec: 0.6, // 이 시간 안에서 가장 많이 나온 상태로 다듬기 (깜빡임 제거)
  bridgeGapSec: 0.5, // 서기 구간 사이에 이보다 짧게 끊기면 하나로 이어 봄
  maxFrameGapSec: 0.5, // 프레임 간격이 이보다 크면 시간을 세지 않음
};
export type StandingThresholds = typeof STANDING_THRESHOLDS;

/** 프레임 하나의 상태 */
export type FrameState = "standing" | "not_standing" | "unknown";

export interface StandingSummary {
  longestSec: number; // 가장 길게 이어진 서기 시간 = 지표값
  totalSec: number; // 서기 시간 합계
  analyzedSec: number; // 판정 가능했던 시간
  unknownRatio: number; // 판정 불가 비율 (0~1)
  segments: { start: number; end: number; duration: number }[]; // 서기 구간
}

/** 프레임 하나 → 서기 여부. 어깨·골반이 안 보이거나 다리가 화면 밖이면 unknown */
export function classifyFrame(
  lm: PoseFrame["lm"],
  width: number,
  height: number,
  th: StandingThresholds = STANDING_THRESHOLDS
): FrameState {
  if (!lm) return "unknown";
  const P = (i: number) => toPx(lm, i, width, height, th.minVisibility);

  // 몸통 = 어깨~골반. 골반이 양쪽 다 보이면 양쪽 중점끼리,
  // 한쪽만 보이면(옆 촬영) 같은 쪽 어깨와 짝지어 재야 길이가 왜곡되지 않음.
  // 같은 쪽 어깨가 가려졌으면(팔 등) 보이는 어깨로 대신함 — 판정 불가로 버리지 않기 위해
  const lHip = P(LM.L_HIP);
  const rHip = P(LM.R_HIP);
  const lSh = P(LM.L_SHOULDER);
  const rSh = P(LM.R_SHOULDER);
  let hip: Pt | null = null;
  let shoulder: Pt | null = null;
  if (lHip && rHip) {
    hip = mid(lHip, rHip);
    shoulder = mid(lSh, rSh);
  } else if (lHip || rHip) {
    hip = lHip ?? rHip;
    shoulder = (lHip ? lSh : rSh) ?? mid(lSh, rSh);
  }
  if (!shoulder || !hip) return "unknown";
  const torso = dist(shoulder, hip);
  if (torso < 1) return "unknown";

  // 다리는 더 잘 보이는 쪽 하나만 사용 (옆에서 찍으면 반대쪽 다리가 가려짐)
  const leg = (h: number, k: number, a: number) => ({ hip: P(h), knee: P(k), ankle: P(a) });
  const left = leg(LM.L_HIP, LM.L_KNEE, LM.L_ANKLE);
  const right = leg(LM.R_HIP, LM.R_KNEE, LM.R_ANKLE);
  const score = (s: typeof left) => (s.hip?.v ?? 0) + (s.knee?.v ?? 0) + (s.ankle?.v ?? 0);
  const best = score(left) >= score(right) ? left : right;

  const anyLeg = [LM.L_KNEE, LM.R_KNEE, LM.L_ANKLE, LM.R_ANKLE].some((i) => P(i) !== null);
  if (!anyLeg) return "unknown"; // 다리가 화면 밖이면 서기인지 알 수 없음

  const tilt = tiltFromUp(hip, shoulder);
  const ankleBelowHip = best.ankle ? (best.ankle.y - hip.y) / torso : null;
  // 무릎 각도는 같은 쪽 골반으로 재고, 그쪽 골반이 가려졌으면 몸통 계산에 쓴 골반으로 대신함
  // (무릎·발목이 보이는데 골반 하나 때문에 각도를 못 재는 경우 방지)
  const legHip = best.hip ?? hip;
  const kneeAngle = best.knee && best.ankle ? angleAt(legHip, best.knee, best.ankle) : null;

  // 무릎이 보이면 무릎이 펴졌는지 확인, 안 보이면(옆 촬영으로 가려짐) 발목 높이를 더 엄격하게 봄
  const legStraight =
    kneeAngle !== null
      ? kneeAngle >= th.standKneeAngle && ankleBelowHip !== null && ankleBelowHip >= th.standAnkleBelowHip
      : ankleBelowHip !== null && ankleBelowHip >= th.standAnkleBelowHipNoKnee;
  return tilt <= th.standMaxTilt && legStraight ? "standing" : "not_standing";
}

/** 각 프레임을 앞뒤 windowSec 안에서 가장 많이 나온 상태로 바꿈 */
export function smooth(times: number[], states: FrameState[], windowSec: number): FrameState[] {
  const half = windowSec / 2;
  let lo = 0;
  let hi = 0;
  return states.map((state, i) => {
    while (times[lo] < times[i] - half) lo++;
    while (hi < times.length && times[hi] <= times[i] + half) hi++;
    const counts = new Map<FrameState, number>();
    for (let j = lo; j < hi; j++) counts.set(states[j], (counts.get(states[j]) ?? 0) + 1);
    let best = state; // 동률이면 원래 상태 유지
    for (const [s, c] of counts) if (c > (counts.get(best) ?? 0)) best = s;
    return best;
  });
}

/** 좌표 기록 → 서기 요약. 영상 처리 없이 좌표만으로 계산하므로 테스트하기 쉽습니다. */
export function measureStanding(
  track: { width: number; height: number; frames: PoseFrame[] },
  th: StandingThresholds = STANDING_THRESHOLDS
): StandingSummary {
  const { frames, width, height } = track;
  const times = frames.map((f) => f.t);
  const states = smooth(
    times,
    frames.map((f) => classifyFrame(f.lm, width, height, th)),
    th.smoothWindowSec
  );

  // 프레임마다 다음 프레임까지의 시간을 그 프레임 상태의 시간으로 셈
  const segments: StandingSummary["segments"] = [];
  let totalSec = 0;
  let analyzedSec = 0;
  let unknownSec = 0;
  for (let i = 0; i < frames.length - 1; i++) {
    const dt = times[i + 1] - times[i];
    if (dt <= 0) continue;
    if (dt > th.maxFrameGapSec) {
      unknownSec += dt; // 프레임이 끊긴 구간은 판정 불가로 셈 (품질 비율에 반영)
      continue;
    }
    if (states[i] === "unknown") {
      unknownSec += dt;
      continue;
    }
    analyzedSec += dt;
    if (states[i] !== "standing") continue;
    totalSec += dt;

    const last = segments[segments.length - 1];
    if (last && times[i] - last.end <= th.bridgeGapSec) {
      last.end = times[i] + dt; // 짧게 끊긴 건 이어 봄 (끊긴 시간은 세지 않음)
      last.duration += dt;
    } else {
      segments.push({ start: times[i], end: times[i] + dt, duration: dt });
    }
  }

  const all = analyzedSec + unknownSec;
  return {
    longestSec: segments.reduce((m, s) => Math.max(m, s.duration), 0),
    totalSec,
    analyzedSec,
    unknownRatio: all > 0 ? unknownSec / all : 1,
    segments,
  };
}

export const GROSS_MOTOR_LABEL = "독립 서기 유지 시간";

/** 서기 요약 → 화면에 넘길 결과 */
export function toGrossMotorResult(summary: StandingSummary): AnalysisResult {
  // 재촬영 조건은 다음 단계(이슈)에서 보강합니다. 지금은 아이가 거의 안 보이는 경우만 처리.
  if (summary.analyzedSec === 0) {
    return {
      status: "retry_needed",
      retryReason: "아이의 전신이 화면에 보이지 않았어요. 아이와 비슷한 높이에서 전신이 나오게 다시 찍어 주세요.",
    };
  }
  return {
    status: "success",
    metric: {
      value: Math.round(summary.longestSec * 10) / 10,
      unit: "seconds",
      label: GROSS_MOTOR_LABEL,
    },
  };
}

export async function analyzeGrossMotor(videoBlob: Blob): Promise<AnalysisResult> {
  try {
    const track = await extractPoseLandmarks(videoBlob);
    return toGrossMotorResult(measureStanding(track));
  } catch (e) {
    // 영상을 읽지 못했거나 모델 로드에 실패한 경우 — 화면이 멈추지 않게 안내로 돌려줌
    // 보호자 잘못이 아닐 수 있어 '다시 촬영'이 아니라 '다시 시도'로 안내. 원인은 개발 모드에서만 남김
    if (import.meta.env.DEV) console.error("[grossMotor] 분석 실패", e);
    return { status: "retry_needed", retryReason: "분석 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요." };
  }
}
