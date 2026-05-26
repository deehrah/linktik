import { PrismaClient } from '@prisma/client'
import { PaystackService } from '../lib/paystack'
import { logger } from '../lib/logger'

const prisma = new PrismaClient()

interface CreateSubscriptionParams {
  userId: string
  paymentId: string
  planTier: string
  billingCycle: 'MONTHLY' | 'YEARLY'
  authorizationCode?: string
}

interface RenewSubscriptionParams {
  subscriptionId: string
  planTier: string
  amount: number // in kobo
}

/**
 * SubscriptionService
 * Manages subscription lifecycle: creation, renewal, cancellation, upgrades
 */
export class SubscriptionService {
  /**
   * Create a new subscription after payment confirmation
   */
  static async createSubscription(params: CreateSubscriptionParams) {
    try {
      const {
        userId,
        paymentId,
        planTier,
        billingCycle,
        authorizationCode,
      } = params

      // Calculate subscription period
      const currentPeriodStart = new Date()
      const daysInPeriod = billingCycle === 'MONTHLY' ? 30 : 365
      const currentPeriodEnd = new Date(
        currentPeriodStart.getTime() + daysInPeriod * 24 * 60 * 60 * 1000
      )

      // Create subscription record
      const subscription = await prisma.subscription.create({
        data: {
          userId,
          paymentId,
          planTier: planTier.toUpperCase() as any,
          status: 'active',
          billingCycle: billingCycle as 'MONTHLY' | 'YEARLY',
          currentPeriodStart,
          currentPeriodEnd,
          authorizationCode,
        },
      })

      logger.info('Subscription created', {
        subscriptionId: subscription.id,
        userId,
        planTier,
        billingCycle,
      })

      return subscription
    } catch (error) {
      logger.error('Failed to create subscription', { error })
      throw error
    }
  }

  /**
   * Renew an active subscription
   */
  static async renewSubscription(params: RenewSubscriptionParams) {
    try {
      const { subscriptionId, planTier, amount } = params

      // Get subscription details
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { payment: true, user: true },
      })

      if (!subscription) {
        throw new Error('Subscription not found')
      }

      if (subscription.status !== 'active') {
        throw new Error(`Cannot renew inactive subscription (status: ${subscription.status})`)
      }

      if (!subscription.authorizationCode) {
        throw new Error('No authorization code for recurring charge')
      }

      // Charge using authorization code
      const chargeResponse = await PaystackService.chargeAuthorization(
        subscription.authorizationCode,
        subscription.user?.email || '',
        amount
      )

      if (!chargeResponse.status) {
        logger.warn('Subscription renewal charge failed', {
          subscriptionId,
          response: chargeResponse,
        })
        return {
          success: false,
          message: 'Charge failed',
          error: chargeResponse.message,
        }
      }

      // Create new payment record for this renewal
      const renewalPayment = await prisma.payment.create({
        data: {
          userId: subscription.userId,
          reference: `renew_${subscriptionId}_${Date.now()}`,
          amount,
          planTier,
          status: 'COMPLETED',
          authorizationCode: subscription.authorizationCode,
          completedAt: new Date(),
          metadata: chargeResponse.data,
        },
      })

