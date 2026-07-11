class AffiliateService {
    /**
     * Validates and normalizes a product URL.
     * @param {string} url - The raw URL from the database or scraper.
     * @returns {string|null} - The valid URL or null if invalid.
     */
    static validateUrl(url) {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return null;
        }

        let cleanUrl = url.trim();

        // Ensure https:// protocol
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = `https://${cleanUrl}`;
        }

        try {
            // Check if it's a valid URL format
            new URL(cleanUrl);
            return cleanUrl;
        } catch (error) {
            return null;
        }
    }
}

module.exports = AffiliateService;
