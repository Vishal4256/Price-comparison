import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Star } from 'lucide-react';

export default function ProductCard({ product }) {
    if (!product) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full relative">
            
            {/* Top Badges */}
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                {product.source && (
                    <span className="px-2 py-1 bg-white border border-gray-200 text-slate-600 text-[10px] font-bold rounded shadow-sm uppercase tracking-wider">
                        {product.source}
                    </span>
                )}
                {product.rating > 4.7 && (
                    <span className="px-2 py-1 bg-[#D4AF37] text-white text-[10px] font-bold rounded shadow-sm uppercase tracking-wider">
                        MAX VALUE
                    </span>
                )}
            </div>

            {/* Image Area */}
            <div className="relative p-6 h-48 sm:h-56 overflow-hidden bg-gray-50 flex items-center justify-center border-b border-gray-100 shrink-0">
                <img 
                    src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'} 
                    alt={product.title} 
                    className="max-h-full object-contain mix-blend-multiply relative z-10 group-hover:scale-105 transition-transform duration-500" 
                />
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-sm text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    <Link to={`/product/${product._id || '1'}`}>
                        {product.title || product.name || 'Unknown Product'}
                    </Link>
                </h3>

                <div className="flex items-center gap-1 mb-4">
                    <div className="flex text-[#D4AF37]">
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current text-gray-300" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{product.rating || '4.5'}</span>
                    <span className="text-xs text-slate-400 ml-1">(1.2k)</span>
                </div>

                <div className="mt-auto">
                    <div className="flex flex-col mb-4">
                        <span className="text-xl font-black text-[#0B1E36]">
                            ₹{(product.currentPrice || product.price || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                        </span>
                        {(product.originalPrice > (product.currentPrice || product.price)) && (
                            <span className="text-xs font-medium text-slate-400 line-through mt-0.5">
                                ₹{product.originalPrice?.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <a 
                            href={product.url || '#'} 
                            target={product.url ? "_blank" : "_self"}
                            rel="noopener noreferrer"
                            onClick={(e) => !product.url && e.preventDefault()}
                            className="flex items-center justify-center py-2 bg-[#0B1E36] hover:bg-[#1a365d] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                        >
                            View Deal
                        </a>
                        <Link 
                            to={`/product/${product._id || '1'}`}
                            className="flex items-center justify-center py-2 bg-white hover:bg-slate-50 border border-gray-300 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm text-center"
                        >
                            Compare Deals
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
