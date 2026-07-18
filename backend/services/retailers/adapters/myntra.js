const { normalizeProduct, simulateLatency } = require('../baseAdapter');

exports.search = async (params) => {
    // Myntra focuses heavily on fashion/apparel.
    if (params.category && !['fashion', 'shoes', 'clothing', 'apparel', 'accessories'].includes(params.category.toLowerCase())) {
        return []; // Skip searching if it's explicitly an electronics search for example
    }

    await simulateLatency(700, 1400);
    
    const basePrice = params.budget ? (params.budget * 0.7) : (Math.random() * 5000 + 500);
    
    const results = [
        {
            title: `${params.brand ? params.brand + ' ' : ''}Men Slim Fit ${params.keywords}`,
            brand: params.brand || 'Roadster',
            price: Math.floor(basePrice),
            originalPrice: Math.floor(basePrice * 1.5),
            discount: 33,
            image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&q=80',
            rating: 4.3,
            reviews: Math.floor(Math.random() * 1200),
            retailer: 'Myntra',
            url: `https://www.myntra.com/${encodeURIComponent(params.keywords)}`
        }
    ];

    return results.map(normalizeProduct);
};
