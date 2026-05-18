const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
