import { Router } from 'express'
import { authMiddleware } from '@/middleware/auth.middleware'
import TicketController from '@/controllers/TicketController'

const router = Router()

/**
 * Ticket Management Routes
 */

// Create order and generate tickets (public)
router.post('/order', TicketController.createOrder)

// Validate ticket QR code (no auth needed for scanning)
router.post('/validate', TicketController.validateTicket)

// Scan ticket at event entry (requires auth)
router.post('/scan', authMiddleware, TicketController.scanTicket)

// Get order details (public, but email-verified in frontend)
router.get('/order/:orderId', TicketController.getOrder)

// Get customer's orders and tickets
router.get('/customer/:email', authMiddleware, TicketController.getCustomerOrders)

// Refund a ticket
router.post('/:ticketId/refund', authMiddleware, TicketController.refundTicket)

// Get event entry statistics
router.get('/event/:eventId/stats', authMiddleware, TicketController.getEntryStats)

// Confirm order payment
router.post('/order/:orderId/confirm-payment', TicketController.confirmOrderPayment)

export default router
