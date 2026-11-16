// 의사 앱 날짜·문구 도우미
const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];
const DAY = 24 * 60 * 60 * 1000;

export function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function fromIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

/** "11월 20일 금요일" */
export function fullDay(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAY[d.getDay()]}요일`;
}

/** "11/20" */
export function slash(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${m}/${d}`;
}

/** "오늘" / "어제" / "5일 전" */
export function ago(ts: number, now: number) {
  const diff = Math.round((startOfDay(now) - startOfDay(ts)) / DAY);
  if (diff <= 0) return "오늘";
  if (diff === 1) return "어제";
  return `${diff}일 전`;
}

/** "오늘 오전 8:12" */
export function agoTime(ts: number, now: number) {
  const d = new Date(ts);
  const h = d.getHours();
  return `${ago(ts, now)} ${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** 확인할 장면에 쓰는 데모 이미지 (Figma) */
export const SCENE_IMAGES = ["/images/scene-1.png", "/images/scene-2.png"];

export const genderShort = (g: "male" | "female") => (g === "male" ? "남" : "여");
export const genderLong = (g: "male" | "female") => (g === "male" ? "남아" : "여아");
export { WEEKDAY, DAY };
