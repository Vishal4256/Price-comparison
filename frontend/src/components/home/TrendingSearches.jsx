import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TrendingSearches() {
    const [loading, setLoading] = useState(true);
    const [searches, setSearches] = useState([]);

    useEffect(() => {
        // Simulate API call
        const fetchSearches = () => {
            setTimeout(() => {
                setSearches([
                    "iPhone 15 Pro",
                    "Sony PlayStation 5",
                    "MacBook Air M2",
                    "Dyson Airwrap",
                    "Nike Air Force 1",
                    "Samsung Galaxy S24",
                    "LG C3 OLED"
                ]);
                setLoading(false);
            }, 800);
        };
        fetchSearches();
    }, []);

    if (loading) {
        return (
            <div className="py-6 border-b border-slate-100 bg-white px-4">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
                    <div className="w-32 h-4 bg-slate-100 rounded animate-pulse"></div>
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-24 h-8 bg-slate-100 rounded-full animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="py-4 border-b border-slate-100 bg-white px-4 overflow-x-auto whitespace-nowrap hide-scrollbar">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">
                    <Search className="w-3 h-3" />
                    Trending Now:
                </div>
                {searches.map((term, index) => (
                    <Link 
                        key={index}
                        to={`/search?q=${encodeURIComponent(term)}`}
                        className="inline-block bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
                    >
                        {term}
                    </Link>
                ))}
            </div>
        </div>
    );
}
