export type TaskType = "name_response" | "imitation" | "ball_play";

export interface AnalysisInput {
  videoBlob: Blob;
  taskType: TaskType;
  stimulusTimestamp?: number; // name_response, imitation: 신호음 재생 시점(ms, 녹화 시작 기준)
}

export interface AnalysisResult {
  status: "success" | "retry_needed";
  retryReason?: string;
  metric?: {
    value: number;
    unit: "seconds" | "count";
    label: string;
  };
  ambient?: {
    bothInFrameSec: number;
    caregiverOrientSec: number;
    activitySec: number;
    contactSec: number;
  };
  detail?: Record<string, number | boolean | string>;
  /**
   * 결과 화면에서 영상 위에 다시 그릴 좌표. 화면에 보여줄 때만 쓰고 기록에는 저장하지 않아요
   * (recording 화면이 저장 전에 떼어냄).
   */
  trace?: FaceTrace;
}

/** 호명 반응: 프레임별 얼굴 윤곽과 고개 각도 */
export interface FaceTrace {
  kind: "face";
  frames: {
    t: number; // 초
    yaw: number | null; // 도
    /** 얼굴 윤곽 36점 + 코끝 1점의 정규화 좌표 [x0, y0, x1, y1, …] (0~1), 미검출이면 null */
    pts: number[] | null;
  }[];
  /** 이름을 부른 시점(초) */
  stimulusSec: number;
  /** 고개를 돌린 것으로 잡힌 시점(초). 반응이 없으면 null */
  responseSec: number | null;
}
