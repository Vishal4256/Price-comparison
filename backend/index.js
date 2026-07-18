require('dotenv').config();
require('./config/env')(); // Validate env vars before anything else

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('./jobs/priceTracker'); // Start Cron Jobs
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const searchRoutes = require('./routes/searchRoutes');
const visionRoutes = require('./routes/visionRoutes');

const Sentry = require("@sentry/node");
const logger = require('./utils/logger');
const errorHandler = require('./middleware/error');

// Initialize Retailer Registry
require('./services/retailers');

if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 1.0,
    });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Logging Middleware
app.use(helmet());

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev')); // Request logging

// Secure CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.CLIENT_URL] 
        : ['http://localhost:5173'],
    credentials: true
}));

// Rate Limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many authentication attempts, please try again later.'
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Apply global rate limiter to all API routes
app.use('/api', apiLimiter);

// Import Auth Middleware
const { protect } = require('./middleware/auth');

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);

// Protected Routes (Require Authentication)
app.use('/api/search', protect, searchRoutes);
app.use('/api/vision', protect, visionRoutes);
app.use('/api/assistant', protect, require('./routes/assistantRoutes'));
app.use('/api/compare', protect, require('./routes/compareRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes')); // protect is inside the router now
app.use('/api/feed', require('./routes/feedRoutes'));
app.use('/api/products', protect, require('./routes/productRoutes'));
app.use('/api/prices', require('./routes/historyRoutes')); // History & Pricing endpoints
app.use('/api/ai', require('./routes/aiRoutes')); // AI Decision Engine endpoints
app.use('/api/dashboard', require('./routes/dashboardRoutes')); // Analytics & Dashboards
app.use('/api/engagement', require('./routes/engagementRoutes')); // Notifications & Coupons

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        logger.info('✅ MongoDB: Connected successfully');
        
        // Startup Diagnostics
        const diag = {
            environment:  process.env.NODE_ENV || 'development',
            port:         process.env.PORT || 5000,
            mongodb:      'connected',
            gemini:       process.env.GEMINI_API_KEY ? 'configured' : '⚠️  NOT CONFIGURED — AI features disabled',
            redis:        'disabled (planned)',
            frontendUrl:  process.env.CLIENT_URL || 'not set',
        };

        logger.info('─────────────────────────────────────────');
        logger.info('  PriceWise API — Startup Diagnostics');
        logger.info('─────────────────────────────────────────');
        Object.entries(diag).forEach(([k, v]) => logger.info(`  ${k.padEnd(15)}: ${v}`));
        logger.info('─────────────────────────────────────────');
    })
    .catch(err => logger.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('PriceWise v2.0 API is running (Clean Foundation)...');
});

// Health Checks (mounted at both /health and /api/health for compatibility)
const healthRoutes = require('./routes/healthRoutes');
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

// Sentry Error Handler (must be before any other error middleware)
Sentry.setupExpressErrorHandler(app);

// Centralized Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

// Graceful Shutdown
const shutdown = async () => {
    logger.info('SIGINT/SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('HTTP server closed.');
    });
    
    try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed.');
        
        // Close Redis later when we implement it
        const redisClient = require('./config/redis');
        if (redisClient) {
            redisClient.quit();
            logger.info('Redis connection closed.');
        }

        process.exit(0);
    } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
