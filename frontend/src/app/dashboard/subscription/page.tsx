'use client'

import { useEffect, useState } from 'react'
import { subscriptionsApi } from '@/lib/api'
import { Card, Button } from '@/components/ui'

interface Subscription {
  id: string
  planTier: string
  billingCycle: string
  startDate: string
  renewalDate: string
  status: string
  daysRemaining: number
}

interface SubscriptionHistory {
  id: string
  planTier: string
  startDate: string
  endDate: string | null
  status: string
}

export default function SubscriptionPage() {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [history, setHistory] = useState<SubscriptionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [upgradeInProgress, setUpgradeInProgress] = useState(false)

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      const [currentRes, historyRes] = await Promise.all([
        subscriptionsApi.getCurrent<Subscription | null>(),
        subscriptionsApi.getHistory<SubscriptionHistory[]>(),
      ])

      if (currentRes) {
        setCurrentSubscription(currentRes)
      }
      if (historyRes) {
        setHistory(historyRes)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (newPlan: 'PRO' | 'ENTERPRISE') => {
    try {
      setUpgradeInProgress(true)
      await subscriptionsApi.upgrade(newPlan)
      await fetchSubscriptionData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upgrade failed')
    } finally {
      setUpgradeInProgress(false)
    }
  }

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await subscriptionsApi.cancel('User initiated')
        await fetchSubscriptionData()
      } catch (err: any) {
        setError(err.response?.data?.message || 'Cancellation failed')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading subscription details...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Subscription</h1>
          <p className="text-slate-600">Manage your plan and billing</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Current Subscription Card */}
        {currentSubscription ? (
          <Card className="mb-8">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{currentSubscription.planTier}</h2>
                  <p className="text-slate-600 capitalize">
                    Billing cycle: {currentSubscription.billingCycle}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  currentSubscription.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {currentSubscription.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-slate-600 text-sm">Start Date</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {new Date(currentSubscription.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Next Renewal</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {new Date(currentSubscription.renewalDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {currentSubscription.daysRemaining !== undefined && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-600">
                    Your subscription renews in <strong>{currentSubscription.daysRemaining}</strong> days
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                {currentSubscription.planTier !== 'ENTERPRISE' && (
                  <Button
                    onClick={() => handleUpgrade('ENTERPRISE')}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={upgradeInProgress}
                  >
                    {upgradeInProgress ? 'Processing...' : 'Upgrade to Enterprise'}
                  </Button>
                )}
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  className="border border-red-300 text-red-600 hover:bg-red-50"
                >
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="mb-8">
            <div className="p-6 text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">No Active Subscription</h2>
              <p className="text-slate-600 mb-4">
                Upgrade to access premium features
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <a href="/pricing">Browse Plans</a>
              </Button>
            </div>
          </Card>
        )}

        {/* Subscription History */}
        {history.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Subscription History</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="text-left py-2 px-4 text-slate-600 font-semibold">Plan</th>
                      <th className="text-left py-2 px-4 text-slate-600 font-semibold">Start Date</th>
                      <th className="text-left py-2 px-4 text-slate-600 font-semibold">End Date</th>
                      <th className="text-left py-2 px-4 text-slate-600 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((sub) => (
                      <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">{sub.planTier}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(sub.startDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {sub.endDate
                            ? new Date(sub.endDate).toLocaleDateString()
                            : 'Ongoing'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            sub.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
