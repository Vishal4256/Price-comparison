const registry = require('./retailers/registry');
const logger = require('../utils/logger');
const capabilities = require('./retailers/capabilities');
const { withTimeout } = require('./retailers/baseAdapter');

const TIMEOUT_MS = 8000; // Global 8-second timeout for any individual scraper

exports.searchAllRetailers = async (geminiParams) => {
    logger.info('[Retailer Engine] Orchestrating universal search for:', geminiParams.keywords);

    const registeredRetailers = registry.getRegisteredRetailers();
    const activePromises = [];

    // 1. Capability Filtering & Engine Spin-up
    registeredRetailers.forEach(retailerName => {
        const capability = capabilities[retailerName];
        
        // Check if the retailer supports searching
        if (capability && capability.canSearch) {
            const adapter = registry.getAdapter(retailerName);
            if (adapter && adapter.search) {
                logger.info(`[Retailer Engine] Spinning up adapter: ${retailerName}`);
                // Wrap in timeout and push to active pool
                activePromises.push(withTimeout(adapter.search(geminiParams), TIMEOUT_MS));
            }
        }
    });

    // 2. Parallel Execution
    const results = await Promise.allSettled(activePromises);

    let allProducts = [];

    // 3. Result Aggregation
    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            allProducts = [...allProducts, ...result.value];
        } else {
            // We do not crash the request; we simply log the failure and move on.
            console.warn(`[Retailer Engine] Scraper index ${index} failed or timed out.`, result.reason?.message);
        }
    });

    // 4. Post-processing: Apply AI intent filters
    if (geminiParams.budget) {
        allProducts = allProducts.filter(p => p.price <= geminiParams.budget);
    }

    // 5. Unified Sort (Lowest price first)
    allProducts.sort((a, b) => a.price - b.price);

    logger.info(`[Retailer Engine] Search complete. Returning ${allProducts.length} unified products.`);
    return allProducts;
};
