const geminiService = require('../services/geminiService');
const registry = require('../services/retailers/registry');
const pricingEngine = require('../services/pricingEngine');
const cacheService = require('../services/cache');
const logger = require('../utils/logger');
const cacheUtils = require('../utils/cacheUtils');

exports.universalSearch = async (req, res) => {
    try {
        const { q } = req.query;

        // 1. Input Validation
        if (!q || q.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }

        const normalizedQuery = q.trim().toLowerCase();

        // 2. Cache Check
        const cachedResult = await cacheService.get(`search:${normalizedQuery}`);
        if (cachedResult) {
            logger.info(`[Search Controller] Cache hit for query: "${normalizedQuery}"`);
            return res.status(200).json(cachedResult);
        }

        logger.info(`[Search Controller] Received query: "${q}"`);

        // 3. Gemini Intent Extraction
        logger.info(`[Search Controller] Extracting intent via Gemini...`);
        const extractedParams = await geminiService.extractIntent(q);

        // 4. Parallel Retailer Search
        logger.info(`[Search Controller] Initiating registry universal scrape...`);
        const rawResults = await registry.searchAll(extractedParams);

        // 5. Normalization & Pricing Engine
        logger.info(`[Search Controller] Normalizing payload...`);
        const normalizedProducts = pricingEngine.normalizeOffers(rawResults);

        const responseData = {
            success: true,
            query: q,
            intent: extractedParams,
            count: normalizedProducts.length,
            products: normalizedProducts
        };

        // 6. Set Cache (5 mins)
        await cacheService.set(`search:${normalizedQuery}`, responseData, 300);

        // 7. Store Search Analytics (Future Phase)
        // await analyticsService.logSearch(normalizedQuery, responseData.count);

        res.status(200).json(responseData);

    } catch (error) {
        console.error('[Search Controller] Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred while processing your search.',
            error: error.message 
        });
    }
};
