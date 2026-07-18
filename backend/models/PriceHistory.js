const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
    productId: { 
        type: String, 
        required: true, 
        index: true 
    },
    retailer: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    shipping: { 
        type: Number, 
        default: 0 
    },
    currency: { 
        type: String, 
        default: 'INR' 
    },
    inStock: { 
        type: Boolean, 
        default: true 
    },
    availability: {
        type: String,
        enum: ["in_stock", "out_of_stock", "preorder"],
        default: "in_stock"
    },
    source: { 
        type: String, 
        enum: ['scrape', 'manual', 'api'], 
        default: 'scrape' 
    },
    recordedAt: { 
        type: Date, 
        default: Date.now, 
        index: true 
    }
});

// Compound index to quickly find the latest price per product and retailer
priceHistorySchema.index({ productId: 1, retailer: 1, recordedAt: -1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
