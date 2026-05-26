'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { eventsApi } from '@/lib/api';

interface EventData {
  id: string;
  name: string;
  description: string | null;
  eventType: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl: string | null;
  createdAt: string;
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export default function EventsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getAll<EventData[]>();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
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

      {/* Main Content */}
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

        {/* Events Grid */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-4 border-[#28C88C] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#8E9CB1] mt-4">Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden hover:border-[#28C88C] transition-colors">
                  <div className="h-48 bg-gradient-to-br from-[#28C88C]/20 to-[#28C88C]/5 flex items-center justify-center">
                    <svg className="w-16 h-16 text-[#28C88C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <Link href={`/dashboard/events/${event.id}`} className="block">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-white text-lg">{event.name}</h3>
                      <span className="px-2 py-1 bg-[#28C88C]/10 text-[#28C88C] text-xs rounded-full">
                        {event.eventType}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-[#8E9CB1] mb-4 line-clamp-2">{event.description}</p>
                    )}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[#8E9CB1]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(event.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#8E9CB1]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </div>
                    </div>
                    {event.ticketTypes.length > 0 && (
                      <div className="pt-4 border-t border-[#334155]">
                        <p className="text-sm text-[#8E9CB1] mb-2">Ticket Types:</p>
                        <div className="space-y-1">
                          {event.ticketTypes.map((ticket) => (
                            <div key={ticket.id} className="flex items-center justify-between text-sm">
                              <span className="text-white">{ticket.name}</span>
                              <span className="text-[#28C88C] font-semibold">₦{ticket.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 px-4 py-2 bg-[#28C88C] hover:bg-[#24B37D] text-white rounded-lg font-semibold transition-colors text-sm">
                        View Details
                      </button>
                      <button className="p-2 text-[#8E9CB1] hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  </Link>
                </div>
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

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create Event</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#8E9CB1] hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    placeholder="My Awesome Event"
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                    Event Type
                  </label>
                  <select className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] text-white">
                    <option>Conference</option>
                    <option>Workshop</option>
                    <option>Meetup</option>
                    <option>Concert</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Event description..."
                  className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Event venue or online"
                  className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                    Ticket Price
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F1F5F9] mb-2">
                    Total Tickets
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-[#334155] text-white rounded-xl font-semibold hover:border-[#28C88C] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#28C88C] hover:bg-[#24B37D] text-white rounded-xl font-semibold transition-colors"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
