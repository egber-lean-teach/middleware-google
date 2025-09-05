import { MeteringError } from "./MeteringError";

export class APIResponseError extends MeteringError {
  /** Exception for API response errors.
   *
   * @param message - The error message.
   * @param statusCode - The HTTP status code of the response.
   * @param responseData - The response data from the API.
   * @param cause - The cause of the error.
   */
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly responseData?: any,
    cause?: Error
  ) {
    super(message, cause);
    this.name = "APIResponseError";
  }
}
