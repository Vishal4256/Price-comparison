const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    targetPrice: { type: Number, required: true },
    active: { type: Boolean, default: true },
    email: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
