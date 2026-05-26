import { Router } from 'express'
import { PaymentController } from '../controllers/PaymentController'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

/**
 * Payment Routes
 * All routes require authentication
 */

// Initialize payment flow
router.post('/initialize', PaymentController.initializePayment)

// Verify and confirm payment
router.post('/verify', PaymentController.verifyPayment)

// Get payment history
router.get('/history', PaymentController.getPaymentHistory)

// Check feature access
router.get('/feature-check/:feature', PaymentController.checkFeatureAccess)

/**
 * Subscription Routes
 */

// Get current subscription
router.get('/subscriptions/current', PaymentController.getCurrentSubscription)

export default router
