import type { AnalysisResult } from "../../types/analysis";

export async function measureAmbient(
  _videoBlob: Blob
): Promise<AnalysisResult["ambient"]> {
  throw new Error("Not implemented");
}
