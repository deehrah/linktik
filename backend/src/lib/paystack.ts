import axios from 'axios';
import crypto from 'crypto';
import { logger } from './logger';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || '';

interface InitializePaymentData {
  email: string;
  amount: number; // Amount in kobo (1 NGN = 100 kobo)
  reference?: string;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
  channels?: string[];
}

interface VerifyPaymentData {
  reference: string;
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data?: any;
}

interface PaystackWebhookPayload {
  event: string;
  data: {
    id?: number;
    domain?: string;
    reference?: string;
    amount?: number;
    paid_at?: string;
    paidAt?: string;
    status?: string;
    customer?: {
      id?: number;
      email?: string;
      first_name?: string;
      last_name?: string;
    };
    authorization?: {
      authorization_code?: string;
      bin?: string;
      last4?: string;
      exp_month?: string;
      exp_year?: string;
      channel?: string;
      card_type?: string;
      bank?: string;
      country_code?: string;
      brand?: string;
      reusable?: boolean;
      signature?: string;
    };
    metadata?: Record<string, any>;
  };
}

export class PaystackService {
  /**
   * Initialize a payment with Paystack
   */
  static async initializePayment(data: InitializePaymentData) {
    try {
      if (!PAYSTACK_SECRET_KEY) {
        throw new Error('PAYSTACK_SECRET_KEY not configured');
      }

      const payload = {
        email: data.email,
        amount: data.amount,
        reference: data.reference || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        currency: data.currency || 'NGN',
        description: data.description || 'LinkTik Payment',
        metadata: {
          ...data.metadata,
          integration: 'LinkTik',
        },
        channels: data.channels || ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      };

      const response = await axios.post(`${PAYSTACK_BASE_URL}/transaction/initialize`, payload, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      logger.info('Payment initialized', {
        reference: payload.reference,
        amount: data.amount,
        email: data.email,
      });

      return response.data as PaystackResponse;
    } catch (error) {
      logger.error('Failed to initialize payment', { error });
      throw new Error(
        error instanceof Error ? error.message : 'Failed to initialize payment with Paystack'
      );
    }
  }

  /**
   * Verify a payment transaction
   */
  static async verifyPayment(reference: string) {
    try {
      if (!PAYSTACK_SECRET_KEY) {
        throw new Error('PAYSTACK_SECRET_KEY not configured');
      }

      const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      logger.info('Payment verified', {
        reference,
        status: response.data.data?.status,
      });

      return response.data as PaystackResponse;
    } catch (error) {
      logger.error('Failed to verify payment', { error, reference });
      throw new Error(
        error instanceof Error ? error.message : 'Failed to verify payment with Paystack'
      );
    }
  }

  /**
   * Verify webhook signature from Paystack
   */
  static verifyWebhookSignature(
    payload: string,
    signature: string
  ): boolean {
    try {
      if (!PAYSTACK_SECRET_KEY) {
        logger.warn('PAYSTACK_SECRET_KEY not configured for webhook verification');
        return false;
      }

      const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY)
        .update(payload)
        .digest('hex');

      const isValid = hash === signature;

      if (!isValid) {
        logger.warn('Webhook signature mismatch', { expected: hash, received: signature });
      }

      return isValid;
    } catch (error) {
      logger.error('Error verifying webhook signature', { error });
      return false;
    }
  }

  /**
   * Handle successful payment webhook
   */
  static async handlePaymentSuccess(payload: PaystackWebhookPayload) {
    try {
      const { data } = payload;

      if (!data.reference) {
        throw new Error('No reference in webhook payload');
      }

      logger.info('Processing payment success', {
        reference: data.reference,
        amount: data.amount,
        email: data.customer?.email,
      });

      // Return webhook data for further processing in controller
      return {
        success: true,
        reference: data.reference,
        amount: data.amount,
        email: data.customer?.email,
        status: data.status,
        paidAt: data.paid_at || data.paidAt,
        metadata: data.metadata,
        authorization: data.authorization,
      };
    } catch (error) {
      logger.error('Error handling payment success webhook', { error });
      throw error;
    }
  }

  /**
   * Create a customer on Paystack
   */
  static async createCustomer(email: string, firstName?: string, lastName?: string) {
    try {
      if (!PAYSTACK_SECRET_KEY) {
        throw new Error('PAYSTACK_SECRET_KEY not configured');
      }

      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/customer`,
        {
          email,
          first_name: firstName || '',
          last_name: lastName || '',
        },
        {
          headers: {
            'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('Customer created on Paystack', { email });
      return response.data;
    } catch (error) {
      logger.error('Failed to create customer', { error, email });
      throw new Error('Failed to create customer on Paystack');
    }
  }

  /**
   * Get transaction details
   */
  static async getTransactionDetails(id: number) {
    try {
      if (!PAYSTACK_SECRET_KEY) {
        throw new Error('PAYSTACK_SECRET_KEY not configured');
      }

      const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/${id}`, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get transaction details', { error });
      throw new Error('Failed to get transaction details from Paystack');
    }
  }

  /**
   * Charge authorization (for subscription recurring charges)
   */
  static async chargeAuthorization(
    authorizationCode: string,
    email: string,
    amount: number,
    reference?: string
  ) {
    try {
      if (!PAYSTACK_SECRET_KEY) {
        throw new Error('PAYSTACK_SECRET_KEY not configured');
      }

      const payload = {
        authorization_code: authorizationCode,
        email,
        amount,
        reference: reference || `recurring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const response = await axios.post(`${PAYSTACK_BASE_URL}/transaction/charge_authorization`, payload, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      logger.info('Recurring charge initiated', { email, amount });
      return response.data;
    } catch (error) {
      logger.error('Failed to charge authorization', { error });
      throw new Error('Failed to process recurring charge');
    }
  }

  /**
   * Get banks list for transfers
   */
  static async getBanksList() {
    try {
      if (!PAYSTACK_SECRET_KEY) {
        throw new Error('PAYSTACK_SECRET_KEY not configured');
      }

      const response = await axios.get(`${PAYSTACK_BASE_URL}/bank`, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get banks list', { error });
      throw new Error('Failed to get banks list');
    }
  }

  /**
   * Resolve bank account
   */
  static async resolveBankAccount(accountNumber: string, bankCode: string) {
    try {
      if (!PAYSTACK_SECRET_KEY) {
        throw new Error('PAYSTACK_SECRET_KEY not configured');
      }

      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          headers: {
            'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to resolve bank account', { error });
      throw new Error('Failed to resolve bank account');
    }
  }
}

export default PaystackService;
