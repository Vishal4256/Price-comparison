const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    category: { type: String },
    brand: { type: String },
    rating: { type: Number },
    reviewsCount: { type: Number },
    source: { type: String }, // Amazon, Flipkart, eBay
    url: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    originalPrice: { type: Number },
    discountPercentage: { type: Number },
    lowestPrice: { type: Number },
    highestPrice: { type: Number },
    averagePrice: { type: Number },
    isFakeDiscount: { type: Boolean, default: false },
    fakeDiscountReason: { type: String },
}, { timestamps: true });

productSchema.index({ title: 'text', brand: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);

