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
        data: { clickCount: { increment: 1 } },
      });

      // Log detailed analytics
      await prisma.linkClick.create({
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
        data: { scanCount: { increment: 1 } },
      });

      // Log detailed analytics
      await prisma.qRScan.create({
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
        },
      });
    } catch (error) {
      console.error('Error tracking QR scan:', error);
    }
  }

  static async getLinkAnalytics(linkId: string) {
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      include: {
        clicks: {
          orderBy: { clickedAt: 'desc' },
          take: 100,
        },
      },
    });

    if (!link) return null;

    // Aggregate analytics
    const countryStats = await prisma.linkClick.groupBy({
      by: ['country'],
      where: { linkId },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    });

    const deviceStats = await prisma.linkClick.groupBy({
      by: ['device'],
      where: { linkId },
      _count: { device: true },
    });

    const browserStats = await prisma.linkClick.groupBy({
      by: ['browser'],
      where: { linkId },
      _count: { browser: true },
      orderBy: { _count: { browser: 'desc' } },
      take: 5,
    });

    const osStats = await prisma.linkClick.groupBy({
      by: ['os'],
      where: { linkId },
      _count: { os: true },
      orderBy: { _count: { os: 'desc' } },
      take: 5,
    });

    return {
      link: {
        id: link.id,
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        title: link.title,
        clickCount: link.clickCount,
        createdAt: link.createdAt,
      },
      analytics: {
        totalClicks: link.clickCount,
        countries: countryStats.map(s => ({ country: s.country, count: s._count.country })),
        devices: deviceStats.map(s => ({ device: s.device, count: s._count.device })),
        browsers: browserStats.map(s => ({ browser: s.browser, count: s._count.browser })),
        operatingSystems: osStats.map(s => ({ os: s.os, count: s._count.os })),
        recentClicks: link.clicks.slice(0, 20),
      },
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
    const countryStats = await prisma.qRScan.groupBy({
      by: ['country'],
      where: { qrCodeId },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    });

    const deviceStats = await prisma.qRScan.groupBy({
      by: ['device'],
      where: { qrCodeId },
      _count: { device: true },
    });

    const browserStats = await prisma.qRScan.groupBy({
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
        countries: countryStats.map(s => ({ country: s.country, count: s._count.country })),
        devices: deviceStats.map(s => ({ device: s.device, count: s._count.device })),
        browsers: browserStats.map(s => ({ browser: s.browser, count: s._count.browser })),
        recentScans: qrCode.scans.slice(0, 20),
      },
    };
  }
}
