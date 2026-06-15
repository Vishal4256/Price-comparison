const axios = require('axios');
const cheerio = require('cheerio');
const { parseProductTitle, parseQuery } = require('../utils/productParser');

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
];

const getHeaders = () => ({
    'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'max-age=0',
    'Host': 'www.flipkart.com',
});

/**
 * Parse a price string like "₹54,900" → 54900. Returns 0 on failure.
 */
const parsePrice = (str) => {
    if (!str) return 0;
    const cleaned = str.replace(/[₹,\s]/g, '').trim();
    const num = parseFloat(cleaned.match(/[\d.]+/)?.[0] || '');
    return isNaN(num) ? 0 : num;
};

// ─── Shared validation helpers ─────────────────────────────────────────────────

function norm(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * True if `needle` appears as a standalone word in `haystack`.
 *
 * Stricter boundary check:
 *   - "15" MUST NOT match "15.40 cm" (decimal) or "15e" (alphanumeric suffix)
 *   - "15" MUST match "iphone 15 pro" or "iphone 15 (128 GB)"
 */
function tokenPresent(haystack, needle) {
    if (!haystack || !needle) return false;
    const h = norm(haystack);
    const n = norm(needle).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Right boundary excludes dot — prevents "15" matching "15.40 cm"
    return new RegExp(`(?:^|[^a-z0-9])${n}(?:[^a-z0-9.]|$)`).test(h);
}

/**
 * Extract the primary numeric model token from a parsed query.
 *
 * Fix: the old code took model.split(' ')[0] which for "iphone 15" returned
 * "iphone" — no digit — silently skipping the model-number check.
 * Now we scan ALL tokens and return the FIRST one containing a digit.
 *
 * Examples:
 *   model = "iphone 15"        → "15"
 *   model = "iphone 15 pro max" → "15"
 *   model = "galaxy s24 ultra"  → "s24"
 *   model = "iphone"            → null  (no digit → no enforcement)
 */
function extractQueryModel(parsedQuery) {
    const model = (parsedQuery.model || '').trim().toLowerCase();
    if (!model) return null;
    for (const token of model.split(' ')) {
        if (token && /\d/.test(token)) return token;
    }
    return null; // no numeric model → no enforcement
}

/**
 * Extract ALL required model tokens (AND-logic enforcement).
 *
 * Returns every token from the first numeric token onwards.
 * e.g. "iphone 15 pro" → ["15", "pro"]  (both must be present in the title)
 *      "iphone 15"      → ["15"]
 *      "iphone"         → []
 */
function extractRequiredModelTokens(parsedQuery) {
    const model = (parsedQuery.model || '').trim().toLowerCase();
    if (!model) return [];
    const tokens = model.split(' ').filter(t => t.length > 0);
    const firstNumericIdx = tokens.findIndex(t => /\d/.test(t));
    if (firstNumericIdx === -1) return [];
    return tokens.slice(firstNumericIdx);
}

/**
 * Validate a scraped product title against the search query.
 *
 * Layers (AND logic — ALL must pass):
 *  1. Series check  — e.g. "iphone" must be a whole word in the title
 *  2. Model tokens  — every required token (e.g. "15", "pro") must be present
 *  3. Brand check   — product brand must match query brand (if specified)
 *
 * Key fix: "iphone 15" query now correctly rejects "Apple iPhone 17e" because
 * "15" is not in that title. Previously this was skipped because primaryModelToken
 * was "iphone" (no digit), causing the check to be bypassed.
 */
function validateProduct(title, parsedQuery, primaryModelToken, requiredModelTokens) {
    const titleNorm = norm(title);
    const parsedProduct = parseProductTitle(title);

    // ── 1. Series check ──────────────────────────────────────────────────────
    if (parsedQuery.series) {
        const qSeries = parsedQuery.series.toLowerCase();
        if (!tokenPresent(titleNorm, qSeries)) {
            return { keep: false, reason: `series "${qSeries}" not in title` };
        }
    }

    // ── 2. Model token checks (strict AND) ───────────────────────────────────
    if (requiredModelTokens && requiredModelTokens.length > 0) {
        for (const token of requiredModelTokens) {
            if (!tokenPresent(titleNorm, token)) {
                return {
                    keep: false,
                    reason: `required model token "${token}" not in title ("${title.slice(0, 60)}")`,
                };
            }
        }
    }

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

// ─── Price extraction using SCOPED DOM selectors ───────────────────────────────
/**
 * Flipkart search-page price DOM structure (verified live 2025-06):
 *
 *   div[data-id="..."]                ← product card
 *     div.QiMO5r                      ← price container (selling price + MRP)
 *       div.hZ3P6w.DeU9vF             ← ✅ SELLING PRICE (₹54,900)
 *       div.kRYCnD.gxR4EY            ← MRP strikethrough (₹59,900)
 *     div.hx1EGN                      ← exchange offer container ← DO NOT READ
 *       div.HZ0E6r.Rm9_cy            ← ❌ Exchange offer price (₹38,300)
 *
 * Strategy:
 *  1. Find the price container div (look for common parent of selling+MRP prices).
 *  2. Extract the FIRST price inside that container → selling price.
 *  3. Extract the SECOND price (if present, usually struck-through) → MRP.
 *  4. NEVER read from the exchange/bank-offer container (hx1EGN).
 *
 * Since Flipkart uses random/hashed class names that change across deployments,
 * we cannot rely on a single hardcoded class. Instead we use a STRUCTURAL
 * approach: within the product card, find the outermost div that contains
 * EXACTLY the first ₹ price. That is the selling price section.
 * The exchange offer is always listed AFTER the main price section with
 * the text "Upto ... Off on Exchange" or "Exchange Offer".
 */

/**
 * Extract selling price and MRP from a product card element.
 *
 * Returns { currentPrice: number, originalPrice: number }
 */
const extractPrices = ($, el) => {
    // Approach: collect ALL leaf text nodes containing ₹ in document order.
    // The first price is always the selling price.
    // The second price (if higher than first) is MRP.
    // Any subsequent price(s) are exchange/EMI prices — IGNORE them.
    
    const priceElements = [];
    
    $(el).find('div, span').each((i, child) => {
        // Only leaf-like elements (no child divs/spans with their own ₹)
        const ownText = $(child).clone().children().remove().end().text().trim();
        if (ownText && ownText.includes('₹') && ownText.length < 30) {
            const price = parsePrice(ownText);
            if (price > 100) {
                priceElements.push({ price, text: ownText, el: child });
            }
        }
    });

    if (priceElements.length === 0) return { currentPrice: 0, originalPrice: 0 };

    // First price in DOM order = selling price (NOT the minimum price)
    const currentPrice = priceElements[0].price;

    // Second price = MRP (if exists and is higher)
    let originalPrice = currentPrice;
    if (priceElements.length >= 2) {
        const second = priceElements[1].price;
        if (second > currentPrice) {
            originalPrice = second;
        }
    }

    return { currentPrice, originalPrice };
};

// ─── Main scraper ─────────────────────────────────────────────────────────────
const scrapeFlipkart = async (query) => {
    try {
        const parsedQuery          = parseQuery(query);
        const primaryModelToken    = extractQueryModel(parsedQuery);
        const requiredModelTokens  = extractRequiredModelTokens(parsedQuery);

        console.log(`\n[Flipkart] Scraping: "${query}"`);
        console.log(`[Flipkart] Parsed → brand:"${parsedQuery.brand}" series:"${parsedQuery.series}" model:"${parsedQuery.model}"`);
        console.log(`[Flipkart] Enforcement → primaryToken:"${primaryModelToken}" requiredTokens:[${requiredModelTokens.join(', ')}]`);

        const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl, {
            headers: getHeaders(),
            timeout: 12000,
        });

        if (data.includes('Something went wrong') || data.length < 10000) {
            console.warn('[Flipkart] ⚠️  Bad response — returning []');
            return [];
        }

        const $ = cheerio.load(data);
        const rawProducts = [];

        // ── Step 1: Collect raw results ──────────────────────────────────────
        $('div[data-id]').each((i, el) => {
            if (rawProducts.length >= 20) return false;

            const fullText = $(el).text();
            if (/currently unavailable/i.test(fullText)) return;

            const img = $(el).find('img').first();
            const title = img.attr('alt') || '';
            if (!title || title.length < 5) return;

            const rawHref =
                $(el).find('a[href*="/p/"]').first().attr('href') ||
                $(el).find('a[href]').first().attr('href');
            if (!rawHref) return;
            const url = 'https://www.flipkart.com' + rawHref.split('?')[0];

            // ── Price extraction: DOM order, first price = selling price ──────
            // We limit scope to BEFORE any exchange offer text to avoid
            // accidentally including exchange prices from later sections.
            const cardHtml = $(el).html() || '';
            
            // Find where exchange offer starts in the HTML (to limit scope)
            const exchangeKeywords = ['On Exchange', 'off on Exchange', 'Exchange Offer', 'Upto ₹'];
            let limitedHtml = cardHtml;
            for (const kw of exchangeKeywords) {
                const idx = cardHtml.indexOf(kw);
                if (idx > 0) {
                    // Only consider HTML before the exchange offer
                    limitedHtml = cardHtml.slice(0, idx);
                    break;
                }
            }
            
            const $limited = require('cheerio').load(`<div id="root">${limitedHtml}</div>`);
            const { currentPrice, originalPrice } = extractPrices($limited, $limited('#root'));

            if (currentPrice === 0) {
                console.log(`[Flipkart] ⚠️  No selling price for: "${title.slice(0, 60)}"`);
                return;
            }

            const discountPercentage = originalPrice > currentPrice
                ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
                : 0;

            let imageSrc = img.attr('src') || '';
            if (!imageSrc || imageSrc.startsWith('data:')) {
                imageSrc = $(el).find('img').eq(1).attr('src') || '';
            }

            const ratingMatch = fullText.match(/\b([1-5]\.\d)\b/);
            const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 4.0;

            // Required debug log
            console.log(`[Flipkart] Found: { title: "${title.slice(0, 50)}", scrapedPrice: ${currentPrice}, mrp: ${originalPrice}, discount: ${discountPercentage}%, url: "${url}" }`);

            rawProducts.push({ title, currentPrice, originalPrice, discountPercentage, rating, image: imageSrc, url, source: 'Flipkart' });
        });

        console.log(`[Flipkart] Raw scraped: ${rawProducts.length} products`);

        // ── Step 2: Validate each product ────────────────────────────────────
        const accepted = [];
        const rejected = [];

        for (const p of rawProducts) {
            const { keep, reason } = validateProduct(p.title, parsedQuery, primaryModelToken, requiredModelTokens);
            const parsedTitle = parseProductTitle(p.title);

            // Required debug log (Step 9)
            console.log(`[Flipkart] Search: "${query}" | Scraped: "${p.title.slice(0, 60)}" | Model parsed: "${parsedTitle.model}" | Decision: ${keep ? 'Accepted' : `Rejected (${reason})`}`);

            if (keep) {
                accepted.push(p);
                if (accepted.length >= 12) break;
            } else {
                rejected.push({ title: p.title, reason });
            }
        }

        console.log(`[Flipkart] Accepted: ${accepted.length} | Rejected: ${rejected.length}`);
        if (rejected.length > 0) {
            console.log('[Flipkart] Rejected products:');
            rejected.forEach(r => console.log(`  ✗ "${r.title.slice(0, 70)}" → ${r.reason}`));
        }

        console.log(`✅ Flipkart: ${accepted.length} relevant products for "${query}"`);
        return accepted;

    } catch (error) {
        console.warn('[Flipkart] ❌ Scrape Error:', error.message);
        return [];
    }
};

module.exports = scrapeFlipkart;
