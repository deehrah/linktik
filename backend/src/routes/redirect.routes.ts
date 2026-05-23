import { Router, Request, Response, NextFunction } from 'express';
import { LinkService } from '../services/LinkService';
import { asyncHandler, AppError } from '../middleware/errorHandler.middleware';
import { logger } from '../lib/logger';

const router = Router();
const linkService = new LinkService();

/**
 * Public redirect endpoint
 * GET /:shortCode
 * Redirects to the original URL with click tracking
 */
router.get('/:shortCode', asyncHandler(async (req: Request, res: Response) => {
  const { shortCode } = req.params;

  try {
    // Get link from cache/database
    const linkData = await linkService.getLinkByShortCode(shortCode);

    // Check if link requires password
    if (linkData.requiresPassword && !req.headers['x-link-password']) {
      // Return 403 Forbidden if password required but not provided
      throw new AppError(
        403,
        'This link is password protected',
        true,
        'PASSWORD_REQUIRED'
      );
    }

    // Record click asynchronously
    const ipAddress =
      ((req.headers['x-forwarded-for'] as string) || '')
        .split(',')[0]
        .trim() || req.socket.remoteAddress || 'unknown';

    linkService.recordClick(shortCode, {
      ipAddress,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer,
    }).catch((err) => {
      logger.error('Failed to record click', { shortCode, error: err });
    });

    // Redirect to original URL with 302 Found
    // Use 302 instead of 301 to avoid browser caching the redirect
    res.redirect(302, linkData.originalUrl);

    logger.info('Redirect executed', { shortCode, ipAddress });
  } catch (error) {
    if (error instanceof AppError) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'LINK_NOT_FOUND',
            message: 'The link you are trying to access does not exist',
          },
        });
      }
      if (error.statusCode === 410) {
        return res.status(410).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      if (error.statusCode === 403) {
        return res.status(403).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
    }

    logger.error('Error processing redirect', {
      shortCode,
      error: error instanceof Error ? error.message : String(error),
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'REDIRECT_ERROR',
        message: 'An error occurred while processing your request',
      },
    });
  }
}));

/**
 * QR code scan tracking endpoint (placeholder)
 * GET /qr/:id/scan
 * Tracks QR code scans and redirects to associated URL
 */
router.get('/qr/:id/scan', asyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement QR code tracking with QRCodeService
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'QR code scanning is coming soon',
    },
  });
}));

/**
 * Catch-all 404 for undefined routes
 */
router.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
    },
  });
});

export default router;

