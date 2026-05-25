import { Router } from 'express'
import { authMiddleware } from '@/middleware/auth.middleware'
import EventController from '@/controllers/EventController'

const router = Router()

/**
 * Event Management Routes
 */

// Create event (organizer)
router.post('/create', authMiddleware, EventController.createEvent)

// Update event (organizer)
router.put('/:eventId', authMiddleware, EventController.updateEvent)

// Publish event (organizer)
router.post('/:eventId/publish', authMiddleware, EventController.publishEvent)

// Delete event (organizer, draft only)
router.delete('/:eventId', authMiddleware, EventController.deleteEvent)

// Get organizer's events
router.get('/organizer/:organizerId', authMiddleware, EventController.getOrganizerEvents)

// Create ticket type for event
router.post('/:eventId/ticket-types', authMiddleware, EventController.createTicketType)

// Get ticket types for event
router.get('/:eventId/ticket-types', EventController.getTicketTypes)

// Check event capacity
router.get('/:eventId/capacity', EventController.checkCapacity)

// Get event analytics (organizer only)
router.get('/:eventId/analytics', authMiddleware, EventController.getEventAnalytics)

// Get single event (public)
router.get('/:eventId', EventController.getEvent)

// Get all published events (public)
router.get('/', EventController.getPublishedEvents)

export default router
