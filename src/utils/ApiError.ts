export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: unknown[];

  constructor(
    statusCode: number,
    message: string = 'Something went wrong',
    errors?: unknown[],
    stack: string = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message: string = 'Bad Request', errors?: unknown[]): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'Resource Not Found'): ApiError {
    return new ApiError(404, message);
  }

  static tooManyRequests(message: string = 'Too Many Requests'): ApiError {
    return new ApiError(429, message);
  }

  static internal(message: string = 'Internal Server Error'): ApiError {
    return new ApiError(500, message);
  }
}
