// 좌표 계산 도구 (거리, 각도, 기울기)
// 모든 계산은 픽셀 좌표로 합니다. 비율 좌표(0~1)는 가로·세로 배율이 달라 각도가 틀어지기 때문입니다.

import type { Landmark } from "./pose";

/** 픽셀 좌표의 점 하나 (y는 아래로 갈수록 커짐), v = visibility */
export type Pt = { x: number; y: number; v: number };

/** 관절 i를 픽셀 좌표로 변환. visibility가 기준보다 낮으면 null */
export function toPx(
  lm: Landmark[],
  i: number,
  width: number,
  height: number,
  minVisibility: number
): Pt | null {
  const p = lm[i];
  if (!p || p[3] < minVisibility) return null;
  return { x: p[0] * width, y: p[1] * height, v: p[3] };
}

/** 좌우 관절의 중점. 한쪽만 보이면 보이는 쪽을 그대로 사용 */
export function mid(a: Pt | null, b: Pt | null): Pt | null {
  if (a && b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, v: Math.min(a.v, b.v) };
  }
  return a ?? b;
}

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** b를 꼭짓점으로 하는 a-b-c 각도(도). 일자로 펴지면 180 */
export function angleAt(a: Pt, b: Pt, c: Pt): number | null {
  const v1x = a.x - b.x;
  const v1y = a.y - b.y;
  const v2x = c.x - b.x;
  const v2y = c.y - b.y;
  const n = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
  if (n === 0) return null;
  const cos = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / n));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** from→to 방향이 '똑바로 위'와 이루는 각도(도). 0 = 똑바로 위, 90 = 수평 */
export function tiltFromUp(from: Pt, to: Pt): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return (Math.atan2(Math.abs(dx), -dy) * 180) / Math.PI;
}
