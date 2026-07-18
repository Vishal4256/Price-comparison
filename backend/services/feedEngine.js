const Product = require('../models/Product');
const Wishlist = require('../models/Wishlist');
const User = require('../models/User');
const logger = require('../utils/logger');

class FeedEngine {

    async generateFeed(userId) {
        // Run all feed sections in parallel. Each method catches its own errors
        // and returns [] on failure — so one bad query never kills the whole feed.
        const [
            trendingDeals,
            wishlistUpdates,
            recommendations,
            priceDrops,
            shoppingTip
        ] = await Promise.all([
            this.getTrendingDeals(),
            this.getWishlistUpdates(userId),
            this.getRecommendations(userId),
            this.getMarketplacePriceDrops(),
            this.getShoppingTip(userId)
        ]);

        const sections = [];

        if (wishlistUpdates.length > 0) {
            sections.push({ type: 'wishlist_updates', title: '❤️ Wishlist Updates', priority: 1, items: wishlistUpdates });
        }
        if (recommendations.length > 0) {
            sections.push({ type: 'recommendations', title: '🎯 Recommended For You', priority: 2, items: recommendations });
        }
        if (priceDrops.length > 0) {
            sections.push({ type: 'price_drops', title: '📉 Recent Price Drops', priority: 3, items: priceDrops });
        }
        if (trendingDeals.length > 0) {
            sections.push({ type: 'trending_deals', title: '🔥 Trending Deals', priority: 4, items: trendingDeals });
        }

        sections.sort((a, b) => a.priority - b.priority);

        return { shoppingTip, sections };
    }

    async getTrendingDeals() {
        try {
            return await Product.find({ 'dealScore.score': { $gte: 80 } })
                .sort({ 'dealScore.score': -1 })
                .limit(10)
                .lean();
        } catch (err) {
            logger.error('FeedEngine.getTrendingDeals error:', err.message);
            return [];
        }
    }

    async getWishlistUpdates(userId) {
        try {
            // FIX: Wishlist schema uses field 'user' (not 'userId') and 'items' array (not 'products')
            // Items are embedded documents — no populate() needed.
            const wishlist = await Wishlist.findOne({ user: userId });
            if (!wishlist || !wishlist.items || wishlist.items.length === 0) return [];

            // Surface items where the current price is at or below the user's target price
            return wishlist.items.filter(item =>
                item.targetPrice && item.currentPrice && item.currentPrice <= item.targetPrice
            );
        } catch (err) {
            logger.error('FeedEngine.getWishlistUpdates error:', err.message);
            return [];
        }
    }

    async getRecommendations(userId) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.searchHistory || user.searchHistory.length === 0) return [];

            const recentQueries = user.searchHistory
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 5)
                .map(sh => sh.query);

            if (recentQueries.length === 0) return [];

            // FIX: $text search requires a text index. Guard against missing index on new collections.
            let recommended = [];
            try {
                recommended = await Product.find({
                    $text: { $search: recentQueries.join(' ') }
                }).limit(20).lean();
            } catch (textErr) {
                logger.warn('FeedEngine.$text search unavailable, falling back to regex:', textErr.message);
                recommended = await Product.find({
                    title: { $regex: recentQueries[0], $options: 'i' }
                }).limit(20).lean();
            }

            const scored = recommended.map(product => {
                const dealScore = product.dealScore ? product.dealScore.score : 50;
                let dropPercentage = 0;
                if (product.priceHistory && product.priceHistory.length > 1) {
                    const oldest = product.priceHistory[0].price;
                    const current = product.currentPrice;
                    if (oldest > current) {
                        dropPercentage = ((oldest - current) / oldest) * 100;
                    }
                }
                const normalizedDrop = Math.min(dropPercentage * 5, 100);
                const feedScore = (0.60 * dealScore) + (0.40 * normalizedDrop);
                return { ...product, feedScore };
            });

            return scored.sort((a, b) => b.feedScore - a.feedScore).slice(0, 10);
        } catch (err) {
            logger.error('FeedEngine.getRecommendations error:', err.message);
            return [];
        }
    }

    async getMarketplacePriceDrops() {
        try {
            return await Product.find({ 'dealScore.rating': 'Excellent' })
                .sort({ updatedAt: -1 })
                .limit(10)
                .lean();
        } catch (err) {
            logger.error('FeedEngine.getMarketplacePriceDrops error:', err.message);
            return [];
        }
    }

    async getShoppingTip(userId) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.searchHistory || user.searchHistory.length === 0) {
                return "Welcome to PriceWise! Start searching for products to get personalized shopping tips.";
            }

            const firstQuery = user.searchHistory
                .sort((a, b) => b.timestamp - a.timestamp)[0]?.query;

            if (firstQuery) {
                return `We noticed you're looking for "${firstQuery}". Set up a wishlist to get notified when prices drop!`;
            }

            return "Set up a wishlist for your favourite products to get notified when prices drop!";
        } catch (err) {
            logger.error('FeedEngine.getShoppingTip error:', err.message);
            return "Set up a wishlist for your favourite products to get notified when prices drop!";
        }
    }
}

module.exports = new FeedEngine();
