import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroBanner() {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <section className="relative overflow-hidden bg-[#0B1E36] text-white pt-20 pb-24 md:pt-32 md:pb-40 px-4 mt-[-1px]">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3"></div>

            <div className="max-w-4xl mx-auto relative z-10 text-center">
                {/* AI Badge */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm"
                >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold tracking-widest uppercase text-blue-200">AI-Powered Engine v2.0</span>
                </motion.div>

                {/* Headline */}
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-6"
                >
                    Stop searching.<br />
                    Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">finding.</span>
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg md:text-xl text-blue-100/60 max-w-2xl mx-auto mb-12 font-medium"
                >
                    Our AI scans thousands of retailers instantly to find you the absolute lowest price. Don't pay more than you have to.
                </motion.p>

                {/* Search Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-3xl mx-auto relative"
                >
                    <form onSubmit={handleSearch} className="relative flex items-center">
                        <div className="absolute left-6 text-slate-400">
                            <Search className="w-6 h-6" />
                        </div>
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="What are you looking for today? (e.g., iPhone 15 Pro, Sony WH-1000XM5)..."
                            className="w-full bg-white rounded-full py-5 pl-16 pr-40 text-slate-900 text-lg outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-2xl placeholder:text-slate-400"
                        />
                        <button 
                            type="submit"
                            className="absolute right-2 top-2 bottom-2 bg-[#0B1E36] hover:bg-indigo-600 text-white px-8 rounded-full font-bold transition-colors flex items-center gap-2"
                        >
                            Search
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </motion.div>

                {/* Trust Indicators / Stats */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 flex flex-wrap justify-center gap-8 text-sm font-bold uppercase tracking-widest text-blue-200/40"
                >
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span>Live Tracking</span>
                    </div>
                    <span>•</span>
                    <div>Over 50+ Retailers</div>
                    <span>•</span>
                    <div>AI Price Prediction</div>
                </motion.div>
            </div>
        </section>
    );
}
