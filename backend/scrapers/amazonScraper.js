const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { parseProductTitle, parseQuery } = require('../utils/productParser');
const { isAccessory } = require('../utils/ProductMatcher');

/**
 * Parse a price string like "₹54,900" → 54900. Returns 0 on failure.
 */
const parsePrice = (str) => {
    if (!str) return 0;
    const cleaned = str.replace(/[₹$,\s]/g, '').trim();
    const num = parseFloat(cleaned.match(/[\d.]+/)?.[0] || '');
    return isNaN(num) ? 0 : num;
};

// ─── Normalisation helper ─────────────────────────────────────────────────────
function norm(str) {
    if (!str) return '';
    // Preserve dots so that decimal numbers like "15.40" stay intact for tokenPresent
    return str.toLowerCase().replace(/[^a-z0-9.\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * True if `needle` appears as a standalone word in `haystack`.
 *
 * Stricter than a basic word-boundary check:
 *   - "15" MUST NOT match "15.40 cm" (decimal point follows)
 *   - "15" MUST NOT match "15e" (alphanumeric suffix)
 *   - "15" MUST match "iphone 15 pro" or "iphone 15 (128 GB)"
 *
 * Right-side anchor excludes dot — prevents "15" matching inside "15.40 cm".
 */
function tokenPresent(haystack, needle) {
    if (!haystack || !needle) return false;
    const h = norm(haystack);
    const n = norm(needle).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Left boundary: start OR non-alphanumeric
    // Right boundary: end OR non-alphanumeric AND non-dot (excludes "15.40", "15e")
    return new RegExp(`(?:^|[^a-z0-9])${n}(?:[^a-z0-9.]|$)`).test(h);
}

// ─── Model-number extractor ───────────────────────────────────────────────────
/**
 * Extract the PRIMARY NUMERIC model identifier from a parsed query.
 *
 * Bug fix: the old code took model.split(' ')[0] which for "iphone 15" gave
 * "iphone" — a word with no digit — causing the numeric model check to be
 * silently skipped. This allowed "iPhone 17e" to pass a search for "iphone 15".
 *
 * Correct approach: scan ALL tokens in the model string and find the FIRST one
 * that contains a digit. That is the numeric model identifier we must enforce.
 *
 * Examples:
 *   parsedQuery.model = "iphone 15"        → primaryModelToken = "15"
 *   parsedQuery.model = "iphone 15 pro max" → primaryModelToken = "15"
 *   parsedQuery.model = "galaxy s24 ultra"  → primaryModelToken = "s24"
 *   parsedQuery.model = "nothing phone 2a"  → primaryModelToken = "2a"
 *   parsedQuery.model = "iphone"            → primaryModelToken = null (no digit → no enforcement)
 */
function extractQueryModel(parsedQuery) {
    const model = (parsedQuery.model || '').trim().toLowerCase();
    if (!model) return null;

    // Find the FIRST token that contains a digit — that is the model number.
    for (const token of model.split(' ')) {
        if (token && /\d/.test(token)) {
            return token;
        }
    }

    // No digit found in any token → no numeric model enforcement
    return null;
}

// ─── AND-token model validation ───────────────────────────────────────────────
/**
 * Given a parsed query, extract ALL mandatory model tokens that must appear
 * in the product title.
 *
 * Rule: every NUMERIC-containing token in the query model field is mandatory.
 *   "iphone 15"         → required tokens: ["15"]
 *   "iphone 15 pro"     → required tokens: ["15", "pro"]   (pro is alphabetic but attached)
 *   "galaxy s24 ultra"  → required tokens: ["s24", "ultra"]
 *
 * Why include non-numeric tokens after the number?
 *   "iphone 15" should match "iphone 15 pro" but NOT "iphone 15 pro" when
 *   the user only typed "iphone 15". We don't over-restrict — we only require
 *   the tokens the user explicitly typed.
 *
 * Returns an array of tokens, may be empty.
 */
function extractRequiredModelTokens(parsedQuery) {
    const model = (parsedQuery.model || '').trim().toLowerCase();
    if (!model) return [];

    const tokens = model.split(' ').filter(t => t.length > 0);

    // Find the index of the first token with a digit
    const firstNumericIdx = tokens.findIndex(t => /\d/.test(t));
    if (firstNumericIdx === -1) return []; // no numeric model → no enforcement

    // Require: the numeric token AND everything after it (variant tokens like "pro", "max", "ultra")
    // This ensures "iphone 15 pro max" query rejects plain "iphone 15"
    return tokens.slice(firstNumericIdx);
}

// ─── Per-product validation ───────────────────────────────────────────────────
/**
 * Decide whether a scraped Amazon product title matches the search query.
 *
 * Validation layers (in order, applied with AND logic):
 *
 * 1. SERIES check  — "iphone" must be in the title as a whole word
 * 2. MODEL check   — "15" (and any variant tokens: "pro", "max") must ALL
 *                    appear in the title as whole words
 * 3. BRAND check   — if query specifies a brand, the product's brand must match
 *
 * Key behaviour:
 *   Query "iphone 15" → primaryToken="15"
 *     "Apple iPhone 17e"     → REJECT (no "15")
 *     "Apple iPhone 15 Pro"  → ACCEPT ("15" present)
 *     "Apple iPhone 15"      → ACCEPT
 *
 *   Query "iphone 15 pro" → required tokens = ["15", "pro"]
 *     "Apple iPhone 15"      → REJECT ("pro" missing)
 *     "Apple iPhone 15 Pro"  → ACCEPT
 *     "Apple iPhone 15 Pro Max" → ACCEPT
 *
 * Returns { keep: boolean, reason: string }
 */
function validateProduct(title, parsedQuery, primaryModelToken, requiredModelTokens, rawQuery) {
    const titleNorm = norm(title);
    const parsedProduct = parseProductTitle(title);

    // ── 0. Accessory check ───────────────────────────────────────────────────
    if (rawQuery && !isAccessory(rawQuery) && isAccessory(title)) {
        return { keep: false, reason: 'rejected accessory' };
    }

    // ── 1. Series check ──────────────────────────────────────────────────────
    if (parsedQuery.series) {
        const qSeries = parsedQuery.series.toLowerCase();
        if (!tokenPresent(titleNorm, qSeries)) {
            return { keep: false, reason: `series "${qSeries}" not in title` };
        }
    }

    // ── 2. Model token checks (strict AND) ───────────────────────────────────
    // Removed strict numeric check at the scraper level to allow the relevance 
    // engine (ProductMatcher) to handle closest matches (e.g. newer models when 
    // the requested model is out of stock).

    // ── 3. Brand check ───────────────────────────────────────────────────────
    if (parsedQuery.brand) {
        const qBrand = parsedQuery.brand.toLowerCase();
        const pBrand = (parsedProduct.brand || '').toLowerCase();
        if (pBrand && pBrand !== qBrand) {
            return { keep: false, reason: `brand mismatch (got "${pBrand}", want "${qBrand}")` };
        }
        if (!pBrand && !titleNorm.includes(qBrand)) {
            return { keep: false, reason: `brand "${qBrand}" not found in title` };
        }
    }

    return { keep: true, reason: 'passed all checks' };
}

/**
 * Extract the selling price and MRP from an Amazon search result card.
 *
 * Amazon search-page price HTML structure:
 *   span.a-price              ← SELLING price (primary price block)
 *     span.a-offscreen        ← "₹54,900" (full price as screen-reader text)
 *   span.a-text-price         ← MRP / crossed-out price (when discount exists)
 *     span.a-offscreen        ← "₹59,900"
 */
const extractAmazonPrices = ($, el) => {
    let currentPriceText = '';
    $(el).find('.a-price').each((_, priceEl) => {
        const cls = $(priceEl).attr('class') || '';
        if (cls.includes('a-text-price')) return; // skip strikethrough MRP blocks
        const offscreen = $(priceEl).find('.a-offscreen').first().text().trim();
        if (offscreen) {
            currentPriceText = offscreen;
            return false; // stop at first selling price
        }
    });

    const originalPriceText = $(el).find('.a-text-price .a-offscreen, .a-text-price span').first().text().trim();

    const currentPrice  = parsePrice(currentPriceText);
    let originalPrice   = parsePrice(originalPriceText) || currentPrice;
    if (originalPrice < currentPrice) originalPrice = currentPrice;

    return { currentPrice, originalPrice };
};

// ─── Main scraper ─────────────────────────────────────────────────────────────
const scrapeAmazon = async (query, isCategory = false) => {
    try {
        const parsedQuery          = parseQuery(query);
        const primaryModelToken    = extractQueryModel(parsedQuery);
        const requiredModelTokens  = extractRequiredModelTokens(parsedQuery);

        const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query).replace(/%20/g, '+')}`;
        
        let browser = null;
        const accepted = [];
        const rejected = [];

        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
            });
            const page = await browser.newPage();
            
            // Set realistic browser headers and viewport
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.amazon.in/'
            });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1280, height: 800 });

            // Fetch up to 3 pages to ensure we get at least 5 products
            for (let pageNum = 1; pageNum <= 3; pageNum++) {
                if (accepted.length >= 12) break;

                const pageUrl = pageNum === 1 ? searchUrl : `${searchUrl}&page=${pageNum}`;
                console.log(`[Amazon Debug] Fetching search URL (Page ${pageNum}): ${pageUrl}`);
                
                // Add a random delay to avoid blocking
                const delay = ms => new Promise(res => setTimeout(res, ms));
                await delay(Math.floor(Math.random() * 2000) + 1000); // 1-3 seconds delay

                // Let all resources load to avoid Bot Manager
                await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
                
                // Scroll down to trigger lazy loading of more search results
                await page.evaluate(async () => {
                    await new Promise((resolve) => {
                        let totalHeight = 0;
                        const distance = 500;
                        const timer = setInterval(() => {
                            const scrollHeight = document.body.scrollHeight;
                            window.scrollBy(0, distance);
                            totalHeight += distance;
                            if(totalHeight >= scrollHeight || totalHeight > 5000){
                                clearInterval(timer);
                                resolve();
                            }
                        }, 100);
                    });
                });

                const data = await page.content();

                if (
                    data.includes('api-services-support@amazon.com') ||
                    data.includes('Enter the characters you see below') ||
                    data.includes('Type the characters you see in this image') ||
                    data.includes('bm-verify') ||
                    data.includes('interstitial')
                ) {
                    console.error('[Amazon] ⚠️ Anti-Bot/CAPTCHA challenge detected on page ' + pageNum);
                    break; // Stop fetching more pages if blocked
                }

                const $ = cheerio.load(data);
                const rawProducts = [];

                // ── Step 1: Collect raw results ──────────────────────────────────────
                let resultCount = $('div[data-component-type="s-search-result"]').length;
                console.log(`[Amazon Debug] Loaded HTML for Page ${pageNum}. Found ${resultCount} search result divs.`);
                
                $('div[data-component-type="s-search-result"]').each((i, el) => {
                    if (rawProducts.length >= 60) return false;

                    const asin = $(el).attr('data-asin');
                    if (!asin) return;
                    const url = `https://www.amazon.in/dp/${asin}`;

                    // Title
                    const spanTexts = [];
                    $(el).find('h2 span').each((_, span) => {
                        const t = $(span).text().trim();
                        if (t && !/sponsored/i.test(t)) spanTexts.push(t);
                    });
                    let title = spanTexts.join(' ').replace(/\s+/g, ' ').trim();
                    if (!title || title.length < 5) {
                        title = $(el).find('h2').text().replace(/^(Sponsored\s*)+/gi, '').replace(/\s+/g, ' ').trim();
                    }
                    if (!title || title.length < 5) return;

                    // Price
                    const { currentPrice, originalPrice } = extractAmazonPrices($, el);
                    if (!currentPrice) return;

                    const image = $(el).find('img.s-image').attr('src') || '';
                    const ratingStr = $(el).find('.a-icon-alt').first().text().trim();
                    const rating = ratingStr ? parseFloat(ratingStr.split(' ')[0]) : 4.0;
                    const discountPercentage = originalPrice > currentPrice
                        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
                        : 0;

                    rawProducts.push({ title, currentPrice, originalPrice, discountPercentage, rating, image, url, source: 'Amazon' });
                });

                console.log(`[Amazon Debug] Number of products extracted on Page ${pageNum}: ${rawProducts.length}`);
                if (rawProducts.length > 0) {
                    console.log(`[Amazon Debug] First product title on Page ${pageNum}: ${rawProducts[0].title}`);
                    console.log(`[Amazon Debug] First product price on Page ${pageNum}: ${rawProducts[0].currentPrice}`);
                }

                // ── Step 2: Validate — strict AND filtering ───────────────────────────
                for (const p of rawProducts) {
                    let keep = true;
                    let reason = 'category bypass';

                    const lowerUrl = p.url.toLowerCase();
                    const isSearchUrl = lowerUrl.includes('/search') || lowerUrl.includes('?q=') || lowerUrl.includes('query=');

                    if (isSearchUrl) {
                        keep = false;
                        reason = 'rejected due to search URL';
                    } else if (!isCategory) {
                        const validation = validateProduct(p.title, parsedQuery, primaryModelToken, requiredModelTokens, query);
                        keep = validation.keep;
                        reason = validation.reason;
                        if (!keep) console.log(`[Amazon Debug] Rejected: "${p.title}" - Reason: ${reason}`);
                    }

                    // To prevent duplicates across pages
                    const isDuplicate = accepted.some(acc => acc.url === p.url);

                    if (keep && !isDuplicate) {
                        accepted.push(p);
                        if (accepted.length >= 12) break;
                    } else if (!keep) {
                        rejected.push({ title: p.title, reason });
                    }
                }

                // If we found at least 5 products, we don't need to fetch the next page
                if (accepted.length >= 5) {
                    break;
                }
            }

        } catch (e) {
            console.error('[Amazon] ⚠️ Puppeteer fetch error:', e.message);
        } finally {
            if (browser) await browser.close();
        }

        return accepted;

    } catch (error) {
        console.warn('[Amazon] ❌ Scrape Error:', error.message);
        return [];
    }
};

module.exports = scrapeAmazon;
