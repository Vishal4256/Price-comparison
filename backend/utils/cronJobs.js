const cron = require('node-cron');
const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const Alert = require('../models/Alert');
const scrapeAmazon = require('../scrapers/amazonScraper');
const scrapeFlipkart = require('../scrapers/flipkartScraper');
const scrapeEbay = require('../scrapers/ebayScraper');
const { sendPriceAlert } = require('./emailService');

// Run every 6 hours
cron.schedule('0 */6 * * *', async () => {
    console.log('Running price update cron job...');
    const products = await Product.find();

    for (const product of products) {
        try {
            let updatedData;
            if (product.source === 'Amazon') {
                const results = await scrapeAmazon(product.title);
                updatedData = results.find(p => p.url === product.url) || results[0];
            } else if (product.source === 'Flipkart') {
                const results = await scrapeFlipkart(product.title);
                updatedData = results.find(p => p.url === product.url) || results[0];
            } else if (product.source === 'eBay') {
                const results = await scrapeEbay(product.title);
                updatedData = results.find(p => p.url === product.url) || results[0];
            }

            if (updatedData) {
                const oldPrice = product.currentPrice;
                product.currentPrice = updatedData.currentPrice;
                product.originalPrice = updatedData.originalPrice;
                await product.save();

                await PriceHistory.create({
                    productId: product._id,
                    price: product.currentPrice,
                    originalPrice: product.originalPrice
                });

                // Check for price drop alerts
                if (product.currentPrice < oldPrice) {
                    const alerts = await Alert.find({ 
                        productId: product._id, 
                        targetPrice: { $gte: product.currentPrice } 
                    });

                    for (const alert of alerts) {
                        await sendPriceAlert(
                            alert.email, 
                            product.title, 
                            product.currentPrice, 
                            alert.targetPrice, 
                            product.url
                        );
                        // Optional: Delete or deactivate alert after sending
                        // await Alert.findByIdAndDelete(alert._id);
                    }
                }

                console.log(`Updated price for ${product.title}`);
            }
        } catch (err) {
            console.error(`Error updating price for ${product.title}:`, err);
        }
    }
});

