import type { TaskType } from "../types/analysis";
import { BallIcon, HandIcon, SpeakerIcon } from "./icons";

/** 과제별 아이콘: 공 주고받기 = 공, 호명 반응 = 스피커, 동작 모방 = 손 */
export default function TaskIcon({ task, size = 24, className }: { task: TaskType; size?: number; className?: string }) {
  if (task === "ball_play") return <BallIcon size={size} className={className} />;
  if (task === "name_response") return <SpeakerIcon size={size} className={className} />;
  return <HandIcon size={size} className={className} />;
}
