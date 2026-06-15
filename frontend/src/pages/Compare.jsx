import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';
import {
    ExternalLink, Loader2, Star, ShoppingCart,
    TrendingDown, AlertCircle, CheckCircle2, Award
} from 'lucide-react';

// ── URL validation ──────────────────────────────────────────────────────────
const VALID_PREFIXES = [
    'https://www.amazon.in',
    'https://www.amazon.com',
    'https://www.flipkart.com',
];
const isValidUrl = (url) =>
    !!(url && typeof url === 'string' && VALID_PREFIXES.some(p => url.startsWith(p)));

// ── Store theme ─────────────────────────────────────────────────────────────
const STORE_THEME = {
    Amazon:   { accent: '#FF9900', bg: 'bg-orange-50',  border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800', btn: 'bg-orange-500 hover:bg-orange-600' },
    Flipkart: { accent: '#2874F0', bg: 'bg-blue-50',    border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-800',     btn: 'bg-blue-600 hover:bg-blue-700'    },
};
const getTheme = (source) => STORE_THEME[source] || { accent: '#666', bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-800', btn: 'bg-gray-600 hover:bg-gray-700' };

// ── Helpers ──────────────────────────────────────────────────────────────────
function Stars({ rating }) {
    const r = parseFloat(rating) || 0;
    return (
        <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= Math.round(r) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300'}`} />
            ))}
            <span className="text-sm font-semibold text-gray-600 ml-1">{r > 0 ? r.toFixed(1) : 'N/A'}</span>
        </div>
    );
}

