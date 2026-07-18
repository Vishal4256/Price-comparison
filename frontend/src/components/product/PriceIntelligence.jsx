import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Activity, Target, ShieldCheck, Zap, Bell, X, Check, Loader2 } from 'lucide-react';
import { api } from '../../api';
import DealScoreCard from '../ai/DealScoreCard';
import RecommendationCard from '../ai/RecommendationCard';

export default function PriceIntelligence({ product }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetPrice, setTargetPrice] = useState('');
    const [alertStatus, setAlertStatus] = useState(null); // 'loading', 'success', 'error'
    
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!product?.id) return;
        setLoading(true);
        api.get(`/api/prices/${product.id}/statistics`)
            .then(res => setStats(res.data.data))
            .catch(err => console.error("Failed to load statistics:", err))
            .finally(() => setLoading(false));
    }, [product?.id]);

    if (!product) return null;

    if (loading) {
        return (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 flex flex-col items-center justify-center mb-8">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                <span className="text-sm font-bold text-slate-500">Loading Intelligence Engine...</span>
            </div>
        );
    }

    if (!stats) return null;

    const currentPrice = product.price || stats.average; // fallback to avg if current price is missing in prop
    const lowestEver = stats.lowest || currentPrice;
    const highestEver = stats.highest || currentPrice;
    const averagePrice = stats.average || currentPrice;
    
    const discountFromAverage = ((averagePrice - currentPrice) / averagePrice) * 100;
    const dealScore = Math.min(100, Math.max(0, 60 + (discountFromAverage * 2))).toFixed(0);
    
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-200';
        if (score >= 60) return 'text-amber-500 bg-amber-50 border-amber-200';
        return 'text-rose-500 bg-rose-50 border-rose-200';
    };

    const handleSetAlert = async (e) => {
        e.preventDefault();
        setAlertStatus('loading');
        try {
            await api.post('/api/wishlist', {
                productId: product.id,
                title: product.title,
                image: product.images ? product.images[0] : 'https://via.placeholder.com/400',
                currentPrice,
                targetPrice: Number(targetPrice)
            });
            setAlertStatus('success');
            setTimeout(() => setIsModalOpen(false), 2000);
        } catch (error) {
            setAlertStatus('error');
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-8 relative">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Activity className="w-6 h-6 text-indigo-500" />
                    <h3 className="text-xl font-black text-[#0B1E36]">Price Intelligence</h3>
                </div>
                <button 
                    onClick={() => { setIsModalOpen(true); setAlertStatus(null); setTargetPrice(''); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors text-xs font-bold rounded-lg border border-indigo-100"
                >
                    <Bell className="w-3.5 h-3.5" />
                    Set Alert
                </button>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Price</div>
                    <div className="text-xl font-black text-[#0B1E36]">₹{currentPrice.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-emerald-500" /> Lowest Ever
                    </div>
                    <div className="text-xl font-black text-emerald-600">₹{lowestEver.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-rose-500" /> Highest Ever
                    </div>
                    <div className="text-xl font-black text-rose-600">₹{highestEver.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Average Price</div>
                    <div className="text-xl font-black text-slate-700">₹{averagePrice.toLocaleString()}</div>
                </div>
            </div>

            <hr className="border-slate-100 mb-8" />

            {/* AI Insights (Powered by AI Decision Engine) */}
            <div className="grid md:grid-cols-2 gap-8">
                <DealScoreCard 
                    productId={product.id} 
                    currentPrice={currentPrice} 
                    productTitle={product.title} 
                />
                <RecommendationCard 
                    productId={product.id} 
                    currentPrice={currentPrice} 
                    productTitle={product.title} 
                />
            </div>

            {/* Alert Modal */}
            {isModalOpen && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center p-6 rounded-3xl">
                    <div className="bg-white border border-slate-200 shadow-2xl p-6 rounded-3xl w-full max-w-sm relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-indigo-50 p-2 rounded-xl">
                                <Bell className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-black text-[#0B1E36]">Set Price Alert</h3>
                        </div>
                        
                        <p className="text-sm text-slate-500 mb-6">
                            Current price is <span className="font-bold text-slate-800">₹{currentPrice.toLocaleString()}</span>. We'll notify you when it drops to your target.
                        </p>

                        <form onSubmit={handleSetAlert}>
                            <div className="relative mb-6">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                                <input 
                                    type="number" 
                                    required
                                    min="1"
                                    max={currentPrice - 1}
                                    value={targetPrice}
                                    onChange={(e) => setTargetPrice(e.target.value)}
                                    placeholder="Enter target price"
                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            {alertStatus === 'success' ? (
                                <div className="w-full py-3 bg-emerald-50 text-emerald-600 font-bold rounded-xl flex items-center justify-center gap-2">
                                    <Check className="w-5 h-5" /> Alert Set!
                                </div>
                            ) : (
                                <button 
                                    type="submit" 
                                    disabled={!targetPrice || alertStatus === 'loading'}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors"
                                >
                                    {alertStatus === 'loading' ? 'Saving...' : 'Track Price'}
                                </button>
                            )}
                            {alertStatus === 'error' && <p className="text-xs text-red-500 text-center mt-3">Failed to set alert. Are you logged in?</p>}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
