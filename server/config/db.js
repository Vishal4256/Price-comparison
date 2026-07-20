const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    logger.error('FATAL: MONGO_URI is missing from environment variables');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Connection event listeners
    mongoose.connection.on('error', err => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
