import { logger } from "../models/Logger";
import { ITokenCounts } from "../types";
import { safeExtract } from "./safeExtract";
import { GenerateContentResult } from "@google-cloud/vertexai";

export function extractVertexAITokenCounts(
  response: GenerateContentResult
): ITokenCounts {
  try {
    const usageMetadata = response.response.usageMetadata;
    if (!usageMetadata) {
      return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    }

    const inputTokens = safeExtract.number(usageMetadata, "promptTokenCount");
    const outputTokens = safeExtract.number(
      usageMetadata,
      "candidatesTokenCount"
    );
    const totalTokens = safeExtract.number(usageMetadata, "totalTokenCount");
    const cachedTokens = safeExtract.number(usageMetadata, "cachedTokenCount");
    const reasoningTokens = safeExtract.number(
      usageMetadata,
      "reasoningTokenCount"
    );

    return {
      inputTokens,
      outputTokens,
      totalTokens,
      cachedTokens,
      reasoningTokens,
    };
  } catch (error) {
    logger.warning("Failed to extract Vertex AI token counts:", error);
    return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }
}
