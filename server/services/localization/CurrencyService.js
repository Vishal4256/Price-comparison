const ExchangeRate = require('../../models/ExchangeRate');
const ExchangeRateProvider = require('./ExchangeRateProvider');
const logger = require('../../utils/logger');

class CurrencyService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Refreshes the exchange rates from the provider and updates DB
   * Typically called by a Cron job
   */
  async refreshRates() {
    try {
      const rates = await ExchangeRateProvider.fetchRates('USD');
      
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      const bulkOps = Object.keys(rates).map(targetCurrency => ({
        updateOne: {
          filter: { baseCurrency: 'USD', targetCurrency },
          update: { 
            rate: rates[targetCurrency],
            lastFetchedAt: now,
            expiresAt
          },
          upsert: true
        }
      }));

      if (bulkOps.length > 0) {
        await ExchangeRate.bulkWrite(bulkOps);
        logger.info('Exchange rates refreshed successfully.');
        this.cache.clear(); // Invalidate memory cache
      }
    } catch (error) {
      logger.error(`Failed to refresh exchange rates: ${error.message}`);
      // In a real system, we might alert here, but we continue to use stale rates.
    }
  }

  /**
   * Convert amount from one currency to another
   * @param {number} amount 
   * @param {string} fromCurrency 
   * @param {string} toCurrency 
   * @returns {number} converted amount
   */
  async convert(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;

    try {
      // Base logic: Convert `from` to USD, then USD to `to`
      const fromRate = await this.getRate('USD', fromCurrency);
      const toRate = await this.getRate('USD', toCurrency);

      if (!fromRate || !toRate) {
        logger.warn(`Missing exchange rate for ${fromCurrency} or ${toCurrency}. Returning original amount.`);
        return amount; // Fallback
      }

      const amountInUSD = amount / fromRate;
      return amountInUSD * toRate;

    } catch (error) {
      logger.error(`Conversion failed: ${error.message}`);
      return amount; // Fallback to avoid breaking UI
    }
  }

  async getRate(base, target) {
    const cacheKey = `${base}_${target}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const rateDoc = await ExchangeRate.findOne({ baseCurrency: base, targetCurrency: target });
    if (rateDoc) {
      this.cache.set(cacheKey, rateDoc.rate);
      return rateDoc.rate;
    }

    return null;
  }
}

module.exports = new CurrencyService();
