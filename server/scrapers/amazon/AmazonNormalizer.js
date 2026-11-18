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
    if (rawData.price !== null && rawData.price !== undefined) {
      if (typeof rawData.price === 'string') {
        const numericString = rawData.price.replace(/[^\d.]/g, '');
        if (numericString) parsedPrice = parseFloat(numericString);
      } else {
        parsedPrice = rawData.price;
      }
    }

    const finalUrl = rawData.url || rawData.productUrl;

    return {
      retailerId: 'amazon',
      title: rawData.title,
      price: parsedPrice,
      currency: 'INR',
      url: finalUrl,
      imageUrl: rawData.imageUrl || rawData.image,
      // Attempt to extract ASIN from URL if present
      sku: finalUrl ? this.extractAsin(finalUrl) : null,
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
