const cron = require('node-cron');
const Wishlist = require('../models/Wishlist');
const registry = require('../services/retailers/registry');
const priceIntelligence = require('../services/priceIntelligence');
const pricingEngine = require('../services/pricingEngine');

// 1. Wishlist Refresh Job
// Runs every 4 hours. Finds all products currently in users' wishlists,
// scrapes fresh data, and updates the PriceHistory.
cron.schedule('0 */4 * * *', async () => {
    console.log('[Cron] Starting Wishlist Refresh Job...');
    try {
        // Get all unique product IDs across all wishlists
        const wishlists = await Wishlist.find({});
        
        // Optimize scraping by aggregating products first
        const uniqueProducts = {};
        wishlists.forEach(w => {
            w.items.forEach(item => {
                if (item.productId && !uniqueProducts[item.productId]) {
                    uniqueProducts[item.productId] = item.title;
                }
            });
        });

        console.log(`[Cron] Found ${Object.keys(uniqueProducts).length} unique products to refresh.`);
        const latestPrices = {}; // Store the new best price across all retailers for each product

        for (const [productId, title] of Object.entries(uniqueProducts)) {
            const rawResults = await registry.searchAll({ keywords: title });
            
            let bestCurrentPrice = Infinity;
            let bestRetailer = null;

            for (const result of rawResults) {
                if (result.status === 'success' && result.data && result.data.length > 0) {
                    const bestMatch = result.data[0]; 
                    await priceIntelligence.recordPrice(
                        productId,
                        result.retailer,
                        bestMatch.price,
                        bestMatch.shipping || 0,
                        'INR',
                        true,
                        'scrape'
                    );

                    if (bestMatch.price < bestCurrentPrice) {
                        bestCurrentPrice = bestMatch.price;
                        bestRetailer = result.retailer;
                    }
                }
            }
            if (bestCurrentPrice !== Infinity) {
                latestPrices[productId] = { price: bestCurrentPrice, retailer: bestRetailer };
            }
        }

        // Now evaluate notifications per user based on the fresh data
        const notificationEngine = require('../services/notificationEngine');
        
        for (const w of wishlists) {
            for (const item of w.items) {
                const latest = latestPrices[item.productId];
                if (latest) {
                    // Pass current price and the item's saved 'currentPrice' as previousPrice
                    await notificationEngine.evaluatePriceChange(
                        w.user,
                        item.productId,
                        item.title,
                        latest.retailer,
                        latest.price,
                        item.currentPrice, // The price it was at when last checked/added
                        item.targetPrice
                    );

                    // Update the wishlist item with the newly scraped price
                    item.currentPrice = latest.price;
                }
            }
            await w.save(); // Save updated prices back to wishlist
        }
        
        console.log('[Cron] Wishlist Refresh Complete.');
    } catch (error) {
        console.error('[Cron] Wishlist Refresh Error:', error);
    }
});

// 2. Daily Health Check
// Runs at midnight. Pings the healthCheck of each registered scraper.
cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Starting Daily Health Check...');
    try {
        const retailers = registry.getRetailers();
        for (const [name, adapter] of Object.entries(retailers)) {
            try {
                if (typeof adapter.healthCheck === 'function') {
                    const isHealthy = await adapter.healthCheck();
                    console.log(`[Health] ${name}: ${isHealthy ? 'ALIVE' : 'FAILING'}`);
                }
            } catch (err) {
                console.error(`[Health] ${name} failed health check:`, err.message);
            }
        }
        console.log('[Cron] Daily Health Check Complete.');
    } catch (error) {
        console.error('[Cron] Health Check Error:', error);
    }
});

// 3. Data Aggregation Job
// Runs once a week on Sunday at 2 AM. Rolls up old records.
cron.schedule('0 2 * * 0', async () => {
    console.log('[Cron] Starting Data Aggregation Job...');
    try {
        await priceIntelligence.aggregateHistory();
        console.log('[Cron] Data Aggregation Complete.');
    } catch (error) {
        console.error('[Cron] Aggregation Error:', error);
    }
});
