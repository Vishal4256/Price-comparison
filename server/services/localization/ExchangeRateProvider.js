const axios = require('axios');
const logger = require('../../utils/logger');

class ExchangeRateProvider {
  constructor() {
    this.apiUrl = 'https://open.er-api.com/v6/latest/';
  }

  /**
   * Fetches latest rates for a base currency
   * @param {string} baseCurrency 
   * @returns {Object} Rates dictionary
   */
  async fetchRates(baseCurrency = 'USD') {
    try {
      const response = await axios.get(`${this.apiUrl}${baseCurrency}`);
      if (response.data && response.data.result === 'success') {
        return response.data.rates;
      }
      throw new Error('Invalid response from ExchangeRate API');
    } catch (error) {
      logger.error(`ExchangeRateProvider failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ExchangeRateProvider();
