const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  targetPrice: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Reached', 'Dismissed'], default: 'Active' },
}, { timestamps: true });

// Compound index to easily fetch a user's alerts or find alerts for a product
AlertSchema.index({ user: 1, status: 1 });
AlertSchema.index({ product: 1, status: 1 });

module.exports = mongoose.model('Alert', AlertSchema);
