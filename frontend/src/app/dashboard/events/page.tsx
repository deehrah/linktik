'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { eventsApi } from '@/lib/api'

interface EventSummary {
  id: string
  name: string
  slug: string
  description: string | null
  posterUrl: string | null
  dateTime: string
  venueName: string
  venueAddress: string | null
  category: string | null
  capacity: number | null
  status?: string
  isPublished?: boolean
  createdAt: string
  _count?: {
    tickets?: number
    orders?: number
  }
}

interface CreatedEvent extends EventSummary {
  eventLink?: {
    shortUrl: string
    shortCode?: string
  } | null
  eventQRCode?: {
    imageUrl: string
  } | null
}

interface EventFormState {
  name: string
  slug: string
  description: string
  startDate: string
  endDate: string
  venueName: string
  venueAddress: string
  capacity: string
  category: string
  posterUrl: string
}

const defaultFormState: EventFormState = {
  name: '',
  slug: '',
  description: '',
  startDate: '',
  endDate: '',
  venueName: '',
  venueAddress: '',
  capacity: '',
  category: 'Conference',
  posterUrl: '',
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export default function EventsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [events, setEvents] = useState<EventSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdEvent, setCreatedEvent] = useState<CreatedEvent | null>(null)
  const [form, setForm] = useState<EventFormState>(defaultFormState)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const data = await eventsApi.getAll<EventSummary[]>()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetCreateForm = () => {
    setForm(defaultFormState)
    setError(null)
    setCreatedEvent(null)
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    resetCreateForm()
  }

  const handleCreateEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.name.trim() || !form.slug.trim() || !form.startDate || !form.endDate || !form.venueName.trim()) {
      setError('Please fill in the required fields.')
      return
    }

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError('End date must be after start date.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const created = await eventsApi.create<CreatedEvent>({
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        venueName: form.venueName.trim(),
        venueAddress: form.venueAddress.trim() || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        category: form.category.trim() || undefined,
        posterUrl: form.posterUrl.trim() || undefined,
      })

      setCreatedEvent(created)
      await fetchEvents()
      setEvents((current) => [created, ...current])
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to create event.')
    } finally {
      setSubmitting(false)
    }
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
                <Link href="/dashboard/events" className="px-4 py-2 rounded-lg font-medium bg-[#28C88C]/10 text-[#28C88C]">
                  Events
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 text-[#8E9CB1] hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <Link href="/dashboard/profile" className="w-8 h-8 bg-[#28C88C] rounded-full flex items-center justify-center text-white font-semibold cursor-pointer">
                U
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Events</h1>
            <p className="text-[#8E9CB1]">Create and manage events with ticketing</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-[#28C88C] hover:bg-[#24B37D] text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </button>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-4 border-[#28C88C] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#8E9CB1] mt-4">Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((eventItem) => (
                <Link key={eventItem.id} href={`/dashboard/events/${eventItem.id}`} className="block">
                  <div className="bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden hover:border-[#28C88C] transition-colors h-full">
                    <div className="h-48 bg-gradient-to-br from-[#28C88C]/20 to-[#28C88C]/5 flex items-center justify-center">
                      <svg className="w-16 h-16 text-[#28C88C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <h3 className="font-bold text-white text-lg line-clamp-1">{eventItem.name}</h3>
                        <span className="px-2 py-1 bg-[#28C88C]/10 text-[#28C88C] text-xs rounded-full whitespace-nowrap">
                          {eventItem.category || 'Event'}
                        </span>
                      </div>

                      {eventItem.description && (
                        <p className="text-sm text-[#8E9CB1] mb-4 line-clamp-2">{eventItem.description}</p>
                      )}

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-[#8E9CB1]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(eventItem.dateTime).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#8E9CB1]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {eventItem.venueName}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-[#8E9CB1]">
                        <span>{eventItem.capacity ? `${eventItem.capacity} capacity` : 'Unlimited capacity'}</span>
                        <span className="px-2 py-1 rounded-full bg-[#334155] text-white text-xs">
                          {eventItem.status || (eventItem.isPublished ? 'PUBLISHED' : 'DRAFT')}
                        </span>
                      </div>

                      {eventItem._count?.tickets !== undefined && (
                        <p className="mt-4 text-xs text-[#8E9CB1]">{eventItem._count.tickets} tickets linked</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#28C88C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#28C88C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No events yet</h3>
              <p className="text-[#8E9CB1] mb-6">Create your first event to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-[#28C88C] hover:bg-[#24B37D] text-white rounded-xl font-semibold transition-colors"
              >
                Create Event
              </button>
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create Event</h3>
              <button
                onClick={closeCreateModal}
                className="text-[#8E9CB1] hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleCreateEvent}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">Event Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => {
                      const value = event.target.value
                      setForm((current) => ({
                        ...current,
                        name: value,
                        slug: current.slug ? current.slug : slugify(value),
                      }))
                    }}
                    placeholder="My Awesome Event"
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
                    placeholder="my-awesome-event"
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F1F5F9] mb-2">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Event description..."
                  className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">Venue Name</label>
                  <input
                    type="text"
                    value={form.venueName}
                    onChange={(event) => setForm((current) => ({ ...current, venueName: event.target.value }))}
                    placeholder="Event venue or online"
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">Venue Address</label>
                  <input
                    type="text"
                    value={form.venueAddress}
                    onChange={(event) => setForm((current) => ({ ...current, venueAddress: event.target.value }))}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                    placeholder="Conference"
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))}
                    placeholder="250"
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">Poster URL</label>
                  <input
                    type="url"
                    value={form.posterUrl}
                    onChange={(event) => setForm((current) => ({ ...current, posterUrl: event.target.value }))}
                    placeholder="https://example.com/poster.png"
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {createdEvent && (
                <div className="rounded-2xl border border-[#334155] bg-[#0F172A] p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Event created</p>
                      <p className="text-xs text-[#8E9CB1]">{createdEvent.name}</p>
                    </div>
                    <Link href={`/dashboard/events/${createdEvent.id}`} className="text-sm font-medium text-[#28C88C] hover:text-[#24B37D]">
                      Open details
                    </Link>
                  </div>

                  {createdEvent.eventLink?.shortUrl && (
                    <div className="rounded-xl border border-[#334155] bg-[#0B1220] p-4">
                      <p className="text-xs uppercase tracking-wide text-[#8E9CB1] mb-2">Short link</p>
                      <a
                        href={createdEvent.eventLink.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-[#28C88C] break-all hover:text-[#24B37D]"
                      >
                        {createdEvent.eventLink.shortUrl}
                      </a>
                    </div>
                  )}

                  {createdEvent.eventQRCode?.imageUrl && (
                    <div className="flex items-center justify-center rounded-xl bg-white p-4">
                      <img src={createdEvent.eventQRCode.imageUrl} alt="Generated event QR code" className="h-48 w-48 object-contain" />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="flex-1 px-4 py-3 border border-[#334155] text-white rounded-xl font-semibold hover:border-[#28C88C] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-[#28C88C] hover:bg-[#24B37D] disabled:bg-[#8E9CB1] text-white rounded-xl font-semibold transition-colors"
                >
                  {submitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
