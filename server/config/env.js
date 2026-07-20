require('dotenv').config();
const logger = require('../utils/logger');

const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL',
  'PORT',
  'NODE_ENV'
];

const validateEnv = () => {
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingVars.length > 0) {
    logger.error(`FATAL ERROR: Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
};

module.exports = validateEnv;
