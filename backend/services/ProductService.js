const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const PriceService = require('./PriceService');
const AffiliateService = require('./AffiliateService');
const { analyzeDiscount } = require('../utils/discountAnalyzer');

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
let featuredCache = {
    data: null,
    timestamp: 0
};

class ProductService {
    /**
     * Fetches featured products from the database, validates them,
     * formats the response, and caches it.
     */
    static async getFeaturedProducts() {
        if (featuredCache.data && (Date.now() - featuredCache.timestamp < CACHE_TTL_MS)) {
            console.log("Serving featured products from cache.");
            return featuredCache.data;
        }

        console.log("Fetching featured products from DB...");
        // Fetch up to 50 products to ensure we find at least 8 fully valid ones.
        const products = await Product.find().sort({ createdAt: -1 }).limit(50);
        const validFeatured = [];

        for (const product of products) {
            const validPrice = PriceService.validatePrice(product.currentPrice);
            const validUrl = AffiliateService.validateUrl(product.url);

            // Skip invalid products
            if (!validPrice || !validUrl || !product.title || !product.image) {
                console.log(`Skipping invalid product: ${product.title || 'Unknown'} (Price: ${product.currentPrice}, URL: ${product.url})`);
                continue;
            }

            const savings = PriceService.calculateSavings(validPrice, product.originalPrice);

            validFeatured.push({
                id: product._id,
                title: product.title,
                image: product.image,
                retailer: product.source || 'Unknown', // No hardcoded fallbacks
                currentPrice: validPrice,
                originalPrice: product.originalPrice || validPrice,
                savings: savings,
                productUrl: validUrl,
                rating: product.rating || 0
            });

            if (validFeatured.length >= 8) {
                break; // We only need 8 valid featured products
            }
        }

        // Update cache
        featuredCache.data = validFeatured;
        featuredCache.timestamp = Date.now();

        return validFeatured;
    }
}

module.exports = ProductService;
