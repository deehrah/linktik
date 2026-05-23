import { customAlphabet } from 'nanoid';
import prisma from '../lib/prisma';
import redis from '../lib/redis';
import { AppError, asyncHandler } from '../middleware/errorHandler.middleware';
import { logger } from '../lib/logger';
import { z } from 'zod';

// Validation schemas
const createLinkSchema = z.object({
  originalUrl: z.string().url('Invalid URL'),
  customSlug: z.string().min(3).max(50).optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  passwordHash: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

const updateLinkSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

type CreateLinkInput = z.infer<typeof createLinkSchema>;
type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

// Generate short codes
const nanoid = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  6
);

export class LinkService {
  /**
   * Create a new shortened link
   */
  async createLink(userId: string, input: CreateLinkInput) {
    const validated = createLinkSchema.parse(input);

    // Get user info to check plan tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planTier: true, id: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Determine short code
    let shortCode: string;

    if (validated.customSlug) {
      // Check if user can use custom codes
      const canUseCustom = ['PRO', 'ENTERPRISE'].includes(user.planTier);
      if (!canUseCustom) {
        throw new AppError(
          403,
          'Custom short codes are only available for PRO and ENTERPRISE plans',
          true,
          'PLAN_RESTRICTION'
        );
      }

      // Validate custom slug
      this.validateCustomSlug(validated.customSlug);

      // Check if slug is available
      const existingLink = await prisma.link.findUnique({
        where: { shortCode: validated.customSlug },
      });

      if (existingLink) {
        throw new AppError(
          409,
          'This short code is already taken',
          true,
          'SLUG_EXISTS'
        );
      }

      shortCode = validated.customSlug;
    } else {
      // Generate random short code
      shortCode = await this.generateUniqueShortCode();
    }

    // Create link in database
    const link = await prisma.link.create({
      data: {
        userId,
        originalUrl: validated.originalUrl,
        shortCode,
        title: validated.title,
        description: validated.description,
        passwordHash: validated.passwordHash,
        expiresAt: validated.expiresAt
          ? new Date(validated.expiresAt)
          : null,
      },
    });

    // Cache in Redis for fast redirects (24 hours)
    await this.cacheLink(shortCode, validated.originalUrl, 86400);

    logger.info('Link created', {
      linkId: link.id,
      userId,
      shortCode,
      custom: !!validated.customSlug,
    });

    return this.formatLinkResponse(link);
  }

  /**
   * Get link by short code (for redirects)
   */
  async getLinkByShortCode(shortCode: string) {
    // Try cache first
    const cached = await redis.get(`link:${shortCode}`);
    if (cached) {
      logger.debug('Link hit cache', { shortCode });
      return JSON.parse(cached);
    }

    // Query database
    const link = await prisma.link.findUnique({
      where: { shortCode },
    });

    if (!link) {
      throw new AppError(
        404,
        'Link not found',
        true,
        'LINK_NOT_FOUND'
      );
    }

    // Check if expired
    if (link.expiresAt && new Date() > link.expiresAt) {
      throw new AppError(
        410,
        'This link has expired',
        true,
        'LINK_EXPIRED'
      );
    }

    // Check if active
    if (!link.isActive) {
      throw new AppError(
        410,
        'This link has been deactivated',
        true,
        'LINK_INACTIVE'
      );
    }

    // Cache for future requests
    await this.cacheLink(shortCode, link.originalUrl, 86400);

    const result = {
      originalUrl: link.originalUrl,
      passwordHash: link.passwordHash,
      requiresPassword: !!link.passwordHash,
    };

    // Also cache the full result
    await redis.set(
      `link:${shortCode}`,
      JSON.stringify(result),
      'EX',
      86400
    );

    return result;
  }

  /**
   * Get link details for authenticated user
   */
  async getLinkById(linkId: string, userId: string) {
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      include: {
        clicks: {
          select: {
            id: true,
            clickedAt: true,
            country: true,
            device: true,
            browser: true,
          },
          take: 10,
          orderBy: { clickedAt: 'desc' },
        },
      },
    });

    if (!link) {
      throw new AppError(404, 'Link not found');
    }

    // Verify ownership
    if (link.userId !== userId) {
      throw new AppError(
        403,
        'You do not have permission to access this link',
        true,
        'FORBIDDEN'
      );
    }

    return this.formatLinkResponse(link);
  }

  /**
   * Get all links for a user with pagination
   */
  async getUserLinks(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [links, total] = await Promise.all([
      prisma.link.findMany({
        where: { userId },
        include: {
          clicks: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.link.count({ where: { userId } }),
    ]);

    return {
      links: links.map((link) => ({
        ...this.formatLinkResponse(link),
        clickCount: link.clicks.length,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update link details
   */
  async updateLink(
    linkId: string,
    userId: string,
    input: UpdateLinkInput
  ) {
    const validated = updateLinkSchema.parse(input);

    // Verify ownership
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { userId: true },
    });

    if (!link) {
      throw new AppError(404, 'Link not found');
    }

    if (link.userId !== userId) {
      throw new AppError(403, 'You do not have permission to edit this link');
    }

    // Update
    const updated = await prisma.link.update({
      where: { id: linkId },
      data: validated,
    });

    logger.info('Link updated', { linkId, userId, changes: validated });

    return this.formatLinkResponse(updated);
  }

  /**
   * Delete a link
   */
  async deleteLink(linkId: string, userId: string) {
    // Verify ownership
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { userId: true, shortCode: true },
    });

    if (!link) {
      throw new AppError(404, 'Link not found');
    }

    if (link.userId !== userId) {
      throw new AppError(403, 'You do not have permission to delete this link');
    }

    // Delete from database
    await prisma.link.delete({ where: { id: linkId } });

    // Remove from cache
    await redis.del(`link:${link.shortCode}`);

    logger.info('Link deleted', { linkId, userId });

    return { success: true, id: linkId };
  }

  /**
   * Record a click on a link
   */
  async recordClick(
    shortCode: string,
    metadata: {
      ipAddress?: string;
      userAgent?: string;
      referer?: string;
      country?: string;
      city?: string;
      device?: string;
      browser?: string;
      os?: string;
    }
  ) {
    // Get link
    const link = await prisma.link.findUnique({
      where: { shortCode },
      select: { id: true },
    });

    if (!link) {
      throw new AppError(404, 'Link not found');
    }

    // Record click (async - don't block redirect)
    // Update click count in-memory first for performance
    await redis.incr(`clicks:${link.id}`);

    // Batch write to database every 10 clicks
    const clickCount = await redis.get(`clicks:${link.id}`);
    if (parseInt(clickCount as string) % 10 === 0) {
      // Write to database asynchronously
      this.flushClicksToDatabase(link.id).catch((err) => {
        logger.error('Failed to flush clicks', { linkId: link.id, error: err });
      });
    }

    // Record detailed analytics
    await prisma.analyticsClick.create({
      data: {
        linkId: link.id,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        referer: metadata.referer,
        country: metadata.country,
        city: metadata.city,
        device: metadata.device,
        browser: metadata.browser,
        os: metadata.os,
      },
    });

    logger.debug('Click recorded', { linkId: link.id, shortCode });
  }

  /**
   * Get link analytics
   */
  async getLinkAnalytics(linkId: string, userId: string, days = 7) {
    // Verify ownership
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { userId: true, shortCode: true },
    });

    if (!link) {
      throw new AppError(404, 'Link not found');
    }

    if (link.userId !== userId) {
      throw new AppError(403, 'You do not have permission to view this link');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalClicks, clicksByDay, topCountries, topDevices, topBrowsers] =
      await Promise.all([
        prisma.analyticsClick.count({
          where: {
            linkId,
            clickedAt: { gte: startDate },
          },
        }),
        prisma.analyticsClick.groupBy({
          by: ['clickedAt'],
          where: {
            linkId,
            clickedAt: { gte: startDate },
          },
          _count: { id: true },
        }),
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
      ]);

    return {
      shortCode: link.shortCode,
      totalClicks,
      period: {
        days,
        startDate,
        endDate: new Date(),
      },
      clicksByDay,
      topCountries: topCountries.map((c) => ({
        country: c.country,
        clicks: c._count.id,
      })),
      topDevices: topDevices.map((d) => ({
        device: d.device,
        clicks: d._count.id,
      })),
      topBrowsers: topBrowsers.map((b) => ({
        browser: b.browser,
        clicks: b._count.id,
      })),
    };
  }

  // ============== PRIVATE HELPERS ==============

  /**
   * Validate custom slug format and reserved words
   */
  private validateCustomSlug(slug: string) {
    const ALLOWED_PATTERN = /^[a-zA-Z0-9-_]+$/;
    if (!ALLOWED_PATTERN.test(slug)) {
      throw new AppError(
        400,
        'Custom code can only contain letters, numbers, hyphens, and underscores'
      );
    }

    const RESERVED_WORDS = [
      'api',
      'admin',
      'dashboard',
      'login',
      'signup',
      'logout',
      'events',
      'tickets',
      'qr',
      'links',
      'analytics',
      'settings',
      'help',
      'support',
      'pricing',
      'about',
      'contact',
      'terms',
      'privacy',
      'blog',
      'docs',
      'status',
      'health',
      'redirect',
      'shorten',
      'create',
      'delete',
      'update',
    ];

    if (RESERVED_WORDS.includes(slug.toLowerCase())) {
      throw new AppError(400, 'This short code is reserved and cannot be used');
    }
  }

  /**
   * Generate unique random short code
   */
  private async generateUniqueShortCode(): Promise<string> {
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    while (attempts < MAX_ATTEMPTS) {
      const code = nanoid();

      const existing = await prisma.link.findUnique({
        where: { shortCode: code },
      });

      if (!existing) {
        return code;
      }

      attempts++;
    }

    // Fallback to 8 characters if collision persists
    const longNanoid = customAlphabet(
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      8
    );
    return longNanoid();
  }

  /**
   * Cache link in Redis
   */
  private async cacheLink(
    shortCode: string,
    originalUrl: string,
    expirySeconds: number
  ) {
    const cacheKey = `link:${shortCode}`;
    await redis.set(
      cacheKey,
      JSON.stringify({ originalUrl }),
      'EX',
      expirySeconds
    );
  }

  /**
   * Flush accumulated clicks from Redis to database
   */
  private async flushClicksToDatabase(linkId: string) {
    const clickKey = `clicks:${linkId}`;
    const count = await redis.get(clickKey);

    if (count) {
      await prisma.link.update({
        where: { id: linkId },
        data: {
          clickCount: { increment: parseInt(count as string) },
          lastClickedAt: new Date(),
        },
      });

      await redis.del(clickKey);
    }
  }

  /**
   * Format link response
   */
  private formatLinkResponse(link: any) {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    return {
      id: link.id,
      shortCode: link.shortCode,
      shortUrl: `${appUrl}/${link.shortCode}`,
      originalUrl: link.originalUrl,
      title: link.title,
      description: link.description,
      clickCount: link.clickCount || 0,
      lastClickedAt: link.lastClickedAt,
      isActive: link.isActive,
      expiresAt: link.expiresAt,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    };
  }
}
