import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

/**
 * Authentication Routes
 */

// Public endpoints
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// Protected endpoints
router.get('/profile', authMiddleware, authController.getProfile);

export default router;

