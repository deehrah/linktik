/**
 * Service singletons
 * Centralized service instantiation for dependency injection pattern
 * Ensures single instance of each service across the application
 */

import { LinkService } from './LinkService'
import { AuthService } from './AuthService'
import { QRCodeService } from './QRCodeService'
import { AnalyticsService } from './AnalyticsService'
import { PaymentService } from './PaymentService'
import { SubscriptionService } from './SubscriptionService'
import { EventService } from './EventService'
import { TicketService } from './TicketService'

// Create single instances of each service
export const linkService = new LinkService()
export const authService = new AuthService()
export const qrCodeService = new QRCodeService()
export const analyticsService = new AnalyticsService()

// Export all services as an object for convenience
export const services = {
  linkService,
  authService,
  qrCodeService,
  analyticsService,
  PaymentService,
  SubscriptionService,
  EventService,
  TicketService,
}

export default services
