const mongoose = require('mongoose');

const AffiliateClickSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  merchantName: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String }, // For anonymous attribution
  campaign: { type: String },
  referralSource: { type: String },
  targetUrl: { type: String, required: true }
}, {
  timestamps: true
});

// For fast analytics grouping by merchant/time
AffiliateClickSchema.index({ merchantName: 1, createdAt: -1 });

module.exports = mongoose.model('AffiliateClick', AffiliateClickSchema);
