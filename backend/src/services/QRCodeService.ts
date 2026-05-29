import QRCode from 'qrcode';
import sharp from 'sharp';
import { prisma } from '../lib/prisma';
import { uploadToCloudinary, deleteFromCloudinary } from '../lib/cloudinary';
import { logger } from '../lib/logger';
import { PLAN_FEATURES } from '../config/constants';

interface GenerateQROptions {
  data: string;
  linkId?: string;
  fgColor?: string;
  bgColor?: string;
  size?: number;
  format?: 'png' | 'svg' | 'pdf';
  logoUrl?: string;
  logoSize?: number; // Percentage of QR code size (5-30)
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
}

interface QRCodeMetadata {
  data: string;
  fgColor: string;
  bgColor: string;
  format: string;
  hasLogo: boolean;
  logoUrl?: string;
  size: number;
  errorCorrection: string;
  uploadedAt: Date;
  cloudinaryPublicId?: string;
}

export class QRCodeService {
  /**
   * Check if user has reached QR code limit for their plan
   */
  static async checkQRCodeLimit(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const planTier = (user.planTier || 'FREE') as keyof typeof PLAN_FEATURES;
    const limit = PLAN_FEATURES[planTier]?.QR_CODES_PER_MONTH || 0;

    if (limit === 0) return true; // Unlimited

    // Check this month's QR code count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await prisma.qRCode.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
    });

    return count < limit;
  }

  /**
   * Generate QR code buffer (PNG or SVG via base64)
   */
  private static async generateQRBuffer(
    data: string,
    options: {
      fgColor: string;
      bgColor: string;
      size: number;
      format: 'png' | 'svg' | 'pdf';
      errorCorrection: 'L' | 'M' | 'Q' | 'H';
    }
  ): Promise<Buffer> {
    const { fgColor, bgColor, size, format, errorCorrection } = options;

    try {
      // Generate PNG buffer (primary format)
      const pngBuffer = await QRCode.toBuffer(data, {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorCorrection,
      });

      if (format === 'png') {
        return pngBuffer;
      }

      // For SVG: Generate data URL and convert to buffer
      if (format === 'svg') {
        const dataUrl = await QRCode.toDataURL(data, {
          width: size,
          margin: 2,
          color: { dark: fgColor, light: bgColor },
          errorCorrectionLevel: errorCorrection,
        });
        // Extract base64 from data URL and convert to buffer
        const base64Data = dataUrl.split(',')[1];
        return Buffer.from(base64Data, 'base64');
      }

      // PDF format: for now return PNG (true PDF needs pdfkit or similar)
      if (format === 'pdf') {
        logger.warn('PDF format requested but not yet supported, returning PNG');
        return pngBuffer;
      }

      return pngBuffer;
    } catch (error) {
      logger.error('Error generating QR buffer', { error });
      throw new Error(`Failed to generate ${format.toUpperCase()} QR code`);
    }
  }

  /**
   * Add logo overlay to QR code
   */
  private static async addLogoOverlay(
    qrBuffer: Buffer,
    logoUrl: string,
    logoSize: number,
    qrCodeSize: number
  ): Promise<Buffer> {
    try {
      // Fetch logo from URL
      const response = await fetch(logoUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Calculate logo dimensions (as percentage of QR code)
      const logoDimension = Math.round((qrCodeSize * logoSize) / 100);

      // Resize logo and add white background
      const resizedLogo = await sharp(buffer)
        .resize(logoDimension, logoDimension, { fit: 'contain', background: '#FFFFFF' })
        .png()
        .toBuffer();

      // Composite logo onto QR code
      const composited = await sharp(qrBuffer)
        .composite([
          {
            input: resizedLogo,
            gravity: 'center',
          },
        ])
        .png()
        .toBuffer();

      return composited;
    } catch (error) {
      logger.error('Error adding logo overlay', { error });
      throw new Error('Failed to add logo overlay to QR code');
    }
  }

  /**
   * Generate and upload QR code
   */
  static async generateQRCode(userId: string, options: GenerateQROptions) {
    const {
      data,
      linkId,
      fgColor = '#000000',
      bgColor = '#FFFFFF',
      size = 500,
      format = 'png',
      logoUrl,
      logoSize = 20,
      errorCorrection = 'M',
    } = options;

    try {
      // Check plan limit
      const hasCapacity = await this.checkQRCodeLimit(userId);
      if (!hasCapacity) {
        throw new Error('QR code limit reached for your plan');
      }

      // Generate QR code buffer
      let qrBuffer = await this.generateQRBuffer(data, {
        fgColor,
        bgColor,
        size,
        format: format as any,
        errorCorrection,
      });

      // Add logo overlay if provided
      let hasLogo = false;
      if (logoUrl && format === 'png') {
        try {
          qrBuffer = await this.addLogoOverlay(qrBuffer, logoUrl, logoSize, size);
          hasLogo = true;
        } catch (error) {
          logger.warn('Logo overlay failed, continuing without logo', { error });
        }
      }

      // Upload to Cloudinary
      const publicId = `linktik/qrcodes/${userId}/${Date.now()}`;
      const uploadResult = await uploadToCloudinary(qrBuffer, {
        folder: 'linktik/qrcodes',
        public_id: publicId,
        format: format as any,
        quality: 'best',
      });

      // Store metadata in database
      const metadata: QRCodeMetadata = {
        data,
        fgColor,
        bgColor,
        format,
        hasLogo,
        logoUrl: hasLogo ? logoUrl : undefined,
        size,
        errorCorrection,
        uploadedAt: new Date(),
        cloudinaryPublicId: uploadResult.public_id,
      };

      // Create QR code record
      const qrCode = await prisma.qRCode.create({
        data: {
          userId,
          data,
          imageUrl: uploadResult.secure_url,
          fgColor,
          bgColor,
          linkId: linkId || null,
          format,
          cloudinaryPublicId: uploadResult.public_id,
          metadata: metadata as any,
        },
        include: {
          link: true,
        },
      });

      logger.info('QR code generated and uploaded', { qrCodeId: qrCode.id, userId });
      return qrCode;
    } catch (error) {
      logger.error('Error generating QR code', { error, userId });
      throw error;
    }
  }

  static async getUserQRCodes(userId: string, limit = 20, offset = 0) {
    return prisma.qRCode.findMany({
      where: { userId },
      include: {
        link: {
          select: {
            shortCode: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  static async getQRCodeCount(userId: string): Promise<number> {
    return prisma.qRCode.count({
      where: { userId },
    });
  }

  static async getQRCode(id: string, userId: string) {
    return prisma.qRCode.findFirst({
      where: { id, userId },
      include: {
        link: true,
      },
    });
  }

  /**
   * Update QR code customization
   */
  static async updateQRCode(
    id: string,
    userId: string,
    updates: {
      fgColor?: string;
      bgColor?: string;
      logoUrl?: string;
      logoSize?: number;
    }
  ) {
    // Check ownership
    const qrCode = await prisma.qRCode.findFirst({
      where: { id, userId },
    });

    if (!qrCode) {
      throw new Error('QR code not found');
    }

    // If colors or logo changed, regenerate QR code
    if (updates.fgColor || updates.bgColor || updates.logoUrl) {
      const fgColor = updates.fgColor || qrCode.fgColor;
      const bgColor = updates.bgColor || qrCode.bgColor;
      const format = (qrCode.format || 'png') as 'png' | 'svg' | 'pdf';
      const logoUrl = updates.logoUrl || (qrCode.metadata as any)?.logoUrl;
      const logoSize = updates.logoSize || (qrCode.metadata as any)?.logoSize || 20;

      // Generate new QR buffer
      let qrBuffer = await this.generateQRBuffer(qrCode.data, {
        fgColor,
        bgColor,
        size: (qrCode.metadata as any)?.size || 500,
        format,
        errorCorrection: (qrCode.metadata as any)?.errorCorrection || 'M',
      });

      // Add logo if provided
      let hasLogo = false;
      if (logoUrl && format === 'png') {
        try {
          qrBuffer = await this.addLogoOverlay(
            qrBuffer,
            logoUrl,
            logoSize,
            (qrCode.metadata as any)?.size || 500
          );
          hasLogo = true;
        } catch (error) {
          logger.warn('Logo overlay failed during update', { error });
        }
      }

      // Delete old image from Cloudinary
      if (qrCode.cloudinaryPublicId) {
        await deleteFromCloudinary(qrCode.cloudinaryPublicId).catch((err) =>
          logger.warn('Failed to delete old image from Cloudinary', { error: err })
        );
      }

      // Upload new image
      const publicId = `linktik/qrcodes/${userId}/${Date.now()}`;
      const uploadResult = await uploadToCloudinary(qrBuffer, {
        folder: 'linktik/qrcodes',
        public_id: publicId,
        format: format as any,
        quality: 'best',
      });

      const metadata: QRCodeMetadata = {
        data: qrCode.data,
        fgColor,
        bgColor,
        format,
        hasLogo,
        logoUrl: hasLogo ? logoUrl : undefined,
        size: (qrCode.metadata as any)?.size || 500,
        errorCorrection: (qrCode.metadata as any)?.errorCorrection || 'M',
        uploadedAt: new Date(),
        cloudinaryPublicId: uploadResult.public_id,
      };

      return prisma.qRCode.update({
        where: { id },
        data: {
          fgColor,
          bgColor,
          imageUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id,
          metadata: metadata as any,
        },
        include: {
          link: true,
        },
      });
    }

    return prisma.qRCode.update({
      where: { id },
      data: updates,
      include: {
        link: true,
      },
    });
  }

  /**
   * Delete QR code and remove from Cloudinary
   */
  static async deleteQRCode(id: string, userId: string) {
    // Check ownership
    const qrCode = await prisma.qRCode.findFirst({
      where: { id, userId },
    });

    if (!qrCode) {
      throw new Error('QR code not found');
    }

    // Delete from Cloudinary
    if (qrCode.cloudinaryPublicId) {
      await deleteFromCloudinary(qrCode.cloudinaryPublicId).catch((err) =>
        logger.warn('Failed to delete image from Cloudinary', { error: err })
      );
    }

    // Delete from database
    await prisma.qRCode.delete({
      where: { id },
    });

    logger.info('QR code deleted', { qrCodeId: id, userId });
    return { message: 'QR code deleted successfully' };
  }

  /**
   * Get QR code usage statistics for user's plan
   */
  static async getQRCodeStats(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const planTier = (user.planTier || 'FREE') as keyof typeof PLAN_FEATURES;
    const limit = PLAN_FEATURES[planTier]?.QR_CODES_PER_MONTH || 0;

    // Count this month's QR codes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthCount = await prisma.qRCode.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
    });

    const totalCount = await prisma.qRCode.count({
      where: { userId },
    });

    return {
      plan: planTier,
      thisMonthUsed: thisMonthCount,
      monthlyLimit: limit === 0 ? 'Unlimited' : limit,
      totalCreated: totalCount,
      canCreate: limit === 0 || thisMonthCount < limit,
    };
  }
}
