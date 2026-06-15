const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 * Parse a price string → number.
 * Strips ₹, commas, whitespace, then returns a float.
 * Returns 0 on failure.
 */
const cleanPriceText = (text) => {
    if (!text) return 0;
    const cleaned = text.replace(/[₹$,\s]/g, '').trim();
    const matches = cleaned.match(/[\d.]+/);
    if (!matches) return 0;
    const value = parseFloat(matches[0]);
    return isNaN(value) ? 0 : value;
};

/**
 * Scrape the PRODUCT DETAIL PAGE (not search page) for the real selling price.
 *
 * This is the authoritative source — it matches exactly what the customer
 * sees when they open the product URL.
 *
 * Strategy (works even when class names change):
 *   Flipkart: Find ALL ₹ prices in DOM order. Exclude anything inside
 *             exchange/EMI sections. First price = selling price.
 *             Second (higher) price = MRP.
 *   Amazon:   Use specific stable selectors (apexPriceToPay, basisPrice).
 *
 * We NEVER pick exchange offer prices or EMI prices.
 */
const scrapeActualUrl = async (url, source) => {
    console.log(`🤖 [ActualUrlScraper] Scraping product page: ${url} (${source})`);
    
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1920,1080',
            '--disable-web-security',
        ]
    });
    
    try {
        const page = await browser.newPage();
        
        // Evade basic webdriver checks
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            window.chrome = { runtime: {} };
        });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-IN,en;q=0.9' });
        
        // networkidle2 ensures JS-rendered prices have fully loaded
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });

        // Extra delay to allow lazy-loaded price elements to appear
        await new Promise(r => setTimeout(r, 1500));

        let result = null;

        // ── FLIPKART product page ──────────────────────────────────────────────
        if (source === 'Flipkart') {
            result = await page.evaluate(() => {

                /**
                 * Structural approach for Flipkart product pages:
                 *
                 * Flipkart PDP price DOM structure:
                 *   div.CEmiEU or div (price summary section)
                 *     div.Nx9bqj   ← selling price (current class name, may change)
                 *     div.yRaY8j   ← MRP (struck-through, higher number)
                 *   div (exchange offer section) ← appears AFTER selling price section
                 *     "Upto ₹XX,XXX Off on Exchange"
                 *
                 * Stable strategy: Find ALL ₹ amounts in DOM order.
                 * Stop before any exchange/EMI keyword.
                 * First price = selling price. Second (if higher) = MRP.
                 */

                const TITLE_SELECTORS = [
                    'span.B_NuCI',
                    'h1.yhB1nd',
                    'h1 span',
                    'h1',
                    'div.osNmkd',
                ];

                // Get full page body text to check for exchange markers
                const bodyHTML = document.body.innerHTML || '';

                // Find exchange offer marker positions to limit our search
                const exchangeMarkers = ['On Exchange', 'off on Exchange', 'Exchange Offer', 'Upto ₹'];
                let limitHTML = bodyHTML;
                for (const marker of exchangeMarkers) {
                    const idx = bodyHTML.indexOf(marker);
                    if (idx > 0) {
                        limitHTML = bodyHTML.slice(0, idx);
                        break;
                    }
                }

                // Parse limited HTML for ₹ amounts in DOM order
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = limitHTML;

                const priceTexts = [];
                const walker = document.createTreeWalker(
                    tempDiv,
                    NodeFilter.SHOW_TEXT,
                    null
                );
                let node;
                while ((node = walker.nextNode())) {
                    const text = node.textContent.trim();
                    if (text.match(/^₹[\d,]+$/) || text.match(/^₹ *[\d,]+$/)) {
                        const val = parseFloat(text.replace(/[₹,\s]/g, ''));
                        if (!isNaN(val) && val > 100) {
                            priceTexts.push({ text, val });
                        }
                    }
                }

                let currentPriceText = '';
                let originalPriceText = '';

                if (priceTexts.length >= 1) {
                    currentPriceText = priceTexts[0].text;
                }
                if (priceTexts.length >= 2 && priceTexts[1].val > priceTexts[0].val) {
                    originalPriceText = priceTexts[1].text;
                }

                let titleText = '';
                for (const sel of TITLE_SELECTORS) {
                    const el = document.querySelector(sel);
                    if (el && el.textContent.trim().length > 5) {
                        titleText = el.textContent.trim();
                        break;
                    }
                }

                const imageEl = document.querySelector('img._396cs4') ||
                                document.querySelector('img[class*="DByuf4"]') ||
                                document.querySelector('div._2r_T1I img') ||
                                document.querySelector('img[src*="flixcart"]');

                console.log('[Flipkart PDP] Raw prices found (pre-exchange):', JSON.stringify(priceTexts.slice(0, 5)));
                console.log('[Flipkart PDP] Extracted:', { titleText, currentPriceText, originalPriceText });

                return {
                    title: titleText || null,
                    currentPriceText,
                    originalPriceText,
                    image: imageEl ? imageEl.src : null,
                };
            });

        // ── AMAZON product page ────────────────────────────────────────────────
        } else if (source === 'Amazon') {
            result = await page.evaluate(() => {

                /**
                 * Amazon PDP selectors (stable, unlikely to change often):
                 *
                 * Selling price:
                 *   span.apexPriceToPay span.a-offscreen    ← primary modern layout ✅
                 *   #corePriceDisplay_desktop_feature_div .a-price:not(.a-text-price) .a-offscreen
                 *   #priceblock_ourprice                    ← legacy
                 *
                 * MRP (crossed out):
                 *   .basisPrice .a-offscreen
                 *   #corePriceDisplay_desktop_feature_div .a-text-price .a-offscreen
                 *
                 * We skip: coupon prices, cashback, EMI breakdown.
                 */
                const SELLING_PRICE_SELECTORS = [
                    'span.apexPriceToPay span.a-offscreen',
                    '#corePriceDisplay_desktop_feature_div .a-price:not(.a-text-price) .a-offscreen',
                    '#corePrice_desktop .a-price:not(.a-text-price) .a-offscreen',
                    '#priceblock_ourprice',
                    '#priceblock_dealprice',
                    '.a-price:not(.a-text-price) .a-offscreen',
                ];

                const MRP_SELECTORS = [
                    '.basisPrice .a-offscreen',
                    '#corePriceDisplay_desktop_feature_div .a-text-price .a-offscreen',
                    '#corePrice_desktop .a-text-price .a-offscreen',
                    '#priceblock_strike',
                    '.a-text-price .a-offscreen',
                ];

                let currentPriceText = '';
                for (const sel of SELLING_PRICE_SELECTORS) {
                    const el = document.querySelector(sel);
                    if (el && el.textContent.trim()) {
                        currentPriceText = el.textContent.trim();
                        break;
                    }
                }

                let originalPriceText = '';
                for (const sel of MRP_SELECTORS) {
                    const el = document.querySelector(sel);
                    if (el && el.textContent.trim()) {
                        originalPriceText = el.textContent.trim();
                        break;
                    }
                }

                const titleEl = document.querySelector('#productTitle');
                const imageEl = document.querySelector('#landingImage') ||
                                document.querySelector('#imgBlkFront') ||
                                document.querySelector('.a-dynamic-image');

                console.log('[Amazon PDP] Extracted:', { currentPriceText, originalPriceText });

                return {
                    title: titleEl ? titleEl.textContent.trim() : null,
                    currentPriceText,
                    originalPriceText,
                    image: imageEl ? imageEl.src : null,
                };
            });
        }

        await browser.close();

        if (!result) {
            console.warn(`⚠️ [ActualUrlScraper] No result for: ${url}`);
            return null;
        }

        const currentPrice  = cleanPriceText(result.currentPriceText);
        const originalPrice = cleanPriceText(result.originalPriceText) || currentPrice;
        const finalMRP = (originalPrice > 0 && originalPrice >= currentPrice) ? originalPrice : currentPrice;

        console.log(`[ActualUrlScraper] Parsed: { title: "${(result.title || '').slice(0, 60)}", scrapedPrice: ${currentPrice}, mrp: ${finalMRP}, url: "${url}" }`);

        if (currentPrice > 0) {
            const discountPercentage = finalMRP > currentPrice
                ? Math.round(((finalMRP - currentPrice) / finalMRP) * 100)
                : 0;

            console.log(`✅ [ActualUrlScraper] Success: currentPrice=${currentPrice}, mrp=${finalMRP}, discount=${discountPercentage}%`);
            return {
                title: result.title,
                currentPrice,
                originalPrice: finalMRP,
                discountPercentage,
                image: result.image,
                url,
                source,
            };
        } else {
            console.warn(`⚠️ [ActualUrlScraper] Could not extract price: ${url}`);
            return null;
        }

    } catch (error) {
        console.error(`❌ [ActualUrlScraper] Error for ${url}: ${error.message}`);
        await browser.close().catch(() => {});
        return null;
    }
};

module.exports = scrapeActualUrl;
