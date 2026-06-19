/**
 * searchEngine.js  (v3 — strict relevance)
 *
 * Scoring weights (sum = 100):
 *   Brand match     — 50 pts  (HARD-required when brand detected in query)
 *   Series match    — 30 pts  (e.g. "iphone" in title)
 *   Model match     — 15 pts  (e.g. "15" in title)
 *   Storage match   —  5 pts
 *
 * Key rules:
 *  • AND-logic: every query token must appear in the product title.
 *    A product matching only ONE of ["iphone", "15"] is NOT an exact match.
 *  • Brand lock: if the query contains a detected brand, products from
 *    a DIFFERENT brand are excluded from exact matches entirely.
 *  • Scrapers ARE filtered — Amazon/Flipkart sometimes include sponsored
 *    or unrelated products; we must re-score and filter everything.
 *  • Results are split into exactMatches / similar / related sections.
 */

const stringSimilarity = require('string-similarity');
const { parseProductTitle, parseQuery } = require('./productParser');
const { tokenizeQuery } = require('./queryNormalizer');
const { calculateRelevance, groupProducts, isAccessory } = require('./ProductMatcher');

// ─── Weights ──────────────────────────────────────────────────────────────────
const W = {
    BRAND:   50,
    SERIES:  30,
    MODEL:   15,
    STORAGE:  5,
};

// Minimum scores for section membership
const EXACT_MIN_SCORE   = 55;   // brand+series match or better
const SIMILAR_MIN_SCORE = 25;   // same brand/series, different variant
// Anything below SIMILAR_MIN_SCORE goes to "related" (or is dropped)

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise a string for matching: lowercase, strip punctuation, collapse spaces.
 */
