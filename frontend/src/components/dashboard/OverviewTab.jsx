import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Loader2, TrendingDown, Target, Zap, Search, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function OverviewTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/dashboard/user')
            .then(res => setData(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-3xl border border-slate-200 p-24 flex flex-col items-center justify-center h-[500px]">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <h3 className="font-bold text-slate-500">Loading Intelligence...</h3>
            </div>
        );
    }

    if (!data) return null;

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-6">
            {/* Savings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400">Total Savings Potential</p>
                        <h4 className="text-2xl font-black text-[#0B1E36]">₹{data.totalSavingsPotential.toLocaleString()}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400">Below Target Price</p>
                        <h4 className="text-2xl font-black text-[#0B1E36]">{data.belowTargetCount} Items</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400">Avg Deal Score</p>
                        <h4 className="text-2xl font-black text-[#0B1E36]">{data.averageDealScore}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                        <Eye className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400">Tracked Products</p>
                        <h4 className="text-2xl font-black text-[#0B1E36]">{data.trackedProducts}</h4>
                    </div>
                </div>
            </div>

            {/* AI Insights & Wishlist Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="font-black text-[#0B1E36] mb-6 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" /> AI Shopping Insights
                    </h3>
                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50 h-48 flex items-center text-center">
                        <p className="text-indigo-900 font-medium leading-relaxed italic text-lg w-full">
                            "{data.aiSummary}"
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="font-black text-[#0B1E36] mb-6">Wishlist Distribution</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.favoriteCategories.length ? data.favoriteCategories : [{ name: 'Empty', count: 1 }]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {data.favoriteCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            {/* Recent Searches */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-[#0B1E36] mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-indigo-500" /> Recent Searches
                </h3>
                <div className="flex flex-wrap gap-3">
                    {data.recentSearches.map((s, i) => (
                        <div key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-bold text-slate-600">
                            {s.query}
                        </div>
                    ))}
                    {data.recentSearches.length === 0 && <p className="text-slate-500 italic">No recent searches.</p>}
                </div>
            </div>
        </div>
    );
}
