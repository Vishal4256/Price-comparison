const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: [
            'PRICE_DROP', 
            'TARGET_PRICE_REACHED', 
            'NEW_LOWEST_PRICE', 
            'COUPON_AVAILABLE', 
            'CASHBACK_AVAILABLE', 
            'BACK_IN_STOCK', 
            'DEAL_SCORE_IMPROVED'
        ],
        required: true
    },
    productId: { 
        type: String,
        required: true
    },
    retailer: {
        type: String
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    metadata: {
        currentPrice: Number,
        previousPrice: Number,
        triggerReason: String,
        discountValue: Number,
        couponCode: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Index to prevent duplicate notifications for the same event in a short timeframe
notificationSchema.index({ userId: 1, type: 1, productId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
