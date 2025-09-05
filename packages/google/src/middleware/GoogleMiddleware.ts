import { config } from "dotenv";
import {
  EmbedContentRequest,
  GenerateContentRequest,
  GenerativeModel,
  GoogleGenerativeAI,
  ModelParams,
  Part,
  RequestOptions,
  SingleRequestOptions,
} from "@google/generative-ai";
import { logger } from "../../../core/src/models/Logger";
import {
  extractUsageMetadata,
  generateTransactionId,
  extractStopReason,
  extractGoogleAITokenCounts,
  extractModelName,
  ESTIMATED_TOKEN_COUNTS,
  calculateDurationMs,
} from "../../../core/src/utils";
import {
  IStreamWrapperRequest,
  IStreamCompletionRequest,
  ITokenCounts,
  IUsageMetadata,
  IStreamTracker,
  IOperationType,
} from "../../../core/src/types";
import { Metering } from "../../../core/src/models/MeteringData";
config();

export class GoogleAiReveniumMiddleware {
  private apikey: string | undefined = "";
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  private streamStrackers: Map<string, IStreamTracker> = new Map<
    string,
    IStreamTracker
  >();

  constructor(clientApiKey?: string) {
    this.apikey = clientApiKey ?? process.env.GOOGLE_API_KEY;
    this.client = new GoogleGenerativeAI(
      clientApiKey ?? process.env.GOOGLE_API_KEY ?? ""
    );
  }

  public getGenerativeModel(
    modelParams: ModelParams,
    requestOptions?: RequestOptions
  ) {
    const model = this.client.getGenerativeModel(modelParams, requestOptions);
    this.model = model;
    return {
      ...model,
      generateContent: this.generateContentMiddleware, // intercep to generateContent
      generateContentStream: this.generateContentStream, // intercep to generateContentStream
      embedContent: this.generateEmbedding,
    };
  }

  generateContentMiddleware = async (
    request: GenerateContentRequest | string | Array<string | Part>,
    requestOptions?: SingleRequestOptions
  ) => {
    logger.info("--- Middleware actived ---");
    if (!this.verifyApiKey() || !this.verifyMeteringConfig()) return;
    const startTime: Date = new Date();

    try {
      const content = await this.model.generateContent(request, requestOptions);

      const tokenCounts: ITokenCounts = extractGoogleAITokenCounts(content);
      const stopReason: string = extractStopReason(content);
      const endTime: Date = new Date();
      if (
        !process.env.REVENIUM_METERING_API_KEY ||
        !process.env.REVENIUM_METERING_BASE_URL
      )
        return;
      const metering = new Metering();
      const requestMetering = metering.createMeteringRequest({
        modelName: this.model.model.split("models/")[1],
        endTime,
        startTime,
        operationType: IOperationType.CHAT,
        stopReason,
        tokenCounts,
        usageMetadata: {},
      });
      await metering.sendMeteringData(requestMetering);
      return content; // google response
    } catch (error: any) {
      logger.error("Google AI generateContent failed", {
        error,
      });
      throw error;
    }
  };

  generateContentStream = async (
    request: GenerateContentRequest | string | Array<string | Part>,
    requestOptions?: SingleRequestOptions
  ) => {
    if (!this.verifyApiKey() || !this.verifyMeteringConfig()) return;
    const startTime: Date = new Date();
    const transactionId: string = generateTransactionId();
    const usageMetadata = {};

    logger.info("Google AI generateContentStream called", {
      transactionId,
      model: this.model.model,
    });

    const streamTracker: IStreamTracker = {
      transactionId,
      startTime,
      firstTokenTime: undefined,
      isComplete: false,
      usageMetadata,
    };
    this.streamStrackers.set(transactionId, streamTracker);

    try {
      const result = await this.model.generateContentStream(
        request,
        requestOptions
      );
      const wrappedStream = this.createStreamWrapper({
        originalStream: result.stream,
        transactionId,
        startTime,
        streamTracker,
        usageMetadata,
      });

      Object.defineProperty(result, "stream", {
        //Change the steam property
        value: wrappedStream,
        writable: false,
        configurable: false,
      });
      return result;
    } catch (error: any) {
      this.streamStrackers.delete(transactionId);
      logger.error("Google AI generateContentStream failed", {
        transactionId,
        error,
      });
      throw error; // Re-throw the error instead of returning undefined
    }
  };

