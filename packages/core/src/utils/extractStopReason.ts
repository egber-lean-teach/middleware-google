import { logger } from "../models/Logger";
import { safeExtract } from "./safeExtract";
import {
  EmbedContentResponse,
  GenerateContentResult,
} from "@google/generative-ai";
import { GenerateContentResult as VertexGenerateContentResult } from "@google-cloud/vertexai";

export function extractStopReason(
  response:
    | GenerateContentResult
    | EmbedContentResponse
    | VertexGenerateContentResult
): string {
  try {
    // Try to extract from different possible locations
    const stopReason =
      safeExtract.string(response, "candidates.0.finishReason") ||
      safeExtract.string(response, "finishReason") ||
      safeExtract.string(response, "stopReason") ||
      "END";

    return stopReason || "END";
  } catch (error) {
    logger.warning("Failed to extract stop reason:", error);
    return "END";
  }
}
