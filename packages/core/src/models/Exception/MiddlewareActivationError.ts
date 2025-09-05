import { MeteringError } from "./MeteringError";

export class MiddlewareActivationError extends MeteringError {
  /** Exception for middleware activation errors.
   *
   * @param message - The error message.
   * @param cause - The cause of the error.
   */
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "MiddlewareActivationError";
  }
}
