import { PrismaClient } from '@prisma/client';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

const prisma = new PrismaClient();

interface ClickData {
  linkId: string;
  ipAddress: string;
  userAgent: string;
  referer?: string;
}

interface ScanData {
  qrCodeId: string;
  ipAddress: string;
  userAgent: string;
}

export class AnalyticsService {
  static async trackLinkClick(data: ClickData) {
    try {
      const geo = geoip.lookup(data.ipAddress);
      const parser = new UAParser(data.userAgent);
      const uaResult = parser.getResult();

      // Increment click count
      await prisma.link.update({
        where: { id: data.linkId },
        data: { clickCount: { increment: 1 }, lastClickedAt: new Date() },
      });

      // Log detailed analytics
      await prisma.analyticsClick.create({
        data: {
          linkId: data.linkId,
          ipAddress: data.ipAddress,
          country: geo?.country || 'Unknown',
          city: geo?.city || 'Unknown',
          region: geo?.region || 'Unknown',
          browser: uaResult.browser.name || 'Unknown',
          browserVersion: uaResult.browser.version || 'Unknown',
          os: uaResult.os.name || 'Unknown',
          osVersion: uaResult.os.version || 'Unknown',
          device: uaResult.device.type || 'desktop',
          deviceModel: uaResult.device.model || 'Unknown',
          referer: data.referer || null,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      console.error('Error tracking link click:', error);
    }
  }

  static async trackQRScan(data: ScanData) {
    try {
      const geo = geoip.lookup(data.ipAddress);
      const parser = new UAParser(data.userAgent);
      const uaResult = parser.getResult();

      // Increment scan count
      await prisma.qRCode.update({
        where: { id: data.qrCodeId },
        data: { scanCount: { increment: 1 }, lastScannedAt: new Date() },
      });

      // Log detailed analytics
      await prisma.analyticsScan.create({
        data: {
          qrCodeId: data.qrCodeId,
          ipAddress: data.ipAddress,
          country: geo?.country || 'Unknown',
          city: geo?.city || 'Unknown',
          region: geo?.region || 'Unknown',
          browser: uaResult.browser.name || 'Unknown',
          browserVersion: uaResult.browser.version || 'Unknown',
          os: uaResult.os.name || 'Unknown',
          osVersion: uaResult.os.version || 'Unknown',
          device: uaResult.device.type || 'desktop',
          deviceModel: uaResult.device.model || 'Unknown',
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      console.error('Error tracking QR scan:', error);
    }
  }

  /**
   * Get comprehensive link analytics with optimized single query
   * Retrieves all aggregations in one database query instead of multiple round-trips
   */
  static async getLinkAnalytics(linkId: string, days: number = 30) {
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: {
        id: true,
        shortCode: true,
        originalUrl: true,
        title: true,
        clickCount: true,
        createdAt: true,
      },
    });

    if (!link) return null;

    // Calculate date range for analytics
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // ✅ OPTIMIZED: Single query with all aggregations
    // Using Promise.all to fetch analytics data in parallel
    const [analytics, recentClicks] = await Promise.all([
      prisma.$queryRaw`
        SELECT
          COUNT(*) as total_clicks,
          COUNT(DISTINCT DATE(clicked_at)) as unique_days,
          COUNT(DISTINCT country) as unique_countries,
          COUNT(DISTINCT device) as unique_devices,
          COUNT(DISTINCT browser) as unique_browsers,
          COUNT(DISTINCT ip_address) as unique_ips,
          MAX(clicked_at) as latest_click
        FROM analytics_clicks
        WHERE link_id = ${linkId}
          AND clicked_at >= ${startDate}
      ` as Promise<any[]>,
      prisma.analyticsClick.findMany({
        where: {
          linkId,
          clickedAt: { gte: startDate },
        },
        orderBy: { clickedAt: 'desc' },
        take: 20,
      }),
    ]);

    // Fetch aggregated stats in parallel
    const [countries, devices, browsers, dailyStats] = await Promise.all([
      prisma.analyticsClick.groupBy({
        by: ['country'],
        where: {
          linkId,
          clickedAt: { gte: startDate },
          country: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      prisma.analyticsClick.groupBy({
        by: ['device'],
        where: {
          linkId,
          clickedAt: { gte: startDate },
          device: { not: null },
        },
        _count: { id: true },
      }),
      prisma.analyticsClick.groupBy({
        by: ['browser'],
        where: {
          linkId,
          clickedAt: { gte: startDate },
          browser: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      prisma.$queryRaw`
        SELECT
          DATE(clicked_at) as click_date,
          COUNT(*) as clicks
        FROM analytics_clicks
        WHERE link_id = ${linkId}
          AND clicked_at >= ${startDate}
        GROUP BY DATE(clicked_at)
        ORDER BY click_date DESC
      ` as Promise<Array<{ click_date: string; clicks: number }>>,
    ]);

    const summary = analytics[0];

    return {
      link: {
        id: link.id,
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        title: link.title,
        clickCount: link.clickCount,
        createdAt: link.createdAt,
      },
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
      summary: {
        totalClicks: summary.total_clicks || 0,
        uniqueDays: summary.unique_days || 0,
        uniqueCountries: summary.unique_countries || 0,
        uniqueDevices: summary.unique_devices || 0,
        uniqueBrowsers: summary.unique_browsers || 0,
        uniqueIPs: summary.unique_ips || 0,
        latestClick: summary.latest_click,
      },
      analytics: {
        byCountry: countries.map((c) => ({ country: c.country, clicks: c._count.id })),
        byDevice: devices.map((d) => ({ device: d.device, clicks: d._count.id })),
        byBrowser: browsers.map((b) => ({ browser: b.browser, clicks: b._count.id })),
        byDay: dailyStats,
      },
      recentClicks,
    };
  }

  static async getQRAnalytics(qrCodeId: string) {
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId },
      include: {
        scans: {
          orderBy: { scannedAt: 'desc' },
          take: 100,
        },
        link: true,
      },
    });

    if (!qrCode) return null;

    // Aggregate analytics
    const countryStats = await prisma.analyticsScan.groupBy({
      by: ['country'],
      where: { qrCodeId },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    });

    const deviceStats = await prisma.analyticsScan.groupBy({
      by: ['device'],
      where: { qrCodeId },
      _count: { device: true },
    });

    const browserStats = await prisma.analyticsScan.groupBy({
      by: ['browser'],
      where: { qrCodeId },
      _count: { browser: true },
      orderBy: { _count: { browser: 'desc' } },
      take: 5,
    });

    return {
      qrCode: {
        id: qrCode.id,
        data: qrCode.data,
        imageUrl: qrCode.imageUrl,
        scanCount: qrCode.scanCount,
        createdAt: qrCode.createdAt,
        link: qrCode.link,
      },
      analytics: {
        totalScans: qrCode.scanCount,
        countries: countryStats.map((s: any) => ({ country: s.country, count: s._count.country })),
        devices: deviceStats.map((s: any) => ({ device: s.device, count: s._count.device })),
        browsers: browserStats.map((s: any) => ({ browser: s.browser, count: s._count.browser })),
        recentScans: qrCode.scans.slice(0, 20),
      },
    };
  }
}
