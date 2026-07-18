import React from 'react';
import { TrendingUp, Flame } from 'lucide-react';

export default function TrendingTab() {
    const trends = [
        { rank: 1, term: 'iPhone 16 Pro Max', queries: '12,450', momentum: '+45%' },
        { rank: 2, term: 'Samsung S24 Ultra', queries: '9,820', momentum: '+12%' },
        { rank: 3, term: 'PS5 Slim', queries: '8,400', momentum: '-5%' },
        { rank: 4, term: 'AirPods Pro 2', queries: '7,100', momentum: '+22%' },
        { rank: 5, term: 'MacBook Air M3', queries: '5,500', momentum: '+8%' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-indigo-500" />
                    <h2 className="text-2xl font-black text-[#0B1E36]">Trending Aggregation</h2>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                    <Flame className="w-4 h-4 fill-emerald-600" /> Live Updates
                </div>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold text-slate-800 mb-4">Top Searched Terms (24h)</h3>
                        <div className="space-y-4">
                            {trends.map(t => (
                                <div key={t.rank} className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500">#{t.rank}</div>
                                    <div className="flex-1">
                                        <div className="font-bold text-[#0B1E36]">{t.term}</div>
                                        <div className="text-xs text-slate-500">{t.queries} queries</div>
                                    </div>
                                    <div className={`text-sm font-black ${t.momentum.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {t.momentum}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col items-center justify-center text-center">
                        <Flame className="w-12 h-12 text-slate-300 mb-4" />
                        <h4 className="font-bold text-slate-700">AI Heatmap Processing</h4>
                        <p className="text-sm text-slate-500 mt-2">Visual heatmap rendering will be available in v2.1 when sufficient data density is achieved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
