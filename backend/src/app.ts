import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import specializationRoutes from './modules/specializations/specializations.routes.js';
import doctorRoutes from './modules/doctors/doctors.routes.js';
import availabilityRoutes from './modules/availability/availability.routes.js';
import appointmentRoutes from './modules/appointments/appointments.routes.js';
import documentRoutes from './modules/documents/documents.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import healthRoutes from './modules/health/health.routes.js';

export const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // In development allow any localhost port or configured frontend URL
      if (config.env === 'development' || origin === config.frontendUrl) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for student testing demo
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Structured HTTP Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/api/v1/health') {
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// API Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/specializations', specializationRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/availability', availabilityRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);

// Root greeting
app.get('/', (_req, res) => {
  res.json({
    service: 'MediCloud API',
    status: 'ACTIVE',
    version: '1.0.0',
    documentation: '/api/v1/health',
  });
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`,
    },
  });
});

// Centralized error handler
app.use(errorHandler);
