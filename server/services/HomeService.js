const CategoryRepository = require('../repositories/CategoryRepository');

class HomeService {
  async getHomeData() {
    const categories = await CategoryRepository.find({}, { limit: 10 });
    
    return {
      hero: {
        headline: 'Find the Best Price Across Every Store, Instantly',
        subheadline: 'PriceSmart analyzes millions of products to find you the lowest price, track price drops, and help you save money on every purchase.'
      },
      categories: categories.map(c => ({
        id: c._id,
        name: c.name,
        icon: c.icon,
        slug: c.slug
      })),
      trending: [], // Empty initially, populated later by scrapers/AI
      deals: []     // Empty initially
    };
  }
}

module.exports = new HomeService();