      // Update subscription period
      const daysInPeriod =
        subscription.billingCycle === 'MONTHLY' ? 30 : 365
      const newPeriodStart = new Date()
      const newPeriodEnd = new Date(
        newPeriodStart.getTime() + daysInPeriod * 24 * 60 * 60 * 1000
      )

      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          currentPeriodStart: newPeriodStart,
          currentPeriodEnd: newPeriodEnd,
          renewalDate: newPeriodEnd,
        },
      })

      logger.info('Subscription renewed successfully', {
        subscriptionId,
        renewalPaymentId: renewalPayment.id,
        newEndDate: newPeriodEnd,
      })

      return {
        success: true,
        subscription: updatedSubscription,
        payment: renewalPayment,
      }
    } catch (error) {
      logger.error('Failed to renew subscription', { error })
      throw error
    }
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(subscriptionId: string, reason?: string) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
      })

      if (!subscription) {
        throw new Error('Subscription not found')
      }

      // Update subscription status to cancelled
      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'cancelled',
          endDate: new Date(),
        },
      })

      // Downgrade user to FREE plan
      await prisma.user.update({
        where: { id: subscription.userId },
        data: { planTier: 'FREE' },
      })

      logger.info('Subscription cancelled', {
        subscriptionId,
        userId: subscription.userId,
        reason,
      })

      return updatedSubscription
    } catch (error) {
      logger.error('Failed to cancel subscription', { error })
      throw error
    }
  }

  /**
   * Upgrade subscription to a higher tier
   */
  static async upgradeSubscription(
    subscriptionId: string,
    newPlanTier: string,
    upgradeCost: number
  ) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { user: true },
      })

      if (!subscription) {
        throw new Error('Subscription not found')
      }

      // Create upgrade payment
      const upgradePayment = await prisma.payment.create({
        data: {
          userId: subscription.userId,
          reference: `upgrade_${subscriptionId}_${Date.now()}`,
          amount: upgradeCost,
          planTier: newPlanTier,
          status: 'COMPLETED',
          completedAt: new Date(),
          authorizationCode: subscription.authorizationCode,
          metadata: {
            upgradeFrom: subscription.planTier,
            upgradeTo: newPlanTier,
            timestamp: new Date().toISOString(),
          },
        },
      })

      // Update subscription tier
      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          planTier: newPlanTier.toUpperCase() as any,
        },
      })

      // Update user plan
      await prisma.user.update({
        where: { id: subscription.userId },
        data: { planTier: newPlanTier.toUpperCase() as any },
      })

      logger.info('Subscription upgraded', {
        subscriptionId,
        from: subscription.planTier,
        to: newPlanTier,
        paymentId: upgradePayment.id,
      })

      return {
        success: true,
        subscription: updatedSubscription,
        payment: upgradePayment,
      }
    } catch (error) {
      logger.error('Failed to upgrade subscription', { error })
      throw error
    }
  }

  /**
   * Get subscriptions expiring soon (within 7 days)
   * Useful for sending renewal reminders
   */
  static async getExpiringSubscriptions() {
    try {
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      const expiringSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'active',
          currentPeriodEnd: {
            lte: sevenDaysFromNow,
            gte: new Date(),
          },
        },
        include: {
          user: true,
          payment: true,
        },
      })

      return expiringSubscriptions
    } catch (error) {
      logger.error('Failed to get expiring subscriptions', { error })
      throw error
    }
  }

  /**
   * Get expired subscriptions that need renewal
   */
  static async getExpiredSubscriptions() {
    try {
      const expiredSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'active',
          currentPeriodEnd: {
            lt: new Date(),
          },
        },
        include: {
          user: true,
          payment: true,
        },
      })

      return expiredSubscriptions
    } catch (error) {
      logger.error('Failed to get expired subscriptions', { error })
      throw error
    }
  }

  /**
   * Mark an expired subscription as expired
   */
  static async expireSubscription(subscriptionId: string) {
    try {
      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'expired',
          endDate: new Date(),
        },
      })

      // Downgrade user to FREE plan
      await prisma.user.update({
        where: { id: updatedSubscription.userId },
        data: { planTier: 'FREE' },
      })

      logger.info('Subscription marked as expired', {
        subscriptionId,
        userId: updatedSubscription.userId,
      })

      return updatedSubscription
    } catch (error) {
      logger.error('Failed to expire subscription', { error })
      throw error
    }
  }

  /**
   * Get subscription details with usage stats
   */
  static async getSubscriptionDetails(subscriptionId: string) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: {
          user: true,
          payment: true,
        },
      })

      if (!subscription) {
        return null
      }

      // Calculate days remaining
      const now = new Date()
      const daysRemaining = Math.ceil(
        (subscription.currentPeriodEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      )

      // Get usage stats
      const [linksCount, qrCodesCount] = await Promise.all([
        prisma.link.count({ where: { userId: subscription.userId } }),
        prisma.qRCode.count({ where: { userId: subscription.userId } }),
      ])

      return {
        ...subscription,
        daysRemaining,
        usage: {
          linksCount,
          qrCodesCount,
        },
      }
    } catch (error) {
      logger.error('Failed to get subscription details', { error })
      throw error
    }
  }
}

export default SubscriptionService
