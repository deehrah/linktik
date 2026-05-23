import { Request, Response, NextFunction } from 'express';
import { LinkService } from '@/services/LinkService';
import { asyncHandler, AppError } from '@/middleware/errorHandler.middleware';
import UAParser from 'ua-parser-js';
import geoip from 'geoip-lite';

const linkService = new LinkService();
const parser = new UAParser();

export class LinkController {
  /**
   * POST /api/links - Create a new shortened link
   */
  createLink = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const link = await linkService.createLink(req.user.id, req.body);

    res.status(201).json({
      success: true,
      data: link,
      message: 'Link created successfully',
    });
  });

  /**
   * GET /api/links - Get all links for authenticated user
   */
  getUserLinks = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // Validate pagination
    if (page < 1) throw new AppError(400, 'Page must be >= 1');
    if (limit < 1 || limit > 100)
      throw new AppError(400, 'Limit must be between 1 and 100');

    const result = await linkService.getUserLinks(req.user.id, page, limit);

    res.json({
      success: true,
      data: result.links,
      pagination: result.pagination,
    });
  });

  /**
   * GET /api/links/:id - Get specific link details
   */
  getLinkById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const link = await linkService.getLinkById(req.params.id, req.user.id);

    res.json({
      success: true,
      data: link,
    });
  });

  /**
   * PUT /api/links/:id - Update link
   */
  updateLink = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const link = await linkService.updateLink(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      success: true,
      data: link,
      message: 'Link updated successfully',
    });
  });

  /**
   * DELETE /api/links/:id - Delete link
   */
  deleteLink = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    await linkService.deleteLink(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Link deleted successfully',
    });
  });

  /**
   * GET /api/links/:id/analytics - Get link analytics
   */
  getLinkAnalytics = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const days = parseInt(req.query.days as string) || 7;
    if (days < 1 || days > 365)
      throw new AppError(400, 'Days must be between 1 and 365');

    const analytics = await linkService.getLinkAnalytics(
      req.params.id,
      req.user.id,
      days
    );

    res.json({
      success: true,
      data: analytics,
    });
  });

  /**
   * POST /api/links/:shortCode/click - Record a click (no auth needed, public)
   * This is called before redirect to track analytics
   */
  recordClick = asyncHandler(async (req: Request, res: Response) => {
    const { shortCode } = req.params;

    // Parse user agent
    const userAgent = req.headers['user-agent'] || '';
    const ua = parser.setUA(userAgent).getResult();

    // Get geolocation from IP
    const clientIp =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      '';
    const ipAddress = clientIp.split(',')[0].trim();
    const geo = geoip.lookup(ipAddress);

    // Record the click
    await linkService.recordClick(shortCode, {
      ipAddress,
      userAgent,
      referer: req.headers.referer,
      country: geo?.country,
      city: geo?.city,
      device: ua.device.type || 'desktop',
      browser: ua.browser.name,
      os: ua.os.name,
    });

    res.json({
      success: true,
      message: 'Click recorded',
    });
  });
}

export default new LinkController();
