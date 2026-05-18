const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const scrapeFlipkart = async (query) => {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    try {
        const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const products = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('div[data-id]'));
            return items.map(item => {
                const img = item.querySelector('img');
                const title = img ? img.getAttribute('alt') : null;
                const linkEl = item.querySelector('a[href*="/p/"]');
                const ratingEl = item.querySelector('div[class*="MKiFS6"], div[class*="XQDdHH"], div[class*="_3LWZlK"]');
                
                let currentPrice = 0;
                let originalPrice = 0;
                
                const priceTexts = [];
                const allElements = item.querySelectorAll('*');
                allElements.forEach(el => {
                    const text = el.textContent.trim();
                    if(text.startsWith('₹') && el.children.length === 0) {
                        priceTexts.push(text);
                    }
                });
                
                if (priceTexts.length > 0) {
                    currentPrice = parseFloat(priceTexts[0].replace(/[₹,]/g, ''));
                    if (priceTexts.length > 1) {
                        originalPrice = parseFloat(priceTexts[1].replace(/[₹,]/g, ''));
                    } else {
                        originalPrice = currentPrice;
                    }
                }

                return {
                    title: title,
                    currentPrice,
                    originalPrice,
                    discountPercentage: originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0,
                    rating: ratingEl ? parseFloat(ratingEl.innerText) : 0,
                    image: img ? img.src : null,
                    url: linkEl && linkEl.getAttribute('href') ? 'https://www.flipkart.com' + linkEl.getAttribute('href') : null,
                    source: 'Flipkart'
                };
            }).filter(p => p.title && p.currentPrice > 0);
        });

        await browser.close();
        return products;
    } catch (error) {
        console.error('Flipkart Scrape Error:', error.message);
        await browser.close();
        return [];
    }
};

module.exports = scrapeFlipkart;
