const { normalizeProduct, simulateLatency } = require('../baseAdapter');

exports.search = async (params) => {
    if (params.category && !['beauty', 'makeup', 'skincare', 'cosmetics', 'perfume'].includes(params.category.toLowerCase())) {
        return []; 
    }

    await simulateLatency(600, 1200);
    
    const basePrice = params.budget ? (params.budget * 0.9) : (Math.random() * 3000 + 300);
    
    const results = [
        {
            title: `${params.brand ? params.brand + ' ' : ''}Essential ${params.keywords}`,
            brand: params.brand || 'Nykaa Cosmetics',
            price: Math.floor(basePrice),
            originalPrice: Math.floor(basePrice * 1.1),
            discount: 9,
            image: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&q=80',
            rating: 4.6,
            reviews: Math.floor(Math.random() * 3200),
            retailer: 'Nykaa',
            url: `https://www.nykaa.com/search/result/?q=${encodeURIComponent(params.keywords)}`
        }
    ];

    return results.map(normalizeProduct);
};
