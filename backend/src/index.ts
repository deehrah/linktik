import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import linkRoutes from './routes/link.routes';
import qrcodeRoutes from './routes/qrcode.routes';
import eventRoutes from './routes/event.routes';
import redirectRoutes from './routes/redirect.routes';
import { authMiddleware } from './middleware/auth.middleware';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(helmet());
app.use(morgan('combined'));

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
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/qrcodes', qrcodeRoutes);
app.use('/api/events', eventRoutes);

// Public redirect routes (must be after API routes)
app.use('/', redirectRoutes);

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
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use((err: any, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
});

export default app;
