class ProductDTO {
  static toSummaryResponse(product, lowestPrice = null) {
    if (!product) return null;
    
    const dto = {
      id: product._id || product.id,
      title: product.name,
      brand: product.brand,
      rating: product.rating,
      image: product.image
    };

    if (lowestPrice) {
      dto.lowestPrice = {
        price: lowestPrice.price,
        oldPrice: lowestPrice.oldPrice,
        discount: lowestPrice.discount,
        retailerId: lowestPrice.retailerId
      };
    }

    return dto;
  }

  static toDetailResponse(product, prices = [], history = [], category = null) {
    if (!product) return null;
    
    return {
      id: product._id || product.id,
      title: product.name,
      brand: product.brand,
      category: category ? { id: category._id, name: category.name } : product.category,
      rating: product.rating,
      image: product.image,
      specifications: product.specifications ? Object.fromEntries(product.specifications) : {},
      prices: prices.map(p => ({
        retailerId: p.retailerId,
        price: p.price,
        oldPrice: p.oldPrice,
        discount: p.discount,
        url: p.url,
        inStock: p.inStock,
        deliveryDays: p.deliveryDays || 2
      })),
      priceHistory: history.map(h => ({
        date: h.date,
        price: h.price
      }))
    };
  }
}

module.exports = ProductDTO;
