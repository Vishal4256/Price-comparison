const { normalizeProduct, simulateLatency } = require('../baseAdapter');

exports.search = async (params) => {
    if (params.category && !['fashion', 'shoes', 'clothing', 'apparel'].includes(params.category.toLowerCase())) {
        return []; 
    }

    await simulateLatency(900, 1600);
    
    const basePrice = params.budget ? (params.budget * 0.65) : (Math.random() * 4000 + 800);
    
    const results = [
        {
            title: `${params.brand ? params.brand + ' ' : ''}Trending ${params.keywords}`,
            brand: params.brand || 'DNMX',
            price: Math.floor(basePrice),
            originalPrice: Math.floor(basePrice * 1.8),
            discount: 45,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
            rating: 4.0,
            reviews: Math.floor(Math.random() * 500),
            retailer: 'Ajio',
            url: `https://www.ajio.com/search/?text=${encodeURIComponent(params.keywords)}`
        }
    ];

    return results.map(normalizeProduct);
};
