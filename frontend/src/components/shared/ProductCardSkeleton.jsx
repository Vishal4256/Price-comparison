import React from 'react';
import { motion } from 'framer-motion';

export default function ProductCardSkeleton() {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm animate-pulse"
        >
            {/* Image Skeleton */}
            <div className="aspect-square bg-slate-100 w-full"></div>
            
            <div className="p-5 space-y-4">
                {/* Brand Skeleton */}
                <div className="w-16 h-4 bg-slate-100 rounded-md"></div>
                
                {/* Title Skeleton */}
                <div className="space-y-2">
                    <div className="w-full h-5 bg-slate-100 rounded-md"></div>
                    <div className="w-3/4 h-5 bg-slate-100 rounded-md"></div>
                </div>
                
                {/* Rating Skeleton */}
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-4 h-4 bg-slate-100 rounded-full"></div>
                    ))}
                </div>

                {/* Price Skeleton */}
                <div className="flex items-end justify-between pt-4 border-t border-slate-50">
                    <div>
                        <div className="w-24 h-7 bg-slate-100 rounded-md mb-1"></div>
                        <div className="w-16 h-4 bg-slate-100 rounded-md"></div>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                </div>
            </div>
        </motion.div>
    );
}
