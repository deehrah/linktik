"use client"

import { useEffect, useState } from 'react'
import { userApi } from '@/lib/api'
import { Card, Button, Input } from '@/components/ui'

export default function ProfilePage() {
  const [profile, setProfile] = useState<{ name?: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await userApi.getProfile<{ name?: string; email?: string } | null>()
      setProfile(data)
      setName(data?.name || '')
      setEmail(data?.email || '')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await userApi.updateProfile({ name, email })
      await fetchProfile()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!profile) return <div className="p-8">Profile not found</div>

  return (
    <div className="min-h-screen bg-[#0F172A] py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-white mb-4">Profile</h1>
        <Card>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm text-[#8E9CB1] mb-1">Full name</label>
              <Input value={name} onChange={(e: any) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-[#8E9CB1] mb-1">Email</label>
              <Input value={email} onChange={(e: any) => setEmail(e.target.value)} />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
