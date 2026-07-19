const BaseRetailer = require('../BaseRetailer');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Flipkart retailer — real Cheerio scraper.
 * Scrapes flipkart.com search results page.
 *
 * Returns [] on block/CAPTCHA/error — never returns fake data.
 */
class FlipkartRetailer extends BaseRetailer {
    constructor() {
        super();
        this.name = 'Flipkart';
        this.supportedCategories = ['electronics', 'fashion', 'home', 'sports'];
        this.supportsCoupons = false;
        this.supportsCashback = false;
        this.baseUrl = 'https://www.flipkart.com';
    }

    _headers() {
        return {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-IN,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Upgrade-Insecure-Requests': '1',
        };
    }

    async search(params) {
        const keywords = params.keywords || '';
        if (!keywords.trim()) return [];

        const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(keywords)}&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off`;

        try {
            const response = await axios.get(searchUrl, {
                headers: this._headers(),
                timeout: 10000,
                maxRedirects: 3,
            });

            if (response.status !== 200) {
                console.warn(`[Flipkart] Blocked — HTTP ${response.status}`);
                return [];
            }

            const html = response.data;
            const $ = cheerio.load(html);

            // Detect login-wall / bot block
            if (html.includes('_396cs4') === false && $('body').text().length < 500) {
                console.warn('[Flipkart] Empty/blocked page — returning []');
                return [];
            }

            const products = [];

            // Flipkart product grid cards — multiple possible class patterns
            const cardSelectors = ['div._1YokD2._3Mn1Gg', 'div._1AtVbE', 'div._4ddWXP', 'div[data-id]'];

            let cards = $();
            for (const sel of cardSelectors) {
                const found = $(sel);
                if (found.length > 2) { cards = found; break; }
            }

            // Fallback: look for price + title combinations
            if (cards.length === 0) {
                console.warn('[Flipkart] No product cards matched — returning []');
                return [];
            }

            cards.each((i, el) => {
                if (i >= 10) return false;
                const $el = $(el);

                // Title — Flipkart uses several class names
                const title = $el.find('div._4rR01T, a.s1Q9rs, a.IRpwTa, div.col.col-7-12 a').first().text().trim() ||
                              $el.find('[class*="title"]').first().text().trim();

                if (!title || title.length < 3) return;

                // Price
                const priceText = $el.find('div._30jeq3, div._1_WHN1').first().text();
                const price = priceText ? parseInt(priceText.replace(/[^0-9]/g, ''), 10) : null;
                if (!price || price <= 0) return;

                // Image
                const image = $el.find('img._396cs4, img._2r_T1I, img').first().attr('src') || '';

                // Link
                const relLink = $el.find('a').first().attr('href') || '';
                const url = relLink.startsWith('http') ? relLink : `${this.baseUrl}${relLink}`;

                // Rating
                const ratingText = $el.find('div._3LWZlK').first().text();
                const rating = parseFloat(ratingText) || null;

                products.push({
                    title,
                    brand: params.brand || null,
                    category: params.category || 'General',
                    price,
                    shipping: 0,
                    image,
                    url,
                    rating,
                    reviews: 0,
                    inStock: true,
                });
            });

            console.log(`[Flipkart] Scraped ${products.length} products for "${keywords}"`);
            return products;

        } catch (err) {
            console.warn(`[Flipkart] Scrape failed: ${err.message} — returning []`);
            return [];
        }
    }

    async healthCheck() {
        try {
            const r = await axios.get(this.baseUrl, { headers: this._headers(), timeout: 5000 });
            return r.status === 200;
        } catch {
            return false;
        }
    }
}

module.exports = new FlipkartRetailer();
