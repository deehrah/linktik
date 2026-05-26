"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { eventsApi } from '@/lib/api'
import { Card, Button } from '@/components/ui'

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.eventId as string
  const router = useRouter()

  const [event, setEvent] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) return
    fetchData()
  }, [eventId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await eventsApi.getOne(eventId)
      setEvent(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!event) return <div className="p-8">Event not found</div>

  return (
    <div className="min-h-screen bg-[#0F172A] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">{event.name}</h1>
          <div className="flex gap-2">
            <Button onClick={() => router.back()}>Back</Button>
            <Link href={`/dashboard/events`}>
              <Button variant="secondary">All Events</Button>
            </Link>
          </div>
        </div>

        <Card>
          <div className="p-6 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="bg-white p-2 rounded-lg flex items-center justify-center">
                {event.posterUrl ? (
                  <img src={event.posterUrl} alt="Poster" className="w-full h-56 object-cover" />
                ) : (
                  <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-400">No poster</div>
                )}
              </div>
            </div>
            <div className="md:col-span-2 space-y-3">
              <p className="text-sm text-[#8E9CB1]">When</p>
              <p className="text-white">{new Date(event.dateTime).toLocaleString()}</p>

              <p className="text-sm text-[#8E9CB1]">Where</p>
              <p className="text-white">{event.venueName}{event.venueAddress ? ` — ${event.venueAddress}` : ''}</p>

              <p className="text-sm text-[#8E9CB1]">Tickets sold</p>
              <p className="text-white">{event.ticketsSold ?? event._count?.tickets ?? 0}</p>

              {event.ticketTypes?.length > 0 && (
                <div>
                  <p className="text-sm text-[#8E9CB1]">Ticket Types</p>
                  <div className="space-y-2 mt-2">
                    {event.ticketTypes.map((t: any) => (
                      <div key={t.id} className="flex justify-between text-white">
                        <div>{t.name}</div>
                        <div className="text-[#28C88C]">₦{t.price?.toLocaleString?.() ?? t.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
