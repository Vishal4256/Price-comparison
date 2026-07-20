class RegionService {
  constructor() {
    this.DEFAULT_REGION = {
      country: 'IN',
      currency: 'INR',
      language: 'en-IN',
      timezone: 'Asia/Kolkata'
    };
  }

  /**
   * Determine the active region context based on request headers/preferences
   * @param {Object} req - Express request object
   * @returns {Object} Region Context
   */
  getRegionContext(req) {
    // 1. User Preference (Explicit Override via Header or Query)
    const overrideCountry = req.headers['x-region'] || req.query.region;
    
    if (overrideCountry) {
      return this.resolveRegion(overrideCountry.toUpperCase());
    }

    // 2. Account Setting (If user is logged in)
    if (req.user && req.user.preferences && req.user.preferences.country) {
      return this.resolveRegion(req.user.preferences.country.toUpperCase());
    }

    // 3. Device Locale / Browser Language
    const acceptLanguage = req.headers['accept-language'];
    if (acceptLanguage) {
      // E.g., 'en-US,en;q=0.9' -> Extract 'US'
      const match = acceptLanguage.match(/^[a-z]{2}-([A-Z]{2})/);
      if (match && match[1]) {
        return this.resolveRegion(match[1]);
      }
    }

    // 4. Default Region
    return this.DEFAULT_REGION;
  }

  resolveRegion(countryCode) {
    // In production, this would query the `Region` MongoDB collection.
    // We use a static lookup for fallback and performance.
    const regions = {
      'IN': { country: 'IN', currency: 'INR', language: 'en-IN', timezone: 'Asia/Kolkata' },
      'US': { country: 'US', currency: 'USD', language: 'en-US', timezone: 'America/New_York' },
      'DE': { country: 'DE', currency: 'EUR', language: 'de-DE', timezone: 'Europe/Berlin' },
      'GB': { country: 'GB', currency: 'GBP', language: 'en-GB', timezone: 'Europe/London' }
    };

    return regions[countryCode] || this.DEFAULT_REGION;
  }
}

module.exports = new RegionService();
