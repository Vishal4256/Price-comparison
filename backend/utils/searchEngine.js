const stringSimilarity = require('string-similarity');

/**
 * Normalizes product titles for better matching by removing common junk and standardizing format.
 */
const normalizeTitle = (title) => {
    if (!title) return '';
    return title
        .toLowerCase()
        .replace(/\b\d+\s*(gb|tb|mb|ram|rom)\b/gi, '') // Remove sizes
        .replace(/\b(black|white|blue|green|red|yellow|purple|silver|gold|gray|grey|orange|pink)\b/gi, '') // Colors
        .replace(/official store|brand new|latest model|gen \d+/gi, '')
        .replace(/[^a-z0-9\s]/g, ' ') // Remove special characters
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();
};

/**
 * Calculates similarity score between search query and product title.
 */
const calculateSimilarity = (query, title) => {
    const normQuery = normalizeTitle(query);
    const normTitle = normalizeTitle(title);
    
    // Exact match check
    if (normTitle.includes(normQuery)) return 1.0;
    
    // Fuzzy similarity
    return stringSimilarity.compareTwoStrings(normQuery, normTitle);
};

/**
 * Ranks results based on multiple factors.
 */
const rankResults = (results, query) => {
    const normQuery = normalizeTitle(query);
    const queryWords = normQuery.split(' ').filter(w => w.length > 0);
    
    return results.map(item => {
        const normTitle = normalizeTitle(item.title);
        const similarity = calculateSimilarity(query, item.title);
        
        // Exact match boost
        let score = similarity * 100;
        
        if (normTitle.includes(normQuery)) {
            score += 50;
        } else if (queryWords.length > 0 && queryWords.every(w => normTitle.includes(w))) {
            // All words present boost
            score += 30;
        }

        // Popularity/Rating boost (if available)
        if (item.rating) score += (item.rating * 2);
        
        // Lower price priority if scores are close
        return { ...item, searchScore: score };
    }).sort((a, b) => b.searchScore - a.searchScore);
};

module.exports = {
    normalizeTitle,
    calculateSimilarity,
    rankResults
};
