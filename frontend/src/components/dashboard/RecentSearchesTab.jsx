import React, { useState, useEffect } from 'react';
import { Search, History, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RecentSearchesTab() {
    const [searches, setSearches] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Mock data
        setSearches([
            { id: 1, query: 'Gaming laptop under 80000', timestamp: '2 hours ago', category: 'Laptops' },
            { id: 2, query: 'Sony noise cancelling headphones', timestamp: '1 day ago', category: 'Audio' },
            { id: 3, query: 'Best budget smartwatches 2026', timestamp: '3 days ago', category: 'Wearables' }
        ]);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <History className="w-6 h-6 text-indigo-500" />
                <h2 className="text-2xl font-black text-[#0B1E36]">Recent Searches</h2>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {searches.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 font-medium">No recent searches found.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {searches.map(search => (
                            <div key={search.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate(`/search?q=${encodeURIComponent(search.query)}`)}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                        <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{search.query}</h4>
                                        <div className="text-xs text-slate-500 font-medium">{search.timestamp} • {search.category}</div>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
