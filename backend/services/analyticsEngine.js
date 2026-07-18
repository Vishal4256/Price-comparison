const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const SearchAnalytics = require('../models/SearchAnalytics');
const PriceHistory = require('../models/PriceHistory');
const User = require('../models/User');
const registry = require('./retailers/registry');

class AnalyticsEngine {
    
    async getUserDashboardMetrics(userId) {
        // 1. Wishlist Metrics
        const wishlist = await Wishlist.findOne({ user: userId });
        const items = wishlist ? wishlist.items : [];
        const totalWishlistItems = items.length;
        
        let belowTargetCount = 0;
        let totalSavingsPotential = 0;
        let categories = {};
        
        items.forEach(item => {
            // Count products below target price
            if (item.targetPrice && item.currentPrice <= item.targetPrice) {
                belowTargetCount++;
                totalSavingsPotential += (item.targetPrice - item.currentPrice);
            }
            // Mock category extraction from title (for real app, we'd save category in wishlist item)
            const cat = "General"; 
            categories[cat] = (categories[cat] || 0) + 1;
        });

        // 2. Search Analytics Metrics
        const recentSearches = await SearchAnalytics.find({ userId })
            .sort({ timestamp: -1 })
            .limit(5)
            .select('query timestamp');

        // Total tracked
        const trackedProducts = totalWishlistItems; // For a user, tracked usually implies wishlist

        return {
            totalWishlistItems,
            belowTargetCount,
            totalSavingsPotential,
            averageDealScore: 78, // Placeholder: Would require cross-referencing AI scores for all items
            trackedProducts,
            recentSearches,
            favoriteCategories: Object.keys(categories).map(k => ({ name: k, count: categories[k] })),
            favoriteRetailers: [{ name: 'Amazon', count: 12 }, { name: 'Flipkart', count: 8 }] // Placeholder
        };
    }

    async getAdminDashboardMetrics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Aggregate counts concurrently
        const [
            totalUsers,
            totalSearchesToday,
            totalWishlists,
            priceUpdatesToday,
            uniqueProducts
        ] = await Promise.all([
            User.countDocuments(),
            SearchAnalytics.countDocuments({ timestamp: { $gte: today } }),
            Wishlist.countDocuments(),
            PriceHistory.countDocuments({ recordedAt: { $gte: today } }),
            PriceHistory.distinct('productId').then(res => res.length)
        ]);

        const retailersActive = Object.keys(registry.getRetailers()).length;

        // Count total wishlist items across all users
        const allWishlists = await Wishlist.find({}, 'items');
        const totalWishlistItems = allWishlists.reduce((sum, w) => sum + w.items.length, 0);

        return {
            productsIndexed: uniqueProducts, // Using tracked products as proxy for indexed
            retailersActive,
            productsTracked: totalWishlistItems, // Global tracked items
            priceUpdatesToday,
            totalUsers,
            totalWishlistItems,
            searchesToday: totalSearchesToday,
            averageApiResponseTime: 245, // ms (Mock, ideally tracked via middleware)
            aiRequests: 1420, // Mock
            geminiSuccessRate: 99.2 // % Mock
        };
    }

    async getScraperHealthMetrics() {
        const retailers = registry.getRetailers();
        const healthMetrics = [];

        for (const [name, adapter] of Object.entries(retailers)) {
            let status = 'offline';
            let responseTime = 0;
            
            const start = Date.now();
            try {
                if (typeof adapter.healthCheck === 'function') {
                    const isHealthy = await adapter.healthCheck();
                    status = isHealthy ? 'online' : 'degraded';
                } else {
                    // Fallback ping if no healthcheck
                    status = 'online';
                }
            } catch (err) {
                status = 'offline';
            }
            responseTime = Date.now() - start;

            healthMetrics.push({
                name,
                status,
                lastSuccess: new Date().toISOString(), // Simplified for now
                averageResponseTime: responseTime,
                successRate: status === 'online' ? 98.5 : 0, // Mock
                timeoutCount: status === 'offline' ? 5 : 0
            });
        }

        return healthMetrics;
    }

    async getSearchAnalytics(days = 7) {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        // Group by day to get searches over time
        const searchesOverTime = await SearchAnalytics.aggregate([
            { $match: { timestamp: { $gte: dateLimit } } },
            { $group: { 
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        return searchesOverTime.map(item => ({
            date: item._id,
            searches: item.count
        }));
    }
}

module.exports = new AnalyticsEngine();
