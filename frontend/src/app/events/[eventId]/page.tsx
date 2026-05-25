'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { Card, Button, Input } from '@/components/ui'

interface Event {
  id: string
  name: string
  description: string | null
  dateTime: string
  location: string | null
}

interface TicketType {
  id: string
  name: string
  price: number
  quantityLeft: number
}

interface TicketSelection {
  ticketTypeId: string
  quantity: number
}

export default function EventTicketPage() {
  const params = useParams()
  const eventId = params.eventId as string
  
  const [event, setEvent] = useState<Event | null>(null)
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tickets, setTickets] = useState<TicketSelection[]>([])
  const [orderingInProgress, setOrderingInProgress] = useState(false)

  // Customer info
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  const fetchEventDetails = useCallback(async () => {
    try {
      setLoading(true)
      const [eventRes, ticketsRes] = await Promise.all([
        api.get(`/api/events/${eventId}`),
        api.get(`/api/events/${eventId}/ticket-types`),
      ])

      setEvent(eventRes.data)
      setTicketTypes(ticketsRes.data || [])
      
      // Initialize ticket selections
      if (ticketsRes.data) {
        setTickets(ticketsRes.data.map((t: TicketType) => ({ ticketTypeId: t.id, quantity: 0 })))
      }
    } catch (err: any) {
      setError('Failed to load event details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    if (eventId) {
      fetchEventDetails()
    }
  }, [eventId, fetchEventDetails])

  const handleQuantityChange = (ticketTypeId: string, quantity: number) => {
    setTickets(tickets.map(t => 
      t.ticketTypeId === ticketTypeId ? { ...t, quantity: Math.max(0, quantity) } : t
    ))
  }

  const calculateTotal = () => {
    return tickets.reduce((sum, selection) => {
      const ticketType = ticketTypes.find(t => t.id === selection.ticketTypeId)
      return sum + (ticketType?.price || 0) * selection.quantity
    }, 0)
  }

  const handleOrderTickets = async () => {
    try {
      setOrderingInProgress(true)
      setError(null)

      const selectedTickets = tickets.filter(t => t.quantity > 0)
      if (selectedTickets.length === 0) {
        setError('Please select at least one ticket')
        setOrderingInProgress(false)
        return
      }

      const response = await api.post('/api/tickets/order', {
        eventId,
        customerName,
        customerEmail,
        customerPhone,
        tickets: selectedTickets,
      })

      // Redirect to order confirmation
      if (response.data?.id) {
        window.location.href = `/tickets/order/${response.data.id}`
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order')
    } finally {
      setOrderingInProgress(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading event details...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Event not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Event Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
              <p className="text-blue-100">{event.location || 'Online Event'}</p>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="md:col-span-2">
            <Card className="mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Event Details</h2>
                <p className="text-slate-600 mb-4">{event.description}</p>
                <div className="flex items-center text-slate-600 mb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(event.dateTime).toLocaleDateString()} at{' '}
                  {new Date(event.dateTime).toLocaleTimeString()}
                </div>
              </div>
            </Card>

            {/* Ticket Types */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Select Tickets</h2>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {ticketTypes.map((ticketType) => (
                    <div key={ticketType.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{ticketType.name}</h3>
                          <p className="text-sm text-slate-600">
                            ₦{(ticketType.price / 100).toLocaleString()} · {ticketType.quantityLeft} available
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">
                          ₦{(ticketType.price / 100).toLocaleString()}
                        </span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max={ticketType.quantityLeft}
                        value={tickets.find(t => t.ticketTypeId === ticketType.id)?.quantity || 0}
                        onChange={(e) => handleQuantityChange(ticketType.id, parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter quantity"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-4">
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Your Order</h3>

                {/* Customer Info */}
                <div className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+234..."
                    />
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-slate-200 pt-4 mb-4">
                  {tickets
                    .filter(t => t.quantity > 0)
                    .map(selection => {
                      const ticketType = ticketTypes.find(t => t.id === selection.ticketTypeId)
                      return (
                        <div key={selection.ticketTypeId} className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">
                            {ticketType?.name} × {selection.quantity}
                          </span>
                          <span className="font-semibold text-slate-900">
                            ₦{((ticketType?.price || 0) / 100 * selection.quantity).toLocaleString()}
                          </span>
                        </div>
                      )
                    })}
                </div>

                {/* Total */}
                <div className="border-t border-slate-200 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₦{(calculateTotal() / 100).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleOrderTickets}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={orderingInProgress}
                >
                  {orderingInProgress ? 'Processing...' : 'Continue to Payment'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
