import { IStreamTracker } from "../types/streamTracker";
import { IUsageMetadata } from "./usageMetadata";

export interface IStreamWrapperRequest {
  originalStream: AsyncIterable<any>;
  transactionId: string;
  startTime: Date;
  streamTracker: IStreamTracker;
  usageMetadata?: IUsageMetadata;
}
