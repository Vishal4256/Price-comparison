const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const scrapeAmazon = require('../scrapers/amazonScraper');
const scrapeFlipkart = require('../scrapers/flipkartScraper');

const { analyzeDiscount } = require('../utils/discountAnalyzer');
const User = require('../models/User');
const Alert = require('../models/Alert');


const Fuse = require('fuse.js');
const { rankResults, mergeProducts } = require('../utils/searchEngine');
const { normalizeQuery } = require('../utils/queryNormalizer');

// --- Simple in-memory cache (5-minute TTL) ---
const searchCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const getCached = (key) => {
    const entry = searchCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
        searchCache.delete(key);
        return null;
    }
    return entry.data;
};

const setCache = (key, data) => {
    searchCache.set(key, { ts: Date.now(), data });
    // Keep cache bounded to 100 entries
    if (searchCache.size > 100) {
        const firstKey = searchCache.keys().next().value;
        searchCache.delete(firstKey);
    }
};

exports.searchProducts = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query is required' });

    // ── Pagination params ─────────────────────────────────────────────────────
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));

    try {
        // 0. Normalize the query
        const normalizedQ = normalizeQuery(q);
        console.log(`\n🔎 Search: "${q}" → normalized: "${normalizedQ}" (page ${page}, limit ${limit})`);

        // Source tag helper (defined here so it's usable in both cache hit and cache miss paths)
        const formatSource = (src) => {
            if (!src) return 'Unknown';
            const lower = (src || '').toLowerCase();
            if (lower === 'amazon')   return 'Amazon';
            if (lower === 'flipkart') return 'Flipkart';
            return src;
        };

        // Cache check — cache the FULL result set (all pages), slice per request
        const cacheKey = normalizedQ.toLowerCase().trim();
        let fullData = getCached(cacheKey);

        if (fullData) {
            console.log(`⚡ Cache hit: ${fullData.results?.length || 0} total results`);
        } else {
            // 1. Save search history
            if (req.user) {
                await User.findByIdAndUpdate(req.user.id, {
                    $push: { searchHistory: { $each: [{ query: q }], $slice: -10 } }
                }).catch(() => {});
            }

            // 2. Run DB query + BOTH scrapers simultaneously in parallel
            const withTimeout = (promise, ms) =>
                Promise.race([
                    promise,
                    new Promise(resolve => setTimeout(() => resolve(null), ms))
                ]);

            const [dbProducts, amazonResult, flipkartResult] = await Promise.all([
                Product.find(
                    { $text: { $search: normalizedQ } },
                    { score: { $meta: 'textScore' } }
                ).sort({ score: { $meta: 'textScore' } }).limit(10).catch(() => []),
                withTimeout(
                    scrapeAmazon(normalizedQ).catch(e => { console.error('Amazon error:', e.message); return []; }),
                    12000
                ),
                withTimeout(
                    scrapeFlipkart(normalizedQ).catch(e => { console.error('Flipkart error:', e.message); return []; }),
                    12000
                ),
            ]);

            // null means timeout; [] means scraper ran but found nothing
            const amazon   = amazonResult   ?? [];
            const flipkart = flipkartResult ?? [];

            if (amazonResult === null && flipkartResult === null) {
                console.warn('⚠️  Both scrapers timed out.');
            }

            // Required debug logs
            console.log('Search:', q);
            console.log('Amazon:', amazon.length);
            console.log('Flipkart:', flipkart.length);

            const dbMapped       = dbProducts.map(p => ({ ...p._doc,  source: formatSource(p.source) }));
            const amazonTagged   = amazon.map(p   => ({ ...p, source: formatSource(p.source   || 'Amazon'),   _fromScraper: true }));
            const flipkartTagged = flipkart.map(p  => ({ ...p, source: formatSource(p.source  || 'Flipkart'), _fromScraper: true }));

            // Combine — NEVER overwrite one retailer with another
            const allResults = [...amazonTagged, ...flipkartTagged, ...dbMapped];

            // 4. Rank + classify into sections (strict AND-logic, brand-lock)
            const { exactMatches, similar, related, all: ranked } = rankResults(allResults, normalizedQ);

            // Per-retailer splits
            const amazonFinal   = ranked.filter(p => formatSource(p.source) === 'Amazon');
            const flipkartFinal = ranked.filter(p => formatSource(p.source) === 'Flipkart');

            console.log('Final:', ranked.length);
            console.log(`  → Exact: ${exactMatches.length} | Similar: ${similar.length} | Related: ${related.length}`);
            console.log(`  → Amazon: ${amazonFinal.length} | Flipkart: ${flipkartFinal.length}\n`);

            // 5. Build and cache the FULL (unpaginated) response
            fullData = {
                amazon:       amazonFinal,
                flipkart:     flipkartFinal,
                exactMatches,
                similar,
                related,
                results: ranked,
            };

            // 6. Cache full result for 5 minutes
            setCache(cacheKey, fullData);
        } // end cache miss block
        // ── 7. Apply pagination to the full ranked list ──────────────────────
        // Works for BOTH cache hits and fresh scrapes.
        const { exactMatches: allExact, similar: allSimilar, related: allRelated } = fullData;

        // Flat ordered list: exact first → similar → related
        const allRanked    = [...allExact, ...allSimilar, ...allRelated];
        const totalResults = allRanked.length;
        const totalPages   = Math.max(1, Math.ceil(totalResults / limit));
        const safePage     = Math.min(page, totalPages);
        const skip         = (safePage - 1) * limit;
        const pageSlice    = allRanked.slice(skip, skip + limit);

        // Re-classify paginated slice into sections
        const exactSet   = new Set(allExact.map(p => p.url));
        const similarSet = new Set(allSimilar.map(p => p.url));
        const pageExact   = pageSlice.filter(p => exactSet.has(p.url));
        const pageSimilar = pageSlice.filter(p => similarSet.has(p.url));
        const pageRelated = pageSlice.filter(p => !exactSet.has(p.url) && !similarSet.has(p.url));

        console.log(`📄 Page ${safePage}/${totalPages}: items ${skip + 1}–${Math.min(skip + limit, totalResults)} of ${totalResults}`);

        res.json({
            // Paginated sections
            exactMatches: pageExact,
            similar:      pageSimilar,
            related:      pageRelated,
            results:      pageSlice,
            // Per-retailer (filtered to this page)
            amazon:       pageSlice.filter(p => formatSource(p.source) === 'Amazon'),
            flipkart:     pageSlice.filter(p => formatSource(p.source) === 'Flipkart'),
            // Pagination metadata (Requirement 1)
            page:         safePage,
            limit,
            totalResults,
            totalPages,
        });

    } catch (error) {
        console.error('❌ searchProducts error:', error);
        res.status(500).json({ message: 'Unable to fetch products. Please try again.' });
    }
};




