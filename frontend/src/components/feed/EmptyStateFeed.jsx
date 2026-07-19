import React from 'react';
import { Search, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeedSection from './FeedSection';

const EmptyStateFeed = ({ trendingDeals }) => {
    const navigate = useNavigate();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
            
            <div className="text-center py-16 bg-gradient-to-b from-indigo-50 to-white rounded-3xl border border-indigo-100">
                <h1 className="text-3xl font-bold text-slate-800 mb-4">Welcome to PriceWise!</h1>
                <p className="text-slate-600 max-w-lg mx-auto mb-8 text-lg">
                    Start searching for products or add items to your wishlist to get personalized recommendations and price drop alerts.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/search')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0B1E36] text-white rounded-xl hover:bg-[#1a365d] transition-colors font-medium"
                    >
                        <Search className="w-5 h-5" /> Start Searching
                    </button>
                    <button
                        onClick={() => navigate('/wishlist')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-rose-500 border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors font-medium"
                    >
                        <Heart className="w-5 h-5" /> Build Wishlist
                    </button>
                </div>
            </div>

            {trendingDeals && trendingDeals.length > 0 && (
                <FeedSection 
                    title="🔥 Trending Deals" 
                    description="See what other users are saving on right now."
                    items={trendingDeals} 
                />
            )}
        </div>
    );
};

export default EmptyStateFeed;
