require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const validateEnv = require('./config/env');
const logger = require('./utils/logger');
const requestLogger = require('./middlewares/requestLogger');
const applySecurityMiddlewares = require('./middlewares/security');
const errorHandler = require('./middlewares/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const assistantRoutes = require('./routes/v1/assistant');

// 1. Validate critical environment variables
validateEnv();

const app = express();

// 2. HTTP Request Body Parser
app.use(express.json());

// 3. Request Logger & ID Injector (Must be early)
app.use(requestLogger);

// 4. Security Middlewares (Helmet, CORS, Sanitizers, Limiters, Compression)
applySecurityMiddlewares(app);

// 5. Connect to Database
connectDB();

// 6. Routes
app.use('/health', require('./routes/v1/health'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1/home', require('./routes/v1/home'));
app.use('/api/v1/search', require('./routes/v1/search'));
app.use('/api/v1/product', require('./routes/v1/product'));
app.use('/api/v1/compare', require('./routes/v1/compare'));
app.use('/api/v1/dashboard', require('./routes/v1/dashboard'));
app.use('/api/v1/auth', require('./routes/v1/auth'));
app.use('/api/v1/notifications', require('./routes/v1/notifications'));
app.use('/api/v1/out', require('./routes/v1/out'));
app.use('/api/v1/partner', require('./routes/v1/partner'));
app.use('/api/v1/assistant', assistantRoutes);
app.use('/api/public/v1', require('./routes/public/v1/index'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 7. Global Error Handler (Must be last middleware)
app.use(errorHandler);

// 8. Register Scrapers
const retailerRegistry = require('./scrapers/RetailerRegistry');
const amazonScraper = require('./scrapers/amazon/scraper');
const flipkartScraper = require('./scrapers/flipkart/scraper');
retailerRegistry.register('amazon', amazonScraper);
retailerRegistry.register('flipkart', flipkartScraper);

// 9. Start Background Jobs
const CronScheduler = require('./jobs/CronScheduler');
const PriceWorker = require('./workers/PriceWorker');
const CacheRefreshJob = require('./jobs/CacheRefreshJob');
const AnalyticsAggregationJob = require('./jobs/AnalyticsAggregationJob');

// Schedule Price Refresh (Runs every 15 minutes)
CronScheduler.schedule('PriceRefreshJob', '*/15 * * * *', async () => await PriceWorker.processDueItems());

// Schedule Cache Refresh (Runs every hour)
CronScheduler.schedule('CacheRefreshJob', '0 * * * *', async () => await CacheRefreshJob.run());

// Schedule Analytics Aggregation (Runs once a day at 1:00 AM)
CronScheduler.schedule('AnalyticsAggregationJob', '0 1 * * *', async () => await AnalyticsAggregationJob.run());

CronScheduler.start();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// 9. Graceful Shutdown
const shutdown = async () => {
  logger.info('SIGINT/SIGTERM received. Shutting down gracefully...');
  await CronScheduler.stop();
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
