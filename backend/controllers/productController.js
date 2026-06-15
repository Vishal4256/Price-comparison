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
                console.log(`[Category Mode] Mapped "${normalizedQ}" to queries: [${queriesToScrape.join(', ')}]`);
            }

            // 2. Run DB query + Scrapers simultaneously in parallel
            const withTimeout = (promise, ms) =>
                Promise.race([
                    promise,
                    new Promise(resolve => setTimeout(() => resolve(null), ms))
                ]);

            const amazonPromises = queriesToScrape.map(sq => 
                withTimeout(scrapeAmazon(sq, isCategory).catch(e => { console.error('Amazon error:', e.message); return []; }), 12000)
            );
            const flipkartPromises = queriesToScrape.map(sq => 
                withTimeout(scrapeFlipkart(sq, isCategory).catch(e => { console.error('Flipkart error:', e.message); return []; }), 12000)
            );

            const [dbProducts, ...scraperResults] = await Promise.all([
                Product.find(
                    { $text: { $search: normalizedQ } },
                    { score: { $meta: 'textScore' } }
                ).sort({ score: { $meta: 'textScore' } }).limit(10).catch(() => []),
                ...amazonPromises,
                ...flipkartPromises
            ]);

            const numQueries = queriesToScrape.length;
            const amazonRaw = scraperResults.slice(0, numQueries).flat().filter(Boolean);
            const flipkartRaw = scraperResults.slice(numQueries, numQueries * 2).flat().filter(Boolean);

            const amazon   = amazonRaw   || [];
            const flipkart = flipkartRaw || [];

            if (amazon.length === 0 && flipkart.length === 0) {
                console.warn('⚠️  Both scrapers returned 0 results or timed out.');
            }

            // Required debug logs
            console.log('Search:', q);
            console.log('Amazon:', amazon.length);
            console.log('Flipkart:', flipkart.length);

            const dbMapped       = dbProducts.map(p => ({ ...p._doc,  source: formatSource(p.source) }));
            const amazonTagged   = amazon.map(p   => ({ ...p, source: formatSource(p.source   || 'Amazon'),   _fromScraper: true }));
            const flipkartTagged = flipkart.map(p  => ({ ...p, source: formatSource(p.source  || 'Flipkart'), _fromScraper: true }));

            // Combine — NEVER overwrite one retailer with another
            const allResults = mergeProducts([...amazonTagged, ...flipkartTagged, ...dbMapped]);

            // 4. Rank + classify into sections
            let exactMatches = [], similar = [], related = [], ranked = [];
            
            if (isCategory) {
                // Category mode: bypass strict token matching because generic products won't have "electronics" in the title.
                // We shuffle the combined results so the user gets a diverse grid of Amazon + Flipkart subcategory items.
                exactMatches = allResults.sort(() => 0.5 - Math.random());
                
                if (exactMatches.length === 0) {
                    console.log(`[Category Mode] Scrapers completely failed for ${normalizedQ}. Injecting fallback products.`);
                    const fallbacks = {
                        'fashion': [
                            { title: "Men Regular Fit Checkered Casual Shirt", price: 449, originalPrice: 1499, discount: 70, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/shirt/o/x/5/xl-wwsh9005f-wrogn-original-imahnzmfwwdzwbcs.jpeg?q=70", link: "https://www.flipkart.com/search?q=mens+shirts", source: "Flipkart", rating: 4.2 },
                            { title: "Analog Watch For Men & Women", price: 1495, originalPrice: 2995, discount: 50, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/watch/z/c/5/-original-imaghg3tq3c72bzc.jpeg?q=70", link: "https://www.amazon.in/s?k=watches", source: "Amazon", rating: 4.5 },
                            { title: "Running Shoes For Men", price: 2199, originalPrice: 4499, discount: 51, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/shoe/p/e/g/8-393288-8-puma-black-white-original-imaguz3ghfng2ghm.jpeg?q=70", link: "https://www.amazon.in/s?k=mens+shoes", source: "Amazon", rating: 4.3 },
                            { title: "Polarized Aviator Sunglasses", price: 899, originalPrice: 2499, discount: 64, image: "https://m.media-amazon.com/images/I/41D5jI5b2XL._AC_UL480_FMwebp_QL65_.jpg", link: "https://www.amazon.in/s?k=sunglasses", source: "Amazon", rating: 4.1 },
                            { title: "Women A-line Knee Length Dress", price: 699, originalPrice: 1999, discount: 65, image: "https://rukminim2.flixcart.com/image/612/612/xif0q/dress/3/j/8/m-awd-19-a-shree-shital-apparel-original-imagmsyhzkhvhyz6.jpeg?q=70", link: "https://www.flipkart.com/search?q=womens+dresses", source: "Flipkart", rating: 4.0 },
                            { title: "Genuine Leather Wallet For Men", price: 499, originalPrice: 1299, discount: 61, image: "https://m.media-amazon.com/images/I/81oPZ0kY1iL._AC_UL480_FMwebp_QL65_.jpg", link: "https://www.amazon.in/s?k=mens+wallets", source: "Amazon", rating: 4.4 }
                        ],
                        'electronics': [
                            { title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones", price: 26990, originalPrice: 34990, discount: 22, image: "https://m.media-amazon.com/images/I/61vJtKbAssL._AC_UY327_FMwebp_QL65_.jpg", link: "https://www.amazon.in/s?k=headphones", source: "Amazon", rating: 4.6 },
                            { title: "Apple iPhone 15 (128 GB) - Black", price: 65999, originalPrice: 79900, discount: 17, image: "https://m.media-amazon.com/images/I/71657TiFeHL._AC_UY327_FMwebp_QL65_.jpg", link: "https://www.amazon.in/s?k=iphone+15", source: "Amazon", rating: 4.8 },
                            { title: "ASUS Vivobook 15 Core i3 12th Gen Laptop", price: 35990, originalPrice: 56990, discount: 36, image: "https://rukminim2.flixcart.com/image/312/312/xif0q/computer/q/e/z/-original-imagpxgqjkwzxmrq.jpeg?q=70", link: "https://www.flipkart.com/search?q=laptops", source: "Flipkart", rating: 4.3 }
                        ],
                        'appliances': [
                            { title: "Samsung 189 L Direct Cool Single Door Refrigerator", price: 15490, originalPrice: 22999, discount: 32, image: "https://rukminim2.flixcart.com/image/312/312/xif0q/refrigerator-new/w/x/z/-original-imagnj4fggtzg9c5.jpeg?q=70", link: "https://www.flipkart.com/search?q=refrigerator", source: "Flipkart", rating: 4.4 },
                            { title: "LG 7 Kg 5 Star Fully-Automatic Front Load Washing Machine", price: 28990, originalPrice: 39990, discount: 27, image: "https://m.media-amazon.com/images/I/71d1AItn5IL._AC_UY327_FMwebp_QL65_.jpg", link: "https://www.amazon.in/s?k=washing+machine", source: "Amazon", rating: 4.5 },
                            { title: "Voltas 1.5 Ton 3 Star Inverter Split AC", price: 32990, originalPrice: 62990, discount: 47, image: "https://m.media-amazon.com/images/I/41-Nhy5HheL._AC_UY327_FMwebp_QL65_.jpg", link: "https://www.amazon.in/s?k=air+conditioner", source: "Amazon", rating: 4.2 }
                        ]
                    };
                    exactMatches = fallbacks[normalizedQ] || fallbacks['fashion'];
                }
                
                ranked = exactMatches;
                console.log(`[Category Mode] Bypassed rankResults, displaying ${exactMatches.length} items as Exact.`);
            } else {
                const rankObj = rankResults(allResults, normalizedQ);
                exactMatches = rankObj.exactMatches;
                similar = rankObj.similar;
                related = rankObj.related;
                ranked = rankObj.all;
            }

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
