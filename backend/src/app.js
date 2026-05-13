// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { verifyEmailConnection } = require('./config/mail');
const { initSocket } = require('./socket');
const { scheduleBackup } = require('./job/backupJob');
const { scheduleCleanup } = require('./job/cleanupJob');
const { scheduleReminders } = require('./job/reminderJob');
const { scheduleVirusScan } = require('./job/virusScanJob');
const { setupQueues } = require('./job');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const apiRoutes = require('./routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5175',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
  exposedHeaders: ['X-Total-Count', 'X-Pagination-Pages']
};
app.use(cors(corsOptions));

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Strict rate limiter for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 failed attempts
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  }
});
app.use('/api/auth/login', authLimiter);

// ============================================
// STATIC FILES
// ============================================
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/temp', express.static(path.join(__dirname, '../temp')));

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

// Simple health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CLMS Backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Detailed health check
app.get('/health/detailed', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: { status: 'unknown' },
      redis: { status: 'unknown' },
      email: { status: 'unknown' },
      storage: { status: 'unknown' }
    }
  };
  
  // Check database
  try {
    const { sequelize } = require('./config/database');
    await sequelize.authenticate();
    health.services.database = { status: 'connected', message: 'Database is healthy' };
  } catch (error) {
    health.services.database = { status: 'error', message: error.message };
    health.status = 'DEGRADED';
  }
  
  // Check Redis
  try {
    const { isRedisConnected } = require('./utils/redis');
    const redisStatus = await isRedisConnected();
    health.services.redis = { 
      status: redisStatus ? 'connected' : 'disconnected', 
      message: redisStatus ? 'Redis is healthy' : 'Redis is not connected' 
    };
    if (!redisStatus) health.status = 'DEGRADED';
  } catch (error) {
    health.services.redis = { status: 'error', message: error.message };
    health.status = 'DEGRADED';
  }
  
  // Check Email
  try {
    const emailStatus = await verifyEmailConnection();
    health.services.email = {
      status: emailStatus ? 'connected' : 'warning',
      message: emailStatus ? 'Email service is configured' : 'Email service not configured'
    };
  } catch (error) {
    health.services.email = { status: 'error', message: error.message };
  }
  
  // Check Storage
  try {
    const fs = require('fs-extra');
    const uploadsPath = path.join(__dirname, '../uploads');
    await fs.ensureDir(uploadsPath);
    health.services.storage = { status: 'connected', message: 'Storage is writable' };
  } catch (error) {
    health.services.storage = { status: 'error', message: error.message };
    health.status = 'DEGRADED';
  }
  
  res.json(health);
});

// ============================================
// API ROUTES
// ============================================
app.use('/api', apiRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER INITIALIZATION
// ============================================
let server = null;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Database connected');
    
    // Connect to Redis (optional)
    try {
      await connectRedis();
      logger.info('✅ Redis connected');
    } catch (error) {
      logger.warn('⚠️ Redis connection failed, continuing without cache');
    }
    
    // Verify email configuration (optional)
    try {
      await verifyEmailConnection();
      logger.info('✅ Email service configured');
    } catch (error) {
      logger.warn('⚠️ Email service not configured');
    }
    
    // Setup queues
    await setupQueues();
    logger.info('✅ Queues initialized');
    
    // Start HTTP server
    server = app.listen(PORT, () => {
      console.log(`\n╔═══════════════════════════════════════════════════════════════════════════╗`);
      console.log(`║                         🚀 CLMS BACKEND IS RUNNING                         ║`);
      console.log(`╠═══════════════════════════════════════════════════════════════════════════╣`);
      console.log(`║  📍 URL: http://localhost:${PORT}                                           ║`);
      console.log(`║  📊 Health: http://localhost:${PORT}/health                                ║`);
      console.log(`║  🔍 Detailed Health: http://localhost:${PORT}/health/detailed              ║`);
      console.log(`║  🔐 Login: http://localhost:${PORT}/api/auth/login                         ║`);
      console.log(`╠═══════════════════════════════════════════════════════════════════════════╣`);
      console.log(`║  📝 Demo Credentials:                                                      ║`);
      console.log(`║     👑 Admin: admin@clms.com / admin123                                    ║`);
      console.log(`║     👨‍🏫 Teacher: teacher@clms.com / teacher123                              ║`);
      console.log(`║     👨‍🎓 Student: student@clms.com / student123                             ║`);
      console.log(`║     🔬 Lab Manager: labmanager@clms.com / labmanager123                    ║`);
      console.log(`║     🏛️ Dean: dean@clms.com / dean123                                      ║`);
      console.log(`║     🔧 ICT: ict@clms.com / ict123                                         ║`);
      console.log(`║     📦 Asset: asset@clms.com / asset123                                    ║`);
      console.log(`║     🧪 Lab Assistant: labassistant@clms.com / labassistant123              ║`);
      console.log(`╠═══════════════════════════════════════════════════════════════════════════╣`);
      console.log(`║  🌍 Environment: ${process.env.NODE_ENV || 'development'.padEnd(51, ' ')}║`);
      console.log(`║  🔧 Mode: ${process.env.NODE_ENV === 'production' ? 'Production'.padEnd(54, ' ') : 'Development'.padEnd(54, ' ')}║`);
      console.log(`║  📅 Started: ${new Date().toLocaleString().padEnd(55, ' ')}║`);
      console.log(`╚═══════════════════════════════════════════════════════════════════════════╝\n`);
      
      logger.info(`Server started on port ${PORT}`);
    });
    
    // Initialize Socket.IO
    const io = initSocket(server);
    logger.info('✅ WebSocket server initialized');
    
    // Make io available globally
    app.set('io', io);
    
    // Initialize scheduled jobs (only in production or if enabled)
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_BACKUP === 'true') {
      scheduleBackup();
      scheduleCleanup();
      scheduleReminders();
      scheduleVirusScan();
      logger.info('✅ Scheduled jobs initialized');
    }
    
    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`\n🛑 Received ${signal}, closing gracefully...`);
      
      // Close server
      if (server) {
        await new Promise((resolve) => {
          server.close(() => {
            logger.info('✅ HTTP server closed');
            resolve();
          });
        });
      }
      
      // Close database connection
      try {
        const { disconnectDB } = require('./config/database');
        await disconnectDB();
        logger.info('✅ Database connection closed');
      } catch (error) {
        logger.error('Error closing database:', error);
      }
      
      // Close Redis connection
      try {
        const { redisClient } = require('./config/redis');
        if (redisClient) {
          await redisClient.quit();
          logger.info('✅ Redis connection closed');
        }
      } catch (error) {
        logger.error('Error closing Redis:', error);
      }
      
      // Close queues
      try {
        const { closeQueues } = require('./utils/queue');
        await closeQueues();
        logger.info('✅ Queues closed');
      } catch (error) {
        logger.error('Error closing queues:', error);
      }
      
      logger.info('✅ Graceful shutdown complete');
      process.exit(0);
    };
    
    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// ============================================
// EXPORT APP FOR TESTING
// ============================================
module.exports = { app, startServer };