import { PrismaClient } from '@prisma/client'
import QRCode from 'qrcode'
import { logger } from '@/lib/logger'

const prisma = new PrismaClient()

interface CreateOrderParams {
  eventId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  tickets: Array<{ ticketTypeId: string; quantity: number }>
}

interface ValidateTicketParams {
  eventId: string
  ticketNumber: string
  qrCodeData: string
}

interface ScanTicketParams {
  ticketId: string
  eventId: string
  scannerId: string
}

/**
 * TicketService
 * Manages ticket generation, validation, and event entry
 */
export class TicketService {
  /**
   * Create an order and generate tickets
   */
  static async createOrder(params: CreateOrderParams) {
    try {
      const { eventId, customerName, customerEmail, customerPhone, tickets } = params

      // Verify event exists
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      })

      if (!event) {
        throw new Error('Event not found')
      }

      // Calculate total amount and validate availability
      let totalAmount = 0
      for (const item of tickets) {
        const ticketType = await prisma.ticketType.findUnique({
          where: { id: item.ticketTypeId },
        })

        if (!ticketType) {
          throw new Error(`Ticket type ${item.ticketTypeId} not found`)
        }

        if (ticketType.quantityLeft < item.quantity) {
          throw new Error(
            `Only ${ticketType.quantityLeft} ${ticketType.name} tickets available`
          )
        }

        totalAmount += ticketType.price * item.quantity
      }

      // Create order
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const serviceCharge = totalAmount * 0.01 // 1% service charge

      const order = await prisma.order.create({
        data: {
          orderNumber,
          eventId,
          customerName,
          customerEmail,
          customerPhone,
          totalAmount,
          serviceCharge,
          ticketCount: tickets.reduce((sum, t) => sum + t.quantity, 0),
          paymentStatus: 'PENDING',
          status: 'PENDING',
        },
      })

      // Generate tickets for each ticket type
      const generatedTickets = []
      for (const item of tickets) {
        for (let i = 0; i < item.quantity; i++) {
          const ticketNumber = `TKT-${eventId.substring(0, 8)}-${order.id.substring(0, 8)}-${Date.now()}-${i}`
          const qrCodeData = `${eventId}|${ticketNumber}|${Date.now()}`

          // Generate QR code image
          const qrCodeBuffer = await QRCode.toDataURL(qrCodeData)

          const ticket = await prisma.ticket.create({
            data: {
              orderId: order.id,
              eventId,
              ticketTypeId: item.ticketTypeId,
              ticketNumber,
              buyerName: customerName,
              buyerEmail: customerEmail,
              qrCodeData,
              qrCodeUrl: qrCodeBuffer,
              status: 'PENDING',
            },
          })

          generatedTickets.push(ticket)
        }

        // Update ticket type quantity
        const ticketType = await prisma.ticketType.findUnique({
          where: { id: item.ticketTypeId },
        })

        if (ticketType) {
          await prisma.ticketType.update({
            where: { id: item.ticketTypeId },
            data: {
              quantitySold: ticketType.quantitySold + item.quantity,
              quantityLeft: Math.max(0, ticketType.quantityLeft - item.quantity),
            },
          })
        }
      }

      logger.info('Order created with tickets', {
        orderId: order.id,
        orderNumber,
        eventId,
        ticketCount: generatedTickets.length,
      })

