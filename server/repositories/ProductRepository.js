const BaseRepository = require('./BaseRepository');
const Product = require('../models/Product');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async searchProducts(query, { categoryId, brand, sort, skip, limit }) {
    const filter = {};
    if (query) {
      filter.$text = { $search: query };
    }
    if (categoryId) filter.category = categoryId;
    if (brand) filter.brand = brand;

    const sortOpt = sort || (query ? { score: { $meta: "textScore" } } : { createdAt: -1 });

    const [products, total] = await Promise.all([
      this.model.find(filter)
        .sort(sortOpt)
        .skip(skip)
        .limit(limit)
        .populate('category', 'name'),
      this.count(filter)
    ]);

    return { products, total };
  }
}

module.exports = new ProductRepository();
