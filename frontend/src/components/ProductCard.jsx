import React, { useState } from 'react';
import { Star, ShoppingCart, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const SOURCE_STYLE = {
    Amazon:   { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200'  },
    Flipkart: { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
};

const getStyle = (source) =>
    SOURCE_STYLE[source] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };

export default function ProductCard({ product }) {
    const [expanded, setExpanded] = useState(false);
    if (!product) return null;

    // Backward compatibility or flat products
    const isGrouped = product.prices && product.prices.length > 0;
    const lowestPrice = isGrouped ? product.lowestPrice : (product.currentPrice || product.price || 0);
    const lowestRetailer = isGrouped ? product.lowestRetailer : product.source;
    const savings = isGrouped ? product.savings : (product.originalPrice - lowestPrice > 0 ? product.originalPrice - lowestPrice : 0);

    const style = getStyle(lowestRetailer);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full relative">

            {/* Badges */}
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                {isGrouped && product.prices.length > 1 && (
                    <span className="px-2 py-1 bg-green-600 text-white text-[10px] font-bold rounded shadow-sm uppercase tracking-wider">
                        BEST PRICE
                    </span>
                )}
                {product.discountPercentage > 10 && (
                    <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded shadow-sm">
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

                {/* Lowest Price Highlight */}
                <div className="mt-auto bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-semibold mb-1">Lowest Price:</p>
                    <div className="flex items-end gap-2 mb-1">
                        <span className="text-xl font-black text-[#0B1E36]">
                            ₹{lowestPrice.toLocaleString('en-IN')}
                        </span>
                        {lowestRetailer && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text} border ${style.border}`}>
                                {lowestRetailer}
                            </span>
                        )}
                    </div>
                    {savings > 0 && (
                        <p className="text-xs font-bold text-green-600">
                            You Save: ₹{savings.toLocaleString('en-IN')}
                        </p>
                    )}
                </div>

                {/* Compared Prices List */}
                {isGrouped && product.prices.length > 0 && (
                    <div className="mt-3">
                        <button 
                            onClick={() => setExpanded(!expanded)}
                            className="flex items-center justify-between w-full text-xs font-bold text-slate-600 bg-white border border-gray-200 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <span>Available on {product.prices.length} Stores</span>
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        
                        {expanded && (
                            <div className="flex flex-col gap-2 mt-2">
                                {product.prices.sort((a, b) => a.price - b.price).map((p, idx) => {
                                    const rStyle = getStyle(p.retailer || p.source);
                                    return (
                                        <a
                                            key={idx}
                                            href={p.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center justify-between px-3 py-2 border rounded-xl transition-colors shadow-sm ${rStyle.bg} ${rStyle.border} hover:opacity-80`}
                                        >
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${rStyle.text}`}>
                                                    {p.retailer || p.source}
                                                </span>
                                                <span className={`text-sm font-black ${rStyle.text}`}>
                                                    ₹{(p.price || p.currentPrice || 0).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-bold bg-white/80 px-2 py-1 rounded-lg">
                                                View
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
