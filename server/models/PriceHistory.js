const mongoose = require('mongoose');

const PriceHistorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  retailerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Retailer', required: true },
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('PriceHistory', PriceHistorySchema);
