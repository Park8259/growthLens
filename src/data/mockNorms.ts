import type { TaskType } from "../types/analysis";

// 월령별 또래 평균값 (임상 연구 기반 추정치)
const NORMS: Record<TaskType, Record<number, number>> = {
  gross_motor: { // 혼자 서 있기 (초) — 높을수록 좋음
    9: 1.0, 10: 1.5, 11: 2.1, 12: 2.8, 13: 3.9,
    14: 5.2, 15: 7.0, 16: 9.0, 17: 11.5, 18: 13.5,
  },
  fine_motor: { // 블록 쌓기 성공 시도 횟수 — 낮을수록 좋음
    9: 12, 10: 10, 11: 8, 12: 6.5, 13: 5.5,
    14: 4.5, 15: 3.5, 16: 2.8, 17: 2.2, 18: 1.8,
  },
  social: { // 반응 시간 (초) — 낮을수록 좋음
    9: 3.5, 10: 2.9, 11: 2.4, 12: 2.1, 13: 1.9,
    14: 1.6, 15: 1.4, 16: 1.2, 17: 1.0, 18: 0.9,
  },
};

// 높을수록 좋은 지표인지 여부
export const HIGHER_IS_BETTER: Record<TaskType, boolean> = {
  gross_motor: true,
  fine_motor:  false,
  social:      false,
};

export function getPeerNorm(taskType: TaskType, ageMonths: number): number {
  const table = NORMS[taskType];
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  const nearest = keys.reduce((prev, curr) =>
    Math.abs(curr - ageMonths) < Math.abs(prev - ageMonths) ? curr : prev
  );
  return table[nearest];
}

export function compareToNorm(
  value: number,
  norm: number,
  higherIsBetter: boolean
): "good" | "average" | "attention" {
  const ratio = higherIsBetter ? value / norm : norm / value;
  if (ratio >= 1.15) return "good";
  if (ratio >= 0.80) return "average";
  return "attention";
}
