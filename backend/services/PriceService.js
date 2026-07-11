class PriceService {
    /**
     * Validates a price value.
     * @param {number|string} price - The price to validate.
     * @returns {number|null} - The valid numeric price, or null if invalid.
     */
    static validatePrice(price) {
        if (price === undefined || price === null) {
            return null;
        }

        const numPrice = Number(price);

        if (isNaN(numPrice) || numPrice <= 0) {
            return null;
        }

        return numPrice;
    }

    /**
     * Calculates the savings amount. Never returns a negative value.
     * @param {number} currentPrice - The lowest valid price.
     * @param {number} originalPrice - The MRP / Original price.
     * @returns {number} - The total savings amount (always >= 0).
     */
    static calculateSavings(currentPrice, originalPrice) {
        const validCurrent = this.validatePrice(currentPrice);
        const validOriginal = this.validatePrice(originalPrice);

        if (!validCurrent || !validOriginal) {
            return 0;
        }

        const savings = validOriginal - validCurrent;
        return savings > 0 ? savings : 0;
    }
}

module.exports = PriceService;
