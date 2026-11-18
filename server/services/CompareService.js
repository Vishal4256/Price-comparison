const ProductRepository = require('../repositories/ProductRepository');
const RetailerPriceRepository = require('../repositories/RetailerPriceRepository');

class CompareService {
  async compareProducts(productIds) {
    if (!productIds || productIds.length === 0) {
      throw new Error('No product IDs provided');
    }

    const [products, lowestPricesList] = await Promise.all([
      ProductRepository.find({ _id: { $in: productIds } }),
      RetailerPriceRepository.findLowestPricesForProducts(productIds)
    ]);

    return {
      products: products.map(p => ({
        id: p._id,
        title: p.name,
        brand: p.brand,
        category: p.category,
        image: p.image,
        rating: p.rating
      })),
      lowestPrices: lowestPricesList.map(lp => ({
        productId: lp._id,
        price: lp.price,
        oldPrice: lp.oldPrice,
        discount: lp.discount,
        retailerId: lp.retailerId
      })),
      retailers: [], // Will populate properly when Retailer models are fully joined
      specifications: products.map(p => ({
        productId: p._id,
        specs: p.specifications ? Object.fromEntries(p.specifications) : {}
      })),
      priceHistory: [], // Will pull from PriceHistoryRepository
      aiSummary: {
        recommendation: 'Not enough data to generate an AI summary yet.'
      },
      alternatives: []
    };
  }
}

module.exports = new CompareService();
