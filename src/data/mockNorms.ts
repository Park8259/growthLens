import type { TaskType } from "../types/analysis";

// 월령별 참조값
// name_response: 전근아·김휘영 (2025) TD군 평균 3.62초(SD 3.25), 18~48개월
// imitation, ball_play: 논문에서 참조값 미제공 — 화면에 표시하지 않음
// name_response 참조값: 전근아·김휘영(2025) TD군 평균 3.62초, 대상 18~48개월
// 18개월 미만은 논문 범위 밖이므로 null 반환
const NORMS: Partial<Record<TaskType, Record<number, number>>> = {
  name_response: {
    18: 3.62, 24: 3.62, 30: 3.62, 36: 3.62, 42: 3.62, 48: 3.62,
  },
};

const MIN_NORM_MONTHS: Partial<Record<TaskType, number>> = {
  name_response: 18,
};

export function getPeerNorm(taskType: TaskType, ageMonths: number): number | null {
  const minAge = MIN_NORM_MONTHS[taskType];
  if (minAge !== undefined && ageMonths < minAge) return null;
  const table = NORMS[taskType];
  if (!table) return null;
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  const nearest = keys.reduce((prev, curr) =>
    Math.abs(curr - ageMonths) < Math.abs(prev - ageMonths) ? curr : prev
  );
  return table[nearest] ?? null;
}


