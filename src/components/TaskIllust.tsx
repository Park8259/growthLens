import type { TaskType } from "../types/analysis";
import ballImg from "../assets/task-ball_play.png";
import nameImg from "../assets/task-name_response.png";
import imitationImg from "../assets/task-imitation.png";

// Figma 부모 버전의 과제 일러스트 (흰 둥근 네모 + 그림).
// 그림 일부가 네모 밖으로 살짝 나오므로, 70px 네모 기준 위치를 size에 맞춰 늘리고 줄여요.
const ART: Record<TaskType, { src: string; left: number; top: number; w: number; h: number }> = {
  ball_play: { src: ballImg, left: 0, top: 0, w: 70, h: 70 },
  name_response: { src: nameImg, left: -1, top: -7, w: 81, h: 83 },
  imitation: { src: imitationImg, left: 0, top: -14, w: 70, h: 87 },
};

export default function TaskIllust({ task, size = 43, className = "" }: { task: TaskType; size?: number; className?: string }) {
  const a = ART[task];
  const k = size / 70;
  return (
    <span className={`relative block flex-shrink-0 ${className}`} style={{ width: size, height: size }} aria-hidden>
      <img
        src={a.src}
        alt=""
        draggable={false}
        className="pointer-events-none absolute max-w-none select-none"
        style={{ left: a.left * k, top: a.top * k, width: a.w * k, height: a.h * k }}
      />
    </span>
  );
}
