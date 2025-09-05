import { logger } from "../models/Logger";
import { safeExtract } from "./safeExtract";
import { EmbedContentResponse, GenerateContentResult } from "@google/generative-ai";

export function extractStopReason(response: GenerateContentResult | EmbedContentResponse  ): string {
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