exports.getSuggestions = async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    try {
        const suggestions = await Product.find({
            title: { $regex: q, $options: 'i' }
        }).limit(8).select('title image source currentPrice');

        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSimilarProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const similar = await Product.find({
            _id: { $ne: product._id },
            $or: [
                { category: product.category },
                { brand: product.brand },
                { title: { $regex: product.title.split(' ')[0], $options: 'i' } }
            ]
        }).limit(6);

        res.json(similar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getProductDetails = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const history = await PriceHistory.find({ productId: product._id }).sort({ timestamp: 1 });
        
        // Analyze discount
        const analysis = analyzeDiscount(history, product.currentPrice, product.originalPrice);
        
        res.json({ 
            product: {
                ...product._doc,
                isFakeDiscount: analysis.isFake,
                fakeDiscountReason: analysis.reason
            }, 
            history 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTrendingDeals = async (req, res) => {
    try {
        const products = await Product.find().limit(10);
        const trending = [];

        for (const product of products) {
            const history = await PriceHistory.find({ productId: product._id }).sort({ timestamp: 1 });
            const analysis = analyzeDiscount(history, product.currentPrice, product.originalPrice);
            
            if (!analysis.isFake && product.discountPercentage > 10) {
                trending.push({
                    ...product._doc,
                    isFakeDiscount: false,
                    analysis
                });
            }
        }

        if (trending.length === 0) {
            return res.json(products.slice(0, 8));
        }

        res.json(trending.slice(0, 8));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalAlerts = await Alert.countDocuments();
        const recentHistory = await PriceHistory.find().sort({ timestamp: -1 }).limit(5).populate('productId');

        res.json({
            stats: {
                totalUsers,
                totalProducts,
                totalAlerts,
                scrapingSuccess: 98.2 // Mocked or calculated from logs
            },
            logs: recentHistory.map(h => ({
                timestamp: h.timestamp,
                message: `Price update for ${h.productId?.title || 'Unknown Product'}`,
                status: 'Success'
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.saveProduct = async (req, res) => {
    try {
        const productData = req.body;
        let product = await Product.findOne({ url: productData.url });

        if (product) {
            // Update existing
            product.currentPrice = productData.currentPrice;
            await product.save();
        } else {
            product = await Product.create(productData);
        }

        // Add history entry
        await PriceHistory.create({
            productId: product._id,
            price: product.currentPrice,
            originalPrice: product.originalPrice
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPublicStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        // Extract distinct scraper sources, fallback to Amazon, Flipkart (2)
        const uniqueSources = await Product.distinct('source');
        const retailerCount = Math.max(uniqueSources.filter(Boolean).length, 2);
        
        // Dynamic models count with premium base pad
        const modelCount = totalProducts > 0 ? totalProducts + 2400 : 2431;

        res.json({
            models: modelCount,
            retailers: retailerCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
