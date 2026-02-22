import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode,
    url: req.url,
    method: req.method,
    body: req.body,
    user: req.user?.userId,
  });

  // Don't expose internal errors in production
  const errorResponse: any = {
    error: statusCode === 500 && config.env === 'production'
      ? 'Internal server error'
      : message,
    statusCode,
  };

  // Include stack trace in development
  if (config.env === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Not found',
    statusCode: 404,
    path: req.path,
  });
}

// Async wrapper for route handlers
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Create custom error
export function createError(message: string, statusCode: number = 500): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

