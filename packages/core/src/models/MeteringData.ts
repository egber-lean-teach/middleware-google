import {
  IMeteringDataRequest,
  IMeteringRequest,
} from "../types/meteringRequest";
import { calculateDurationMs } from "../utils/calculateDuration";
import { formatTimestamp } from "../utils/formatTimeStamp";
import { generateTransactionId } from "../utils/generateTransactionId";
import { logger } from "./Logger";
import {
  COST_TYPE,
  CURRENT_CREDENTIAL,
  GOOGLE_AGENT,
  MIDDLEWARE_SOURCE,
  PRODUCT_ID_FREE,
  PROVIDER_GOOGLE,
  VERTEXT_AGENT,
} from "../utils/constants/constants";
import { IModel } from "../types/model";

export class Metering {
  apiKey: string;
  baseUrl: string;
  type: IModel;

  constructor({
    clientApiKey,
    baseUrl,
    type,
  }: {
    clientApiKey?: string;
    baseUrl?: string;
    type?: IModel;
  } = {}) {
    this.apiKey = clientApiKey ?? process.env.REVENIUM_METERING_API_KEY ?? "";
    this.baseUrl = baseUrl ?? process.env.REVENIUM_METERING_BASE_URL ?? "";
    this.type = type ?? "google";
  }
  public createMeteringRequest(
    metering: IMeteringRequest
  ): IMeteringDataRequest {
    const agent = this.type === "google" ? GOOGLE_AGENT : VERTEXT_AGENT;
    return {
      stopReason: metering.stopReason,
      costType: COST_TYPE,
      isStreamed: false,
      taskType: COST_TYPE,
      agent,
      operationType: metering.operationType.toString(),
      inputTokenCount: metering.tokenCounts.inputTokens,
      outputTokenCount: metering.tokenCounts.outputTokens,
      reasoningTokenCount: metering.tokenCounts.reasoningTokens || 0,
      cacheCreationTokenCount: metering.tokenCounts.cachedTokens || 0,
      cacheReadTokenCount: 0,
      totalTokenCount: metering.tokenCounts.totalTokens,
      organizationId: `my-customer-name-${generateTransactionId()}`,
      productId: PRODUCT_ID_FREE,
      subscriber: {
        id: `user-${generateTransactionId()}`,
        email: `user-@${agent.toLowerCase()}.ai`,
        credential: CURRENT_CREDENTIAL,
      },
      model: metering.modelName,
      transactionId: generateTransactionId(),
      responseTime: formatTimestamp(metering.endTime),
      requestDuration: calculateDurationMs(
        metering.startTime,
        metering.endTime
      ),
      provider: PROVIDER_GOOGLE,
      requestTime: formatTimestamp(metering.startTime),
      completionStartTime: formatTimestamp(metering.endTime),
      timeToFirstToken: 0,
      middleware_source: MIDDLEWARE_SOURCE,
    };
  }

  public async sendMeteringData(
    meteringRequest: IMeteringDataRequest
  ): Promise<void> {
    const endpoint: string = `${this.baseUrl}/v2/ai/completions`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          accept: "application/json",
        },
        body: JSON.stringify(meteringRequest),
      });
      if (!response.ok) {
        const errorData = await response?.text();
        logger.error(
          `Metering API request failed with status ${response.status} - ${errorData}`
        );
        return;
      }
      logger.info(`Metering data sent successfully to Revenium`);
    } catch (error: any) {
      logger.error(`Error to sent metering data ${error}`);
    }
  }
}
