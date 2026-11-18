const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  brand: { type: String, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // removed required for cache
  sku: { type: String, index: true },
  image: { type: String },
  imageUrl: { type: String },
  basePrice: { type: Number },
  specifications: { type: Map, of: String },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ProductSchema.index({ name: 'text', brand: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Product', ProductSchema);
