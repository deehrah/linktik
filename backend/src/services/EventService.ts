import { EventStatus } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'
import { QRCodeService } from './QRCodeService'
import { LinkService } from './LinkService'

const linkService = new LinkService()

interface CreateEventParams {
  organizerId: string
  name: string
  slug: string
  description?: string
  startDate: Date
  endDate: Date
  venueName: string
  venueAddress?: string
  capacity?: number
  category?: string
  posterUrl?: string
}

interface CreateTicketTypeParams {
  eventId: string
  name: string
  description?: string
  price: number
  quantityTotal: number
}

interface UpdateEventParams {
  name?: string
  description?: string
  dateTime?: Date
  venueName?: string
  venueAddress?: string
  capacity?: number
  category?: string
  posterUrl?: string
  status?: EventStatus
  isPublished?: boolean
}

/**
 * EventService
 * Manages event lifecycle: creation, ticket types, capacity, status
 */
export class EventService {
  private static validateEventDates(startDate: Date, endDate: Date): void {
    if (new Date(endDate) <= new Date(startDate)) {
      throw new Error('End date must be after start date')
    }
  }

  /**
   * Create a new event
   */
  static async createEvent(params: CreateEventParams) {
    try {
      const {
        organizerId,
        name,
        slug,
        description,
        startDate,
        endDate,
        venueName,
        venueAddress,
        capacity,
        category,
        posterUrl,
      } = params

      this.validateEventDates(startDate, endDate)

      // Check if slug is unique
      const existingEvent = await prisma.event.findFirst({
        where: { slug },
      })

      if (existingEvent) {
        throw new Error(`Event slug "${slug}" is already taken`)
      }

      // Create event
      const event = await prisma.event.create({
        data: {
          organizerId,
          name,
          slug,
          description,
          dateTime: startDate,
          venueName,
          venueAddress,
          capacity,
          category,
          posterUrl,
          status: 'DRAFT',
          isPublished: false,
        },
      })

      logger.info('Event created', {
        eventId: event.id,
        organizerId,
        name,
        slug,
      })

      let eventLink = null
      try {
        eventLink = await linkService.createLink(organizerId, {
          originalUrl: `${process.env.APP_URL || 'http://localhost:3000'}/e/${slug}`,
          title: `Event: ${name}`,
        })
      } catch (error) {
        console.warn('Link generation failed', error)
      }

      let eventQRCode = null
      try {
        eventQRCode = await QRCodeService.generateQRCode(organizerId, {
          data: eventLink?.shortUrl || `${process.env.APP_URL || 'http://localhost:3000'}/e/${slug}`,
          size: 500,
          format: 'png',
          errorCorrection: 'H',
        })
      } catch (error) {
        console.warn('QR generation failed', error)
      }

      return { ...event, eventLink, eventQRCode }
    } catch (error) {
      logger.error('Failed to create event', { error })
      throw error
    }
  }

