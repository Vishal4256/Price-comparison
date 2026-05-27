const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const USD_TO_INR = 83.5;

const cleanPriceText = (text) => {
    if (!text) return 0;
    const cleaned = text.replace(/[₹$,]/g, '').replace(/\s/g, '').trim();
    const matches = cleaned.match(/[\d.]+/);
    if (!matches) return 0;
    const value = parseFloat(matches[0]);
    return isNaN(value) ? 0 : value;
};

const scrapeActualUrl = async (url, source) => {
    console.log(`🤖 [ActualUrlScraper] Direct scraping: ${url} (${source})`);
    
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1920,1080'
        ]
    });
    
    try {
        const page = await browser.newPage();
        
        // Evade basic webdriver checks
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });
        
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });

        let result = null;

        if (source === 'Amazon') {
            result = await page.evaluate(() => {
                const priceSelectors = [
                    '.a-price-whole',
                    '.a-price .a-offscreen',
                    'span.apexPriceToPay span.a-offscreen',
                    '#priceblock_ourprice',
                    '#priceblock_dealprice',
                    '#corePriceDisplay_desktop_feature_div .a-price-whole',
                    '#corePrice_desktop .a-price-whole'
                ];
                
                const originalPriceSelectors = [
                    'span.a-price.a-text-price span.a-offscreen',
                    '.a-text-price span',
                    '#priceblock_strike',
                    '#corePrice_desktop .a-text-price span',
                    '.basisPrice .a-offscreen'
                ];

                let currentPriceText = '';
                for (const selector of priceSelectors) {
                    const el = document.querySelector(selector);
                    if (el && el.textContent.trim()) {
                        currentPriceText = el.textContent.trim();
                        break;
                    }
                }

                let originalPriceText = '';
                for (const selector of originalPriceSelectors) {
                    const el = document.querySelector(selector);
                    if (el && el.textContent.trim()) {
                        originalPriceText = el.textContent.trim();
                        break;
                    }
                }

                const titleEl = document.querySelector('#productTitle');
                const imageEl = document.querySelector('#landingImage') || document.querySelector('#imgBlkFront');

                return {
                    title: titleEl ? titleEl.textContent.trim() : null,
                    currentPriceText,
                    originalPriceText,
                    image: imageEl ? imageEl.src : null
                };
            });

            if (result) {
                const currentPrice = cleanPriceText(result.currentPriceText);
                const originalPrice = cleanPriceText(result.originalPriceText) || currentPrice;
                
                result.currentPrice = currentPrice;
                result.originalPrice = originalPrice;
            }

        } else if (source === 'Flipkart') {
            result = await page.evaluate(() => {
                const priceSelectors = [
                    '.Nx9bqj',
                    'div[class*="Nx9bqj"]',
                    '.CxhGGd',
                    'div[class*="CxhGGd"]'
                ];

                const originalPriceSelectors = [
                    '.yRaY8j',
                    'div[class*="yRaY8j"]',
                    '.A6rE5m',
                    'div[class*="A6rE5m"]'
                ];

                let currentPriceText = '';
                for (const selector of priceSelectors) {
                    const el = document.querySelector(selector);
                    if (el && el.textContent.trim()) {
                        currentPriceText = el.textContent.trim();
                        break;
                    }
                }

                let originalPriceText = '';
                for (const selector of originalPriceSelectors) {
                    const el = document.querySelector(selector);
                    if (el && el.textContent.trim()) {
                        originalPriceText = el.textContent.trim();
                        break;
                    }
                }

                const titleEl = document.querySelector('.B_NuCI') || document.querySelector('h1 span') || document.querySelector('.title');
                const imageEl = document.querySelector('img[src*="flixcart.com/image"]') || document.querySelector('img');

                return {
                    title: titleEl ? titleEl.textContent.trim() : null,
                    currentPriceText,
                    originalPriceText,
                    image: imageEl ? imageEl.src : null
                };
            });

            if (result) {
                const currentPrice = cleanPriceText(result.currentPriceText);
                const originalPrice = cleanPriceText(result.originalPriceText) || currentPrice;
                
                result.currentPrice = currentPrice;
                result.originalPrice = originalPrice;
            }

        } else if (source === 'eBay') {
            result = await page.evaluate(() => {
                const priceSelectors = [
                    '.x-price-primary',
                    '[itemprop="price"]',
                    '.display-price',
                    '#prcIsum'
                ];

                const originalPriceSelectors = [
                    '.x-price-original',
                    '.STP',
                    '.org-price-val',
                    '#mm-saleDscPrc'
                ];

                let currentPriceText = '';
                for (const selector of priceSelectors) {
                    const el = document.querySelector(selector);
                    if (el && el.textContent.trim()) {
                        currentPriceText = el.textContent.trim();
                        break;
                    }
                }

                let originalPriceText = '';
                for (const selector of originalPriceSelectors) {
                    const el = document.querySelector(selector);
                    if (el && el.textContent.trim()) {
                        originalPriceText = el.textContent.trim();
                        break;
                    }
                }

                const titleEl = document.querySelector('.x-item-title__mainTitle') || document.querySelector('#itemTitle');
                const imageEl = document.querySelector('.ux-image-magnify__image') || document.querySelector('#icImg');

                return {
                    title: titleEl ? titleEl.textContent.replace(/[\n\t]/g, '').trim() : null,
                    currentPriceText,
                    originalPriceText,
                    image: imageEl ? imageEl.src : null
                };
            });

            if (result) {
                let currentPrice = cleanPriceText(result.currentPriceText);
                let originalPrice = cleanPriceText(result.originalPriceText) || currentPrice;

                if (result.currentPriceText.includes('$') || result.currentPriceText.includes('US')) {
                    currentPrice = Math.round(currentPrice * USD_TO_INR);
                    originalPrice = Math.round(originalPrice * USD_TO_INR);
                }

                result.currentPrice = currentPrice;
                result.originalPrice = originalPrice;
            }
        }

        await browser.close();

        if (result && result.currentPrice > 0) {
            console.log(`✅ [ActualUrlScraper] Successfully scraped: Title="${result.title}", CurrentPrice=${result.currentPrice}, OriginalPrice=${result.originalPrice}`);
            return {
                title: result.title,
                currentPrice: result.currentPrice,
                originalPrice: result.originalPrice,
                discountPercentage: result.originalPrice > result.currentPrice ? Math.round(((result.originalPrice - result.currentPrice) / result.originalPrice) * 100) : 0,
                image: result.image,
                url,
                source
            };
        } else {
            console.warn(`⚠️ [ActualUrlScraper] Direct scrape returned no price data: ${url}`);
            return null;
        }

    } catch (error) {
        console.error(`❌ [ActualUrlScraper] Direct scrape error for ${url}: ${error.message}`);
        await browser.close();
        return null;
    }
};

module.exports = scrapeActualUrl;
