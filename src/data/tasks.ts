import type { TaskType } from "../types/analysis";

// 과제 정보 한곳 모음 (Figma 부모 버전 문구 기준)

// 과제를 보여주는 순서 (오늘의 과제, 변화, 진료 요약, 의사 화면 공통). 호명 반응이 맨 위
export const TASK_ORDER: TaskType[] = ["name_response", "ball_play", "imitation"];

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
    "폰을 더 뒤로, 아이와 보호자가 함께 보이게 해주세요",
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


export function unitOf(unit: "seconds" | "count") {
  return unit === "seconds" ? "초" : "회";
}

/**
 * 아이를 부르는 이름. 성을 떼고, 받침이 있으면 "이"를 붙여요.
 * "김하온" → "하온이", "김철수" → "철수", "남궁민준" → "민준이", "하온" → "하온이"
 * 두 글자 이름은 성인지 알 수 없어서 그대로 써요.
 */
export function nameWithI(fullName: string) {
  const name = fullName.trim();
  const given = name.length === 3 ? name.slice(1) : name.length === 4 ? name.slice(2) : name;
  const last = given.charCodeAt(given.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return given;
  return (last - 0xac00) % 28 === 0 ? given : `${given}이`;
}
