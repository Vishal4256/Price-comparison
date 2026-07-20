class AmazonNormalizer {
  /**
   * Normalize a raw Amazon scraped item into a standard ProductDTO-like structure.
   * @param {Object} rawData 
   * @returns {Object}
   */
  static normalize(rawData) {
    if (!rawData) return null;

    // Remove commas from price and parse
    let parsedPrice = null;
    if (rawData.price) {
      const numericString = rawData.price.replace(/[^\d.]/g, '');
      if (numericString) parsedPrice = parseFloat(numericString);
    }

    return {
      retailerId: 'amazon',
      title: rawData.title,
      price: parsedPrice,
      currency: 'INR',
      url: rawData.url,
      imageUrl: rawData.imageUrl,
      // Attempt to extract ASIN from URL if present
      sku: rawData.url ? this.extractAsin(rawData.url) : null,
      availability: parsedPrice !== null ? 'In Stock' : 'Out of Stock',
      metadata: {
        rawRating: rawData.rating || null
      }
    };
  }

  static extractAsin(url) {
    const match = url.match(/\/dp\/([A-Z0-9]{10})/);
    return match ? match[1] : null;
  }
}

module.exports = AmazonNormalizer;
