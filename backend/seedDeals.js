const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const PriceHistory = require('./models/PriceHistory');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pricesense';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB for INR seeding...');
    
    await Product.deleteMany({});
    await PriceHistory.deleteMany({});
    
    const deals = [
        { 
            title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', 
            currentPrice: 24990, 
            originalPrice: 29990, 
            discountPercentage: 17, 
            rating: 4.8, 
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', 
            source: 'amazon', 
            url: 'https://www.amazon.in/dp/B09XS7JWHH',
            category: 'Electronics',
            brand: 'Sony',
            isActive: true
        },
        { 
            title: 'Apple Watch Series 9 GPS + Cellular', 
            currentPrice: 41900, 
            originalPrice: 44900, 
            discountPercentage: 7, 
            rating: 4.9, 
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', 
            source: 'flipkart', 
            url: 'https://www.flipkart.com/apple-watch-series-9/p/itm21764676',
            category: 'Electronics',
            brand: 'Apple',
            isActive: true
        },
        { 
            title: 'ASUS ROG Zephyrus G14 Gaming Laptop', 
            currentPrice: 134990, 
            originalPrice: 159990, 
            discountPercentage: 16, 
            rating: 4.7, 
            image: 'https://images.unsplash.com/photo-1504610926078-a1611febcad3?w=500&q=80', 
            source: 'amazon', 
            url: 'https://www.amazon.in/dp/B0C4M6D9G6',
            category: 'Laptops',
            brand: 'ASUS',
            isActive: true
        },
        { 
            title: 'Samsung Galaxy S24 Ultra 5G', 
            currentPrice: 129999, 
            originalPrice: 139999, 
            discountPercentage: 7, 
            rating: 4.6, 
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80', 
            source: 'flipkart', 
            url: 'https://www.flipkart.com/samsung-galaxy-s24-ultra/p/itm',
            category: 'Smartphones',
            brand: 'Samsung',
            isActive: true
        }
    ];
    
    for (const d of deals) {
        const p = await Product.create(d);
        await PriceHistory.create({ productId: p._id, price: d.currentPrice, timestamp: new Date() });
        await PriceHistory.create({ productId: p._id, price: d.originalPrice, timestamp: new Date(Date.now() - 86400000 * 7) });
    }
    
    console.log('Successfully seeded 4 high-quality hot deals in INR.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
