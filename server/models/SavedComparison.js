const mongoose = require('mongoose');

const SavedComparisonSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

SavedComparisonSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SavedComparison', SavedComparisonSchema);
