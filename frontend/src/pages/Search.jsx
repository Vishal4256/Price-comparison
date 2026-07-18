import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Loader2, Sparkles, Filter, AlertCircle, ShoppingCart } from 'lucide-react';
import { api } from '../api';
import Navbar from '../components/Navbar';
import ProductCard from '../components/shared/ProductCard';
import ProductCardSkeleton from '../components/shared/ProductCardSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

export default function Search() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [loading, setLoading] = useState(false);
    const [loadingState, setLoadingState] = useState(''); // 'intent', 'scraping', etc.
    const [results, setResults] = useState([]);
    const [intent, setIntent] = useState(null);
    const [error, setError] = useState('');

    const performSearch = async (searchQuery) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError('');
        setResults([]);
        setIntent(null);

        try {
            // Stage 1: Intent Extraction via Gemini
            setLoadingState('🧠 Analyzing intent and optimizing search parameters...');
            
            // Artificial delay for UI purposes if the backend is too fast, 
            // so users actually see the cool loading state
            await new Promise(res => setTimeout(res, 800));

            setLoadingState('🔍 Scanning Amazon, Flipkart, and 40+ retailers...');

            const response = await api.get(`/api/search/universal?q=${encodeURIComponent(searchQuery)}`);
            
            setIntent(response.data.intent);
            setResults(response.data.products || []);
            
        } catch (err) {
            console.error(err);
            setError('We hit a snag while scanning retailers. Please try again.');
        } finally {
            setLoading(false);
            setLoadingState('');
        }
    };

    useEffect(() => {
        if (initialQuery) {
            performSearch(initialQuery);
        } else {
            setResults([]);
            setIntent(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialQuery]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            <Navbar />
            
            {/* Search Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <form onSubmit={handleSearchSubmit} className="relative max-w-4xl mx-auto flex items-center">
                        <div className="absolute left-6 text-slate-400">
                            <SearchIcon className="w-5 h-5" />
                        </div>
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search naturally (e.g., Gaming laptop under ₹80,000, Gift for dad)..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-full py-4 pl-14 pr-32 text-slate-900 text-sm md:text-base outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 font-medium"
                        />
                        <button 
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="absolute right-2 top-2 bottom-2 bg-[#0B1E36] hover:bg-indigo-600 disabled:bg-slate-300 text-white px-6 rounded-full font-bold transition-colors text-sm"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
                
                {/* Error State */}
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3 max-w-3xl mx-auto">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Loading State */}
                <AnimatePresence>
                    {loading && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
                            <h2 className="text-xl font-black text-[#0B1E36] mb-2">{loadingState}</h2>
                            <p className="text-slate-500 max-w-md mx-auto">Universal search is bypassing retailer bot protections and aggregating live prices just for you.</p>
                            
                            <div className="mt-12 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 opacity-60">
                                {[1,2,3,4].map(i => <ProductCardSkeleton key={i} />)}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results State */}
                {!loading && initialQuery && !error && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Gemini Insights Bar */}
                        {intent && (
                            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 p-2 rounded-xl">
                                        <Sparkles className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-0.5">AI Extracted Intent</p>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700 font-medium">
                                            {intent.category && <span className="bg-white px-2 py-1 rounded border border-indigo-100">Category: {intent.category}</span>}
                                            {intent.budget && <span className="bg-white px-2 py-1 rounded border border-indigo-100">Max Budget: ₹{intent.budget.toLocaleString()}</span>}
                                            {intent.brand && <span className="bg-white px-2 py-1 rounded border border-indigo-100">Brand: {intent.brand}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs font-bold text-slate-400">
                                    Found {results.length} unified results
                                </div>
                            </div>
                        )}

                        {/* Product Grid */}
                        {results.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {results.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="py-32 text-center flex flex-col items-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                    <ShoppingCart className="w-8 h-8 text-slate-300" />
                                </div>
                                <h2 className="text-2xl font-black text-[#0B1E36] mb-2">No products found</h2>
                                <p className="text-slate-500 max-w-md mx-auto mb-8">We couldn't find any live products matching your exact criteria across our supported retailers. Try broadening your search or adjusting your budget.</p>
                                <button 
                                    onClick={() => navigate('/')}
                                    className="bg-white border border-slate-200 text-[#0B1E36] px-6 py-2 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Return Home
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Pre-Search State */}
                {!initialQuery && !loading && (
                    <div className="py-32 text-center">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <Sparkles className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-black text-[#0B1E36] mb-2">Universal Search</h2>
                        <p className="text-slate-500 max-w-md mx-auto">Type anything naturally. Our AI will understand your intent and find the lowest prices across the internet instantly.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
