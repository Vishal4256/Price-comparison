const { parseProductTitle, parseQuery } = require('./productParser');

const ACCESSORY_KEYWORDS = [
    "case", "cover", "back panel", "screen guard", "tempered", 
    "adapter", "charger", "cable", "buds", "earbuds",
    "replacement", "spare", "skin", "protector"
];

function isAccessory(title) {
    if (!title) return false;
    const lowerTitle = title.toLowerCase();
    return ACCESSORY_KEYWORDS.some(kw => {
        // Match as a whole word to avoid partial matches
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        return regex.test(lowerTitle);
    });
}

function extractStorage(title) {
    const { storage } = parseProductTitle(title);
    return storage;
}

function extractColor(title) {
    const { color } = parseProductTitle(title);
    return color;
}

function normalizeProduct(title) {
    const parsed = parseProductTitle(title);
    
    // Construct the normalized key based on brand, series, model, color, storage
    const parts = [
        parsed.brand,
        parsed.series,
        parsed.model,
        parsed.color,
        parsed.storage
    ].filter(Boolean);
    
    if (parts.length === 0) {
        // Fallback if parsing fails
        return title.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    // e.g. apple_iphone_15_black_128gb
    return parts.join('_').replace(/\s+/g, '_').toLowerCase();
}

/**
 * Calculates relevance score for a product based on the query.
 * Exact model match: +100
 * Storage match: +50
 * Color match: +30
 * Different model: -100
 * Accessory: -100
 * Different generation: -100
 */
function calculateRelevance(query, title) {
    let score = 0;
    const parsedQuery = parseQuery(query);
    const parsedProduct = parseProductTitle(title);
    const queryLower = query.toLowerCase();

    // Check if the query itself is searching for an accessory
    const isQueryAccessory = isAccessory(query);
    const isProductAccessory = isAccessory(title);

    if (!isQueryAccessory && isProductAccessory) {
        return -100; // Accessory penalty
    }

    // Exact model match
    if (parsedQuery.model && parsedProduct.model) {
        const qModelNumericMatch = parsedQuery.model.match(/\d+/);
        const pModelNumericMatch = parsedProduct.model.match(/\d+/);
        
        const qNum = qModelNumericMatch ? qModelNumericMatch[0] : null;
        const pNum = pModelNumericMatch ? pModelNumericMatch[0] : null;

        if (qNum && pNum) {
            if (qNum !== pNum) {
                return 60; // Different generation/model. Soften penalty so it appears as related instead of being excluded.
            }
        }

        if (parsedProduct.model.includes(parsedQuery.model) || parsedQuery.model.includes(parsedProduct.model)) {
            score += 100;
        } else {
            // Further penalty if model string is totally different but numeric matches (e.g. Pro vs normal)
            // But let's keep it simple: if the required tokens aren't there, we don't give the +100
            // The required model tokens logic from searchEngine is better for strict filtering.
        }
    } else if (parsedQuery.series && parsedProduct.series && parsedQuery.series === parsedProduct.series) {
         score += 100; // Series match fallback
    } else if (!parsedQuery.model && !parsedQuery.series && parsedQuery.brand && parsedProduct.brand === parsedQuery.brand) {
         score += 100; // Brand match fallback for generic queries
    } else {
         // Generic check if title contains the query mostly
         const tokens = queryLower.split(/\s+/);
         const matches = tokens.filter(t => title.toLowerCase().includes(t));
         if (matches.length === tokens.length) score += 100;
    }

    // Storage match
    if (parsedQuery.storage && parsedProduct.storage === parsedQuery.storage) {
        score += 50;
    } else if (parsedQuery.storage && parsedProduct.storage !== parsedQuery.storage) {
         // Optional penalty or just no score
    }

    // Color match
    if (parsedQuery.color && parsedProduct.color === parsedQuery.color) {
        score += 30;
    }

    return score;
}

function findLowestPrice(groupedProduct) {
    if (!groupedProduct.prices || groupedProduct.prices.length === 0) return null;
    let lowest = groupedProduct.prices[0];
    for (const p of groupedProduct.prices) {
        if (p.price < lowest.price) {
            lowest = p;
        }
    }
    return lowest;
}

function groupProducts(products) {
    const groups = {};

    for (const p of products) {
        const key = normalizeProduct(p.title);
        
        if (!groups[key]) {
            groups[key] = {
                id: key,
                title: p.title, // Use the title of the first product in the group as base
                image: p.image,
                rating: p.rating,
                prices: [],
                parsed: parseProductTitle(p.title),
                searchScore: p.searchScore || 0
            };
        }
        
        // Use standard price key
        const itemPrice = p.price || p.currentPrice;
        const itemOriginal = p.originalPrice || itemPrice;
        
        // Add retailer offer to the group's prices array
        // Make sure not to add duplicates for the same retailer if they appear multiple times for the same normalized key.
        const retailerName = p.retailer || p.source || 'Unknown';
        const existingOffer = groups[key].prices.find(offer => offer.retailer === retailerName);
        
        if (!existingOffer || itemPrice < existingOffer.price) {
            if (existingOffer) {
                // Replace with cheaper offer
                existingOffer.price = itemPrice;
                existingOffer.originalPrice = itemOriginal;
                existingOffer.url = p.url;
            } else {
                groups[key].prices.push({
                    retailer: retailerName,
                    price: itemPrice,
                    originalPrice: itemOriginal,
                    url: p.url,
                    availability: p.availability || true
                });
            }
        }

        // Update main group stats if necessary (e.g. better image, higher rating)
        if (p.rating > groups[key].rating) groups[key].rating = p.rating;
    }

    // Format output
    return Object.values(groups).map(group => {
        const lowestOffer = findLowestPrice(group);
        if (lowestOffer) {
            group.lowestPrice = lowestOffer.price;
            group.lowestRetailer = lowestOffer.retailer;
            
            // Calculate max savings: Highest original price (or highest price) minus lowest price
            const maxPrice = Math.max(...group.prices.map(p => p.price || p.originalPrice || 0));
            group.savings = maxPrice > lowestOffer.price ? (maxPrice - lowestOffer.price) : 0;
            
            group.discountPercentage = maxPrice > lowestOffer.price 
                ? Math.round(((maxPrice - lowestOffer.price) / maxPrice) * 100) 
                : 0;
        }
        return group;
    });
}

module.exports = {
    isAccessory,
    extractStorage,
    extractColor,
    normalizeProduct,
    calculateRelevance,
    groupProducts,
    findLowestPrice
};
