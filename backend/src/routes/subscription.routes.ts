import { Router } from 'express'
import { SubscriptionController } from '../controllers/SubscriptionController'

const router = Router()

/**
 * Subscription Management Routes
 * All routes require authentication via middleware
 */

// Get current subscription details
router.get('/current', SubscriptionController.getCurrentSubscription)

// Get subscription renewal information
router.get('/renewal-date', SubscriptionController.getRenewalDate)

// Get subscription history
router.get('/history', SubscriptionController.getSubscriptionHistory)

// Cancel subscription
router.post('/cancel', SubscriptionController.cancelSubscription)

// Upgrade to higher tier
router.post('/upgrade', SubscriptionController.upgradeSubscription)

export default router
