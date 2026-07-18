const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    brand: { type: String },
    category: { type: String },
    currentPrice: { type: Number, required: true },
    originalPrice: { type: Number },
    retailer: { type: String },
    url: { type: String },
    image: { type: String },
    inStock: { type: Boolean, default: true },
    dealScore: {
        score: { type: Number, default: 50 },
        rating: { type: String, default: 'Fair' }
    },
    priceHistory: [{
        price: Number,
        timestamp: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

productSchema.index({ title: 'text', brand: 'text', category: 'text' });
productSchema.index({ 'dealScore.score': -1 });

module.exports = mongoose.model('Product', productSchema);
