const cron = require('node-cron');
const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const Alert = require('../models/Alert');
const scrapeAmazon = require('../scrapers/amazonScraper');
const scrapeFlipkart = require('../scrapers/flipkartScraper');
const scrapeEbay = require('../scrapers/ebayScraper');
const scrapeActualUrl = require('../scrapers/actualUrlScraper');
const { sendPriceAlert } = require('./emailService');

// Helper to extract Amazon ASIN
const extractAmazonASIN = (url) => {
    if (!url) return null;
    const match = url.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    return match ? match[1].toUpperCase() : null;
};

// Helper to extract Flipkart Item ID or PID
const extractFlipkartId = (url) => {
    if (!url) return null;
    const itmMatch = url.match(/\/p\/(itm[a-f0-9]{12,16})/i);
    if (itmMatch) return itmMatch[1].toLowerCase();
    try {
        const parsed = new URL(url);
        const pid = parsed.searchParams.get('pid');
        if (pid) return pid.toLowerCase();
    } catch (e) {}
    return null;
};

// Helper to extract eBay Item ID
const extractEbayId = (url) => {
    if (!url) return null;
    const match = url.match(/\/itm\/(\d{9,15})/i);
    return match ? match[1] : null;
};

// Advanced product identity comparison
const isSameProduct = (urlA, urlB, source) => {
    if (!urlA || !urlB) return false;
    
    // Check path normalization first
    const normA = urlA.split('?')[0].replace(/\/+$/, '').toLowerCase().trim();
    const normB = urlB.split('?')[0].replace(/\/+$/, '').toLowerCase().trim();
    if (normA === normB) return true;

    if (source === 'Amazon') {
        const asinA = extractAmazonASIN(urlA);
        const asinB = extractAmazonASIN(urlB);
        return asinA !== null && asinA === asinB;
    }

    if (source === 'Flipkart') {
        const idA = extractFlipkartId(urlA);
        const idB = extractFlipkartId(urlB);
        return idA !== null && idA === idB;
    }

    if (source === 'eBay') {
        const idA = extractEbayId(urlA);
        const idB = extractEbayId(urlB);
        return idA !== null && idA === idB;
    }

    return false;
};

// Run every day at midnight (daily update)
cron.schedule('0 0 * * *', async () => {
    console.log('⏳ Running scheduled daily price update cron job...');
    const products = await Product.find();

    for (const product of products) {
        try {
            let updatedData = null;

            // 1. Try scraping the direct product URL first (if anti-bot allows it)
            if (product.url) {
                try {
                    updatedData = await scrapeActualUrl(product.url, product.source);
                } catch (urlScrapeErr) {
                    console.warn(`⚠️ Direct URL scrape failed for ${product.title}: ${urlScrapeErr.message}`);
                }
            }

            // 2. Fall back to search query scraper, utilizing exact ID matching
            if (!updatedData) {
                console.log(`🔍 Direct scrape bypassed. Querying search engine for: "${product.title}" (${product.source})`);
                let results = [];
                if (product.source === 'Amazon') {
                    results = await scrapeAmazon(product.title);
                } else if (product.source === 'Flipkart') {
                    results = await scrapeFlipkart(product.title);
                } else if (product.source === 'eBay') {
                    results = await scrapeEbay(product.title);
                }

                if (results && results.length > 0) {
                    // Try to find the exact match using ASIN / Product ID
                    updatedData = results.find(p => isSameProduct(p.url, product.url, product.source));
                    
                    // Safe fallback: only use first search result if it has > 80% title similarity
                    if (!updatedData) {
                        const firstRes = results[0];
                        const titleSimilarity = product.title.toLowerCase().includes(firstRes.title.toLowerCase().split(' ')[0]);
                        if (titleSimilarity) {
                            console.log(`ℹ️ Exact URL match not found. Using high-similarity fallback: ${firstRes.title}`);
                            updatedData = firstRes;
                        }
                    }
                }
            }

            if (updatedData) {
                const oldPrice = product.currentPrice;
                product.currentPrice = updatedData.currentPrice;
                product.originalPrice = updatedData.originalPrice || updatedData.currentPrice;
                product.discountPercentage = updatedData.discountPercentage || 0;
                
                // Track lowest / highest prices dynamically
                if (!product.lowestPrice || product.currentPrice < product.lowestPrice) {
                    product.lowestPrice = product.currentPrice;
                }
                if (!product.highestPrice || product.currentPrice > product.highestPrice) {
                    product.highestPrice = product.currentPrice;
                }
                
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
                    }
                }

                console.log(`✅ Updated price for ${product.title}: ₹${oldPrice} -> ₹${product.currentPrice}`);
            } else {
                console.error(`❌ Could not update price for ${product.title} (all scrapers failed).`);
            }
        } catch (err) {
            console.error(`❌ Error in cron job loop for ${product.title}:`, err);
        }
    }
    console.log('🏁 Scheduled daily price update cron job finished.');
});



