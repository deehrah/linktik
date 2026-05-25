import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { asyncHandler, AppError } from '../middleware/errorHandler.middleware';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';

export class AnalyticsController {
  /**
   * GET /api/analytics/links/:linkId - Get analytics for a specific link
   */
  getLinkAnalytics = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { linkId } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    if (days < 1 || days > 365) {
      throw new AppError(400, 'Days must be between 1 and 365');
    }

    // Verify link ownership
    const link = await prisma.link.findFirst({
      where: { id: linkId, userId: req.user.id },
    });

    if (!link) {
      throw new AppError(404, 'Link not found or you do not have permission');
    }

    const analytics = await AnalyticsService.getLinkAnalytics(linkId, days);

    if (!analytics) {
      throw new AppError(404, 'Link not found');
    }

    res.status(200).json({
      success: true,
      data: analytics,
      message: 'Link analytics retrieved successfully',
    });
  });

  /**
   * GET /api/analytics/qrcodes/:qrCodeId - Get analytics for a specific QR code
   */
  getQRCodeAnalytics = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { qrCodeId } = req.params;

    // Verify QR code ownership
    const qrCode = await prisma.qRCode.findFirst({
      where: { id: qrCodeId, userId: req.user.id },
    });

    if (!qrCode) {
      throw new AppError(404, 'QR code not found or you do not have permission');
    }

    const analytics = await AnalyticsService.getQRAnalytics(qrCodeId);

    if (!analytics) {
      throw new AppError(404, 'QR code not found');
    }

    res.status(200).json({
      success: true,
      data: analytics,
      message: 'QR code analytics retrieved successfully',
    });
  });

  /**
   * GET /api/analytics/dashboard - Get user dashboard analytics (all links + QR codes)
   */
  getDashboardAnalytics = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { prisma } = await import('../lib/prisma.js');

    // Fetch all user data in parallel
    const [linksData, qrCodesData, recentClicks] = await Promise.all([
      // Get all links with click stats
      prisma.link.findMany({
        where: { userId: req.user.id },
        select: {
          id: true,
          shortCode: true,
          title: true,
          originalUrl: true,
          clickCount: true,
          createdAt: true,
          lastClickedAt: true,
        },
        orderBy: { clickCount: 'desc' },
        take: 10,
      }),

      // Get all QR codes with scan stats
      prisma.qRCode.findMany({
        where: { userId: req.user.id },
        select: {
          id: true,
          data: true,
          imageUrl: true,
          scanCount: true,
          format: true,
          createdAt: true,
          lastScannedAt: true,
          link: {
            select: { shortCode: true, title: true },
          },
        },
        orderBy: { scanCount: 'desc' },
        take: 10,
      }),

      // Get recent clicks (last 7 days)
      prisma.$queryRaw`
        SELECT
          ac.link_id,
          l.short_code,
          l.title,
          COUNT(*) as clicks,
          MAX(ac.clicked_at) as latest_click
        FROM analytics_clicks ac
        JOIN links l ON ac.link_id = l.id
        WHERE l.user_id = ${req.user.id}
          AND ac.clicked_at >= NOW() - INTERVAL 7 DAY
        GROUP BY ac.link_id, l.short_code, l.title
        ORDER BY clicks DESC
        LIMIT 10
      ` as Promise<any[]>,
    ]);

    // Calculate totals
    const totalClicks = linksData.reduce((sum: number, link: any) => sum + link.clickCount, 0);
    const totalScans = qrCodesData.reduce((sum: number, qr: any) => sum + qr.scanCount, 0);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalLinks: linksData.length,
          totalQRCodes: qrCodesData.length,
          totalClicks,
          totalScans,
          combinedEngagement: totalClicks + totalScans,
        },
        topLinks: linksData,
        topQRCodes: qrCodesData,
        recentActivity: recentClicks,
      },
      message: 'Dashboard analytics retrieved successfully',
    });
  });

  /**
   * GET /api/analytics/summary - Get quick summary stats
   */
  getSummaryStats = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { prisma } = await import('../lib/prisma.js');

    const [totalLinks, totalQRCodes, totalClicks, totalScans] = await Promise.all([
      prisma.link.count({ where: { userId: req.user.id } }),
      prisma.qRCode.count({ where: { userId: req.user.id } }),
      prisma.analyticsClick.count({ where: { link: { userId: req.user.id } } }),
      prisma.analyticsScan.count({ where: { qrCode: { userId: req.user.id } } }),
    ]);

    // Get clicks in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const clicksLast24h = await prisma.analyticsClick.count({
      where: {
        link: { userId: req.user.id },
        clickedAt: { gte: oneDayAgo },
      },
    });

    const scansLast24h = await prisma.analyticsScan.count({
      where: {
        qrCode: { userId: req.user.id },
        scannedAt: { gte: oneDayAgo },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        totalLinks,
        totalQRCodes,
        totalClicks,
        totalScans,
        clicksLast24h,
        scansLast24h,
        engagementLast24h: clicksLast24h + scansLast24h,
      },
      message: 'Summary stats retrieved successfully',
    });
  });

  /**
   * GET /api/analytics/trending - Get trending links and QR codes
   */
  getTrendingData = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { prisma } = await import('../lib/prisma.js');

    // Get trending links (highest clicks in last 7 days)
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trendingLinks = await prisma.$queryRaw`
      SELECT
        l.id,
        l.short_code,
        l.title,
        l.click_count,
        COUNT(ac.id) as clicks_last_7_days
      FROM links l
      LEFT JOIN analytics_clicks ac ON l.id = ac.link_id AND ac.clicked_at >= ${last7Days}
      WHERE l.user_id = ${req.user.id}
      GROUP BY l.id
      ORDER BY clicks_last_7_days DESC
      LIMIT 5
    ` as any[];

    const trendingQRCodes = await prisma.$queryRaw`
      SELECT
        qr.id,
        qr.data,
        qr.format,
        qr.scan_count,
        COUNT(qs.id) as scans_last_7_days
      FROM qr_codes qr
      LEFT JOIN analytics_scans qs ON qr.id = qs.qr_code_id AND qs.scanned_at >= ${last7Days}
      WHERE qr.user_id = ${req.user.id}
      GROUP BY qr.id
      ORDER BY scans_last_7_days DESC
      LIMIT 5
    ` as any[];

    res.status(200).json({
      success: true,
      data: {
        trendingLinks,
        trendingQRCodes,
        period: {
          days: 7,
          startDate: last7Days.toISOString(),
          endDate: new Date().toISOString(),
        },
      },
      message: 'Trending data retrieved successfully',
    });
  });
}
