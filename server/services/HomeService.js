const CategoryRepository = require('../repositories/CategoryRepository');
const ProductRepository = require('../repositories/ProductRepository');

class HomeService {
  async getHomeData() {
    const categories = await CategoryRepository.find({}, { limit: 10 });
    
      const products = await ProductRepository.find({}, { limit: 8, sort: { updatedAt: -1 } });

      const trendingProducts = products.map(p => ({
        id: p._id,
        title: p.name,
        brand: p.brand,
        price: p.basePrice || 0,
        currency: 'INR',
        imageUrl: p.imageUrl || p.image,
        retailers: ['amazon', 'flipkart'] // Mocked for UI purposes if missing
      }));

      return {
        heroSuggestions: [
          'Sony WH-1000XM5',
          'MacBook Air M3',
          'iPhone 15 Pro',
          'Samsung Galaxy S24',
          'Dyson V15 Detect'
        ],
        popularCategories: categories.map(c => ({
          id: c._id,
          name: c.name,
          icon: c.icon,
          slug: c.slug
        })),
        trendingProducts: trendingProducts,
        biggestPriceDrops: [], // Empty initially
        recommended: []        // Empty initially
      };
  }
}

module.exports = new HomeService();
