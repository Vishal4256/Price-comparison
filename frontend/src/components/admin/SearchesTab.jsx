import React from 'react';
import { Search, Clock } from 'lucide-react';

export default function SearchesTab() {
    const searches = [
        { id: 1, query: 'Gaming laptop under 80000', intent: 'Electronics', user: 'Vishal Singh', time: '2 mins ago' },
        { id: 2, query: 'Sony noise cancelling headphones', intent: 'Audio', user: 'Guest', time: '15 mins ago' },
        { id: 3, query: 'Best budget smartwatches 2026', intent: 'Wearables', user: 'John Doe', time: '1 hour ago' },
        { id: 4, query: 'Gift for mother under 5000', intent: 'Gifting', user: 'Sarah Smith', time: '3 hours ago' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Search className="w-6 h-6 text-indigo-500" />
                <h2 className="text-2xl font-black text-[#0B1E36]">Live Search Feed</h2>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {searches.map(s => (
                        <div key={s.id} className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <Search className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 text-lg">{s.query}</h4>
                                <div className="flex gap-4 mt-2">
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-widest">{s.intent}</span>
                                    <span className="text-sm font-medium text-slate-500">{s.user}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <Clock className="w-3 h-3" /> {s.time}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
