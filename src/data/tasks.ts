import type { TaskType } from "../types/analysis";
import { mockDoctor, nextAppointment } from "./mockDoctor";

// 과제 정보 한곳 모음 (Figma 부모 버전 문구 기준)

export const TASK_ORDER: TaskType[] = ["ball_play", "name_response", "imitation"];

export const TASK_LABEL: Record<TaskType, string> = {
  name_response: "호명 반응",
  imitation: "동작 모방",
  ball_play: "공 주고받기",
};

/** 오늘의 과제 카드 한 줄 설명 */
export const TASK_SHORT: Record<TaskType, string> = {
  name_response: "부르면 얼마나 빨리 돌아보는지",
  imitation: "보호자 동작을 따라 하는지",
  ball_play: "공을 보호자와 주고받는지",
};

export const TASK_META: Record<TaskType, string> = {
  name_response: "약 30초",
  imitation: "약 30초",
  ball_play: "약 1분 · 준비물 단색 공",
};

/** 과제 안내 화면 설명 (2줄) */
export const TASK_GUIDE: Record<TaskType, string> = {
  name_response: "아이가 다른 곳을 볼 때 이름을 불러요.\n소리가 나면 바로 불러주세요.",
  imitation: "아이가 보는 앞에서 손 들기나 박수를 보여줘요.\n소리가 나면 바로 시작해주세요.",
  ball_play: "공을 아이와 보호자 사이에 두고 주고받아요.\n공이 화면에 계속 보이게 해주세요.",
};

/** 촬영 준비 화면 하단 제목 */
export const TASK_PREP_TITLE: Record<TaskType, string> = {
  name_response: "아이 옆에 편하게 앉아주세요",
  imitation: "아이와 마주 앉아주세요",
  ball_play: "공을 화면 안에 놓아주세요",
};

/** 분석 화면 두 번째 단계 */
export const TASK_ANALYZE_STEP: Record<TaskType, string> = {
  name_response: "고개를 돌리는 순간",
  imitation: "동작을 따라 하는 순간",
  ball_play: "아이가 다시 던지는 순간",
};

/** 재촬영 화면 팁 3개 */
export const TASK_RETRY_TIPS: Record<TaskType, string[]> = {
  name_response: [
    "아이 얼굴이 화면 가운데 오게 해주세요",
    "폰을 조금 더 뒤로, 아이 전신이 보이게 해주세요",
    "아이 시야 밖에서 이름을 불러주세요",
  ],
  imitation: [
    "아이와 마주 앉아서 시작해 주세요",
    "폰을 조금 더 뒤로, 아이와 보호자가 함께 보이게 해주세요",
    "동작은 아이가 보는 앞에서 크게 해주세요",
  ],
  ball_play: [
    "아이와 마주 앉아서 시작해 주세요",
    "폰을 조금 더 뒤로, 아이 전신과 공이 보이게 해주세요",
    "공은 아이와 보호자 사이에서만 굴려 주세요",
  ],
};

/** 측정 시간(초) */
export const TASK_DURATION: Record<TaskType, number> = {
  name_response: 30,
  imitation: 30,
  ball_play: 60,
};

/** 데모용 다음 진료일 — 의사 앱 일정(김하온 = p1)과 같은 날을 써요 */
export function nextVisit() {
  const a = nextAppointment("p1");
  const [, m, d] = (a?.date ?? "").split("-").map(Number);
  return { month: m, day: d, has: Boolean(a), doctor: mockDoctor.name };
}

export function unitOf(unit: "seconds" | "count") {
  return unit === "seconds" ? "초" : "회";
}

/** 받침이 있으면 "하온이", 없으면 "지수" */
export function nameWithI(name: string) {
  const last = name.charCodeAt(name.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return name;
  return (last - 0xac00) % 28 === 0 ? name : `${name}이`;
}
