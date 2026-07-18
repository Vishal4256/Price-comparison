const Product = require('../models/Product');
const Wishlist = require('../models/Wishlist');
const PriceHistory = require('../models/PriceHistory');
const User = require('../models/User');
const aiDecisionEngine = require('./aiDecisionEngine');
const logger = require('../utils/logger');

class FeedEngine {
    
    async generateFeed(userId) {
        try {
            // Execute independent queries in parallel
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

            // Build Sections Array based on priority
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

            // Sort by priority just in case
            sections.sort((a, b) => a.priority - b.priority);

            return {
                shoppingTip,
                sections
            };

        } catch (error) {
            logger.error(`FeedEngine Error generating feed for user ${userId}: ${error.message}`);
            throw error;
        }
    }

    async getTrendingDeals() {
        // Deterministic: Products with dealScore >= 80, sorted by score.
        return await Product.find({ 'dealScore.score': { $gte: 80 } })
            .sort({ 'dealScore.score': -1 })
            .limit(10)
            .lean();
    }

    async getWishlistUpdates(userId) {
        // Items in user's wishlist that have dropped in price recently
        const wishlist = await Wishlist.findOne({ userId }).populate('products');
        if (!wishlist || !wishlist.products || wishlist.products.length === 0) return [];

        const items = [];
        for (const product of wishlist.products) {
            if (product.dealScore && product.dealScore.rating === 'Excellent') {
                items.push(product);
            }
        }
        return items;
    }

    async getRecommendations(userId) {
        // Find user's search history
        const user = await User.findById(userId);
        if (!user || !user.searchHistory || user.searchHistory.length === 0) return [];

        // Extract last 5 unique queries
        const recentQueries = user.searchHistory
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5)
            .map(sh => sh.query);

        if (recentQueries.length === 0) return [];

        // Find products matching these queries
        const recommended = await Product.find({
            $text: { $search: recentQueries.join(' ') }
        }).limit(20).lean();

        // Calculate Feed Score
        const scored = recommended.map(product => {
            const dealScore = product.dealScore ? product.dealScore.score : 50;
            // Normalize DealScore (0-100)
            const normalizedDealScore = dealScore;
            
            // Normalize Price Drop (Assuming a 20% drop is a 100 score)
            let dropPercentage = 0;
            if (product.priceHistory && product.priceHistory.length > 1) {
                const oldest = product.priceHistory[0].price;
                const current = product.currentPrice;
                if (oldest > current) {
                    dropPercentage = ((oldest - current) / oldest) * 100;
                }
            }
            const normalizedDrop = Math.min(dropPercentage * 5, 100);

            // FeedScore = (0.60 * DealScore) + (0.40 * PriceDropPercentage)
            const feedScore = (0.60 * normalizedDealScore) + (0.40 * normalizedDrop);

            return { ...product, feedScore };
        });

        // Sort by deterministic feedScore
        return scored.sort((a, b) => b.feedScore - a.feedScore).slice(0, 10);
    }

    async getMarketplacePriceDrops() {
        // General marketplace price drops. We approximate this by looking for recent updates and excellent deal scores.
        return await Product.find({ 'dealScore.rating': 'Excellent' })
            .sort({ updatedAt: -1 })
            .limit(10)
            .lean();
    }

    async getShoppingTip(userId) {
        const user = await User.findById(userId);
        if (!user || !user.searchHistory || user.searchHistory.length === 0) {
            return "Welcome to PriceWise! Start searching for products to get personalized shopping tips.";
        }

        const recentQueries = user.searchHistory
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 3)
            .map(sh => sh.query)
            .join(', ');

        try {
            // Using aiDecisionEngine to just evaluate the queries.
            // We'll simulate a quick call to Gemini via the engine or a direct Axios call if engine doesn't expose generic prompt.
            // Since aiDecisionEngine might not have a generic method, we can do a quick direct call here, 
            // or just return a deterministic tip if we don't want to pollute aiDecisionEngine.
            
            return `We noticed you're looking for ${recentQueries.split(',')[0]}. Set up a wishlist to get notified when prices drop!`;

        } catch (error) {
            return "Set up a wishlist for your favorite products to get notified when prices drop!";
        }
    }
}

module.exports = new FeedEngine();
