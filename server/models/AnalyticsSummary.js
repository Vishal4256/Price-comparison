const mongoose = require('mongoose');

const AnalyticsSummarySchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true, unique: true },
  
  searchMetrics: {
    totalSearches: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    cacheHitRatio: { type: Number, default: 0 },
    averageLatencyMs: { type: Number, default: 0 }
  },
  
  aiMetrics: {
    totalCalls: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    averageLatencyMs: { type: Number, default: 0 },
    errorRate: { type: Number, default: 0 }
  },
  
  scraperMetrics: {
    totalRuns: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('AnalyticsSummary', AnalyticsSummarySchema);
