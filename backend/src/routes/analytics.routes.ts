import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { AnalyticsController } from '../controllers/AnalyticsController';

const router = Router();
const controller = new AnalyticsController();

// Analytics routes - all require authentication
router.get('/summary', authMiddleware, controller.getSummaryStats);
router.get('/dashboard', authMiddleware, controller.getDashboardAnalytics);
router.get('/trending', authMiddleware, controller.getTrendingData);
router.get('/links/:linkId', authMiddleware, controller.getLinkAnalytics);
router.get('/qrcodes/:qrCodeId', authMiddleware, controller.getQRCodeAnalytics);

export default router;
