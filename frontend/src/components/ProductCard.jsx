import React from 'react';
import { Star, ShoppingCart, AlertCircle } from 'lucide-react';

// ── URL validation ──────────────────────────────────────────────────────────
const VALID_PREFIXES = [
    'https://www.amazon.in',
    'https://www.amazon.com',
    'https://www.flipkart.com',
];

function isValidUrl(url) {
    return !!(url && typeof url === 'string' && url.startsWith('https://') &&
        VALID_PREFIXES.some(prefix => url.startsWith(prefix)));
}

// ── Source badge colours ────────────────────────────────────────────────────
const SOURCE_STYLE = {
    Amazon:   { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200'  },
    Flipkart: { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
};

const getStyle = (source) =>
    SOURCE_STYLE[source] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };

// ── Main ProductCard ────────────────────────────────────────────────────────
export default function ProductCard({ product }) {
    if (!product) return null;

    const price = product.currentPrice || product.price || 0;
    const validUrl = isValidUrl(product.url);
    const style = getStyle(product.source);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full relative">

            {/* Source + Discount badges */}
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                {product.source && (
                    <span className={`px-2 py-1 border text-[10px] font-bold rounded shadow-sm uppercase tracking-wider ${style.bg} ${style.text} ${style.border}`}>
                        {product.source}
                    </span>
                )}
                {product.discountPercentage > 10 && (
                    <span className="px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded shadow-sm">
                        {product.discountPercentage}% OFF
                    </span>
                )}
            </div>

            {/* Product image */}
            <div className="relative p-6 h-48 sm:h-52 overflow-hidden bg-gray-50 flex items-center justify-center border-b border-gray-100 shrink-0">
                <img
                    src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'}
                    alt={product.title}
                    className="max-h-full object-contain mix-blend-multiply relative z-10 group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
                    }}
                />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Title */}
                <h3 className="font-bold text-sm text-slate-900 mb-2 line-clamp-2 leading-snug">
                    {product.title || product.name || 'Unknown Product'}
                </h3>

                {/* Rating */}
                {product.rating > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                        <div className="flex text-[#D4AF37]">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 ${i <= Math.round(product.rating) ? 'fill-current' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{Number(product.rating).toFixed(1)}</span>
                    </div>
                )}

                {/* Price */}
                <div className="mt-auto">
                    <div className="flex flex-col mb-3">
                        <span className="text-xl font-black text-[#0B1E36]">
                            ₹{price.toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice > price && (
                            <span className="text-xs font-medium text-slate-400 line-through mt-0.5">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>

                    {/* View Deal — single action button */}
                    {validUrl ? (
                        <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#0B1E36] hover:bg-[#1a365d] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            View Deal
                        </a>
                    ) : (
                        <button
                            disabled
                            title="Product link unavailable"
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl cursor-not-allowed"
                        >
                            <AlertCircle className="w-3.5 h-3.5" />
                            Link Unavailable
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
