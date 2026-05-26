import 'dotenv/config';
import 'module-alias/register';
console.log('STARTUP: 1 - dotenv loaded');

// Global error handlers - set up FIRST
process.on('unhandledRejection', (reason: any) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  console.error('UNCAUGHT EXCEPTION:', error.message);
  console.error(error.stack);
  process.exit(1);
});

console.log('STARTUP: 2 - error handlers registered');

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env';
// import { logger } from './lib/logger';
// import { redis } from './lib/redis';
import { sanitizeInput } from './middleware/sanitize.middleware';
import authRoutes from './routes/auth.routes';
import linkRoutes from './routes/link.routes';
import qrcodeRoutes from './routes/qrcode.routes';
import analyticsRoutes from './routes/analytics.routes';
import paymentRoutes from './routes/payment.routes';
import subscriptionRoutes from './routes/subscription.routes';
import eventRoutes from './routes/event.routes';
import ticketRoutes from './routes/tickets.routes';
import webhookRoutes from './routes/webhook.routes';
import redirectRoutes from './routes/redirect.routes';
import { authMiddleware } from './middleware/auth.middleware';
import {
  errorHandler,
  asyncHandler,
} from './middleware/errorHandler.middleware';
import {
  authLimiter,
  apiLimiter,
  redirectLimiter,
} from './middleware/rateLimit.middleware';

console.log('DEBUG: All imports complete, creating app...');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan('combined'));
app.use(apiLimiter);
app.use(sanitizeInput); // Apply input sanitization to remove XSS attacks

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'LinkTik API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      apiDocs: '/api-docs',
      auth: '/api/auth/*',
    },
  });
});

// API Documentation placeholder
app.get('/api-docs', (req: Request, res: Response) => {
  res.json({
    message: 'API Documentation',
    basePath: '/api',
    version: '1.0.0',
    endpoints: {
      'POST /api/auth/signup': 'Create new account',
      'POST /api/auth/login': 'Login to existing account',
      'POST /api/auth/refresh': 'Refresh access token',
      'GET /api/auth/profile': 'Get current user profile (requires auth)',
    },
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/links', apiLimiter, authMiddleware, linkRoutes);
app.use('/api/qrcodes', apiLimiter, authMiddleware, qrcodeRoutes);
app.use('/api/analytics', apiLimiter, authMiddleware, analyticsRoutes);
app.use('/api/payments', apiLimiter, authMiddleware, paymentRoutes);
app.use('/api/subscriptions', apiLimiter, authMiddleware, subscriptionRoutes);
app.use('/api/events', apiLimiter, eventRoutes);
app.use('/api/tickets', apiLimiter, ticketRoutes);

// Public Webhook Routes (no auth required)
app.use('/webhooks', webhookRoutes);

// Public redirect routes (must be after API routes)
app.use('/', redirectLimiter, redirectRoutes);

// Test endpoint to verify routes are loaded
app.get('/api/test', authMiddleware, (req: Request, res: Response) => {
  res.json({
    message: 'Routes are working',
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      path: req.path,
      method: req.method,
    },
  });
});

// Global error handler (must be last)
app.use(errorHandler);

console.log('About to start server on port...');

// Start server
const PORT = parseInt(env.PORT, 10) || 5000;
console.log(`Starting server on port ${PORT}`);
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

console.log('Server listen() called, waiting for connections...');

export default app;
