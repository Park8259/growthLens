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
}
