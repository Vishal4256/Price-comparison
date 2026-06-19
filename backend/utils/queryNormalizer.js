/**
 * queryNormalizer.js
 *
 * Cleans and expands user search queries before passing them to scrapers.
 * Handles typos, abbreviations, missing spaces, and common shorthand.
 */

// ─── Word-level typo correction ──────────────────────────────────────────────
const TYPO_MAP = {
    'iphon':     'iphone',
    'iphoen':    'iphone',
    'iphnoe':    'iphone',
    'ipone':     'iphone',
    'samung':    'samsung',
    'samsng':    'samsung',
    'samsugn':   'samsung',
    'mackbook':  'macbook',
    'macbok':    'macbook',
    'lenvo':     'lenovo',
    'lenvoo':    'lenovo',
    'canoon':    'canon',
    'bluethoot': 'bluetooth',
    'bluethot':  'bluetooth',
};

// ─── Brand/model abbreviation expansions ────────────────────────────────────
// Run sequentially; each is applied to the WHOLE string ONCE.
// Listed from most-specific to least-specific to avoid cascade.
const EXPANSIONS = [
    // ── iPhone ──
    // iphon15 / iphone15 (no space) → iphone 15
    [/\biphon?e?(\d{2})\b/gi,  'iphone $1'],
    // ipad9 → ipad 9
    [/\bipad(\d)\b/gi,          'ipad $1'],
    // macbook variants
    [/\bmacbookpro\b/gi,        'macbook pro'],
    [/\bmacbookair\b/gi,        'macbook air'],
    [/\bmac\s+air\b/gi,         'macbook air'],
    [/\bmac\s+pro\b/gi,         'macbook pro'],
    [/\bmac\s+mini\b/gi,        'mac mini'],

    // ── Samsung (most specific first, single-pass) ──
    // already full: "samsung galaxy s24 ultra" — keep as-is (no pattern needed)
    // "samsung s24 ultra" → expand
    [/\bsamsung\s+s(\d{2})\s*ultra\b/gi,   'samsung galaxy s$1 ultra'],
    [/\bsamsung\s+s(\d{2})\s*\+/gi,        'samsung galaxy s$1 plus'],
    [/\bsamsung\s+s(\d{2})\b/gi,           'samsung galaxy s$1'],
    // "galaxy s24 ultra" → expand
    [/\bgalaxy\s+s(\d{2})\s*ultra\b/gi,    'samsung galaxy s$1 ultra'],
    [/\bgalaxy\s+s(\d{2})\s*\+/gi,         'samsung galaxy s$1 plus'],
    [/\bgalaxy\s+s(\d{2})\b/gi,            'samsung galaxy s$1'],
    // Bare "s24ultra" / "s24+" / "s24" — only when standalone word
    [/\bs(\d{2})ultra\b/gi,                'samsung galaxy s$1 ultra'],
    [/\bs(\d{2})\+/gi,                     'samsung galaxy s$1 plus'],
    // "s24" standalone — only after no samsung/galaxy in string yet (handled by guard below)

    // ── OnePlus ──
    [/\b1\+(\d)/gi,             'oneplus $1'],
    [/\boneplus(\d)/gi,         'oneplus $1'],

    // ── Google Pixel ──
    [/\bpixel(\d)\b/gi,         'google pixel $1'],

    // ── Storage normalisation ──
    [/\b(\d+)\s*g\s*b\b/gi,     '$1gb'],
    [/\b(\d+)\s*t\s*b\b/gi,     '$1tb'],
];

/**
 * Normalize a raw user query into a clean, expanded search string.
 */
function normalizeQuery(rawQuery) {
    if (!rawQuery || typeof rawQuery !== 'string') return '';

    let q = rawQuery
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s+]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // ── Step 1: word-level typo correction ──────────────────────────────────
    q = q.split(' ').map(w => TYPO_MAP[w] || w).join(' ');

    // ── Step 2: apply expansions ONE by ONE (no re-run after each) ──────────
    for (const [pattern, replacement] of EXPANSIONS) {
        q = q.replace(pattern, replacement);
        // Collapse any duplicate words introduced by the expansion
        // e.g. "samsung samsung galaxy" → "samsung galaxy"
        q = q.replace(/\b(\w+)\s+\1\b/g, '$1');
        q = q.replace(/\s+/g, ' ').trim();
    }

    // ── Step 3: handle bare "s24" (only if no "samsung" or "galaxy" yet) ────
    if (!/\bsamsung\b|\bgalaxy\b/i.test(q)) {
        q = q.replace(/\bs(\d{2})\b/gi, 'samsung galaxy s$1');
    }

    // Final cleanup
    q = q.replace(/\s+/g, ' ').trim();

    return q;
}

/**
 * Tokenize a normalized query into meaningful words (length ≥ 2).
 */
function tokenizeQuery(normalizedQuery) {
    const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'of', 'in', 'on', 'at', 'by', 'to']);
    return (normalizedQuery || '')
        .split(' ')
        .filter(w => w.length >= 2 && !STOP_WORDS.has(w));
}

module.exports = { normalizeQuery, tokenizeQuery };
