/**
 * Input sanitization middleware
 * Removes potentially dangerous HTML/scripts from user input to prevent XSS attacks
 */

import sanitizeHtml from 'sanitize-html';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

/**
 * Recursively sanitize all string values in an object
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, {
      allowedTags: [], // No HTML tags allowed
      allowedAttributes: {},
      allowedIframeHostnames: [],
    });
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Middleware to sanitize request body, query, and params
 * Removes HTML tags and potentially dangerous content
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize request body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query) as any;
    }

    // Sanitize URL parameters
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    logger.debug('Input sanitized', { path: req.path, method: req.method });
    next();
  } catch (error) {
    logger.error('Error during input sanitization', {
      error: error instanceof Error ? error.message : String(error),
      path: req.path,
    });
    next(); // Continue even if sanitization fails
  }
};

export default sanitizeInput;
