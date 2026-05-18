const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const scrapeEbay = async (query) => {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    try {
        const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const products = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.s-item__wrapper'));
            return items.map(item => {
                const titleEl = item.querySelector('.s-item__title');
                const priceEl = item.querySelector('.s-item__price');
                const originalPriceEl = item.querySelector('.s-item__trending-price .STP');
                const imageEl = item.querySelector('.s-item__image-img');
                const linkEl = item.querySelector('.s-item__link');

                const currentPrice = priceEl ? parseFloat(priceEl.innerText.replace(/[$,]/g, '')) : 0;
                const originalPrice = originalPriceEl ? parseFloat(originalPriceEl.innerText.replace(/[$,]/g, '')) : currentPrice;

                return {
                    title: titleEl ? titleEl.innerText : null,
                    currentPrice,
                    originalPrice,
                    discountPercentage: originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0,
                    rating: 0, // eBay ratings are harder to parse
                    image: imageEl ? imageEl.src : null,
                    url: linkEl && linkEl.getAttribute('href') ? linkEl.getAttribute('href') : null,
                    source: 'eBay'
                };
            }).filter(p => p.title && p.currentPrice > 0 && !p.title.includes('Shop on eBay'));
        });

        await browser.close();
        return products;
    } catch (error) {
        console.error('eBay Scrape Error:', error.message);
        await browser.close();
        return [];
    }
};

module.exports = scrapeEbay;
