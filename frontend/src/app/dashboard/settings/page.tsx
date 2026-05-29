'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Card, Button, Input } from '@/components/ui'
import { subscriptionsApi, userApi } from '@/lib/api'

interface ProfileData {
  name?: string
  email?: string
}

interface SubscriptionData {
  planTier: string
  billingCycle: string
  status: string
  renewalDate: string
}

interface PreferencesState {
  emailNotifications: boolean
  eventReminders: boolean
  productUpdates: boolean
}

const preferenceStorageKey = 'linktik-dashboard-settings'

const defaultPreferences: PreferencesState = {
  emailNotifications: true,
  eventReminders: true,
  productUpdates: false,
}

export default function SettingsPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [preferences, setPreferences] = useState<PreferencesState>(defaultPreferences)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const storedPreferences = typeof window !== 'undefined' ? localStorage.getItem(preferenceStorageKey) : null

      if (storedPreferences) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(storedPreferences) })
      }

      const [profileData, subscriptionData] = await Promise.all([
        userApi.getProfile<ProfileData | null>(),
        subscriptionsApi.getCurrent<SubscriptionData | null>().catch(() => null),
      ])

      if (profileData) {
        setName(profileData.name || '')
        setEmail(profileData.email || '')
      }

      if (subscriptionData) {
        setSubscription(subscriptionData)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = async () => {
    try {
      setSavingProfile(true)
      setMessage(null)
      await userApi.updateProfile({ name, email })
      setMessage('Profile details saved.')
    } catch (error) {
      console.error('Failed to save profile settings:', error)
      setMessage('Unable to save profile details right now.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePreferencesSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setSavingPreferences(true)
      localStorage.setItem(preferenceStorageKey, JSON.stringify(preferences))
      setMessage('Preferences saved locally.')
    } finally {
      setSavingPreferences(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-[#8E9CB1]">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <header className="bg-[#1E293B] border-b border-[#334155]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#28C88C] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LT</span>
                </div>
                <span className="text-xl font-bold text-white">LinkTik</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                <Link href="/dashboard" className="px-4 py-2 rounded-lg font-medium text-[#8E9CB1] hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/links" className="px-4 py-2 rounded-lg font-medium text-[#8E9CB1] hover:text-white transition-colors">
                  Links
                </Link>
                <Link href="/dashboard/qr-codes" className="px-4 py-2 rounded-lg font-medium text-[#8E9CB1] hover:text-white transition-colors">
                  QR Codes
                </Link>
                <Link href="/dashboard/events" className="px-4 py-2 rounded-lg font-medium text-[#8E9CB1] hover:text-white transition-colors">
                  Events
                </Link>
                <Link href="/dashboard/settings" className="px-4 py-2 rounded-lg font-medium bg-[#28C88C]/10 text-[#28C88C]">
                  Settings
                </Link>
              </nav>
            </div>

            <Link href="/dashboard/profile" className="w-8 h-8 bg-[#28C88C] rounded-full flex items-center justify-center text-white font-semibold cursor-pointer">
              U
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-[#8E9CB1]">Manage account details, preferences, and billing shortcuts.</p>
        </div>

        {message && (
          <div className="rounded-xl border border-[#334155] bg-[#1E293B] px-4 py-3 text-sm text-white">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Account</h2>
                <p className="text-sm text-[#8E9CB1]">Update the identity tied to your workspace.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
                <Input label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleProfileSave} isLoading={savingProfile}>
                  Save account changes
                </Button>
                <Link href="/dashboard/profile" className="text-sm font-medium text-[#28C88C] hover:text-[#24B37D]">
                  Open profile page
                </Link>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Billing</h2>
                <p className="text-sm text-[#8E9CB1]">Your current subscription status.</p>
              </div>

              {subscription ? (
                <div className="space-y-3">
                  <div className="rounded-xl bg-[#0F172A] border border-[#334155] p-4">
                    <p className="text-xs uppercase tracking-wide text-[#8E9CB1]">Plan</p>
                    <p className="text-lg font-semibold text-white">{subscription.planTier}</p>
                  </div>
                  <div className="rounded-xl bg-[#0F172A] border border-[#334155] p-4">
                    <p className="text-xs uppercase tracking-wide text-[#8E9CB1]">Status</p>
                    <p className="text-lg font-semibold text-white">{subscription.status}</p>
                  </div>
                  <div className="rounded-xl bg-[#0F172A] border border-[#334155] p-4">
                    <p className="text-xs uppercase tracking-wide text-[#8E9CB1]">Renewal</p>
                    <p className="text-lg font-semibold text-white">{new Date(subscription.renewalDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#8E9CB1]">No active subscription found.</p>
              )}

              <Link href="/dashboard/subscription" className="inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-[#28C88C] text-white font-semibold hover:bg-[#24B37D] transition-colors">
                Manage subscription
              </Link>
            </div>
          </Card>
        </div>

        <Card>
          <form className="p-6 space-y-6" onSubmit={handlePreferencesSave}>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Preferences</h2>
              <p className="text-sm text-[#8E9CB1]">These options are stored locally in your browser.</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between gap-4 rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-4">
                <div>
                  <p className="font-semibold text-white">Email notifications</p>
                  <p className="text-sm text-[#8E9CB1]">Receive account and activity emails.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(event) => setPreferences((current) => ({ ...current, emailNotifications: event.target.checked }))}
                  className="h-5 w-5 accent-[#28C88C]"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-4">
                <div>
                  <p className="font-semibold text-white">Event reminders</p>
                  <p className="text-sm text-[#8E9CB1]">Get nudges before event start times.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.eventReminders}
                  onChange={(event) => setPreferences((current) => ({ ...current, eventReminders: event.target.checked }))}
                  className="h-5 w-5 accent-[#28C88C]"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-4">
                <div>
                  <p className="font-semibold text-white">Product updates</p>
                  <p className="text-sm text-[#8E9CB1]">Hear about new LinkTik features and releases.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.productUpdates}
                  onChange={(event) => setPreferences((current) => ({ ...current, productUpdates: event.target.checked }))}
                  className="h-5 w-5 accent-[#28C88C]"
                />
              </label>
            </div>

            <div className="flex justify-end">
              <Button type="submit" isLoading={savingPreferences}>
                Save preferences
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
