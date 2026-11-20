import type { FaceTrace, TaskType } from "../types/analysis";

// 방금 분석한 영상과 좌표. 결과 화면의 "AI가 본 장면"에만 쓰고, 저장하지 않아요.
// 새로고침하거나 다음 과제를 분석하면 사라져요. 영상은 기기 밖으로 나가지 않아요.

export interface LastReplay {
  task: TaskType;
  video: Blob;
  trace: FaceTrace;
}

let last: LastReplay | null = null;

export function setLastReplay(r: LastReplay | null) {
  last = r;
}

export function getLastReplay(task: TaskType): LastReplay | null {
  return last && last.task === task ? last : null;
}