function norm(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * True if `needle` appears as a whole word inside `haystack`.
 * Right-side anchor excludes dot — prevents "15" matching "15.40 cm".
 */
function wordIncludes(haystack, needle) {
    if (!haystack || !needle) return false;
    const h = norm(haystack);
    const n = norm(needle);
    const re = new RegExp(`(?:^|[^a-z0-9])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[^a-z0-9.]|$)`);
    return re.test(h);
}

/**
 * 0-1 field similarity score.
 */
function fieldScore(queryVal, productVal) {
    if (!queryVal || !productVal) return 0;
    const q = norm(queryVal);
    const p = norm(productVal);
    if (!q || !p) return 0;
    if (p === q) return 1;
    if (p.includes(q) || q.includes(p)) return 0.9;
    return stringSimilarity.compareTwoStrings(q, p);
}

// ─── AND-token check ──────────────────────────────────────────────────────────

/**
 * Check that EVERY query token appears in the product title as a whole word.
 * This is the core AND-logic gate.
 *
 * Uses whole-word boundary matching (not substring) to prevent false positives.
 * e.g. token "15" should NOT match "iphone 150" or "iphone 17e 512GB" even if
 * "1" and "5" appear somewhere.
 *
 * Returns an object:
 *  { allMatch: bool, matchedCount: number, totalTokens: number }
 */
function andTokenCheck(queryTokens, productTitle) {
    const normTitle = norm(productTitle);
    let matchedCount = 0;
    for (const token of queryTokens) {
        const normToken = norm(token);
        if (!normToken) continue;
        // Use word-boundary regex, not includes() — prevents "15" matching "150"
        const re = new RegExp(`(?:^|[^a-z0-9])${normToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[^a-z0-9]|$)`);
        if (re.test(normTitle)) {
            matchedCount++;
        }
    }
    return {
        allMatch: matchedCount === queryTokens.length,
        matchedCount,
        totalTokens: queryTokens.length,
    };
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Score a single product 0-100 against a parsed query.
 */
function scoreProduct(parsedQuery, parsedProduct) {
    // Brand
    let brandScore = 0;
    if (parsedQuery.brand && parsedProduct.brand) {
        brandScore = fieldScore(parsedQuery.brand, parsedProduct.brand);
    } else if (parsedQuery.brand) {
        brandScore = wordIncludes(parsedProduct.keywords.join(' '), parsedQuery.brand) ? 0.5 : 0;
    } else if (!parsedQuery.brand) {
        brandScore = 0.5;
    }

    // Series (e.g. "iphone", "galaxy")
    let seriesScore = 0;
    if (parsedQuery.series && parsedProduct.series) {
        seriesScore = fieldScore(parsedQuery.series, parsedProduct.series);
    } else if (parsedQuery.series) {
        seriesScore = wordIncludes(parsedProduct.keywords.join(' '), parsedQuery.series) ? 0.5 : 0;
    } else if (!parsedQuery.series) {
        seriesScore = 0.5;
    }

    // ── Model number: hard mismatch gate ────────────────────────────────────
    // If the query contains a numeric model (e.g. "15") and the product's
    // parsed model contains a DIFFERENT numeric identifier (e.g. "17e"),
    // force model score to 0. This prevents "iPhone 17e" from scoring high
    // when searching "iphone 15" just because they are both iPhones.
    let modelScore = 0;
    if (parsedQuery.model && parsedProduct.model) {
        // Extract the primary numeric token from each side
        const queryNumToken   = getFirstNumericToken(parsedQuery.model);
        const productNumToken = getFirstNumericToken(parsedProduct.model);

        if (queryNumToken && productNumToken && queryNumToken !== productNumToken) {
            // The query specifies a different model number → hard zero
            modelScore = 0;
        } else {
            modelScore = fieldScore(parsedQuery.model, parsedProduct.model);
        }
    } else if (!parsedQuery.model) {
        modelScore = 0.5;
    }

    // Storage
    let storageScore = 0;
    if (parsedQuery.storage && parsedProduct.storage) {
        storageScore = parsedProduct.storage === parsedQuery.storage ? 1 : 0;
    } else if (!parsedQuery.storage) {
        storageScore = 0.5;
    }

    const total =
        brandScore   * W.BRAND   +
        seriesScore  * W.SERIES  +
        modelScore   * W.MODEL   +
        storageScore * W.STORAGE;

    return Math.round(total * 10) / 10;
}

/**
 * Extract the first token containing a digit from a model string.
 * e.g. "iphone 15 pro" → "15"
 *      "galaxy s24 ultra" → "s24"
 *      "iphone" → null
 */
function getFirstNumericToken(modelStr) {
    if (!modelStr) return null;
    for (const token of norm(modelStr).split(' ')) {
        if (token && /\d/.test(token)) return token;
    }
    return null;
}

// ─── Brand-lock check ─────────────────────────────────────────────────────────

/**
 * If the query contains a specific brand, products from a DIFFERENT brand
 * are hard-excluded from exact matches.
 * Returns true if the product PASSES the brand lock (can be an exact match).
 */
function passesBrandLock(parsedQuery, parsedProduct, productTitle) {
    if (!parsedQuery.brand) return true; // no brand in query → no lock

    const qBrand = parsedQuery.brand.toLowerCase();
    const pBrand = (parsedProduct.brand || '').toLowerCase();
    const titleLower = norm(productTitle);

    // The product's brand must match the queried brand
    if (pBrand && pBrand !== qBrand) return false;

    // If brand wasn't detected in the product title, check the raw title
    if (!pBrand && !titleLower.includes(qBrand)) return false;

    return true;
}

// ─── Main ranking function ────────────────────────────────────────────────────

function rankResults(groupedProducts, normalizedQuery) {
    const parsedQuery = parseQuery(normalizedQuery);
    const queryTokens = tokenizeQuery(normalizedQuery);

    const exactMatches = [];
    const similar      = [];
    const related      = [];

    for (const group of groupedProducts) {
        const title = group.title || '';
        
        // Filter out accessories if the query didn't ask for one
        if (!isAccessory(normalizedQuery) && isAccessory(title)) {
            continue; 
        }

        const score = calculateRelevance(normalizedQuery, title);

        // Rating micro-bonus (max +2 pts)
        const ratingBonus = group.rating ? Math.min(group.rating * 0.4, 2) : 0;
        const finalScore  = score + ratingBonus;

        const enriched = { ...group, searchScore: finalScore };

        // Requirement: Only show products with score > 50
        if (finalScore > 50) {
            if (finalScore >= 100) {
                exactMatches.push(enriched);
            } else if (finalScore >= 80) {
                similar.push(enriched);
            } else {
                related.push(enriched);
            }
        }
    }

    // Sort each section by score descending
    const sortByScore = (a, b) => b.searchScore - a.searchScore;
    exactMatches.sort(sortByScore);
    similar.sort(sortByScore);
    related.sort(sortByScore);

    return {
        exactMatches,
        similar,
        related,
        all: [...exactMatches, ...similar, ...related],
    };
}

// ─── Cross-retailer merge ─────────────────────────────────────────────────────

/**
 * Check if two products are likely the same item from different stores.
 */
function areSameProduct(a, b, titleA, titleB) {
    if (a.brand && b.brand && a.brand !== b.brand) return false;
    const titleSim = stringSimilarity.compareTwoStrings(
        (titleA || '').toLowerCase(),
        (titleB || '').toLowerCase()
    );
    if (titleSim >= 0.82) return true;
    if (a.series && b.series && a.series === b.series &&
        a.model  && b.model  && fieldScore(a.model, b.model) > 0.8 &&
        a.storage === b.storage) {
        return true;
    }
    return false;
}

function mergeProducts(products) {
    // Deprecated in favor of ProductMatcher.groupProducts, but keeping interface intact.
    return groupProducts(products);
}

// ─── Did-you-mean ─────────────────────────────────────────────────────────────

function getDidYouMean(query, products) {
    if (products.length === 0) return [];
    const titles = products.map(p => p.title).filter(Boolean);
    if (titles.length === 0) return [];
    const { ratings } = stringSimilarity.findBestMatch(
        query.toLowerCase(),
        titles.map(t => t.toLowerCase())
    );
    return ratings
        .filter(r => r.rating > 0.3)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3)
        .map(r => {
            const idx = titles.findIndex(t => t.toLowerCase() === r.target);
            return idx >= 0 ? titles[idx] : null;
        })
        .filter(Boolean);
}

// Legacy compat
function normalizeTitle(title) {
    if (!title) return '';
    return title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

module.exports = {
    rankResults,
    mergeProducts,
    getDidYouMean,
    scoreProduct,
    normalizeTitle,
    andTokenCheck,
    passesBrandLock,
};
