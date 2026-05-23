import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AnalyticsService } from '../services/AnalyticsService';

const router = Router();
const prisma = new PrismaClient();

// Public redirect endpoint - /:shortCode
router.get('/:shortCode', async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;

    // Find link by short code
    const link = await prisma.link.findUnique({
      where: { shortCode },
    });

    if (!link) {
      return res.status(404).send('Link not found');
    }

    // Check if link is active
    if (!link.isActive) {
      return res.status(410).send('Link is no longer active');
    }

    // Check if link is expired
    if (link.expiresAt && new Date() > link.expiresAt) {
      return res.status(410).send('Link has expired');
    }

    // Track click asynchronously (don't wait for it)
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                      req.socket.remoteAddress || 
                      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const referer = req.headers['referer'];

    AnalyticsService.trackLinkClick({
      linkId: link.id,
      ipAddress,
      userAgent,
      referer,
    }).catch(err => console.error('Error tracking click:', err));

    // Redirect to original URL
    res.redirect(302, link.originalUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).send('Internal server error');
  }
});

// QR code scan tracking endpoint
router.get('/qr/:id/scan', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const qrCode = await prisma.qRCode.findUnique({
      where: { id },
    });

    if (!qrCode) {
      return res.status(404).send('QR code not found');
    }

    // Track scan asynchronously
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                      req.socket.remoteAddress || 
                      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    AnalyticsService.trackQRScan({
      qrCodeId: qrCode.id,
      ipAddress,
      userAgent,
    }).catch(err => console.error('Error tracking scan:', err));

    // Redirect to QR code data (URL)
    res.redirect(302, qrCode.data);
  } catch (error) {
    console.error('Error processing QR scan:', error);
    res.status(500).send('Internal server error');
  }
});

export default router;
