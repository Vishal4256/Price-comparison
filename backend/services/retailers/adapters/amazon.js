const BaseRetailer = require('../BaseRetailer');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Amazon India retailer — real Cheerio scraper.
 * Scrapes amazon.in search results page.
 *
 * NOTE: Amazon has aggressive bot protection. If scraping is blocked (403, CAPTCHA, empty results),
 * this adapter returns [] cleanly — it NEVER returns fake/mock data.
 */
class AmazonRetailer extends BaseRetailer {
    constructor() {
        super();
        this.name = 'Amazon';
        this.supportedCategories = ['electronics', 'fashion', 'home', 'books', 'appliances'];
        this.supportsCoupons = false;
        this.supportsCashback = false;
        this.baseUrl = 'https://www.amazon.in';
    }

    /**
     * Build realistic browser headers to avoid immediate bot detection.
     */
    _headers() {
        return {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-IN,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'DNT': '1',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
        };
    }

    async search(params) {
        const keywords = params.keywords || '';
        if (!keywords.trim()) return [];

        const searchUrl = `${this.baseUrl}/s?k=${encodeURIComponent(keywords)}&ref=sr_pg_1`;

        try {
            const response = await axios.get(searchUrl, {
                headers: this._headers(),
                timeout: 10000,
                maxRedirects: 3,
            });

            // If Amazon redirected to a CAPTCHA or error page
            if (response.status !== 200) {
                console.warn(`[Amazon] Blocked — HTTP ${response.status}`);
                return [];
            }

            const html = response.data;
            const $ = cheerio.load(html);

            // Detect CAPTCHA page
            if ($('form[action="/errors/validateCaptcha"]').length || html.includes('Type the characters you see in this image')) {
                console.warn('[Amazon] CAPTCHA detected — returning []');
                return [];
            }

            const products = [];

            // Amazon product card selector (as of 2024-2025 DOM)
            $('[data-component-type="s-search-result"]').each((i, el) => {
                if (i >= 10) return false; // cap at 10 results

                const $el = $(el);

                // Skip sponsored ad units that don't have real product data
                const isSponsoredBadge = $el.find('.s-sponsored-label-info-icon').length > 0 ||
                                         $el.find('[aria-label*="Sponsored"]').length > 0;
                // We still try to parse them — just use the title text carefully

                // Title — use the most reliable selectors in order
                const title = $el.find('h2[aria-label]').attr('aria-label')?.trim() ||
                              $el.find('h2 span.a-size-medium').first().text().trim() ||
                              $el.find('h2 span.a-size-base-plus').first().text().trim() ||
                              $el.find('h2 span').first().text().trim();

                if (!title || title.length < 5 || title.toLowerCase().includes('sponsored')) return;

                const asin = $el.attr('data-asin');
                const productUrl = asin
                    ? `${this.baseUrl}/dp/${asin}`
                    : ($el.find('h2 .a-link-normal').attr('href')
                        ? `${this.baseUrl}${$el.find('h2 .a-link-normal').attr('href')}`
                        : searchUrl);

                // Price — try multiple selectors Amazon uses
                const priceWhole = $el.find('.a-price-whole').first().text().replace(/[^0-9]/g, '');
                const priceSymbol = $el.find('.a-price').first().text().replace(/[^0-9.]/g, '').split('.')[0];
                const rawPrice = priceWhole || priceSymbol;
                const price = rawPrice ? parseInt(rawPrice, 10) : null;

                // Filter out results with no price (usually sponsored without prices)
                if (!price || price <= 0) return;

                // Rating
                const ratingText = $el.find('.a-icon-alt').first().text();
                const rating = parseFloat(ratingText) || null;

                // Review count
                const reviewsText = $el.find('[aria-label$="stars"] + span').text() ||
                                     $el.find('.a-size-base.s-underline-text').text();
                const reviews = parseInt(reviewsText.replace(/[^0-9]/g, ''), 10) || 0;

                // Image
                const image = $el.find('img.s-image').attr('src') || '';

                products.push({
                    title,
                    brand: params.brand || null,
                    category: params.category || 'General',
                    price,
                    shipping: 0,
                    image,
                    url: productUrl,
                    rating,
                    reviews,
                    inStock: true,
                });
            });

            console.log(`[Amazon] Scraped ${products.length} products for "${keywords}"`);
            return products;

        } catch (err) {
            // Network errors, timeouts, DNS failures → return [] cleanly
            console.warn(`[Amazon] Scrape failed: ${err.message} — returning []`);
            return [];
        }
    }

    async healthCheck() {
        try {
            const r = await axios.get(`${this.baseUrl}`, { headers: this._headers(), timeout: 5000 });
            return r.status === 200;
        } catch {
            return false;
        }
    }
}

module.exports = new AmazonRetailer();
