import { PrismaClient } from '@prisma/client';
import { PaystackService } from '../lib/paystack';
import { logger } from '../lib/logger';
import { PLAN_FEATURES } from '../config/constants';

const prisma = new PrismaClient();

interface CreatePaymentParams {
  userId: string;
  planTier: 'pro' | 'advanced';
  amount: number; // in kobo
  email: string;
  description?: string;
}

interface ConfirmPaymentParams {
  reference: string;
  userId: string;
}

const PLAN_PRICES = {
  pro: 50000, // 500 NGN in kobo
  advanced: 100000, // 1000 NGN in kobo
} as const;

export class PaymentService {
  /**
   * Create a payment for plan upgrade
   */
  static async createPayment(params: CreatePaymentParams) {
    try {
      const { userId, planTier, amount, email, description } = params;

      // Verify user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      // Generate reference
      const reference = `pay_${userId}_${planTier}_${Date.now()}`;

      // Initialize payment with Paystack
      const paymentResponse = await PaystackService.initializePayment({
        email,
        amount,
        reference,
        description: description || `LinkTik ${planTier.toUpperCase()} Plan Upgrade`,
        metadata: {
          userId,
          planTier,
          upgradeFrom: user.planTier,
          timestamp: new Date().toISOString(),
        },
      });

      if (!paymentResponse.status) {
        throw new Error(paymentResponse.message || 'Failed to initialize payment');
      }

      // Create payment record in database
      const payment = await prisma.payment.create({
        data: {
          userId,
          reference,
          amount,
          planTier,
          status: 'PENDING',
          paystackAccessCode: paymentResponse.data?.access_code,
          paystackAuthorizationUrl: paymentResponse.data?.authorization_url,
          metadata: paymentResponse.data as any,
        },
      });

      logger.info('Payment created', {
        paymentId: payment.id,
        userId,
        planTier,
        amount,
      });

      return {
        success: true,
        payment,
        paymentUrl: paymentResponse.data?.authorization_url,
        reference,
      };
    } catch (error) {
      logger.error('Failed to create payment', { error });
      throw error;
    }
  }

  /**
   * Confirm payment and update user subscription
   */
  static async confirmPayment(params: ConfirmPaymentParams) {
    try {
      const { reference, userId } = params;

      // Find payment record
      const payment = await prisma.payment.findFirst({
        where: { reference, userId },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status === 'COMPLETED') {
        return { success: true, message: 'Payment already processed', payment };
      }

      // Verify payment with Paystack
      const verifyResponse = await PaystackService.verifyPayment(reference);

      if (!verifyResponse.status) {
        // Update payment status to failed
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });

        throw new Error(verifyResponse.message || 'Payment verification failed');
      }

      const { status, amount, authorization } = verifyResponse.data;

      if (status !== 'success') {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });
        throw new Error(`Payment status: ${status}`);
      }

      // Amount verification
      if (amount !== payment.amount) {
        logger.warn('Amount mismatch in payment verification', {
          expected: payment.amount,
          received: amount,
          reference,
        });
        throw new Error('Payment amount mismatch');
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          authorizationCode: authorization?.authorization_code,
          metadata: verifyResponse.data as any,
        },
      });

      // Get user current plan
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      const oldPlan = user.planTier;

      // Update user plan
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          planTier: payment.planTier.toUpperCase() as any,
        },
      });

      // Create subscription record
      const subscription = await prisma.subscription.create({
        data: {
          userId,
          paymentId: payment.id,
          planTier: payment.planTier.toUpperCase() as any,
          status: 'active',
          billingCycle: 'MONTHLY',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          authorizationCode: authorization?.authorization_code,
        },
      });

      logger.info('Payment confirmed and subscription updated', {
        paymentId: payment.id,
        userId,
        oldPlan,
        newPlan: payment.planTier,
      });

      return {
        success: true,
        message: 'Payment successful and subscription updated',
        payment,
        subscription,
        user: updatedUser,
      };
    } catch (error) {
      logger.error('Failed to confirm payment', { error });
      throw error;
    }
  }

  /**
   * Get user's active subscription
   */
  static async getUserSubscription(userId: string) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: 'active' },
        orderBy: { createdAt: 'desc' },
        include: {
          payment: true,
        },
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to get user subscription', { error });
      throw error;
    }
  }

  /**
   * Get payment history
   */
  static async getPaymentHistory(userId: string, limit = 10) {
    try {
      const payments = await prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return payments;
    } catch (error) {
      logger.error('Failed to get payment history', { error });
      throw error;
    }
  }

  /**
   * Calculate total revenue (admin)
   */
  static async calculateTotalRevenue() {
    try {
      const result = await prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      });

      return {
        totalRevenue: result._sum?.amount || 0,
        totalTransactions: result._count,
      };
    } catch (error) {
      logger.error('Failed to calculate revenue', { error });
      throw error;
    }
  }

  /**
   * Get plan upgrade price
   */
  static getPlanPrice(planTier: string): number {
    const tier = planTier.toLowerCase() as keyof typeof PLAN_PRICES;
    return PLAN_PRICES[tier] || 0;
  }

  /**
   * Check if user can access plan features
   */
  static canAccessFeature(
    planTier: string,
    feature: 'CUSTOM_CODES_ALLOWED' | 'ANALYTICS_RETENTION_DAYS' | 'API_CALLS_PER_DAY' | 'QR_CODES_PER_MONTH'
  ): boolean {
    const tier = (planTier || 'FREE') as 'FREE' | 'PRO' | 'ENTERPRISE';
    const features = (PLAN_FEATURES as any)[tier];

    if (!features) return false;

    const value = features[feature];
    if (typeof value === 'number') return value > 0;
    return !!value;
  }
}

export default PaymentService;
