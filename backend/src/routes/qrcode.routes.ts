import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { QRCodeService } from '../services/QRCodeService';
import { AnalyticsService } from '../services/AnalyticsService';

const router = Router();

// Get all QR codes for authenticated user
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const qrCodes = await QRCodeService.getUserQRCodes(userId);
    res.json(qrCodes);
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({ error: 'Failed to fetch QR codes' });
  }
});

// Get single QR code
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const qrCode = await QRCodeService.getQRCode(id, userId);

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    res.json(qrCode);
  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({ error: 'Failed to fetch QR code' });
  }
});

// Get QR code analytics
router.get('/:id/analytics', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check ownership
    const qrCode = await QRCodeService.getQRCode(id, userId);
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    const analytics = await AnalyticsService.getQRAnalytics(id);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching QR analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Create new QR code
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { data, linkId, fgColor, bgColor, size } = req.body;
    const userId = req.user!.userId;

    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    const qrCode = await QRCodeService.generateQRCode(userId, {
      data,
      linkId,
      fgColor,
      bgColor,
      size,
    });

    res.status(201).json(qrCode);
  } catch (error) {
    console.error('Error creating QR code:', error);
    res.status(500).json({ error: 'Failed to create QR code' });
  }
});

// Update QR code
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, fgColor, bgColor } = req.body;
    const userId = req.user!.userId;

    const qrCode = await QRCodeService.updateQRCode(id, userId, {
      data,
      fgColor,
      bgColor,
    });

    res.json(qrCode);
  } catch (error) {
    console.error('Error updating QR code:', error);
    const message = error instanceof Error ? error.message : 'Failed to update QR code';
    res.status(error instanceof Error && error.message === 'QR code not found' ? 404 : 500)
      .json({ error: message });
  }
});

// Delete QR code
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = await QRCodeService.deleteQRCode(id, userId);
    res.json(result);
  } catch (error) {
    console.error('Error deleting QR code:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete QR code';
    res.status(error instanceof Error && error.message === 'QR code not found' ? 404 : 500)
      .json({ error: message });
  }
});

export default router;
