import { IStreamTracker } from "./streamTracker";
import { IUsageMetadata } from "./usageMetadata";

export interface IStreamCompletionRequest {
  transactionId: string;
  startTime: Date;
  firstTokenTime: Date | undefined;
  modelName: string;
  usageMetadata?: IUsageMetadata;
}
