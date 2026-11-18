/**
 * Data Transfer Objects (DTOs)
 * Used to normalize data before sending it to the client
 */

const productDTO = (product, retailers = [], priceHistory = []) => {
  return {
    id: product._id,
    title: product.name,
    brand: product.brand,
    category: product.category?.name || product.category,
    image: product.image,
    rating: product.rating,
    retailers: retailers.map(retailer => ({
      id: retailer.retailerId._id || retailer.retailerId,
      name: retailer.retailerId.name || 'Unknown',
      logo: retailer.retailerId.logo,
      price: retailer.price,
      oldPrice: retailer.oldPrice,
      discount: retailer.discount,
      url: retailer.url,
      updatedAt: retailer.updatedAt
    })),
    priceHistory: priceHistory.map(history => ({
      date: history.date,
      price: history.price
    }))
  };
};

module.exports = {
  productDTO
};
