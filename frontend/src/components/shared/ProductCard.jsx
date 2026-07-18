import React from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingDown, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductCard({ product }) {
    // If no product is passed, render a defensive fallback or the skeleton could be rendered upstream
    if (!product) return null;

    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group flex flex-col h-full"
        >
            {/* Image container */}
            <div className="relative aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-6">
                {product.discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider z-10 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        {product.discount}% OFF
                    </div>
                )}
                <img loading="lazy" decoding="async"
                    src={product.image || 'https://via.placeholder.com/400'} 
                    alt={product.title} 
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
            </div>
            
            <div className="p-5 flex flex-col flex-1">
                {/* Brand & Category */}
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.brand}</span>
                </div>
                
                {/* Title */}
                <h3 className="font-bold text-[#0B1E36] leading-tight mb-2 line-clamp-2 hover:text-indigo-600 transition-colors">
                    <Link to={`/product/${product.id}`}>{product.title}</Link>
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-auto">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} 
                            />
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">({product.reviews || 0})</span>
                </div>

                {/* Price Section */}
                <div className="flex items-end justify-between pt-4 mt-4 border-t border-slate-50">
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-[#0B1E36]">
                                ₹{product.lowestPrice?.toLocaleString() || product.price?.toLocaleString()}
                            </span>
                        </div>
                        {product.highestPrice && product.highestPrice > product.lowestPrice && (
                            <span className="text-[11px] font-bold text-slate-400 line-through">
                                ₹{product.highestPrice?.toLocaleString()}
                            </span>
                        )}
                        {product.availableRetailers && (
                            <div className="text-[10px] font-bold text-indigo-500 mt-1">
                                Available at {product.availableRetailers} retailers
                            </div>
                        )}
                    </div>
                    
                    <Link 
                        to={`/product/${product.productId || product.id}`}
                        className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
