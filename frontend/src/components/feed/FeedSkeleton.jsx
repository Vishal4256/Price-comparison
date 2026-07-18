import React from 'react';

const FeedSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 animate-pulse">
            {/* AI Tip Skeleton */}
            <div className="w-full h-20 bg-indigo-900/20 rounded-xl border border-indigo-500/20"></div>

            {/* Section 1 */}
            <div className="space-y-4">
                <div className="w-48 h-6 bg-slate-800 rounded"></div>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="min-w-[280px] h-80 bg-slate-800 rounded-xl shrink-0"></div>
                    ))}
                </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
                <div className="w-56 h-6 bg-slate-800 rounded"></div>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="min-w-[280px] h-80 bg-slate-800 rounded-xl shrink-0"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeedSkeleton;
