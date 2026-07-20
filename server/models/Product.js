const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  brand: { type: String, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image: { type: String },
  specifications: { type: Map, of: String },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ProductSchema.index({ name: 'text', brand: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Product', ProductSchema);
