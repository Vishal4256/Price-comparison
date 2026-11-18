const BaseRepository = require('./BaseRepository');
const RetailerPrice = require('../models/RetailerPrice');

class RetailerPriceRepository extends BaseRepository {
  constructor() {
    super(RetailerPrice);
  }

  async findLowestPriceForProduct(productId) {
    return this.model.findOne({ productId }).sort({ price: 1 }).limit(1);
  }

  async findPricesForProduct(productId) {
    return this.model.find({ productId }).sort({ price: 1 }).populate('retailerId', 'name logo');
  }

  async findLowestPricesForProducts(productIds) {
    // Uses aggregation to find the minimum price per product
    return this.model.aggregate([
      { $match: { productId: { $in: productIds } } },
      { $sort: { price: 1 } },
      { 
        $group: {
          _id: "$productId",
          price: { $first: "$price" },
          oldPrice: { $first: "$oldPrice" },
          discount: { $first: "$discount" },
          retailerId: { $first: "$retailerId" }
        }
      }
    ]);
  }
}

module.exports = new RetailerPriceRepository();