  private createStreamWrapper = (
    streamRequest: IStreamWrapperRequest
  ): AsyncIterable<any> => {
    const _this = this;
    return {
      [Symbol.asyncIterator]: async function* () {
        let isFirstToken = true;
        let firstTokenTime: Date | undefined;

        try {
          for await (const chunk of streamRequest.originalStream) {
            if (isFirstToken) {
              firstTokenTime = new Date();
              streamRequest.streamTracker.firstTokenTime = firstTokenTime;
              isFirstToken = false;
            }
            yield chunk;
          }
        } finally {
          // Stream completed, send metering data
          await _this.handleStreamCompletion({
            transactionId: streamRequest.transactionId,
            startTime: streamRequest.startTime,
            firstTokenTime,
            modelName: _this.model?.model?.split("models/")[1],
            usageMetadata: streamRequest.usageMetadata,
          });
        }
      },
    };
  };

  private handleStreamCompletion = async (
    request: IStreamCompletionRequest
  ) => {
    try {
      const streamTracker = this.streamStrackers.get(request.transactionId);
      if (!streamTracker) {
        logger.warning("Stream tracker not found for transaction", {
          transactionId: request.transactionId,
        });
        return;
      }
      const endTime: Date = new Date();
      const duration: number = calculateDurationMs(request.startTime, endTime);
      const timeToFirstToken: number = request.firstTokenTime
        ? calculateDurationMs(request.startTime, request.firstTokenTime)
        : 0;
      const metering = new Metering();
      const meteringRequest = metering.createMeteringRequest({
        modelName: this.model.model.split("models/")[1],
        endTime,
        startTime: request.startTime,
        operationType: IOperationType.CHAT,
        stopReason: "END",
        tokenCounts: ESTIMATED_TOKEN_COUNTS,
        usageMetadata: request.usageMetadata,
      });
      await metering.sendMeteringData(meteringRequest);
      this.streamStrackers.delete(request.transactionId);
      logger.info("Google AI stream completion metering completed", {
        transactionId: request.transactionId,
      });
    } catch (error: any) {
      logger.error("Failed to handle stream completion metering", {
        transactionId: request.transactionId,
        error,
      });
      this.streamStrackers.delete(request.transactionId);
    }
  };

  generateEmbedding = async (
    request: string | (string | Part)[] | EmbedContentRequest,
    requestOptions?: SingleRequestOptions
  ) => {
    if (!this.verifyApiKey() || !this.verifyMeteringConfig()) return;
    logger.info("Google AI embedContent called");
    const startTime: Date = new Date();
    const transactionId = generateTransactionId();
    const model = this.model.model.split("models/")[1];
    const usageMetadata = {};

    logger.info("Google AI embedContent called", {
      transactionId,
      model,
    });

    try {
      const result = await this.model.embedContent(request, requestOptions);
      const stopReason = extractStopReason(result);
      const modelName = extractModelName(result, model);
      const endTime: Date = new Date();

      const metering = new Metering();
      const meteringRequest = metering.createMeteringRequest({
        modelName,
        endTime,
        startTime,
        operationType: IOperationType.EMBED,
        stopReason,
        tokenCounts: ESTIMATED_TOKEN_COUNTS,
        usageMetadata,
      });
      await metering.sendMeteringData(meteringRequest);
      return result;
    } catch (error: any) {
      logger.error("Google AI embedContent failed", {
        error,
      });
      throw error;
    }
  };

  private verifyApiKey = () => {
    if (!this.apikey) {
      logger.warning("❌ GOOGLE_API_KEY not found");
      logger.warning("   Set: export GOOGLE_API_KEY=your-google-api-key");
      return false;
    }
    return true;
  };

  private verifyMeteringConfig = () => {
    if (
      !process.env.REVENIUM_METERING_API_KEY ||
      !process.env.REVENIUM_METERING_BASE_URL
    ) {
      logger.warning(
        "❌ REVENIUM_METERING_API_KEY or REVENIUM_METERING_BASE_URL not found"
      );
      return false;
    }
    return true;
  };
}
