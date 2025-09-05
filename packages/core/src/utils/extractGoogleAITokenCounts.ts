import { GenerateContentResult } from "@google/generative-ai";
import { ITokenCounts } from "../types";
import { logger } from "../models/Logger";
import { safeExtract } from "./safeExtract";

export function extractGoogleAITokenCounts({
  response,
}: GenerateContentResult): ITokenCounts {
  try {
    const usageMetadata = response.usageMetadata;
    if (!usageMetadata)
      return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

    const inputTokens = safeExtract.number(usageMetadata, "promptTokenCount");
    const outputTokens = safeExtract.number(
      usageMetadata,
      "candidatesTokenCount"
    );
    const totalTokens = safeExtract.number(usageMetadata, "totalTokenCount");
    return {
      inputTokens,
      outputTokens,
      totalTokens,
      cachedTokens: 0,
      reasoningTokens: 0,
    };
  } catch (error) {
    logger.warning("Failed to extract Google AI token counts:", error);
    return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }
}
