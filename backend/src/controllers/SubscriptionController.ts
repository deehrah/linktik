import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../middleware/errorHandler.middleware'
import { SubscriptionService } from '../services/SubscriptionService'
import { logger } from '../lib/logger'

/**
 * SubscriptionController
 * Handles subscription management endpoints
 */
export class SubscriptionController {
  /**
   * Get current subscription details
   * GET /api/subscriptions/current
   */
  static getCurrentSubscription = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError(401, 'Unauthorized')
      }

      const { prisma } = await import('../lib/prisma.js')

      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: 'active' },
        include: { payment: true },
      })

      if (!subscription) {
        return res.status(200).json({
          success: true,
          data: null,
          message: 'No active subscription',
        })
      }

      const details = await SubscriptionService.getSubscriptionDetails(
        subscription.id
      )

      res.status(200).json({
        success: true,
        data: details,
      })
    }
  )

  /**
   * Cancel current subscription
   * POST /api/subscriptions/cancel
   */
  static cancelSubscription = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError(401, 'Unauthorized')
      }

      const { reason } = req.body

      const { prisma } = await import('../lib/prisma.js')

      // Find active subscription
      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: 'active' },
      })

      if (!subscription) {
        throw new AppError(400, 'No active subscription to cancel')
      }

      // Cancel subscription
      const cancelled = await SubscriptionService.cancelSubscription(
        subscription.id,
        reason
      )

      logger.info(`Subscription cancelled by user ${userId}`, {
        subscriptionId: subscription.id,
        reason,
      })

      res.status(200).json({
        success: true,
        message: 'Subscription cancelled',
        data: cancelled,
      })
    }
  )

  /**
   * Upgrade subscription to higher tier
   * POST /api/subscriptions/upgrade
   */
  static upgradeSubscription = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError(401, 'Unauthorized')
      }

      const { newPlanTier } = req.body

      if (!newPlanTier) {
        throw new AppError(400, 'New plan tier is required')
      }

      if (!['PRO', 'ENTERPRISE'].includes(newPlanTier)) {
        throw new AppError(400, 'Invalid plan tier')
      }

      const { prisma } = await import('../lib/prisma.js')

      // Find active subscription
      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: 'active' },
        include: { user: true },
      })

      if (!subscription) {
        throw new AppError(400, 'No active subscription to upgrade')
      }

      const currentPlan = subscription.planTier
      if (currentPlan === newPlanTier) {
        throw new AppError(400, 'Already on this plan')
      }

      // Calculate pro-rata upgrade cost
      // This is simplified - in production would be more complex
      const PLAN_PRICES = {
        PRO: 50000,
        ENTERPRISE: 100000,
      } as const

      const currentPrice = (PLAN_PRICES as any)[currentPlan] || 0
      const newPrice = (PLAN_PRICES as any)[newPlanTier] || 0

      // Calculate days remaining in current period
      const now = new Date()
      const daysRemaining = Math.max(
        0,
        Math.ceil(
          (subscription.currentPeriodEnd.getTime() - now.getTime()) /
            (24 * 60 * 60 * 1000)
        )
      )

      const totalDaysInPeriod =
        subscription.billingCycle === 'MONTHLY' ? 30 : 365
      const proRataCredit = (currentPrice * daysRemaining) / totalDaysInPeriod
      const proRataCost = (newPrice * daysRemaining) / totalDaysInPeriod
      const upgradeCost = Math.max(0, Math.round(proRataCost - proRataCredit))

      // Perform upgrade
      const result = await SubscriptionService.upgradeSubscription(
        subscription.id,
        newPlanTier,
        upgradeCost
      )

      logger.info(`Subscription upgraded by user ${userId}`, {
        from: currentPlan,
        to: newPlanTier,
        cost: upgradeCost,
      })

      res.status(200).json({
        success: true,
        message: `Successfully upgraded to ${newPlanTier}`,
        data: {
          subscription: result.subscription,
          upgradeCost,
          payment: result.payment,
        },
      })
    }
  )

  /**
   * Get subscription renewal date
   * GET /api/subscriptions/renewal-date
   */
  static getRenewalDate = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
      throw new AppError(401, 'Unauthorized')
    }

    const { prisma } = await import('../lib/prisma.js')

    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'active' },
    })

    if (!subscription) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active subscription',
      })
    }

    const now = new Date()
    const daysUntilRenewal = Math.ceil(
      (subscription.currentPeriodEnd.getTime() - now.getTime()) /
        (24 * 60 * 60 * 1000)
    )

    res.status(200).json({
      success: true,
      data: {
        renewalDate: subscription.currentPeriodEnd,
        daysRemaining: daysUntilRenewal,
        billingCycle: subscription.billingCycle,
        autoRenew: !!subscription.authorizationCode,
      },
    })
  })

  /**
   * View subscription history
   * GET /api/subscriptions/history
   */
  static getSubscriptionHistory = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError(401, 'Unauthorized')
      }

      const { prisma } = await import('../lib/prisma.js')

      const subscriptions = await prisma.subscription.findMany({
        where: { userId },
        include: { payment: true },
        orderBy: { createdAt: 'desc' },
      })

      res.status(200).json({
        success: true,
        data: subscriptions.map((sub: any) => ({
          id: sub.id,
          planTier: sub.planTier,
          status: sub.status,
          billingCycle: sub.billingCycle,
          currentPeriodStart: sub.currentPeriodStart,
          currentPeriodEnd: sub.currentPeriodEnd,
          createdAt: sub.createdAt,
        })),
      })
    }
  )
}

export default SubscriptionController
