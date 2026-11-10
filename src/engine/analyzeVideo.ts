import type { AnalysisInput, AnalysisResult } from "../types/analysis";
import { analyzeGrossMotor } from "./metrics/grossMotor";
import { analyzeFineMotor } from "./metrics/fineMotor";
import { analyzeSocial } from "./metrics/social";

export async function analyzeVideo(
  input: AnalysisInput
): Promise<AnalysisResult> {
  switch (input.taskType) {
    case "gross_motor":
      return analyzeGrossMotor(input.videoBlob);
    case "fine_motor":
      return analyzeFineMotor(input.videoBlob);
    case "social":
      if (input.stimulusTimestamp === undefined) {
        throw new Error("stimulusTimestamp is required for social task");
      }
      return analyzeSocial(input.videoBlob, input.stimulusTimestamp);
  }
}
