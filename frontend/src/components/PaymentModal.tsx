'use client'

import { useState } from 'react'
import { paymentsApi } from '@/lib/api'
import { Modal, Button } from '@/components/ui'

const PLAN_INFO: Record<string, { name: string; price: number }> = {
  pro: { name: 'PRO', price: 50000 },
  enterprise: { name: 'ENTERPRISE', price: 100000 },
}

interface PaymentModalProps {
  planId: string
  onClose: () => void
}

export default function PaymentModal({ planId, onClose }: PaymentModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const planInfo = PLAN_INFO[planId as keyof typeof PLAN_INFO]
  if (!planInfo) return null

  const handlePayment = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await paymentsApi.initializePayment(
        planId.toUpperCase() as 'PRO' | 'ENTERPRISE',
        billingCycle.toUpperCase() as 'MONTHLY' | 'YEARLY'
      )

      // Redirect to Paystack payment page
      if (response.data?.authorization_url) {
        window.location.href = response.data.authorization_url
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment initialization failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={`Upgrade to ${planInfo.name}`}>
      <div className="space-y-4">

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Billing Cycle Selection */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer" style={{ borderColor: billingCycle === 'monthly' ? '#3b82f6' : '#e5e7eb' }}>
            <input
              type="radio"
              name="billing"
              value="monthly"
              checked={billingCycle === 'monthly'}
              onChange={() => setBillingCycle('monthly')}
              className="mr-3"
            />
            <div>
              <div className="font-semibold">Monthly</div>
              <div className="text-sm text-slate-600">₦{(planInfo.price / 100).toLocaleString()}/month</div>
            </div>
          </label>

          <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer" style={{ borderColor: billingCycle === 'yearly' ? '#3b82f6' : '#e5e7eb' }}>
            <input
              type="radio"
              name="billing"
              value="yearly"
              checked={billingCycle === 'yearly'}
              onChange={() => setBillingCycle('yearly')}
              className="mr-3"
            />
            <div>
              <div className="font-semibold">Yearly (Save 20%)</div>
              <div className="text-sm text-slate-600">₦{((planInfo.price * 12) * 0.8 / 100).toLocaleString()}/year</div>
            </div>
          </label>
        </div>

        {/* Price Summary */}
        <div className="bg-slate-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between mb-2">
            <span>Plan:</span>
            <span className="font-semibold">{planInfo.name}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Billing:</span>
            <span className="font-semibold capitalize">{billingCycle}</span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-semibold">Total:</span>
            <span className="text-lg font-bold text-blue-600">₦{((planInfo.price / 100) * (billingCycle === 'yearly' ? 9.6 : 1)).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Pay Now'}
          </Button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">
          Secure payment powered by Paystack
        </p>
      </div>
    </Modal>
  )
}
