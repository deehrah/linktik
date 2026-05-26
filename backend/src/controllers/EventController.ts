import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../middleware/errorHandler.middleware'
import EventService from '../services/EventService'

/**
 * EventController
 * HTTP handlers for event management endpoints
 */
export class EventController {
  /**
   * POST /api/events/create
   * Create a new event
   */
  static createEvent = asyncHandler(async (req: Request, res: Response) => {
    const { name, slug, description, dateTime, venueName, venueAddress, capacity, category, posterUrl } =
      req.body

    if (!name || !slug || !dateTime || !venueName) {
      throw new AppError(400, 'Missing required fields')
    }

    if (!req.user?.id) {
      throw new AppError(401, 'Unauthorized')
    }

    const event = await EventService.createEvent({
      organizerId: req.user.id,
      name,
      slug,
      description,
      dateTime: new Date(dateTime),
      venueName,
      venueAddress,
      capacity: capacity ? Number(capacity) : undefined,
      category,
      posterUrl,
    })

    res.status(201).json({
      success: true,
      data: event,
    })
  })

  /**
   * GET /api/events/:eventId
   * Get event details
   */
  static getEvent = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params

    const event = await EventService.getEvent(eventId)

    if (!event) {
      throw new AppError(404, 'Event not found')
    }

    res.json({
      success: true,
      data: event,
    })
  })

  /**
   * GET /api/events/organizer/:organizerId
   * Get events by organizer
   */
  static getOrganizerEvents = asyncHandler(async (req: Request, res: Response) => {
    const { organizerId } = req.params
    const { status } = req.query

    if (!req.user?.id || req.user.id !== organizerId) {
      throw new AppError(401, 'Unauthorized')
    }

    const events = await EventService.getOrganizerEvents(organizerId, status as any)

    res.json({
      success: true,
      data: events,
    })
  })

  /**
   * GET /api/events
   * Get published events with pagination
   */
  static getPublishedEvents = asyncHandler(async (req: Request, res: Response) => {
    const { page = '1', limit = '20', category } = req.query

    const result = await EventService.getPublishedEvents(
      Number(page),
      Number(limit),
      category as string
    )

    res.json({
      success: true,
      data: result.events,
      pagination: result.pagination,
    })
  })

  /**
   * PUT /api/events/:eventId
   * Update event details
   */
  static updateEvent = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params

    if (!req.user?.id) {
      throw new AppError(401, 'Unauthorized')
    }

    const event = await EventService.updateEvent(eventId, req.user.id, req.body)

    res.json({
      success: true,
      data: event,
    })
  })

  /**
   * POST /api/events/:eventId/publish
   * Publish event to make it public
   */
  static publishEvent = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params

    if (!req.user?.id) {
      throw new AppError(401, 'Unauthorized')
    }

    const event = await EventService.publishEvent(eventId, req.user.id)

    res.json({
      success: true,
      message: 'Event published successfully',
      data: event,
    })
  })

  /**
   * DELETE /api/events/:eventId
   * Delete event (only if DRAFT)
   */
  static deleteEvent = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params

    if (!req.user?.id) {
      throw new AppError(401, 'Unauthorized')
    }

    await EventService.deleteEvent(eventId, req.user.id)

    res.json({
      success: true,
      message: 'Event deleted successfully',
    })
  })

  /**
   * POST /api/events/:eventId/ticket-types
   * Create ticket type for event
   */
  static createTicketType = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params
    const { name, description, price, quantityTotal } = req.body

    if (!name || !price || !quantityTotal) {
      throw new AppError(400, 'Missing required fields')
    }

    const ticketType = await EventService.createTicketType({
      eventId,
      name,
      description,
      price: Number(price),
      quantityTotal: Number(quantityTotal),
    })

    res.status(201).json({
      success: true,
      data: ticketType,
    })
  })

  /**
   * GET /api/events/:eventId/ticket-types
   * Get ticket types for event
   */
  static getTicketTypes = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params

    const ticketTypes = await EventService.getTicketTypes(eventId)

    res.json({
      success: true,
      data: ticketTypes,
    })
  })

  /**
   * GET /api/events/:eventId/capacity
   * Check event capacity and availability
   */
  static checkCapacity = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params

    const capacity = await EventService.checkCapacity(eventId)

    res.json({
      success: true,
      data: capacity,
    })
  })

  /**
   * GET /api/events/:eventId/analytics
   * Get event analytics (tickets, revenue, attendance)
   */
  static getEventAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params

    if (!req.user?.id) {
      throw new AppError(401, 'Unauthorized')
    }

    // Verify ownership
    const event = await EventService.getEvent(eventId)
    if (!event || event.organizerId !== req.user.id) {
      throw new AppError(403, 'Forbidden')
    }

    const analytics = await EventService.getEventAnalytics(eventId)

    res.json({
      success: true,
      data: analytics,
    })
  })
}

export default EventController
