const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const scrapeAmazon = async (query) => {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    try {
        const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const products = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]'));
            return items.map(item => {
                const titleEl = item.querySelector('h2 a span') || item.querySelector('h2 span') || item.querySelector('.a-text-normal');
                const priceEl = item.querySelector('.a-price-whole');
                const originalPriceEl = item.querySelector('.a-text-price span');
                const ratingEl = item.querySelector('.a-icon-alt');
                const imageEl = item.querySelector('.s-image');
                const linkEl = item.querySelector('h2 a') || item.querySelector('.a-link-normal.s-no-outline');

                const currentPrice = priceEl ? parseFloat(priceEl.innerText.replace(/,/g, '')) : 0;
                const originalPrice = originalPriceEl ? parseFloat(originalPriceEl.innerText.replace(/[₹,]/g, '')) : currentPrice;

                return {
                    title: titleEl ? titleEl.innerText : null,
                    currentPrice,
                    originalPrice,
                    discountPercentage: originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0,
                    rating: ratingEl ? parseFloat(ratingEl.innerText.split(' ')[0]) : 0,
                    image: imageEl ? imageEl.src : null,
                    url: linkEl ? 'https://www.amazon.in' + linkEl.getAttribute('href') : null,
                    source: 'Amazon'
                };
            }).filter(p => p.title && p.currentPrice > 0);
        });

        await browser.close();
        return products;
    } catch (error) {
        console.error('Amazon Scrape Error:', error.message);
        await browser.close();
        return [];
    }
};

module.exports = scrapeAmazon;
