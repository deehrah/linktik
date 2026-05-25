import { Router, Request, Response } from 'express'
import { PaystackService } from '@/lib/paystack'
import { PaymentService } from '@/services/PaymentService'
import { logger } from '@/lib/logger'

const router = Router()

/**
 * Webhook Routes (Public - No Authentication Required)
 * These are called by external services (Paystack) to notify of events
 */

/**
 * POST /webhooks/paystack
 * Paystack webhook for payment events
 * Payload is verified using HMAC-SHA512 signature
 */
router.post('/paystack', async (req: Request, res: Response) => {
  try {
    // Get signature from headers
    const signature = req.headers['x-paystack-signature'] as string

    if (!signature) {
      logger.warn('Webhook request missing signature header')
      return res.status(400).json({
        success: false,
        error: 'Missing signature header',
      })
    }

    // Get raw body for signature verification
    const rawBody = JSON.stringify(req.body)

    // Verify webhook signature
    const isValid = PaystackService.verifyWebhookSignature(rawBody, signature)

    if (!isValid) {
      logger.warn('Webhook signature verification failed', { signature })
      return res.status(401).json({
        success: false,
        error: 'Invalid signature',
      })
    }

    const { event, data } = req.body

    logger.info('Webhook received from Paystack', {
      event,
      reference: data?.reference,
      status: data?.status,
    })

    // Handle different webhook events
    switch (event) {
      case 'charge.success':
        // Payment was successful
        await handlePaymentSuccess(data)
        break

      case 'charge.failure':
        // Payment failed
        await handlePaymentFailure(data)
        break

      case 'invoice.payment_on_account.success':
        // Subscription payment succeeded
        await handleSubscriptionPaymentSuccess(data)
        break

      case 'subscription.create':
        // Subscription was created
        logger.info('Subscription created via webhook', { data })
        break

      case 'subscription.disable':
        // Subscription was disabled/cancelled
        await handleSubscriptionCancelled(data)
        break

      default:
        logger.info('Unhandled webhook event', { event })
    }

    // Acknowledge receipt (Paystack needs 2xx response)
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
    })
  } catch (error) {
    logger.error('Webhook processing error', { error })
    // Still return 200 to acknowledge receipt to Paystack
    res.status(200).json({
      success: true,
      message: 'Webhook received (processing error logged)',
    })
  }
})

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(data: any) {
  try {
    const { reference, customer, amount, authorization } = data

    logger.info('Processing successful payment', {
      reference,
      amount,
      email: customer?.email,
    })

    // Find and update payment record
    const { prisma } = await import('@/lib/prisma.js')

    const payment = await prisma.payment.findFirst({
      where: { reference },
    })

    if (!payment) {
      logger.warn('Payment record not found for webhook', { reference })
      return
    }

    // Payment already confirmed, skip
    if (payment.status === 'COMPLETED') {
      logger.info('Payment already processed', { reference })
      return
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        authorizationCode: authorization?.authorization_code,
        metadata: data,
      },
    })

    // Update user plan
    const user = await prisma.user.findUnique({
      where: { id: payment.userId },
    })

    if (user) {
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          planTier: payment.planTier.toUpperCase() as any,
        },
      })
    }

    // Create subscription if not exists
    const existingSubscription = await prisma.subscription.findFirst({
      where: { paymentId: payment.id },
    })

    if (!existingSubscription) {
      await prisma.subscription.create({
        data: {
          userId: payment.userId,
          paymentId: payment.id,
          planTier: payment.planTier.toUpperCase() as any,
          status: 'active',
          billingCycle: 'MONTHLY',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          authorizationCode: authorization?.authorization_code,
        },
      })
    }

    logger.info('Payment processed and subscription activated', {
      paymentId: payment.id,
      userId: payment.userId,
    })
  } catch (error) {
    logger.error('Error handling payment success webhook', { error })
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(data: any) {
  try {
    const { reference, status } = data

    logger.warn('Payment failed via webhook', {
      reference,
      status,
    })

    const { prisma } = await import('@/lib/prisma.js')

    // Update payment status to failed
    await prisma.payment.updateMany({
      where: { reference },
      data: {
        status: 'FAILED',
        metadata: data,
      },
    })
  } catch (error) {
    logger.error('Error handling payment failure webhook', { error })
  }
}

/**
 * Handle subscription payment success (recurring charge)
 */
async function handleSubscriptionPaymentSuccess(data: any) {
  try {
    const { customer, amount, reference } = data

    logger.info('Subscription payment received', {
      reference,
      amount,
      email: customer?.email,
    })

    // Could create a charge log record here
    // For now, just log the event
  } catch (error) {
    logger.error('Error handling subscription payment webhook', { error })
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(data: any) {
  try {
    const { customer, subscription_code } = data

    logger.info('Subscription cancelled', {
      email: customer?.email,
      subscriptionCode: subscription_code,
    })

    // Could update subscription status here
    // For now, just log the event
  } catch (error) {
    logger.error('Error handling subscription cancellation webhook', { error })
  }
}

export default router