  /**
   * Get event by ID
   */
  static async getEvent(eventId: string) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organizer: { select: { id: true, name: true, email: true } },
          ticketTypes: true,
          _count: {
            select: {
              tickets: true,
              orders: true,
            },
          },
        },
      })

      if (!event) {
        return null
      }

      // Calculate available quantity
      const totalSold = await prisma.ticketType.aggregate({
        where: { eventId },
        _sum: { quantitySold: true },
      })

      return {
        ...event,
        ticketsSold: totalSold._sum.quantitySold || 0,
      }
    } catch (error) {
      logger.error('Failed to get event', { error })
      throw error
    }
  }

  /**
   * Get events by organizer
   */
  static async getOrganizerEvents(organizerId: string, status?: EventStatus) {
    try {
      const events = await prisma.event.findMany({
        where: {
          organizerId,
          ...(status && { status }),
        },
        include: {
          _count: { select: { tickets: true, orders: true } },
        },
        orderBy: { dateTime: 'desc' },
      })

      return events
    } catch (error) {
      logger.error('Failed to get organizer events', { error })
      throw error
    }
  }

  /**
   * Get published events (public listing)
   */
  static async getPublishedEvents(
    page = 1,
    limit = 20,
    category?: string
  ) {
    try {
      const skip = (page - 1) * limit

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where: {
            isPublished: true,
            status: 'PUBLISHED',
            dateTime: { gte: new Date() },
            ...(category && { category }),
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            posterUrl: true,
            dateTime: true,
            venueName: true,
            category: true,
            capacity: true,
            _count: { select: { tickets: true } },
          },
          orderBy: { dateTime: 'asc' },
          skip,
          take: limit,
        }),
        prisma.event.count({
          where: {
            isPublished: true,
            status: 'PUBLISHED',
            dateTime: { gte: new Date() },
            ...(category && { category }),
          },
        }),
      ])

      return {
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      logger.error('Failed to get published events', { error })
      throw error
    }
  }

  /**
   * Update event details
   */
  static async updateEvent(eventId: string, organizerId: string, updates: UpdateEventParams) {
    try {
      // Verify ownership
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      })

      if (!event) {
        throw new Error('Event not found')
      }

      if (event.organizerId !== organizerId) {
        throw new Error('Not authorized to update this event')
      }

      const updated = await prisma.event.update({
        where: { id: eventId },
        data: updates,
      })

      logger.info('Event updated', { eventId, organizerId })

      return updated
    } catch (error) {
      logger.error('Failed to update event', { error })
      throw error
    }
  }

  /**
   * Publish event to make it visible to public
   */
  static async publishEvent(eventId: string, organizerId: string) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      })

      if (!event) {
        throw new Error('Event not found')
      }

      if (event.organizerId !== organizerId) {
        throw new Error('Not authorized')
      }

      if ((await prisma.ticketType.count({ where: { eventId } })) === 0) {
        throw new Error('Event must have at least one ticket type before publishing')
      }

      const updated = await prisma.event.update({
        where: { id: eventId },
        data: {
          status: 'PUBLISHED',
          isPublished: true,
        },
      })

      logger.info('Event published', { eventId, organizerId })

      return updated
    } catch (error) {
      logger.error('Failed to publish event', { error })
      throw error
    }
  }

  /**
   * Create ticket type for event
   */
  static async createTicketType(params: CreateTicketTypeParams) {
    try {
      const { eventId, name, description, price, quantityTotal } = params

      // Verify event exists
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      })

      if (!event) {
        throw new Error('Event not found')
      }

      const ticketType = await prisma.ticketType.create({
        data: {
          eventId,
          name,
          description,
          price,
          quantityTotal,
          quantityLeft: quantityTotal,
        },
      })

      logger.info('Ticket type created', {
        ticketTypeId: ticketType.id,
        eventId,
        name,
        quantity: quantityTotal,
      })

      return ticketType
    } catch (error) {
      logger.error('Failed to create ticket type', { error })
      throw error
    }
  }

  /**
   * Get ticket types for event
   */
  static async getTicketTypes(eventId: string) {
    try {
      const ticketTypes = await prisma.ticketType.findMany({
        where: { eventId, isActive: true },
      })

      return ticketTypes
    } catch (error) {
      logger.error('Failed to get ticket types', { error })
      throw error
    }
  }

  /**
   * Check event capacity
   */
  static async checkCapacity(eventId: string): Promise<{
    capacity: number | null
    sold: number
    available: number
    percentSold: number
  }> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      })

      if (!event) {
        throw new Error('Event not found')
      }

      const sold = await prisma.ticket.count({
        where: { eventId, status: { in: ['VALID', 'USED'] } },
      })

      const capacity = event.capacity || 0
      const available = Math.max(0, capacity - sold)
      const percentSold = capacity > 0 ? Math.round((sold / capacity) * 100) : 0

      return {
        capacity,
        sold,
        available,
        percentSold,
      }
    } catch (error) {
      logger.error('Failed to check capacity', { error })
      throw error
    }
  }

  /**
   * Get event analytics
   */
  static async getEventAnalytics(eventId: string) {
    try {
      const [ticketStats, attendanceStats, revenueStats] = await Promise.all([
        // Ticket statistics
        prisma.ticket.groupBy({
          by: ['status'],
          where: { eventId },
          _count: { id: true },
        }),

        // Attendance statistics
        prisma.entryLog.groupBy({
          by: ['status'],
          where: { eventId },
          _count: { id: true },
        }),

        // Revenue statistics
        prisma.order.aggregate({
          where: { eventId, paymentStatus: 'SUCCESSFUL' },
          _sum: { totalAmount: true },
          _count: { id: true },
        }),
      ])

      return {
        tickets: ticketStats,
        attendance: attendanceStats,
        revenue: {
          total: revenueStats._sum.totalAmount || 0,
          orders: revenueStats._count,
        },
      }
    } catch (error) {
      logger.error('Failed to get event analytics', { error })
      throw error
    }
  }

  /**
   * Delete event (only if DRAFT and no tickets sold)
   */
  static async deleteEvent(eventId: string, organizerId: string) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      })

      if (!event) {
        throw new Error('Event not found')
      }

      if (event.organizerId !== organizerId) {
        throw new Error('Not authorized')
      }

      if (event.status !== 'DRAFT') {
        throw new Error('Can only delete draft events')
      }

      // Check if any tickets sold
      const ticketsSold = await prisma.ticket.count({
        where: { eventId },
      })

      if (ticketsSold > 0) {
        throw new Error('Cannot delete event with tickets sold')
      }

      // Delete related records
      await prisma.ticketType.deleteMany({ where: { eventId } })
      await prisma.scanner.deleteMany({ where: { eventId } })

      const deleted = await prisma.event.delete({
        where: { id: eventId },
      })

      logger.info('Event deleted', { eventId, organizerId })

      return deleted
    } catch (error) {
      logger.error('Failed to delete event', { error })
      throw error
    }
  }
}

export default EventService
