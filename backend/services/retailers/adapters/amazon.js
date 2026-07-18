const BaseRetailer = require('../BaseRetailer');
const { simulateLatency } = require('../baseAdapter');

class AmazonRetailer extends BaseRetailer {
    constructor() {
        super();
        this.name = "Amazon";
        this.supportedCategories = ["electronics", "fashion", "home", "books"];
        this.supportsCoupons = true;
        this.supportsCashback = true;
    }

    async search(params) {
        await simulateLatency(800, 1500);
        
        const basePrice = params.budget ? (params.budget * 0.85) : (Math.random() * 50000 + 1000);
        
        return [
            {
                title: `${params.brand ? params.brand + ' ' : ''}Premium ${params.keywords} (Amazon's Choice)`,
                brand: params.brand || 'Generic',
                category: params.category || 'General',
                price: Math.floor(basePrice),
                shipping: 0,
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
                url: `https://www.amazon.in/s?k=${encodeURIComponent(params.keywords)}`,
                inStock: true
            },
            {
                title: `${params.brand ? params.brand + ' ' : ''}Standard ${params.keywords} - Latest Edition`,
                brand: params.brand || 'Generic',
                category: params.category || 'General',
                price: Math.floor(basePrice * 0.9),
                shipping: 40,
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
                url: `https://www.amazon.in/s?k=${encodeURIComponent(params.keywords)}`,
                inStock: true
            }
        ];
    }
}

module.exports = new AmazonRetailer();
