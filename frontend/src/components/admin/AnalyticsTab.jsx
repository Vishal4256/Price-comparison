import React, { useState, useEffect } from 'react';
import { BarChart3, Users, DollarSign, Activity, Package, Search, Loader2 } from 'lucide-react';
import { api } from '../../api';

export default function AnalyticsTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/dashboard/admin')
            .then(res => setData(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-3xl border border-slate-200 p-24 flex flex-col items-center justify-center h-[500px]">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <h3 className="font-bold text-slate-500">Loading Analytics...</h3>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-6 h-6 text-indigo-500" />
                <h2 className="text-2xl font-black text-[#0B1E36]">Platform Analytics</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <Users className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Users</div>
                    <div className="text-3xl font-black text-[#0B1E36]">{data.totalUsers.toLocaleString()}</div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                        <Package className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Products Indexed</div>
                    <div className="text-3xl font-black text-[#0B1E36]">{data.productsIndexed.toLocaleString()}</div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <Search className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Searches Today</div>
                    <div className="text-3xl font-black text-[#0B1E36]">{data.searchesToday.toLocaleString()}</div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Avg AI Response</div>
                    <div className="text-3xl font-black text-[#0B1E36]">{data.averageApiResponseTime}ms</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-10">
                     <h3 className="text-slate-400 font-bold mb-2">Total Wishlist Items</h3>
                     <span className="text-5xl font-black text-[#0B1E36]">{data.totalWishlistItems.toLocaleString()}</span>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-10">
                     <h3 className="text-slate-400 font-bold mb-2">Price Updates Today</h3>
                     <span className="text-5xl font-black text-[#0B1E36]">{data.priceUpdatesToday.toLocaleString()}</span>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-10">
                     <h3 className="text-slate-400 font-bold mb-2">Gemini Success Rate</h3>
                     <span className="text-5xl font-black text-emerald-500">{data.geminiSuccessRate}%</span>
                </div>
            </div>
        </div>
    );
}
