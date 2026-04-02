export type AppErrorCode =
  | "INVALID_REQUEST"
  | "ALIAS_CONFLICT"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: AppErrorCode,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function createErrorResponse(code: AppErrorCode, message: string) {
  return {
    error: {
      code,
      message
    }
  };
}
