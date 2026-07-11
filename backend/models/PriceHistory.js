const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, for user activity
    actionType: { type: String, enum: ['search', 'view', 'alert_created', 'price_drop', 'cron_update'], default: 'cron_update' },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    previousPrice: { type: Number }, // To calculate difference
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
