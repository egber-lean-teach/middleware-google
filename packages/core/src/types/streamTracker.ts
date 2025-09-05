import { IUsageMetadata } from "./usageMetadata";

export interface IStreamTracker {
  transactionId: string;
  startTime: Date;
  firstTokenTime?: Date;
  isComplete: boolean;
  usageMetadata?: IUsageMetadata;
}
