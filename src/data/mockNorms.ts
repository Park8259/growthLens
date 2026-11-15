import type { TaskType } from "../types/analysis";

// 월령별 참조값
// name_response: 전근아·김휘영 (2025) TD군 평균 3.62초(SD 3.25), 18~48개월
// imitation, ball_play: 논문에서 참조값 미제공 — 화면에 표시하지 않음
const NORMS: Partial<Record<TaskType, Record<number, number>>> = {
  name_response: { // 호명반응 지연 (초) — 낮을수록 좋음, 논문 TD 참조값
    9: 3.62, 10: 3.62, 11: 3.62, 12: 3.62, 13: 3.62,
    14: 3.62, 15: 3.62, 16: 3.62, 17: 3.62, 18: 3.62,
  },
};

export function getPeerNorm(taskType: TaskType, _ageMonths: number): number | null {
  const table = NORMS[taskType];
  if (!table) return null;
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  const nearest = keys.reduce((prev, curr) =>
    Math.abs(curr - _ageMonths) < Math.abs(prev - _ageMonths) ? curr : prev
  );
  return table[nearest] ?? null;
}


