const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Rate limiting configurations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per window
  message: 'Too many authentication attempts, please try again later'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: 'Too many requests, please try again later'
});

const applySecurityMiddlewares = (app) => {
  // 1. HTTP Security Headers
  app.use(helmet());
  
  // 2. CORS setup
  const allowedOrigins = [process.env.CLIENT_URL];
  
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin exactly matches CLIENT_URL or is a Vercel preview deployment
      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200
  }));

  // 3. Compression
  app.use(compression());

  // 4. Data Sanitization against NoSQL Query Injection (Custom wrapper for Express 5 compatibility)
  app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body, { replaceWith: '_' });
    if (req.query) mongoSanitize.sanitize(req.query, { replaceWith: '_' });
    if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: '_' });
    next();
  });

  // 5. Data Sanitization against XSS (Custom wrapper for Express 5 compatibility)
  const { clean } = require('xss-clean/lib/xss');
  app.use((req, res, next) => {
    if (req.body) {
      const cleaned = clean(req.body);
      for (const key in cleaned) req.body[key] = cleaned[key];
    }
    if (req.query) {
      const cleaned = clean(req.query);
      for (const key in cleaned) req.query[key] = cleaned[key];
    }
    if (req.params) {
      const cleaned = clean(req.params);
      for (const key in cleaned) req.params[key] = cleaned[key];
    }
    next();
  });

  // Apply default limit to all API routes
  app.use('/api', apiLimiter);
  // Stricter limits for auth
  app.use('/api/v1/auth', authLimiter);
};

module.exports = applySecurityMiddlewares;
