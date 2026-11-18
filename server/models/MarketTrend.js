const mongoose = require('mongoose');

const marketTrendSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true
  },
  topSearchedProducts: [{
    canonicalId: String,
    title: String,
    searchCount: Number
  }],
  fastestRisingPrices: [{
    canonicalId: String,
    title: String,
    priceIncreasePct: Number,
    oldPrice: Number,
    newPrice: Number
  }],
  biggestPriceDrops: [{
    canonicalId: String,
    title: String,
    priceDecreasePct: Number,
    oldPrice: Number,
    newPrice: Number
  }],
  trendingBrands: [{
    brand: String,
    mentionCount: Number
  }],
  popularCategories: [{
    category: String,
    searchCount: Number
  }],
  operationalMetrics: {
    averageAiLatencyMs: Number,
    predictionAccuracyPct: Number,
    averageRetailerDiscountPct: Number,
    mostVolatileProducts: [{ canonicalId: String, title: String, volatilityScore: Number }]
  }
}, { timestamps: true });

module.exports = mongoose.model('MarketTrend', marketTrendSchema);
