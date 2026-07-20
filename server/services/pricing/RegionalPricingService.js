const TaxService = require('./TaxService');
const ShippingService = require('./ShippingService');
const CurrencyService = require('../localization/CurrencyService');

class RegionalPricingService {
  /**
   * Orchestrates the calculation of the final price for display
   * @param {number} nativePrice - The raw price scraped from retailer
   * @param {string} nativeCurrency - The currency of the native price (e.g. INR)
   * @param {boolean} taxIncludedNative - Does the native price already include tax?
   * @param {Object} regionContext - The user's active region context
   */
  async computeFinalPrice(nativePrice, nativeCurrency, taxIncludedNative, regionContext) {
    // 1. Currency Conversion (Convert native to target region currency)
    let displayPrice = await CurrencyService.convert(nativePrice, nativeCurrency, regionContext.currency);

    let taxAmount = 0;
    
    // 2. Apply Tax if it's not already included natively
    if (!taxIncludedNative) {
      taxAmount = TaxService.calculateTax(displayPrice, regionContext);
      displayPrice += taxAmount;
    }

    // 3. Estimate Shipping
    const shippingCost = ShippingService.estimateShipping(displayPrice, regionContext);
    
    return {
      nativePrice,
      nativeCurrency,
      displayPrice: parseFloat(displayPrice.toFixed(2)),
      displayCurrency: regionContext.currency,
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      shippingCost: parseFloat(shippingCost.toFixed(2)),
      finalTotal: parseFloat((displayPrice + shippingCost).toFixed(2))
    };
  }
}

module.exports = new RegionalPricingService();
