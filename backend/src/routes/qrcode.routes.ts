import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { QRCodeController } from '../controllers/QRCodeController';

const router = Router();
const controller = new QRCodeController();

// QR Code CRUD routes
router.post('/', authMiddleware, controller.createQRCode);
router.get('/', authMiddleware, controller.getUserQRCodes);
router.get('/stats/usage', authMiddleware, controller.getQRCodeStats);
router.get('/:id', authMiddleware, controller.getQRCode);
router.put('/:id', authMiddleware, controller.updateQRCode);
router.delete('/:id', authMiddleware, controller.deleteQRCode);

export default router;