      return {
        order,
        tickets: generatedTickets,
      }
    } catch (error) {
      logger.error('Failed to create order', { error })
      throw error
    }
  }

  /**
   * Validate ticket for entry
   */
  static async validateTicket(params: ValidateTicketParams) {
    try {
      const { eventId, ticketNumber, qrCodeData } = params

      // Find ticket
      const ticket = await prisma.ticket.findFirst({
        where: {
          ticketNumber,
          eventId,
          qrCodeData,
        },
        include: { ticketType: true },
      })

      if (!ticket) {
        return {
          valid: false,
          message: 'Ticket not found or QR code mismatch',
        }
      }

      if (ticket.status === 'USED') {
        return {
          valid: false,
          message: 'Ticket already used',
          ticket,
        }
      }

      if (ticket.status === 'CANCELLED' || ticket.status === 'REFUNDED') {
        return {
          valid: false,
          message: `Ticket ${ticket.status.toLowerCase()}`,
          ticket,
        }
      }

      return {
        valid: true,
        message: 'Valid ticket',
        ticket,
      }
    } catch (error) {
      logger.error('Failed to validate ticket', { error })
      throw error
    }
  }

  /**
   * Scan ticket at entry point
   */
  static async scanTicket(params: ScanTicketParams) {
    try {
      const { ticketId, eventId, scannerId } = params

      // Find ticket
      const ticket = await prisma.ticket.findFirst({
        where: {
          id: ticketId,
          eventId,
        },
      })

      if (!ticket) {
        return {
          success: false,
          status: 'NOT_FOUND',
          message: 'Ticket not found',
        }
      }

      // Check ticket status
      if (ticket.isUsed) {
        return {
          success: false,
          status: 'ALREADY_USED',
          message: 'Ticket already scanned',
          ticket,
        }
      }

      if (ticket.status !== 'VALID' && ticket.status !== 'PENDING') {
        return {
          success: false,
          status: 'INVALID',
          message: `Ticket status: ${ticket.status}`,
          ticket,
        }
      }

      // Mark ticket as used
      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          status: 'USED',
          isUsed: true,
          usedAt: new Date(),
          usedBy: scannerId,
        },
      })

      // Create entry log
      const entryLog = await prisma.entryLog.create({
        data: {
          eventId,
          ticketId,
          scannerId,
          status: 'SUCCESS',
        },
      })

      // Update event attended count
      await prisma.event.update({
        where: { id: eventId },
        data: { attended: { increment: 1 } },
      })

      logger.info('Ticket scanned successfully', {
        ticketId,
        eventId,
        scannerId,
      })

      return {
        success: true,
        status: 'SUCCESS',
        message: 'Ticket accepted',
        ticket: updatedTicket,
      }
    } catch (error) {
      logger.error('Failed to scan ticket', { error })

      return {
        success: false,
        status: 'ERROR',
        message: 'Scanning error',
        error: (error as any).message,
      }
    }
  }

  /**
   * Get order details with tickets
   */
  static async getOrder(orderId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          tickets: {
            include: { ticketType: true },
          },
          event: {
            select: { id: true, name: true, dateTime: true },
          },
        },
      })

      return order
    } catch (error) {
      logger.error('Failed to get order', { error })
      throw error
    }
  }

  /**
   * Get customer's orders and tickets
   */
  static async getCustomerOrders(customerEmail: string) {
    try {
      const orders = await prisma.order.findMany({
        where: { customerEmail },
        include: {
          tickets: true,
          event: {
            select: { id: true, name: true, dateTime: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return orders
    } catch (error) {
      logger.error('Failed to get customer orders', { error })
      throw error
    }
  }

  /**
   * Refund ticket (sets status to REFUNDED)
   */
  static async refundTicket(ticketId: string) {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
      })

      if (!ticket) {
        throw new Error('Ticket not found')
      }

      if (ticket.status === 'USED') {
        throw new Error('Cannot refund already used tickets')
      }

      const refunded = await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'REFUNDED' },
      })

      logger.info('Ticket refunded', { ticketId })

      return refunded
    } catch (error) {
      logger.error('Failed to refund ticket', { error })
      throw error
    }
  }

  /**
   * Get event entry statistics
   */
  static async getEntryStats(eventId: string) {
    try {
      const [total, used, pending, refunded] = await Promise.all([
        prisma.ticket.count({ where: { eventId } }),
        prisma.ticket.count({ where: { eventId, status: 'USED' } }),
        prisma.ticket.count({ where: { eventId, status: 'PENDING' } }),
        prisma.ticket.count({ where: { eventId, status: 'REFUNDED' } }),
      ])

      return {
        total,
        used,
        pending,
        refunded,
        checkInRate: total > 0 ? Math.round((used / total) * 100) : 0,
      }
    } catch (error) {
      logger.error('Failed to get entry stats', { error })
      throw error
    }
  }

  /**
   * Confirm payment and validate tickets
   */
  static async confirmOrderPayment(orderId: string, paymentReference: string) {
    try {
      // Update order payment status
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'SUCCESSFUL',
          paymentReference,
          status: 'CONFIRMED',
        },
      })

      // Set all tickets to VALID
      await prisma.ticket.updateMany({
        where: { orderId },
        data: { status: 'VALID' },
      })

      logger.info('Order payment confirmed', {
        orderId,
        paymentReference,
      })

      return updatedOrder
    } catch (error) {
      logger.error('Failed to confirm order payment', { error })
      throw error
    }
  }
}

export default TicketService
