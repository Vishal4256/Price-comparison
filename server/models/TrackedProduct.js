const mongoose = require('mongoose');

const TrackedProductSchema = new mongoose.Schema({
  canonicalProductId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  trackingType: { type: String, enum: ['wishlist', 'alert', 'trending'], required: true },
  
  // Alert conditions
  targetPrice: { type: Number },
  dealScoreThreshold: { type: Number },
  notifyBackInStock: { type: Boolean, default: false },
  
  // Scheduling
  lastCheckedAt: { type: Date },
  nextScheduledCheck: { type: Date, required: true, index: true },
  priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
  status: { type: String, enum: ['ACTIVE', 'PAUSED', 'FULFILLED'], default: 'ACTIVE' }
}, { timestamps: true });

// Ensure a user can't track the exact same product with the exact same condition multiple times
TrackedProductSchema.index({ userId: 1, canonicalProductId: 1, trackingType: 1 }, { unique: true });

module.exports = mongoose.model('TrackedProduct', TrackedProductSchema);
