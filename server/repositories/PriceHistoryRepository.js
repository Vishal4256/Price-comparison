const BaseRepository = require('./BaseRepository');
const PriceHistory = require('../models/PriceHistory');

class PriceHistoryRepository extends BaseRepository {
  constructor() {
    super(PriceHistory);
  }

  async findHistoryForProduct(productId, limit = 30) {
    return this.model.find({ productId }).sort({ date: -1 }).limit(limit);
  }
}

module.exports = new PriceHistoryRepository();
