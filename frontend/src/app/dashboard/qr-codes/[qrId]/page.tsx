"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { qrCodesApi } from '@/lib/api'
import { Card, Button } from '@/components/ui'

export default function QRCodeDetailPage() {
  const params = useParams()
  const qrId = params.qrId as string
  const router = useRouter()

  const [qr, setQr] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!qrId) return
    fetchData()
  }, [qrId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await qrCodesApi.getOne(qrId)
      setQr(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!qr) return <div className="p-8">QR code not found</div>

  return (
    <div className="min-h-screen bg-[#0F172A] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">{qr.link?.title || 'QR Code'}</h1>
          <div className="flex gap-2">
            <Button onClick={() => router.back()}>Back</Button>
            <Link href={`/dashboard/qr-codes`}>
              <Button variant="secondary">All QR Codes</Button>
            </Link>
          </div>
        </div>

        <Card>
          <div className="p-6 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                <img src={qr.imageUrl} alt="QR" className="w-48 h-48 object-contain" />
              </div>
            </div>
            <div className="md:col-span-2 space-y-3">
              <p className="text-sm text-[#8E9CB1]">Data</p>
              <p className="text-white break-all">{qr.data}</p>

              {qr.link && (
                <p className="text-sm text-[#28C88C]">linktik.io/{qr.link.shortCode}</p>
              )}

              <div className="flex items-center gap-4 pt-4">
                <div className="text-sm text-[#8E9CB1]">Scans</div>
                <div className="text-white font-semibold">{qr.scanCount}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
