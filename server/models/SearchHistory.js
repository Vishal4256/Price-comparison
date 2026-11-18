const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  query: { type: String, required: true },
  category: { type: String }, // Optional context
  resultsCount: { type: Number, default: 0 },
  metadata: {
    intent: { type: String },
    retailersUsed: [{ type: String }],
    latencyMs: { type: Number },
    cacheHit: { type: Boolean, default: false },
    scraperLatencyMs: { type: Number },
    rankingLatencyMs: { type: Number },
    averageMatchConfidence: { type: Number }
  }
}, { timestamps: true });

// Fast lookup for a user's recent searches
SearchHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
