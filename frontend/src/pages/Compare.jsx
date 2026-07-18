import React, { useState } from 'react';
import { api } from '../api';
import Navbar from '../components/Navbar';
import { Search, Loader2, Sparkles, Trophy, AlertCircle, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Compare() {
    const [productA, setProductA] = useState('');
    const [productB, setProductB] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleCompare = async (e) => {
        e.preventDefault();
        if (!productA.trim() || !productB.trim()) {
            setError('Please enter two products to compare.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await api.post('/api/compare', {
                productA: productA.trim(),
                productB: productB.trim()
            });
            setResult(response.data.data);
        } catch (err) {
            console.error(err);
            setError('The AI engine hit a snag generating the comparison. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            <Navbar />
            
            {/* Header Section */}
            <div className="bg-[#0B1E36] text-white pt-16 pb-24 px-4 text-center">
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold tracking-widest uppercase text-blue-200">AI Head-to-Head Engine</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-4">Hardcore Comparisons.</h1>
                <p className="text-blue-200/60 max-w-xl mx-auto font-medium">
                    Stop watching 20-minute YouTube reviews. Our AI compares 9 strict metrics instantly and declares a definitive winner.
                </p>
            </div>

            <main className="flex-1 max-w-6xl w-full mx-auto px-4 -mt-12 pb-24">
                
                {/* Input Area */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 mb-12">
                    <form onSubmit={handleCompare} className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 relative w-full">
                            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="e.g. iPhone 15 Pro"
                                value={productA}
                                onChange={(e) => setProductA(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>
                        
                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0 text-indigo-600">
                            <ArrowRightLeft className="w-5 h-5" />
                        </div>

                        <div className="flex-1 relative w-full">
                            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="e.g. Galaxy S24 Ultra"
                                value={productB}
                                onChange={(e) => setProductB(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black rounded-2xl transition-colors shadow-lg shadow-indigo-600/20"
                        >
                            Compare Now
                        </button>
                    </form>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 border-4 border-indigo-100 rounded-full"></div>
                            <div className="w-24 h-24 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                            <Sparkles className="w-8 h-8 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <h2 className="text-2xl font-black text-[#0B1E36] mb-2">Analyzing 9 strict metrics...</h2>
                        <p className="text-slate-500">Cross-referencing historical specs, benchmarks, and reviews.</p>
                    </div>
                )}

                {/* Results State */}
                <AnimatePresence>
                    {!loading && result && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* The Verdict Banner */}
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Trophy className="w-6 h-6 text-emerald-600" />
                                        <span className="text-sm font-black text-emerald-700 uppercase tracking-widest">Definitive Winner</span>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black text-emerald-900 mb-4">{result.structuredComparison?.winner}</h2>
                                    <p className="text-emerald-800/80 font-medium leading-relaxed max-w-3xl text-lg mb-4">
                                        {result.structuredComparison?.summary}
                                    </p>
                                    <ul className="list-disc list-inside text-emerald-800 font-medium">
                                        {result.structuredComparison?.reasons?.map((r, i) => <li key={i}>{r}</li>)}
                                    </ul>
                                </div>
                            </div>

                            {/* Comparison Grid */}
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                {/* Grid Header */}
                                <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200">
                                    <div className="p-6 font-bold text-slate-400 uppercase tracking-widest text-xs hidden md:block">Metric</div>
                                    <div className="p-6 font-black text-[#0B1E36] text-lg text-center border-l border-slate-200 bg-white">{productA}</div>
                                    <div className="p-6 font-black text-[#0B1E36] text-lg text-center border-l border-slate-200 bg-white">{productB}</div>
                                </div>

                                {/* Grid Rows */}
                                <div className="divide-y divide-slate-100">
                                    {Object.entries(result.engineData || {}).map(([key, value], idx) => {
                                        if (key === 'winner' || key === 'priceDifference') return null; // Skip non-comparative fields in grid
                                        
                                        return (
                                            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 hover:bg-slate-50/50 transition-colors">
                                                {/* Metric Name */}
                                                <div className="p-6 md:border-r border-slate-100 flex items-center bg-slate-50/50 md:bg-transparent">
                                                    <span className="font-bold text-slate-700 capitalize">{key}</span>
                                                </div>

                                                {/* Product A/B Combined Result (since engineData is simplified for now) */}
                                                <div className={`p-6 md:col-span-2 flex flex-col`}>
                                                    <p className="text-sm text-slate-600 leading-relaxed mb-3 flex-1">{value}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
