import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware';
import { AnalyticsService } from '../services/AnalyticsService';

const router = Router();
const prisma = new PrismaClient();

// Get all links for authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('📝 Fetching links for user:', req.user?.userId);
    
    const links = await prisma.link.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        qrCode: true,
      },
    });

    console.log('✅ Found', links.length, 'links');
    res.json(links);
  } catch (error) {
    console.error('❌ Error fetching links:', error);
    res.status(500).json({ error: 'Failed to fetch links', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get single link
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const link = await prisma.link.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
      include: {
        qrCode: true,
      },
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(link);
  } catch (error) {
    console.error('Error fetching link:', error);
    res.status(500).json({ error: 'Failed to fetch link' });
  }
});

// Get link analytics
router.get('/:id/analytics', authMiddleware, async (req, res) => {
  try {
    const link = await prisma.link.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const analytics = await AnalyticsService.getLinkAnalytics(req.params.id);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching link analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Create new link
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { originalUrl, shortCode, title } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    // Generate short code if not provided
    const code = shortCode || Math.random().toString(36).substring(2, 8);

    // Check if short code already exists
    const existing = await prisma.link.findUnique({
      where: { shortCode: code },
    });

    if (existing) {
      return res.status(400).json({ error: 'Short code already exists' });
    }

    const link = await prisma.link.create({
      data: {
        userId: req.user!.userId,
        originalUrl,
        shortCode: code,
        title,
      },
    });

    res.status(201).json(link);
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({ error: 'Failed to create link' });
  }
});

// Update link
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { originalUrl, title } = req.body;

    const link = await prisma.link.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const updated = await prisma.link.update({
      where: { id: req.params.id },
      data: {
        originalUrl,
        title,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating link:', error);
    res.status(500).json({ error: 'Failed to update link' });
  }
});

// Delete link
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const link = await prisma.link.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    await prisma.link.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

export default router;
