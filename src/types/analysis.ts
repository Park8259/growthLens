export type TaskType = "gross_motor" | "fine_motor" | "social";

export interface AnalysisInput {
  videoBlob: Blob;
  taskType: TaskType;
  stimulusTimestamp?: number; // social 과제만: 호명 탭 시점(ms, 녹화 시작 기준)
}

export interface AnalysisResult {
  status: "success" | "retry_needed";
  retryReason?: string;
  metric?: {
    value: number;
    unit: "seconds" | "count";
    label: string;
  };
}
