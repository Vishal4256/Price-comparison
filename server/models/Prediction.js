const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  productId: {
    type: String, // Canonical Product ID
    required: true,
    index: true
  },
  prediction: {
    type: String,
    enum: ['Likely to decrease', 'Stable', 'Likely to increase', 'Insufficient Product History'],
    required: true
  },
  fallbackUsed: {
    type: String,
    enum: ['None', 'Category Trend', 'Insufficient Data'],
    default: 'None'
  },
  expectedPrice: {
    type: Number,
    required: false
  },
  confidence: {
    type: Number, // 0 to 1
    required: true
  },
  timeWindow: {
    type: String,
    default: '7 days'
  },
  basedOn: {
    historyDays: { type: Number, default: 0 },
    samples: { type: Number, default: 0 },
    volatility: { type: String, enum: ['Low', 'Medium', 'High', 'Unknown'], default: 'Unknown' },
    categoryTrend: { type: Boolean, default: false }
  },
  evaluatedAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Predictions expire after 24 hours to force recalculation
  },
  actualAccuracy: {
    type: Number, // Stored later by PredictionEvaluator Job
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Prediction', predictionSchema);
