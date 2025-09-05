import { MeteringError } from "./MeteringError";

export class StreamTrackingError extends MeteringError {
  /** Exception for stream tracking errors.
   *
   * @param message - The error message.
   * @param cause - The cause of the error.
   */
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "StreamTrackingError";
  }
}
