import { Request, Response } from 'express'
import { asyncHandler, AppError } from '../middleware/errorHandler.middleware'
import TicketService from '../services/TicketService'

/**
 * TicketController
 * HTTP handlers for ticket management and entry scanning
 */
export class TicketController {
  /**
   * POST /api/tickets/order
   * Create an order and generate tickets
   */
  static createOrder = asyncHandler(async (req: Request, res: Response) => {
    const { eventId, customerName, customerEmail, customerPhone, tickets } = req.body

    if (!eventId || !customerName || !customerEmail || !customerPhone || !tickets?.length) {
      throw new AppError(400, 'Missing required fields')
    }

    const result = await TicketService.createOrder({
      eventId,
      customerName,
      customerEmail,
      customerPhone,
      tickets,
    })

    res.status(201).json({
      success: true,
      data: result,
    })
  })

  /**
   * POST /api/tickets/validate
   * Validate ticket QR code for entry
   */
  static validateTicket = asyncHandler(async (req: Request, res: Response) => {
    const { eventId, ticketNumber, qrCodeData } = req.body

    if (!eventId || !ticketNumber || !qrCodeData) {
      throw new AppError(400, 'Missing required fields')
    }

    const result = await TicketService.validateTicket({
      eventId,
      ticketNumber,
      qrCodeData,
    })

    const statusCode = result.valid ? 200 : 400

    res.status(statusCode).json({
      success: result.valid,
      ...result,
    })
  })

  /**
   * POST /api/tickets/scan
   * Scan ticket at event entry point
   */
  static scanTicket = asyncHandler(async (req: Request, res: Response) => {
    const { ticketId, eventId, scannerId } = req.body

    if (!ticketId || !eventId || !scannerId) {
      throw new AppError(400, 'Missing required fields')
    }

    if (!req.user?.id) {
      throw new AppError(401, 'Unauthorized')
    }

    const result = await TicketService.scanTicket({
      ticketId,
      eventId,
      scannerId,
    })

    const statusCode = result.success ? 200 : 400

    res.status(statusCode).json(result)
  })

  /**
   * GET /api/orders/:orderId
   * Get order details with tickets
   */
  static getOrder = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params

    const order = await TicketService.getOrder(orderId)

    if (!order) {
      throw new AppError(404, 'Order not found')
    }

    res.json({
      success: true,
      data: order,
    })
  })

  /**
   * GET /api/tickets/customer/:email
   * Get customer's orders and tickets
   */
  static getCustomerOrders = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params

    if (!req.user?.id) {
      throw new AppError(401, 'Unauthorized')
    }

    const orders = await TicketService.getCustomerOrders(email)

    res.json({
      success: true,
      data: orders,
    })
  })

  /**
   * POST /api/tickets/:ticketId/refund
   * Refund a ticket
   */
  static refundTicket = asyncHandler(async (req: Request, res: Response) => {
    const { ticketId } = req.params

    if (!req.user?.id) {
      throw new AppError(401, 'Unauthorized')
    }

    const ticket = await TicketService.refundTicket(ticketId)

    res.json({
      success: true,
      data: ticket,
    })
  })

  /**
   * GET /api/events/:eventId/entry-stats
   * Get event entry and attendance statistics
   */
  static getEntryStats = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params

    if (!req.user?.id) {
      throw new AppError(401, 'Unauthorized')
    }

    const stats = await TicketService.getEntryStats(eventId)

    res.json({
      success: true,
      data: stats,
    })
  })

  /**
   * POST /api/orders/:orderId/confirm-payment
   * Confirm order payment after Paystack verification
   */
  static confirmOrderPayment = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params
    const { paymentReference } = req.body

    if (!paymentReference) {
      throw new AppError(400, 'Payment reference required')
    }

    const order = await TicketService.confirmOrderPayment(orderId, paymentReference)

    res.json({
      success: true,
      message: 'Order payment confirmed',
      data: order,
    })
  })
}

export default TicketController
