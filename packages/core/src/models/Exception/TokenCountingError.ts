import { MeteringError } from "./MeteringError";

export class TokenCountingError extends MeteringError {
  /** Exception for token counting errors.
   *
   * @param message - The error message.
   * @param cause - The cause of the error.
   */
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "TokenCountingError";
  }
}
