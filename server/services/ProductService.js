const ProductRepository = require('../repositories/ProductRepository');
const RetailerPriceRepository = require('../repositories/RetailerPriceRepository');
const PriceHistoryRepository = require('../repositories/PriceHistoryRepository');
const ProductDTO = require('../dtos/ProductDTO');
const { NotFoundError } = require('../errors/AppError');

class ProductService {
  async getProductDetails(productId) {
    const product = await ProductRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const [prices, history] = await Promise.all([
      RetailerPriceRepository.findPricesForProduct(productId),
      PriceHistoryRepository.findHistoryForProduct(productId)
    ]);

    return ProductDTO.toDetailResponse(product, prices, history);
  }
}

module.exports = new ProductService();
