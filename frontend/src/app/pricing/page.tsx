'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import PaymentModal from '@/components/PaymentModal'

const PLANS = [
  {
    id: 'free',
    name: 'FREE',
    price: 0,
    features: [
      '5 short links',
      '1 QR code',
      'Basic analytics',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'PRO',
    price: 500,
    features: [
      'Unlimited links',
      'Unlimited QR codes',
      'Advanced analytics',
      'Link expiration',
      'Custom redirects',
      'Email support',
    ],
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    price: 1000,
    features: [
      'Everything in PRO',
      'API access',
      'Event management',
      'Ticket system',
      'Team management',
      'Priority support',
    ],
  },
]

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      window.location.href = '/dashboard'
    } else {
      setSelectedPlan(planId)
      setShowPaymentModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-slate-400">Choose the perfect plan for your link shortening needs</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg border-2 p-8 transition-all ${
                plan.id === 'pro'
                  ? 'border-blue-500 bg-slate-800 shadow-2xl shadow-blue-500/20 scale-105'
                  : 'border-slate-700 bg-slate-800/50'
              }`}
            >
              {plan.id === 'pro' && (
                <div className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-slate-400 ml-2">/month</span>
              </div>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full mb-8 ${
                  plan.id === 'pro'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {plan.id === 'free' ? 'Get Started' : 'Subscribe Now'}
              </Button>

              <ul className="space-y-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-slate-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-slate-800 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-lg">Can I change my plan anytime?</summary>
              <p className="text-slate-400 mt-3">Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.</p>
            </details>

            <details className="bg-slate-800 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-lg">What payment methods do you accept?</summary>
              <p className="text-slate-400 mt-3">We accept all major credit/debit cards through Paystack. The payment is processed securely.</p>
            </details>

            <details className="bg-slate-800 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-lg">Do you offer refunds?</summary>
              <p className="text-slate-400 mt-3">Yes, we offer a 7-day money-back guarantee if you&apos;re not satisfied with our service.</p>
            </details>

            <details className="bg-slate-800 rounded-lg p-6 cursor-pointer">
              <summary className="font-semibold text-lg">Can I cancel my subscription?</summary>
              <p className="text-slate-400 mt-3">Yes, you can cancel your subscription anytime. You&apos;ll retain access until the end of your billing cycle.</p>
            </details>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          planId={selectedPlan}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedPlan(null)
          }}
        />
      )}
    </div>
  )
}
