/**
 * Pricing Engine
 * 
 * The single source of truth for all pricing calculations.
 * Controllers and scrapers should NEVER calculate math directly.
 */
class PricingEngine {
    
    /**
     * Normalizes raw scraper payload from registry.searchAll into unified format.
     * Groups identical products from different retailers together into a single product with multiple offers.
     * @param {Array} registryResults - Array of { retailer, status, data } objects
     * @returns {Array} Array of Normalized Payload objects
     */
    normalizeOffers(registryResults) {
        // Group offers by common identifier (e.g. title similarity or exact match for now)
        // Since this is a complex NLP task, we'll use a simplistic title-match grouping for v1.
        const productsMap = new Map();

        registryResults.forEach(result => {
            if (result.status === 'success' && Array.isArray(result.data)) {
                result.data.forEach(item => {
                    // Create normalized title (lowercase, no punctuation) as a basic ID mechanism
                    const normalizedTitle = (item.title || "").toLowerCase().replace(/[^a-z0-9]/g, '');
                    
                    if (!productsMap.has(normalizedTitle)) {
                        productsMap.set(normalizedTitle, {
                            productId: `pw-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                            title: item.title,
                            brand: item.brand || "Unknown",
                            category: item.category || "General",
                            image: item.image || item.imageUrl || "",
                            offers: [],
                            currency: "INR",
                            lastUpdated: new Date().toISOString()
                        });
                    }

                    const product = productsMap.get(normalizedTitle);
                    
                    // Prevent duplicate retailers per product (basic safety)
                    const existingRetailer = product.offers.find(o => o.retailer === result.retailer);
                    if (!existingRetailer) {
                        product.offers.push({
                            retailer: result.retailer,
                            price: this.calculateShippingAdjustedPrice(item.price || 0, item.shipping || 0),
                            shipping: item.shipping || 0,
                            url: item.url || item.link || "",
                            inStock: item.inStock !== false,
                            status: "success"
                        });
                    }
                });
            }
        });

        // Calculate aggregated metrics for each product
        const finalProducts = Array.from(productsMap.values()).map(product => {
            product.lowestPrice = this.calculateLowestPrice(product.offers);
            product.highestPrice = this.calculateHighestPrice(product.offers);
            product.averagePrice = this.calculateAveragePrice(product.offers);
            product.availableRetailers = product.offers.length;
            
            // Sort offers (lowest first)
            product.offers = this.sortOffers(product.offers);

            return product;
        });

        // Sort overall products (lowest overall price first)
        return finalProducts.sort((a, b) => a.lowestPrice - b.lowestPrice);
    }

    calculateLowestPrice(offers) {
        if (!offers || offers.length === 0) return 0;
        return Math.min(...offers.map(o => o.price));
    }

    calculateHighestPrice(offers) {
        if (!offers || offers.length === 0) return 0;
        return Math.max(...offers.map(o => o.price));
    }

    calculateAveragePrice(offers) {
        if (!offers || offers.length === 0) return 0;
        const sum = offers.reduce((acc, curr) => acc + curr.price, 0);
        return Math.round(sum / offers.length);
    }

    calculateDiscountPercentage(originalPrice, currentPrice) {
        if (!originalPrice || originalPrice <= currentPrice) return 0;
        return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }

    calculateShippingAdjustedPrice(price, shipping) {
        return Number(price) + Number(shipping || 0);
    }

    sortOffers(offers) {
        return [...offers].sort((a, b) => a.price - b.price);
    }
}

module.exports = new PricingEngine();
