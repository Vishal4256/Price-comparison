const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
// Allowlist origins via env var `ALLOWED_ORIGINS` (comma-separated).
// Defaults include common localhost ports and the deployed Vercel frontend.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://localhost:5173,https://pricecomparison4256.vercel.app').split(',');
app.set('trust proxy', 1);
// Simple CORS array as requested
app.use(cors({
  origin: [
    "https://pricecomparison4256.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/price-history', require('./routes/priceHistoryRoutes'));
app.use('/api/prices', require('./routes/priceRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/prediction', require('./routes/predictionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), dbState: mongoose.connection.readyState });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Connect DB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));

    // Start cron jobs
    require('./jobs/priceUpdateJob');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
