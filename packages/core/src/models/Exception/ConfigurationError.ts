import { MeteringError } from "./MeteringError";

export class ConfigurationError extends MeteringError {
  /** Exception for configuration errors.
   *
   * @param message - The error message.
   * @param cause - The cause of the error.
   */
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "ConfigurationError";
  }
}
