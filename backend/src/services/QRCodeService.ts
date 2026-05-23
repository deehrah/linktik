import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GenerateQROptions {
  data: string;
  linkId?: string;
  fgColor?: string;
  bgColor?: string;
  size?: number;
}

export class QRCodeService {
  static async generateQRCode(userId: string, options: GenerateQROptions) {
    const {
      data,
      linkId,
      fgColor = '#000000',
      bgColor = '#FFFFFF',
      size = 500,
    } = options;

    try {
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(data, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'M',
      });

      // Create QR code record
      const qrCode = await prisma.qRCode.create({
        data: {
          userId,
          data,
          imageUrl: qrDataUrl,
          fgColor,
          bgColor,
          linkId: linkId || null,
        },
        include: {
          link: true,
        },
      });

      return qrCode;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  static async getUserQRCodes(userId: string) {
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

  static async updateQRCode(
    id: string,
    userId: string,
    updates: { data?: string; fgColor?: string; bgColor?: string }
  ) {
    // Check ownership
    const qrCode = await prisma.qRCode.findFirst({
      where: { id, userId },
    });

    if (!qrCode) {
      throw new Error('QR code not found');
    }

    // If data or colors changed, regenerate QR code
    if (updates.data || updates.fgColor || updates.bgColor) {
      const newData = updates.data || qrCode.data;
      const newFgColor = updates.fgColor || qrCode.fgColor;
      const newBgColor = updates.bgColor || qrCode.bgColor;

      const qrDataUrl = await QRCode.toDataURL(newData, {
        width: 500,
        margin: 2,
        color: {
          dark: newFgColor,
          light: newBgColor,
        },
        errorCorrectionLevel: 'M',
      });

      return prisma.qRCode.update({
        where: { id },
        data: {
          ...updates,
          imageUrl: qrDataUrl,
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

  static async deleteQRCode(id: string, userId: string) {
    // Check ownership
    const qrCode = await prisma.qRCode.findFirst({
      where: { id, userId },
    });

    if (!qrCode) {
      throw new Error('QR code not found');
    }

    await prisma.qRCode.delete({
      where: { id },
    });

    return { message: 'QR code deleted successfully' };
  }
}
