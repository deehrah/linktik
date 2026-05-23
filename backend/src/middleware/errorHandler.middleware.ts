import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../lib/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
    public code?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    [key: string]: any;
  };
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId: string;
        email: string;
        planTier: string;
      };
    }
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const timestamp = new Date().toISOString();
  const path = req.path;
  const method = req.method;

  // Zod validation errors
  if (err instanceof ZodError) {
    logger.warn('Validation error', { path, method, errors: err.errors });
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      },
    } as ErrorResponse);
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.warn('Prisma error', { code: err.code, path, method });

    switch (err.code) {
      case 'P2002': // Unique constraint violation
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_ERROR',
            message: `A record with this ${
              (err.meta?.target as string[])?.[0] || 'value'
            } already exists`,
          },
        } as ErrorResponse);

      case 'P2025': // Record not found
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'The requested resource was not found',
          },
        } as ErrorResponse);

      case 'P2003': // Foreign key constraint violation
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REFERENCE',
            message: 'Invalid reference to related resource',
          },
        } as ErrorResponse);

      default:
        logger.error('Unknown Prisma error', { code: err.code, meta: err.meta });
        return res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'A database error occurred',
          },
        } as ErrorResponse);
    }
  }

  // App errors
  if (err instanceof AppError) {
    const level = err.statusCode >= 500 ? 'error' : 'info';
    logger[level as 'error' | 'info']('Application error', {
      statusCode: err.statusCode,
      message: err.message,
      path,
      method,
    });

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'APP_ERROR',
        message: err.message,
      },
    } as ErrorResponse);
  }

  // Syntax errors (malformed JSON, etc.)
  if (err instanceof SyntaxError) {
    logger.warn('Syntax error', { message: err.message, path });
    return res.status(400).json({
      success: false,
      error: {
        code: 'SYNTAX_ERROR',
        message: 'Malformed request',
      },
    } as ErrorResponse);
  }

  // Unknown errors
  logger.error('Unhandled error', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path,
    method,
  });

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : err.message,
    },
  } as ErrorResponse);
};

// Async route handler wrapper to catch errors
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
