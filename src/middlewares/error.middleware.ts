import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// 404 Route Not Found Handler
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// Global Error Handler
export const errorHandler: ErrorRequestHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: unknown[] | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if ('statusCode' in err && typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
    message = err.message || message;
  } else if (err.name === 'SyntaxError') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  // Log error details for 500s or unexpected errors
  if (statusCode >= 500) {
    logger.error(`[Unhandled Error] ${err.message}`, err.stack);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
