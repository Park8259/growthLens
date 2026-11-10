import type { TaskType, AnalysisResult } from "../types/analysis";

export interface MeasurementRecord {
  id: string;
  childId: string;
  taskType: TaskType;
  recordedAt: number; // Unix ms
  result: AnalysisResult;
}

export async function saveRecord(_record: MeasurementRecord): Promise<void> {
  throw new Error("Not implemented");
}

export async function getRecords(
  _childId: string
): Promise<MeasurementRecord[]> {
  throw new Error("Not implemented");
}
