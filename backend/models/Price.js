const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    website: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discount: { type: Number, default: 0 },
    link: { type: String, required: true },
    availability: { type: String, default: 'In Stock' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

priceSchema.index({ productId: 1, website: 1, timestamp: -1 });

module.exports = mongoose.model('Price', priceSchema);
