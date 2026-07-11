const axios = require('axios');
const cheerio = require('cheerio');
const { parseProductTitle, parseQuery } = require('../utils/productParser');
const { isAccessory } = require('../utils/ProductMatcher');

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
 * Parse a price string like "₹54,900.00" → 54900. Returns 0 on failure.
 */
const parsePrice = (str) => {
    if (!str) return 0;
    const noDecimal = str.split('.')[0];
    const cleaned = noDecimal.replace(/[^\d]/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 0 : num;
};

// ─── Shared validation helpers ─────────────────────────────────────────────────

function norm(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9.\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * True if `needle` appears as a standalone word in `haystack`.
 */
function tokenPresent(haystack, needle) {
    if (!haystack || !needle) return false;
    const h = norm(haystack);
    const n = norm(needle).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:^|[^a-z0-9])${n}(?:[^a-z0-9.]|$)`).test(h);
}

function extractQueryModel(parsedQuery) {
    const model = (parsedQuery.model || '').trim().toLowerCase();
    if (!model) return null;
    for (const token of model.split(' ')) {
        if (token && /\d/.test(token)) return token;
    }
    return null;
}

function extractRequiredModelTokens(parsedQuery) {
    const model = (parsedQuery.model || '').trim().toLowerCase();
    if (!model) return [];
    const tokens = model.split(' ').filter(t => t.length > 0);
    const firstNumericIdx = tokens.findIndex(t => /\d/.test(t));
    if (firstNumericIdx === -1) return [];
    return tokens.slice(firstNumericIdx);
}

function validateProduct(title, parsedQuery, primaryModelToken, requiredModelTokens, rawQuery) {
    const titleNorm = norm(title);
    const parsedProduct = parseProductTitle(title);

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
 * Extract selling price and MRP from a product card element.
 * Returns { currentPrice: number, originalPrice: number }
 */
const extractPrices = ($, el) => {
    let currentPrice = 0;
    const selectors = ['._30jeq3', '.Nx9bqj', "div[class*='price']"];
    
    // Priority selector checking for actual selling price
    for (const sel of selectors) {
        // We find all matches of this selector in the element
        const matches = $(el).find(sel);
        for (let i = 0; i < matches.length; i++) {
            const text = $(matches[i]).text().trim();
            if (text && text.includes('₹')) {
                const price = parsePrice(text);
                // The main selling price is usually the first valid one we encounter that is > 100
                // and we ignore exchange offers text because we already scoped the HTML before passing it here
                if (price > 100) {
                    currentPrice = price;
                    break;
                }
            }
        }
        if (currentPrice > 0) break;
    }

    // Fallback: collect ALL leaf text nodes containing ₹ in document order.
    if (currentPrice === 0) {
        const priceElements = [];
        $(el).find('div, span').each((i, child) => {
            const ownText = $(child).clone().children().remove().end().text().trim();
            if (ownText && ownText.includes('₹') && ownText.length < 30) {
                const price = parsePrice(ownText);
                if (price > 100) {
                    priceElements.push({ price, text: ownText, el: child });
                }
            }
        });
        if (priceElements.length > 0) {
            currentPrice = priceElements[0].price;
        }
    }

    let originalPrice = currentPrice;
    
    // Attempt to extract MRP from struck-through text if it exists
    $(el).find('div, span, strike, s').each((i, child) => {
        const text = $(child).text().trim();
        if (text.includes('₹')) {
            const price = parsePrice(text);
            if (price > currentPrice) {
                originalPrice = Math.max(originalPrice, price);
            }
        }
    });

    return { currentPrice, originalPrice };
};

// ─── Main scraper ─────────────────────────────────────────────────────────────
const scrapeFlipkart = async (query, isCategory = false) => {
    try {
        const parsedQuery          = parseQuery(query);
        const primaryModelToken    = extractQueryModel(parsedQuery);
        const requiredModelTokens  = extractRequiredModelTokens(parsedQuery);

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
        $('div[data-id], div._75nlfW, div.tUxRFH, div._1xHGtK').each((i, el) => {
            if (rawProducts.length >= 60) return false;

            const fullText = $(el).text();
            if (/currently unavailable/i.test(fullText)) return;

            const img = $(el).find('img').first();
            let title = img.attr('alt') || '';
            if (!title || title.length < 5) {
                // Apparel and fashion items often have empty alt attributes.
                title = $(el).find('a').text().split('₹')[0].trim();
            }
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

            rawProducts.push({ title, currentPrice, originalPrice, discountPercentage, rating, image: imageSrc, url, source: 'Flipkart' });
        });

        // ── Step 2: Validate each product ────────────────────────────────────
        const accepted = [];
        const rejected = [];

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
            }

            const parsedTitle = parseProductTitle(p.title);

            if (keep) {
                accepted.push(p);
                if (accepted.length >= 12) break;
            } else {
                rejected.push({ title: p.title, reason });
            }
        }

        return accepted;

    } catch (error) {
        console.warn('[Flipkart] ❌ Scrape Error:', error.message);
        return [];
    }
};

module.exports = scrapeFlipkart;
