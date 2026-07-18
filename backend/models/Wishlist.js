const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: String, required: true },
    title: { type: String },
    image: { type: String },
    retailer: { type: String },
    productUrl: { type: String },
    currentPrice: { type: Number },
    currency: { type: String, default: 'INR' },
    targetPrice: { type: Number },
    notifyOnDrop: { type: Boolean, default: true },
    addedAt: { type: Date, default: Date.now },
    lastCheckedAt: { type: Date, default: Date.now },
    isAvailable: { type: Boolean, default: true }
  }]
}, { timestamps: true });

// Ensure one wishlist per user
wishlistSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
