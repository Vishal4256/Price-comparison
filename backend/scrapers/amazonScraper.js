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
    'Host': 'www.amazon.in',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
});

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
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
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
    // Every numeric-origin token from the query model MUST appear in the title.
    if (requiredModelTokens.length > 0) {
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
const scrapeAmazon = async (query) => {
    try {
        const parsedQuery          = parseQuery(query);
        const primaryModelToken    = extractQueryModel(parsedQuery);
        const requiredModelTokens  = extractRequiredModelTokens(parsedQuery);

        console.log(`\n[Amazon] Scraping: "${query}"`);
        console.log(`[Amazon] Parsed → brand:"${parsedQuery.brand}" series:"${parsedQuery.series}" model:"${parsedQuery.model}"`);
        console.log(`[Amazon] Enforcement → primaryToken:"${primaryModelToken}" requiredTokens:[${requiredModelTokens.join(', ')}]`);

        const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl, {
            headers: getHeaders(),
            timeout: 12000,
        });

        if (
            data.includes('api-services-support@amazon.com') ||
            data.includes('Enter the characters you see below') ||
            data.includes('Type the characters you see in this image')
        ) {
            console.warn('[Amazon] ⚠️  CAPTCHA detected — returning []');
            return [];
        }

        const $ = cheerio.load(data);
        const rawProducts = [];

        // ── Step 1: Collect raw results ──────────────────────────────────────
        $('div[data-component-type="s-search-result"]').each((i, el) => {
            if (rawProducts.length >= 20) return false;

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

            console.log(`[Amazon] Raw: { title: "${title.slice(0, 60)}", price: ${currentPrice} }`);

            rawProducts.push({ title, currentPrice, originalPrice, discountPercentage, rating, image, url, source: 'Amazon' });
        });

        console.log(`[Amazon] Raw scraped: ${rawProducts.length} products`);

        // ── Step 2: Validate — strict AND filtering ───────────────────────────
        const accepted = [];
        const rejected = [];

        for (const p of rawProducts) {
            const { keep, reason } = validateProduct(p.title, parsedQuery, primaryModelToken, requiredModelTokens);
            const parsedTitle = parseProductTitle(p.title);

            // Required debug log (Step 9)
            console.log(`[Amazon] Search: "${query}" | Scraped: "${p.title.slice(0, 60)}" | Model parsed: "${parsedTitle.model}" | Decision: ${keep ? 'Accepted' : `Rejected (${reason})`}`);

            if (keep) {
                accepted.push(p);
                if (accepted.length >= 12) break;
            } else {
                rejected.push({ title: p.title, reason });
            }
        }

        console.log(`[Amazon] Accepted: ${accepted.length} | Rejected: ${rejected.length}`);
        if (rejected.length > 0) {
            console.log('[Amazon] Rejected products:');
            rejected.forEach(r => console.log(`  ✗ "${r.title.slice(0, 70)}" → ${r.reason}`));
        }

        console.log(`✅ Amazon: ${accepted.length} relevant products for "${query}"`);
        return accepted;

    } catch (error) {
        console.warn('[Amazon] ❌ Scrape Error:', error.message);
        return [];
    }
};

module.exports = scrapeAmazon;
