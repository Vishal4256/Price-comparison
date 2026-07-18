const BaseRetailer = require('./BaseRetailer');

class RetailerRegistry {
    constructor() {
        this.retailers = new Map();
    }

    /**
     * Register a new retailer scraper.
     * @param {BaseRetailer} retailerInstance 
     */
    register(retailerInstance) {
        if (!(retailerInstance instanceof BaseRetailer)) {
            throw new Error('Retailer must extend BaseRetailer');
        }
        if (!retailerInstance.name || retailerInstance.name === "Unknown") {
            throw new Error('Retailer must have a valid name');
        }
        this.retailers.set(retailerInstance.name, retailerInstance);
        console.log(`[Registry] Registered Retailer: ${retailerInstance.name}`);
    }

    /**
     * Get an array of all registered retailer instances.
     * @returns {Array<BaseRetailer>}
     */
    getRetailers() {
        return Array.from(this.retailers.values());
    }

    /**
     * Get a specific retailer by name.
     * @param {String} name 
     * @returns {BaseRetailer}
     */
    getRetailer(name) {
        return this.retailers.get(name);
    }

    /**
     * Execute a search across all registered retailers concurrently.
     * Uses Promise.allSettled to ensure partial successes are captured.
     * @param {Object} queryParams 
     * @returns {Promise<Array>} Array of raw results or error objects with { status: 'timeout'|'error' }
     */
    async searchAll(queryParams) {
        const activeRetailers = this.getRetailers();
        
        // Map each retailer to a search promise with a hard timeout wrapper
        const promises = activeRetailers.map(async (retailer) => {
            try {
                // Implement per-retailer hard timeout (e.g. 7000ms)
                // This prevents one slow retailer from hanging the registry
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('timeout')), 7000);
                });
                
                // Race between the actual search and the timeout
                const result = await Promise.race([
                    retailer.search(queryParams),
                    timeoutPromise
                ]);
                
                return { retailer: retailer.name, status: 'success', data: result };
            } catch (error) {
                // Return structured status information on failure
                const status = error.message === 'timeout' ? 'timeout' : 'error';
                return { retailer: retailer.name, status, message: error.message };
            }
        });

        // Wait for all to finish (either fulfill or reject/timeout internally)
        return Promise.all(promises);
    }

    /**
     * Run health checks on all retailers.
     */
    async healthCheckAll() {
        const activeRetailers = this.getRetailers();
        const results = await Promise.allSettled(activeRetailers.map(r => r.healthCheck()));
        
        return activeRetailers.map((retailer, index) => {
            const res = results[index];
            return {
                retailer: retailer.name,
                isHealthy: res.status === 'fulfilled' && res.value === true,
                error: res.status === 'rejected' ? res.reason.message : null
            };
        });
    }
}

// Export a singleton instance of the registry
const registry = new RetailerRegistry();
module.exports = registry;
