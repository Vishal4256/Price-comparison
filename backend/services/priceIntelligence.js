const PriceHistory = require('../models/PriceHistory');

class PriceIntelligence {
    
    // 1. Core write method: implements the heartbeat logic
    async recordPrice(productId, retailer, price, shipping = 0, currency = 'INR', inStock = true, source = 'scrape') {
        const latestRecord = await PriceHistory.findOne({ productId, retailer }).sort({ recordedAt: -1 });

        const now = new Date();
        
        if (latestRecord) {
            // Check if price changed
            if (latestRecord.price === price && latestRecord.shipping === shipping && latestRecord.inStock === inStock) {
                // Price hasn't changed. Check if 24 hours have passed for a heartbeat.
                const hoursSinceLastRecord = (now - latestRecord.recordedAt) / (1000 * 60 * 60);
                if (hoursSinceLastRecord < 24) {
                    return { action: 'skipped', reason: 'duplicate within 24h' };
                } else {
                    // Create heartbeat record
                    await PriceHistory.create({ productId, retailer, price, shipping, currency, inStock, availability: inStock ? 'in_stock' : 'out_of_stock', source });
                    return { action: 'inserted', reason: 'heartbeat after 24h' };
                }
            }
        }

        // Insert new record (price changed or first time)
        await PriceHistory.create({ productId, retailer, price, shipping, currency, inStock, availability: inStock ? 'in_stock' : 'out_of_stock', source });
        return { action: 'inserted', reason: 'new price or first record' };
    }

    // 2. Statistics methods
    async getLatestPrice(productId, retailer) {
        return await PriceHistory.findOne({ productId, retailer }).sort({ recordedAt: -1 });
    }

    async getLowestPrice(productId) {
        const result = await PriceHistory.find({ productId }).sort({ price: 1 }).limit(1);
        return result.length > 0 ? result[0].price : null;
    }

    async getHighestPrice(productId) {
        const result = await PriceHistory.find({ productId }).sort({ price: -1 }).limit(1);
        return result.length > 0 ? result[0].price : null;
    }

    async getAveragePrice(productId) {
        const result = await PriceHistory.aggregate([
            { $match: { productId } },
            { $group: { _id: null, avgPrice: { $avg: "$price" } } }
        ]);
        return result.length > 0 ? Math.round(result[0].avgPrice) : null;
    }

    async getMedianPrice(productId) {
        const records = await PriceHistory.find({ productId }).sort({ price: 1 });
        if (records.length === 0) return null;
        
        const mid = Math.floor(records.length / 2);
        if (records.length % 2 !== 0) {
            return records[mid].price;
        }
        return Math.round((records[mid - 1].price + records[mid].price) / 2);
    }

    async getVolatility(productId) {
        const records = await PriceHistory.find({ productId });
        if (records.length < 2) return 0;
        
        const mean = records.reduce((sum, r) => sum + r.price, 0) / records.length;
        const variance = records.reduce((sum, r) => sum + Math.pow(r.price - mean, 2), 0) / records.length;
        const stdDev = Math.sqrt(variance);
        
        // Return volatility as a percentage of the mean
        return Number(((stdDev / mean) * 100).toFixed(2));
    }

    async getTrend(productId) {
        // Compare last 7 days vs previous 7 days
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));

        const recentAvgResult = await PriceHistory.aggregate([
            { $match: { productId, recordedAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: null, avgPrice: { $avg: "$price" } } }
        ]);

        const pastAvgResult = await PriceHistory.aggregate([
            { $match: { productId, recordedAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } } },
            { $group: { _id: null, avgPrice: { $avg: "$price" } } }
        ]);

        const recentAvg = recentAvgResult.length > 0 ? recentAvgResult[0].avgPrice : null;
        const pastAvg = pastAvgResult.length > 0 ? pastAvgResult[0].avgPrice : null;

        if (!recentAvg || !pastAvg) {
            return { trend: "stable", percentage: 0, confidence: 0 };
        }

        const percentageChange = ((recentAvg - pastAvg) / pastAvg) * 100;
        
        let trend = "stable";
        if (percentageChange > 2) trend = "rising";
        else if (percentageChange < -2) trend = "falling";

        return {
            trend,
            percentage: Number(percentageChange.toFixed(1)),
            confidence: 0.9 // Placeholder confidence score
        };
    }

    async getPriceSummary(productId) {
        const [lowest, highest, average, median, volatility, trend] = await Promise.all([
            this.getLowestPrice(productId),
            this.getHighestPrice(productId),
            this.getAveragePrice(productId),
            this.getMedianPrice(productId),
            this.getVolatility(productId),
            this.getTrend(productId)
        ]);

        return { lowest, highest, average, median, volatility, trend };
    }

    async getHistory(productId, days = 30) {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        // Fetch all history for the product within the timeframe
        const history = await PriceHistory.find({ 
            productId, 
            recordedAt: { $gte: dateLimit } 
        }).sort({ recordedAt: 1 });

        return history;
    }

    async aggregateHistory() {
        // Stub for the cron job: will collapse old records into weekly averages
        console.log("History aggregation job executed.");
        return true;
    }
}

module.exports = new PriceIntelligence();
