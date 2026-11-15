// 1군 공통 지표 — 세 과제 모두에서 계산됩니다.
// bothInFrameSec: 두 사람이 모두 검출된 구간
// caregiverOrientSec: 아이 머리 방향이 보호자를 향한 누적 시간
// activitySec: 아이 움직임(중심 이동 or 자세 변화) 누적 시간
// contactSec: 보호자 손목이 아이 bbox 안에 있는 누적 시간 (참고값)

import type { AnalysisResult } from "../../types/analysis";
import { extractPoseLandmarks, identifyPersons, LM, type Landmark } from "../pose";

const SMOOTH_SEC = 0.3;
const MIN_BOTH_RATIO = 0.7;

type Bbox = { cx: number; cy: number; w: number; h: number };

function childBbox(lm: Landmark[]): Bbox | null {
  const vis = lm.filter((l) => l[3] > 0.3);
  if (vis.length === 0) return null;
  const xs = vis.map((l) => l[0]);
  const ys = vis.map((l) => l[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, w: maxX - minX, h: maxY - minY };
}

function dot2dNorm(ax: number, ay: number, bx: number, by: number): number {
  const aLen = Math.sqrt(ax * ax + ay * ay) || 1;
  const bLen = Math.sqrt(bx * bx + by * by) || 1;
  return (ax / aLen) * (bx / bLen) + (ay / aLen) * (by / bLen);
}

function smoothCount(raw: boolean[], halfWin: number): number {
  let count = 0;
  for (let i = 0; i < raw.length; i++) {
    const s = Math.max(0, i - halfWin);
    const e = Math.min(raw.length, i + halfWin + 1);
    if (raw.slice(s, e).filter(Boolean).length * 2 > e - s) count++;
  }
  return count;
}

function continuousCount(raw: boolean[], minRun: number): number {
  let total = 0, run = 0;
  for (const v of raw) {
    if (v) { run++; }
    else { if (run >= minRun) total += run; run = 0; }
  }
  if (run >= minRun) total += run;
  return total;
}

export async function measureAmbient(
  videoBlob: Blob
): Promise<AnalysisResult["ambient"]> {
  const track = await extractPoseLandmarks(videoBlob);
  const { fps, duration, frames } = track;
  const halfWin = Math.round((SMOOTH_SEC * fps) / 2);
  const minRun = Math.round(SMOOTH_SEC * fps);
  const n = frames.length;

  const bothRaw: boolean[] = new Array(n).fill(false);
  const orientRaw: boolean[] = new Array(n).fill(false);
  const activeRaw: boolean[] = new Array(n).fill(false);
  const contactRaw: boolean[] = new Array(n).fill(false);

  let prevBbox: Bbox | null = null;

  for (let i = 0; i < n; i++) {
    const { child, caregiver } = identifyPersons(frames[i]);
    if (!child) { prevBbox = null; continue; }

    bothRaw[i] = caregiver !== null;

    // caregiverOrient: 아이 gaze vector → 보호자 코 방향 내적 ≥ 0.3
    if (caregiver) {
      const nose = child[LM.NOSE];
      const lEar = child[LM.L_EAR];
      const rEar = child[LM.R_EAR];
      if (nose[3] > 0.5 && (lEar[3] > 0.5 || rEar[3] > 0.5)) {
        const earMidX = (lEar[0] + rEar[0]) / 2;
        const earMidY = (lEar[1] + rEar[1]) / 2;
        const cNose = caregiver[LM.NOSE];
        orientRaw[i] = dot2dNorm(
          nose[0] - earMidX, nose[1] - earMidY,
          cNose[0] - nose[0], cNose[1] - nose[1]
        ) >= 0.3;
      }
    }

    // activity: bbox 중심 이동 또는 가로세로비 변화
    const bbox = childBbox(child);
    if (bbox) {
      if (prevBbox) {
        const diag = Math.sqrt(prevBbox.w ** 2 + prevBbox.h ** 2) || 1;
        const move = Math.sqrt((bbox.cx - prevBbox.cx) ** 2 + (bbox.cy - prevBbox.cy) ** 2);
        const dAR = Math.abs(bbox.w / (bbox.h || 0.001) - prevBbox.w / (prevBbox.h || 0.001));
        activeRaw[i] = move / diag > 0.02 || dAR > 0.05;
      }
      prevBbox = bbox;

      // contact: 보호자 손목이 아이 bbox 안
      if (caregiver) {
        const inBox = (wrist: Landmark) =>
          wrist[3] > 0.5 &&
          Math.abs(wrist[0] - bbox.cx) < bbox.w / 2 &&
          Math.abs(wrist[1] - bbox.cy) < bbox.h / 2;
        contactRaw[i] = inBox(caregiver[LM.L_WRIST]) || inBox(caregiver[LM.R_WRIST]);
      }
    } else {
      prevBbox = null;
    }
  }

  const bothInFrameSec = bothRaw.filter(Boolean).length / fps;
  if (bothInFrameSec === 0 || bothInFrameSec / duration < MIN_BOTH_RATIO) return undefined;

  return {
    bothInFrameSec,
    caregiverOrientSec: smoothCount(orientRaw, halfWin) / fps,
    activitySec: smoothCount(activeRaw, halfWin) / fps,
    contactSec: continuousCount(contactRaw, minRun) / fps,
  };
}
