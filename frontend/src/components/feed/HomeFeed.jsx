import React, { useState, useEffect } from 'react';
import api from '../../api';
import FeedSkeleton from './FeedSkeleton';
import EmptyStateFeed from './EmptyStateFeed';
import FeedSection from './FeedSection';
import { Sparkles, Clock, RefreshCw } from 'lucide-react';
import { getApiError } from '../../utils/errorHandler';

const HomeFeed = () => {
    const [feedData, setFeedData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await api.get('/api/feed');
                setFeedData(response.data.data);
            } catch (err) {
                console.error("Failed to fetch feed:", err);
                setError(getApiError(err, "Could not load feed. Please try again."));
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, []);

    if (loading) return <FeedSkeleton />;

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <div className="bg-red-50 p-8 rounded-3xl border border-red-100 max-w-lg mx-auto">
                    <p className="text-red-600 font-bold mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                    >
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!feedData) return null;

    // Check if empty state (no personalized sections)
    const isNewUser = feedData.sections.length === 0 || 
                      (feedData.sections.length === 1 && feedData.sections[0].type === 'trending_deals');

    if (isNewUser) {
        const trending = feedData.sections.find(s => s.type === 'trending_deals')?.items || [];
        return <EmptyStateFeed trendingDeals={trending} />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
            
            {/* AI Shopping Tip */}
            {feedData.shoppingTip && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 to-[#0B1E36] p-6 text-white shadow-xl">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 flex items-start gap-4">
                        <div className="p-3 bg-white/10 rounded-xl shrink-0">
                            <Sparkles className="w-6 h-6 text-indigo-300" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-indigo-200 mb-1 flex items-center gap-2">
                                AI Shopping Tip
                            </h3>
                            <p className="text-lg font-medium leading-relaxed">
                                {feedData.shoppingTip}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Feed Sections */}
            {feedData.sections.map((section, index) => (
                <FeedSection 
                    key={index} 
                    title={section.title} 
                    items={section.items} 
                />
            ))}

            {/* Metadata Footer */}
            {feedData.generatedAt && (
                <div className="text-center text-sm text-slate-400 flex items-center justify-center gap-1 pb-8">
                    <Clock className="w-4 h-4" /> 
                    Feed generated at {new Date(feedData.generatedAt).toLocaleTimeString()}
                </div>
            )}
        </div>
    );
};

export default HomeFeed;
