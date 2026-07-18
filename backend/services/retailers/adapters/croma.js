const { normalizeProduct, simulateLatency } = require('../baseAdapter');

exports.search = async (params) => {
    if (params.category && !['electronics', 'laptop', 'smartphone', 'tv', 'appliances'].includes(params.category.toLowerCase())) {
        return []; 
    }

    await simulateLatency(1200, 2000);
    
    const basePrice = params.budget ? (params.budget * 0.95) : (Math.random() * 60000 + 5000);
    
    const results = [
        {
            title: `${params.brand ? params.brand + ' ' : ''}${params.keywords} - Store Pickup Available`,
            brand: params.brand || 'Generic',
            price: Math.floor(basePrice),
            originalPrice: Math.floor(basePrice * 1.05),
            discount: 5,
            image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&q=80',
            rating: 4.4,
            reviews: Math.floor(Math.random() * 450),
            retailer: 'Croma',
            url: `https://www.croma.com/search/?q=${encodeURIComponent(params.keywords)}`
        }
    ];

    return results.map(normalizeProduct);
};
