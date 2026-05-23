import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import linkController from '../controllers/LinkController';

const router = Router();

/**
 * Link Management Routes
 */

// Create new link
router.post('/', authMiddleware, linkController.createLink);

// Get all user's links
router.get('/', authMiddleware, linkController.getUserLinks);

// Get link details
router.get('/:id', authMiddleware, linkController.getLinkById);

// Update link
router.put('/:id', authMiddleware, linkController.updateLink);

// Delete link
router.delete('/:id', authMiddleware, linkController.deleteLink);

// Get link analytics
router.get('/:id/analytics', authMiddleware, linkController.getLinkAnalytics);

// Record click on link (public - no auth needed)
// This should be called before actually redirecting to the original URL
router.post('/:shortCode/click', linkController.recordClick);

export default router;