export default function Compare() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [stores, setStores] = useState({ Amazon: null, Flipkart: null });
    const [productImage, setProductImage] = useState(null);
    const [productTitle, setProductTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (query) fetchComparison();
    }, [query]);

    const fetchComparison = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/products/search?q=${encodeURIComponent(query)}`);
            const data = response.data;
            const results = Array.isArray(data) ? data : (data.results || []);

            if (results.length === 0) {
                setError('No products found for this search.');
                setLoading(false);
                return;
            }

            // REQUIREMENT 7: Log what we received from the API
            const amzCount = Array.isArray(data.amazon)   ? data.amazon.length   : results.filter(p => p.source === 'Amazon').length;
            const fkCount  = Array.isArray(data.flipkart) ? data.flipkart.length : results.filter(p => p.source === 'Flipkart').length;
            console.log(`[Compare] API returned ${results.length} total | Amazon: ${amzCount} | Flipkart: ${fkCount}`);

            // Flatten merged products into individual store entries
            const allEntries = [];
            for (const p of results) {
                if (p.isMerged && Array.isArray(p.prices)) {
                    for (const entry of p.prices) {
                        allEntries.push({
                            ...entry,
                            title: p.title,
                            image: p.image,
                            // Use per-entry rating if available (new format), fallback to product-level rating
                            rating: entry.rating ?? p.rating,
                            discountPercentage: entry.discountPercentage ?? p.discountPercentage,
                        });
                    }
                } else {
                    allEntries.push({
                        source: p.source,
                        title: p.title,
                        image: p.image,
                        currentPrice: p.currentPrice,
                        originalPrice: p.originalPrice,
                        discountPercentage: p.discountPercentage,
                        rating: p.rating,
                        url: p.url,
                    });
                }
            }

            // Best product image & title (prefer Amazon then Flipkart)
            const best = allEntries.find(e => e.source === 'Amazon') || allEntries[0];
            setProductTitle(best?.title || query);
            setProductImage(best?.image || null);

            // Pick cheapest per store
            const byStore = { Amazon: null, Flipkart: null };
            for (const entry of allEntries) {
                const src = entry.source;
                if (!byStore[src] || entry.currentPrice < byStore[src].currentPrice) {
                    byStore[src] = entry;
                }
            }
            setStores(byStore);
        } catch (err) {
            console.error('Compare fetch error:', err);
            setError('Failed to load comparison. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Derived values ─────────────────────────────────────────────────────
    const availableStores = Object.entries(stores).filter(([, d]) => d !== null);
    const prices = availableStores.map(([, d]) => d.currentPrice).filter(Boolean);
    const lowestPrice  = prices.length > 0 ? Math.min(...prices) : 0;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const savings = highestPrice - lowestPrice;
    const lowestSource = availableStores.find(([, d]) => d.currentPrice === lowestPrice)?.[0];

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-24 pb-20 px-4">
            <Navbar />

            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-10">
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-2">Price Comparison</p>
                    <h1 className="text-3xl font-extrabold text-[#0B1E36] line-clamp-2">
                        {productTitle || query}
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Comparing across major Indian marketplaces</p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Fetching live prices...</p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                        <AlertCircle className="w-6 h-6 shrink-0" />
                        <p className="font-semibold">{error}</p>
                    </div>
                )}

                {/* Single retailer only */}
                {!loading && !error && availableStores.length === 1 && (
                    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 mb-8 text-sm font-medium">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        Currently available from one retailer only.
                    </div>
                )}

                {!loading && !error && availableStores.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ── Left: product image card ─────────────────────────── */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center gap-4">
                            {productImage ? (
                                <img
                                    src={productImage}
                                    alt={productTitle}
                                    className="w-full max-h-52 object-contain mix-blend-multiply"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'; }}
                                />
                            ) : (
                                <div className="w-full h-52 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 text-sm">No image</div>
                            )}
                            <p className="text-center text-sm font-bold text-slate-800 line-clamp-3">{productTitle}</p>
                            {availableStores[0]?.[1]?.rating > 0 && (
                                <Stars rating={availableStores[0][1].rating} />
                            )}
                        </div>

                        {/* ── Right: comparison cards ───────────────────────────── */}
                        <div className="lg:col-span-2 flex flex-col gap-4">

                            {/* Best price summary banner */}
                            {savings > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="p-2 bg-green-100 rounded-xl">
                                        <TrendingDown className="w-6 h-6 text-green-700" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-green-800">Best price on {lowestSource}</p>
                                        <p className="text-green-700 text-sm">You save <span className="font-black">₹{savings.toLocaleString('en-IN')}</span> vs highest price</p>
                                    </div>
                                </div>
                            )}

                            {/* Per-store price cards */}
                            {availableStores.map(([storeName, data]) => {
                                const theme   = getTheme(storeName);
                                const isBest  = data.currentPrice === lowestPrice;
                                const validUrl = isValidUrl(data.url);

                                return (
                                    <div
                                        key={storeName}
                                        className={`relative bg-white rounded-3xl border-2 shadow-sm transition-all ${isBest ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-100'}`}
                                    >
                                        {/* Best price badge */}
                                        {isBest && availableStores.length > 1 && (
                                            <div className="absolute -top-3 left-6 flex items-center gap-1 bg-green-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                                                <Award className="w-3 h-3" /> CHEAPEST
                                            </div>
                                        )}

                                        <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
                                            {/* Store badge */}
                                            <div className={`flex-shrink-0 w-28 h-14 rounded-2xl ${theme.bg} ${theme.border} border flex items-center justify-center`}>
                                                <span className="font-extrabold text-sm" style={{ color: theme.accent }}>{storeName}</span>
                                            </div>

                                            {/* Price block */}
                                            <div className="flex-grow">
                                                <div className="flex items-baseline gap-2 flex-wrap">
                                                    <span className="text-3xl font-black text-[#0B1E36]">
                                                        ₹{(data.currentPrice || 0).toLocaleString('en-IN')}
                                                    </span>
                                                    {data.originalPrice > data.currentPrice && (
                                                        <span className="text-sm text-gray-400 line-through">
                                                            ₹{data.originalPrice.toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                    {data.discountPercentage > 0 && (
                                                        <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                            {data.discountPercentage}% OFF
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 mt-1">
                                                    {data.rating > 0 && <Stars rating={data.rating} />}
                                                    {validUrl ? (
                                                        <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Link verified
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold">
                                                            <AlertCircle className="w-3.5 h-3.5" /> Link unavailable
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* CTA */}
                                            <div className="flex-shrink-0">
                                                {validUrl ? (
                                                    <a
                                                        href={data.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`inline-flex items-center gap-2 px-6 py-3 ${theme.btn} text-white text-sm font-bold rounded-xl transition-colors shadow-md whitespace-nowrap`}
                                                    >
                                                        <ShoppingCart className="w-4 h-4" />
                                                        Buy on {storeName}
                                                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                                                    </a>
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 text-sm font-bold rounded-xl cursor-not-allowed whitespace-nowrap"
                                                    >
                                                        Link Unavailable
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Store not available placeholder */}
                            {Object.entries(stores).filter(([, d]) => d === null).map(([storeName]) => (
                                <div
                                    key={storeName}
                                    className="bg-white rounded-3xl border border-dashed border-gray-200 p-6 flex items-center gap-6 opacity-50"
                                >
                                    <div className="w-28 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                                        <span className="font-bold text-gray-400 text-sm">{storeName}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium">Not available from {storeName}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
