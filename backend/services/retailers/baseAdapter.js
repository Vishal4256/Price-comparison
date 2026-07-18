const crypto = require('crypto');

/**
 * Ensures a uniform product object is returned across all scrapers.
 */
exports.normalizeProduct = (product) => {
    return {
        id: product.id || crypto.randomBytes(4).toString('hex'),
        title: product.title || 'Unknown Product',
        brand: product.brand || 'Generic',
        price: Number(product.price) || 0,
        originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
        discount: Number(product.discount) || 0,
        image: product.image || 'https://via.placeholder.com/400',
        rating: Number(product.rating) || 0,
        reviews: Number(product.reviews) || 0,
        retailer: product.retailer || 'Unknown',
        url: product.url || '#'
    };
};

/**
 * Wraps a promise in a timeout to ensure rogue scrapers don't hang the API.
 */
exports.withTimeout = (promise, ms) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Scraper timed out after ${ms}ms`)), ms))
    ]);
};

/**
 * Helper to simulate network latency for mocked scraper results
 */
exports.simulateLatency = async (min = 800, max = 2000) => {
    const delay = Math.floor(Math.random() * (max - min) + min);
    return new Promise(resolve => setTimeout(resolve, delay));
};
