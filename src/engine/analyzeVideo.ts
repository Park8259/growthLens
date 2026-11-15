import type { AnalysisInput, AnalysisResult } from "../types/analysis";
import { analyzeNameResponse } from "./metrics/nameResponse";
import { analyzeImitation } from "./metrics/imitation";
import { analyzeBallPlay } from "./metrics/ballPlay";

export async function analyzeVideo(input: AnalysisInput): Promise<AnalysisResult> {
  switch (input.taskType) {
    case "name_response":
      if (input.stimulusTimestamp === undefined) {
        throw new Error("stimulusTimestamp is required for name_response task");
      }
      return analyzeNameResponse(input.videoBlob, input.stimulusTimestamp);
    case "imitation":
      if (input.stimulusTimestamp === undefined) {
        throw new Error("stimulusTimestamp is required for imitation task");
      }
      return analyzeImitation(input.videoBlob, input.stimulusTimestamp);
    case "ball_play":
      return analyzeBallPlay(input.videoBlob);
  }
}
