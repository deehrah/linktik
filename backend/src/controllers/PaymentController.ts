import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../middleware/errorHandler.middleware'
import { PaymentService } from '../services/PaymentService'
import { logger } from '../lib/logger'

/**
 * PaymentController
 * Handles all payment-related HTTP requests
 */
export class PaymentController {
  /**
   * Initialize payment flow
   * POST /api/payments/initialize
   */
  static initializePayment = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError(401, 'Unauthorized')
      }

      const { planTier, billingCycle } = req.body

      // Validate input
      if (!planTier) {
        throw new AppError(400, 'Plan tier is required')
      }
      if (!['PRO', 'ENTERPRISE'].includes(planTier)) {
        throw new AppError(400, 'Invalid plan tier')
      }

      // Get plan price in kobo
      const planPrice = PaymentService.getPlanPrice(planTier)
      if (!planPrice) {
        throw new AppError(400, 'Invalid plan tier')
      }

      const email = req.user?.email || ''

      // Create payment
      const payment = await PaymentService.createPayment({
        userId,
        planTier: planTier.toLowerCase(),
        amount: planPrice,
        email,
      })

      logger.info(`Payment initialized for user ${userId}`, {
        reference: payment.reference,
        planTier,
        amount: planPrice,
      })

      res.status(200).json({
        success: true,
        data: {
          reference: payment.reference,
          authorization_url: payment.paymentUrl,
          access_code: payment.payment?.paystackAccessCode,
        },
      })
    }
  )

  /**
   * Verify and confirm payment
   * POST /api/payments/verify
   */
  static verifyPayment = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError(401, 'Unauthorized')
      }

      const { reference } = req.body

      if (!reference) {
        throw new AppError(400, 'Payment reference is required')
      }

      // Confirm payment and create subscription
      const result = await PaymentService.confirmPayment({ reference, userId })

      if (!result.success) {
        throw new AppError(400, result.message || 'Payment verification failed')
      }

      logger.info(`Payment verified for user ${userId}`, { reference })

      res.status(200).json({
        success: true,
        message: 'Payment verified and subscription activated',
        data: {
          subscription: result.subscription,
          planTier: result.subscription?.planTier,
        },
      })
    }
  )

  /**
   * Get user's payment history
   * GET /api/payments/history
   */
  static getPaymentHistory = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError(401, 'Unauthorized')
      }

      const { limit = 10 } = req.query

      const payments = await PaymentService.getPaymentHistory(
        userId,
        parseInt(limit as string) || 10
      )

      res.status(200).json({
        success: true,
        data: payments.map((p: any) => ({
          id: p.id,
          reference: p.reference,
          amount: p.amount,
          planTier: p.planTier,
          status: p.status,
          completedAt: p.completedAt,
          createdAt: p.createdAt,
        })),
      })
    }
  )

  /**
   * Get current active subscription
   * GET /api/subscriptions/current
   */
  static getCurrentSubscription = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError(401, 'Unauthorized')
      }

      const subscription = await PaymentService.getUserSubscription(userId)

      if (!subscription) {
        return res.status(200).json({
          success: true,
          data: null,
          message: 'No active subscription',
        })
      }

      res.status(200).json({
        success: true,
        data: {
          id: subscription.id,
          planTier: subscription.planTier,
          status: subscription.status,
          billingCycle: subscription.billingCycle,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          renewalDate: subscription.renewalDate,
        },
      })
    }
  )

  /**
   * Check if user can access feature based on plan
   * GET /api/payments/feature-check/:feature
   */
  static checkFeatureAccess = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError(401, 'Unauthorized')
      }

      let { feature } = req.params

      if (!feature) {
        throw new AppError(400, 'Feature name is required')
      }

      // Normalize feature name to uppercase with underscores
      feature = feature.toUpperCase().replace(/-/g, '_') as
        | 'CUSTOM_CODES_ALLOWED'
        | 'ANALYTICS_RETENTION_DAYS'
        | 'API_CALLS_PER_DAY'
        | 'QR_CODES_PER_MONTH'

      // Get user subscription
      const subscription = await PaymentService.getUserSubscription(userId)
      const planTier = subscription?.planTier || 'FREE'

      const hasAccess = PaymentService.canAccessFeature(
        planTier,
        feature as any
      )

      res.status(200).json({
        success: true,
        data: {
          feature,
          hasAccess,
          planTier,
        },
      })
    }
  )
}
