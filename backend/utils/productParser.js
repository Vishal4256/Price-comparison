/**
 * productParser.js
 *
 * Parses raw product title strings into structured fields:
 *   brand, model, storage, ram, color, series
 *
 * Example:
 *   "Apple iPhone 15 Pro Max (256GB) Blue Titanium"
 *   → { brand: "apple", series: "iphone", model: "15 pro max", storage: "256gb", color: "blue titanium" }
 */

// ─── Known brands (lowercase) ───────────────────────────────────────────────
const BRANDS = [
    'apple', 'samsung', 'oneplus', 'xiaomi', 'redmi', 'poco', 'realme',
    'oppo', 'vivo', 'nokia', 'motorola', 'moto', 'lg', 'sony', 'asus',
    'lenovo', 'acer', 'hp', 'dell', 'microsoft', 'google', 'huawei',
    'honor', 'infinix', 'tecno', 'iqoo', 'nothing', 'boat', 'jbl',
    'bose', 'sennheiser', 'skullcandy', 'noise', 'ptron', 'zebronics',
    'logitech', 'corsair', 'razer', 'steelseries', 'canon', 'nikon',
    'fujifilm', 'gopro', 'anker', 'mi', 'agaro', 'boAt',
];

// ─── Known colors ────────────────────────────────────────────────────────────
const COLORS = [
    'black', 'white', 'blue', 'red', 'green', 'gold', 'silver', 'gray',
    'grey', 'purple', 'violet', 'pink', 'orange', 'yellow', 'brown',
    'titanium', 'natural', 'midnight', 'starlight', 'space',
    'phantom', 'prism', 'aurora', 'onyx', 'jade', 'lavender',
    'aqua', 'coral', 'cream', 'graphite', 'ivory', 'rose', 'burgundy',
    'teal', 'cyan', 'azure', 'carbon', 'shadow', 'sage', 'emerald',
    // multi-word colors handled by adjacent detection
    'blue titanium', 'black titanium', 'white titanium', 'natural titanium',
    'phantom black', 'phantom white', 'phantom gray', 'cloud white',
    'space gray', 'space black', 'rose gold', 'midnight green', 'product red',
];

// ─── Regex patterns ──────────────────────────────────────────────────────────
const STORAGE_REGEX  = /\b(\d+\s*(?:gb|tb|mb))\b/gi;
const RAM_REGEX      = /\b(\d+\s*gb)\s+(?:ram|lpddr\d?)/gi;
const NUMBERS_REGEX  = /\b(\d+(?:\.\d+)?)\b/g;

/**
 * Parse a product title into structured fields.
 *
 * @param {string} title - Raw product title
 * @returns {{ brand, series, model, storage, ram, color, keywords }}
 */
function parseProductTitle(title) {
    if (!title || typeof title !== 'string') {
        return { brand: '', series: '', model: '', storage: '', ram: '', color: '', keywords: [] };
    }

    const lower = title.toLowerCase().replace(/[()[\]]/g, ' ').replace(/\s+/g, ' ').trim();

    // ── Extract brand ───────────────────────────────────────────────────────
    let brand = '';
    let remainingAfterBrand = lower;
    for (const b of BRANDS) {
        const pattern = new RegExp(`\\b${b}\\b`, 'i');
        if (pattern.test(lower)) {
            brand = b;
            remainingAfterBrand = lower.replace(pattern, '').replace(/\s+/g, ' ').trim();
            break;
        }
    }

    // ── Extract storage (e.g. 256GB, 1TB) ──────────────────────────────────
    const storageMatches = [...lower.matchAll(STORAGE_REGEX)].map(m => m[1].toLowerCase().replace(/\s/g, ''));
    // Pick the largest-sounding one for storage (the last numeric match is often storage in phones)
    const storage = storageMatches.length > 0 ? storageMatches[storageMatches.length - 1] : '';

    // ── Extract RAM (e.g. 8GB RAM) ──────────────────────────────────────────
    const ramMatch = lower.match(RAM_REGEX);
    const ram = ramMatch ? ramMatch[0].replace(/\s+/g, '').toLowerCase() : '';

    // ── Extract color ───────────────────────────────────────────────────────
    let color = '';
    // Check multi-word colors first (longer phrases take priority)
    const sortedColors = [...COLORS].sort((a, b) => b.length - a.length);
    for (const c of sortedColors) {
        if (lower.includes(c)) {
            color = c;
            break;
        }
    }

    // ── Extract series + model ──────────────────────────────────────────────
    // Remove brand, storage, color from the remaining text to isolate model tokens
    let modelText = lower;
    if (brand)   modelText = modelText.replace(new RegExp(`\\b${brand}\\b`, 'i'), '');
    if (storage) modelText = modelText.replace(new RegExp(storage, 'i'), '');
    if (color)   modelText = modelText.replace(new RegExp(color, 'i'), '');
    if (ram)     modelText = modelText.replace(new RegExp(ram, 'i'), '');
    // Remove leftover storage patterns
    modelText = modelText.replace(STORAGE_REGEX, '').replace(/\s+/g, ' ').trim();

    // Series = first word of model text (e.g. "iphone", "galaxy", "airpods")
    const modelTokens = modelText.split(' ').filter(t => t.length > 0);
    const series = modelTokens[0] || '';
    const model  = modelTokens.join(' ').trim();

    // ── Keywords: all meaningful tokens from the title ──────────────────────
    const keywords = lower
        .split(' ')
        .filter(w => w.length >= 2)
        .map(w => w.replace(/[^a-z0-9]/g, ''))
        .filter(w => w.length >= 2);

    return { brand, series, model, storage, ram, color, keywords };
}

/**
 * Parse a user query the same way as a product title,
 * so we can compare structured fields between query and products.
 */
function parseQuery(normalizedQuery) {
    return parseProductTitle(normalizedQuery);
}

function normalizeProductTitle(title) {
    if (!title) return '';
    const parsed = parseProductTitle(title);
    
    // Strict grouping: brand + model + storage + color
    const parts = [];
    if (parsed.brand) parts.push(parsed.brand);
    if (parsed.model) parts.push(parsed.model);
    if (parsed.storage) parts.push(parsed.storage);
    if (parsed.color) parts.push(parsed.color);
    
    if (parts.length > 0) {
        return parts.join(' ').replace(/\s+/g, ' ').trim().toLowerCase();
    }
    
    // Fallback if parsing completely fails (unlikely for phones, but possible for generic items)
    let normalized = title.toLowerCase();
    normalized = normalized.replace(/[()[\]{},]/g, ' ');
    normalized = normalized.replace(/(\d+)\s*(gb|tb|mb)\b/gi, '$1$2');
    const safeFluffWords = [
        'smartphone', 'mobile', 'phone', 'new launch', 'latest', 'renewed', 'refurbished',
        'bestseller', 'sale', 'deal', 'offer', 'discount', 'free delivery'
    ];
    for (const fw of safeFluffWords) {
        normalized = normalized.replace(new RegExp(`\\b${fw}\\b`, 'gi'), ' ');
    }
    return normalized.replace(/\s+/g, ' ').trim();
}

module.exports = { parseProductTitle, parseQuery, normalizeProductTitle };
