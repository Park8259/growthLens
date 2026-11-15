import type { AnalysisResult } from "../../types/analysis";

export async function analyzeNameResponse(
  _videoBlob: Blob,
  _stimulusTimestamp: number
): Promise<AnalysisResult> {
  throw new Error("Not implemented");
}
