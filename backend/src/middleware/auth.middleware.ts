import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { AppError } from '../middleware/errorHandler.middleware';

interface TokenPayload {
  userId: string;
  email: string;
  planTier: string;
}

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

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'No authentication token provided');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    req.user = { ...decoded, id: decoded.userId };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError(401, 'Token expired', true, 'TOKEN_EXPIRED'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError(401, 'Invalid token', true, 'INVALID_TOKEN'));
    }
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError(401, 'Authentication failed'));
  }
};

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      req.user = { ...decoded, id: decoded.userId };
    }
  } catch (error) {
    // Optional auth - continue even if token is invalid
    // Just don't set user
  }
  next();
};
