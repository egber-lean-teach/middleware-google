import {
  GenerateContentRequest,
  GenerativeModel,
  ModelParams,
  Part,
  RequestOptions,
  VertexAI,
} from "@google-cloud/vertexai";
import {
  IOperationType,
  IStreamTracker,
  ITokenCounts,
} from "../../../core/src/types";
import {
  extractStopReason,
  generateTransactionId,
  verifyMeteringConfig,
} from "../../../core/src/utils";
import { logger } from "../../../core/src/models/Logger";
import { extractVertexAITokenCounts } from "../../../core/src/utils/extractVertexAITokenCounts";
import { Metering } from "../../../core/src/models/MeteringData";
export class VertexAIReveniumMiddleware {
  private client: VertexAI;
  private model: GenerativeModel;
  private modelName: string;
  private streamStrackers: Map<string, IStreamTracker> = new Map<
    string,
    IStreamTracker
  >();

  constructor(projectIdClient?: string, locationClient?: string) {
    this.client = new VertexAI({
      project: projectIdClient ?? process.env.GOOGLE_CLOUD_PROJECT_ID ?? "",
      location:
        locationClient ?? process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1",
      googleAuthOptions: {
        keyFilename: process.env.GOOGLE_CREDENTIALS,
      },
    });
  }

  public getGenerativeModel(
    modelParams: ModelParams,
    requestOptions?: RequestOptions
  ) {
    const model = this.client.getGenerativeModel(modelParams, requestOptions);
    this.modelName = modelParams.model;
    this.model = model;
    return {
      ...model,
      generateContent: this.generateContentMiddleware, // intercep to generateContent
      generateContentStream: this.generateContentStream, // intercep to generateContentStream
    };
  }

  public generateContentMiddleware = async (
    request: string | GenerateContentRequest
  ) => {
    if (!verifyMeteringConfig()) return;
    const startTime: Date = new Date();
    const transactionId = generateTransactionId();
    const usageMetadata = {};

    logger.info("Vertex AI generateContent called", {
      transactionId,
      model: "test",
    });

    try {
      const result = await this.model.generateContent(request);
      const tokenCounts: ITokenCounts = extractVertexAITokenCounts(result);
      const stopReason: string = extractStopReason(result);
      const endTime: Date = new Date();
      const metering = new Metering({
        type: "vertex",
      });
      const requestMetering = metering.createMeteringRequest({
        modelName: this.modelName,
        endTime,
        startTime,
        operationType: IOperationType.CHAT,
        stopReason,
        tokenCounts,
        usageMetadata,
      });
      await metering.sendMeteringData(requestMetering);
      return result;
    } catch (error) {
      logger.error("Vertex AI generateContent failed", {
        error,
      });
      throw error;
    }
  };

  public generateContentStream = async (
    request: string | Array<string | Part>,
    requestOptions?: RequestOptions
  ) => {
    console.log("Vertex AI generateContentStream called");
  };
}
