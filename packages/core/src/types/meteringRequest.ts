import { IUsageMetadata } from "./usageMetadata";
import { IOperationType } from "./operation";
import { ISubscriber } from "./subscriber";
import { ITokenCounts } from "./tokenCount";

export interface IMeteringRequest {
  transactionId?: string;
  startTime: Date;
  endTime: Date;
  modelName: string;
  tokenCounts: ITokenCounts;
  stopReason: string;
  operationType: IOperationType;
  usageMetadata?: IUsageMetadata;
}

export interface IMeteringDataRequest {
  stopReason: string;
  costType: string;
  isStreamed: boolean;
  taskType: string;
  agent: string;
  operationType: string;
  inputTokenCount: number;
  outputTokenCount: number;
  reasoningTokenCount: number;
  cacheCreationTokenCount: number;
  cacheReadTokenCount: number;
  totalTokenCount: number;
  organizationId: string;
  productId: string;
  subscriber: ISubscriber;
  model: string;
  transactionId: string;
  responseTime: string;
  requestDuration: number;
  provider: string;
  requestTime: string;
  completionStartTime: string;
  timeToFirstToken: number;
  middleware_source: string;
}
