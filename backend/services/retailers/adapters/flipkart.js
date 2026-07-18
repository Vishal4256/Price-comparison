const { normalizeProduct, simulateLatency } = require('../baseAdapter');

exports.search = async (params) => {
    await simulateLatency(1000, 1800);
    
    const basePrice = params.budget ? (params.budget * 0.8) : (Math.random() * 50000 + 1000);
    
    const results = [
        {
            title: `${params.brand ? params.brand + ' ' : ''}SuperSaver ${params.keywords} [F-Assured]`,
            brand: params.brand || 'Generic',
            price: Math.floor(basePrice),
            originalPrice: Math.floor(basePrice * 1.3),
            discount: 23,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
            rating: 4.1,
            reviews: Math.floor(Math.random() * 800),
            retailer: 'Flipkart',
            url: `https://www.flipkart.com/search?q=${encodeURIComponent(params.keywords)}`
        }
    ];

    return results.map(normalizeProduct);
};
