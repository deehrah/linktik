import { Request, Response } from 'express';
import { QRCodeService } from '../services/QRCodeService';
import { asyncHandler, AppError } from '../middleware/errorHandler.middleware';
import { logger } from '../lib/logger';

export class QRCodeController {
  /**
   * POST /api/qrcodes - Create a new QR code
   */
  createQRCode = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { data, linkId, fgColor, bgColor, size, format, logoUrl, logoSize, errorCorrection } =
      req.body;

    if (!data) {
      throw new AppError(400, 'QR code data is required');
    }

    const qrCode = await QRCodeService.generateQRCode(req.user.id, {
      data,
      linkId,
      fgColor,
      bgColor,
      size,
      format: format || 'png',
      logoUrl,
      logoSize,
      errorCorrection: errorCorrection || 'M',
    });

    res.status(201).json({
      success: true,
      data: qrCode,
      message: 'QR code created successfully',
    });
  });

  /**
   * GET /api/qrcodes - Get all QR codes for authenticated user
   */
  getUserQRCodes = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (page < 1) throw new AppError(400, 'Page must be >= 1');
    if (limit < 1 || limit > 100) throw new AppError(400, 'Limit must be between 1 and 100');

    const offset = (page - 1) * limit;
    const [qrCodes, total] = await Promise.all([
      QRCodeService.getUserQRCodes(req.user.id, limit, offset),
      QRCodeService.getQRCodeCount(req.user.id),
    ]);

    res.status(200).json({
      success: true,
      data: qrCodes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      message: 'QR codes retrieved successfully',
    });
  });

  /**
   * GET /api/qrcodes/:id - Get a specific QR code
   */
  getQRCode = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const qrCode = await QRCodeService.getQRCode(req.params.id, req.user.id);

    if (!qrCode) {
      throw new AppError(404, 'QR code not found');
    }

    res.status(200).json({
      success: true,
      data: qrCode,
      message: 'QR code retrieved successfully',
    });
  });

  /**
   * PUT /api/qrcodes/:id - Update QR code customization
   */
  updateQRCode = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { fgColor, bgColor, logoUrl, logoSize } = req.body;

    const qrCode = await QRCodeService.updateQRCode(req.params.id, req.user.id, {
      fgColor,
      bgColor,
      logoUrl,
      logoSize,
    });

    res.status(200).json({
      success: true,
      data: qrCode,
      message: 'QR code updated successfully',
    });
  });

  /**
   * DELETE /api/qrcodes/:id - Delete a QR code
   */
  deleteQRCode = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const result = await QRCodeService.deleteQRCode(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      data: result,
      message: 'QR code deleted successfully',
    });
  });

  /**
   * GET /api/qrcodes/stats/usage - Get QR code usage statistics
   */
  getQRCodeStats = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const stats = await QRCodeService.getQRCodeStats(req.user.id);

    res.status(200).json({
      success: true,
      data: stats,
      message: 'QR code statistics retrieved successfully',
    });
  });
}
