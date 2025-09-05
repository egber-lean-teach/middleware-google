import { logger } from "../models/Logger";
import { safeExtract } from "./safeExtract";
import { EmbedContentResponse, GenerateContentResult } from "@google/generative-ai";

export function extractModelName(
  response: GenerateContentResult | EmbedContentResponse,
  fallbackModel?: string
): string {
  try {
    const modelName =
      safeExtract.string(response, "model") ||
      safeExtract.string(response, "modelName") ||
      fallbackModel ||
      "unknown-model";

    return modelName;
  } catch (error) {
    logger.warning("Failed to extract model name:", error);
    return fallbackModel || "unknown-model";
  }
}
