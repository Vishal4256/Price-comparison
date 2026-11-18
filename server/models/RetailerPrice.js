const mongoose = require('mongoose');

const RetailerPriceSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  retailerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', required: true, index: true },
  price: { type: Number, required: true },
  currency: { type: String, required: true, default: 'INR' },
  country: { type: String, required: true, default: 'IN' },
  taxIncluded: { type: Boolean, default: true },
  oldPrice: { type: Number },
  discount: { type: Number },
  offer: { type: String },
  delivery: { type: String },
  url: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

// One price entry per product-retailer combination
RetailerPriceSchema.index({ productId: 1, retailerId: 1 }, { unique: true });
RetailerPriceSchema.index({ price: 1 });

module.exports = mongoose.model('RetailerPrice', RetailerPriceSchema);
