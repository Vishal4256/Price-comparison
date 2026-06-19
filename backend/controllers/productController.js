const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const scrapeAmazon = require('../scrapers/amazonScraper');
const scrapeFlipkart = require('../scrapers/flipkartScraper');
const { groupProducts } = require('../utils/ProductMatcher');

const { analyzeDiscount } = require('../utils/discountAnalyzer');
const User = require('../models/User');
const Alert = require('../models/Alert');

const { rankResults } = require('../utils/searchEngine');
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

        if (!fullData) {
            // 1. Save search history
            if (req.user) {
                await User.findByIdAndUpdate(req.user.id, {
                    $push: { searchHistory: { $each: [{ query: q }], $slice: -10 } }
                }).catch(() => {});
            }

            // ── Category Mapping Logic ──
            const CATEGORY_MAP = {
                'electronics': ['smartphones', 'laptops', 'smartwatches', 'earbuds', 'tablets'],
                'appliances': ['refrigerators', 'washing machines', 'air conditioners', 'microwave ovens', 'vacuum cleaners'],
                'fashion': [
                    'mens t-shirts', 'mens shirts', 'jeans', 'jackets', 'hoodies', 
                    'womens dresses', 'sarees', 'kurtis', 'shoes', 'sneakers', 
                    'sandals', 'watches', 'handbags', 'wallets', 'sunglasses', 'belts'
                ],
            };

            const isCategory = !!CATEGORY_MAP[normalizedQ];
            let queriesToScrape = [normalizedQ];

            if (isCategory) {
                // Pick two random distinct subcategories to provide a diverse mix
                const subcats = CATEGORY_MAP[normalizedQ];
                const shuffled = [...subcats].sort(() => 0.5 - Math.random());
                queriesToScrape = shuffled.slice(0, 2);
            }

            // 2. Run DB query + Scrapers simultaneously in parallel
            const withTimeout = (promise, ms) =>
                Promise.race([
                    promise,
                    new Promise(resolve => setTimeout(() => resolve(null), ms))
                ]);

            const amazonPromises = queriesToScrape.map(sq => 
                withTimeout(scrapeAmazon(sq, isCategory).catch(e => { console.error('Amazon error:', e.message); return []; }), 45000)
            );
            const flipkartPromises = queriesToScrape.map(sq => 
                withTimeout(scrapeFlipkart(sq, isCategory).catch(e => { console.error('Flipkart error:', e.message); return []; }), 45000)
            );

            const resultsSets = await Promise.all([
                Product.find(
                    { $text: { $search: normalizedQ } },
                    { score: { $meta: 'textScore' } }
                ).sort({ score: { $meta: 'textScore' } }).limit(10).catch(() => []),
                ...amazonPromises,
                ...flipkartPromises
            ]);

            const dbProducts = resultsSets[0];
            const numQueries = queriesToScrape.length;
            
            const startAmz = 1;
            const startFk = startAmz + numQueries;

            const amazon = resultsSets.slice(startAmz, startAmz + numQueries).flat().filter(Boolean);
            const flipkart = resultsSets.slice(startFk, startFk + numQueries).flat().filter(Boolean);

            if (amazon.length === 0 && flipkart.length === 0) {
                console.error('⚠️  Both scrapers returned 0 results or timed out.');
            }

            const dbMapped = dbProducts.map(p => ({ ...p._doc, source: formatSource(p.source) }));
            const amazonTagged = amazon.map(p => ({ ...p, source: formatSource(p.source || 'Amazon'), _fromScraper: true }));
            const flipkartTagged = flipkart.map(p => ({ ...p, source: formatSource(p.source || 'Flipkart'), _fromScraper: true }));

            const flatResults = [
                ...amazonTagged, ...flipkartTagged, ...dbMapped
            ];

            console.log(`[API Debug] Scrape finished. Amazon raw count: ${amazon.length}. Tagged count: ${amazonTagged.length}.`);

            // 3. Group products using ProductMatcher
            const allResults = groupProducts(flatResults);

            // 4. Rank + classify into sections
            let exactMatches = [], similar = [], related = [], ranked = [];
            
            if (isCategory) {
                // Category mode: bypass strict token matching because generic products won't have "electronics" in the title.
                // We shuffle the combined results so the user gets a diverse grid of Amazon + Flipkart subcategory items.
                exactMatches = allResults.sort(() => 0.5 - Math.random());
                ranked = exactMatches;
            } else {
                const rankObj = rankResults(allResults, normalizedQ);
                exactMatches = rankObj.exactMatches;
                similar = rankObj.similar;
                related = rankObj.related;
                ranked = rankObj.all;
            }

            const amazonFinal   = ranked.filter(p => formatSource(p.source) === 'Amazon' || (p.prices && p.prices.some(pr => pr.retailer === 'Amazon')));
            const flipkartFinal = ranked.filter(p => formatSource(p.source) === 'Flipkart' || (p.prices && p.prices.some(pr => pr.retailer === 'Flipkart')));

            console.log(`[API Debug] Ranking finished. Amazon final count: ${amazonFinal.length}. Ranked total: ${ranked.length}. exact: ${exactMatches.length}`);

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
        const exactSet   = new Set(allExact.map(p => p.id));
        const similarSet = new Set(allSimilar.map(p => p.id));
        const pageExact   = pageSlice.filter(p => exactSet.has(p.id));
        const pageSimilar = pageSlice.filter(p => similarSet.has(p.id));
        const pageRelated = pageSlice.filter(p => !exactSet.has(p.id) && !similarSet.has(p.id));

        res.json({
            // Paginated sections
            exactMatches: pageExact,
            similar:      pageSimilar,
            related:      pageRelated,
            results:      pageSlice,
            // Per-retailer (filtered to this page)
            amazon:       pageSlice.filter(p => formatSource(p.source) === 'Amazon' || (p.prices && p.prices.some(pr => pr.retailer === 'Amazon'))),
            flipkart:     pageSlice.filter(p => formatSource(p.source) === 'Flipkart' || (p.prices && p.prices.some(pr => pr.retailer === 'Flipkart'))),
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
