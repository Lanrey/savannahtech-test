export default class AppError extends Error {
  public statusCode: number;
  public errorCode: string | undefined;
  public isOperational: boolean;
  public cause: Error | undefined;

  constructor(statusCode: number, message, cause?: any, errorCode?: string, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.cause = cause as Error;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
