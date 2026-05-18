import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, X, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { debounce } from 'lodash';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar({ initialValue = '' }) {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const navigate = useNavigate();
    const searchRef = useRef(null);

    // Load recent searches on mount
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) setRecentSearches(JSON.parse(saved).slice(0, 5));
    }, []);

    // Debounced suggestion fetcher
    const fetchSuggestions = useCallback(
        debounce(async (q) => {
            if (q.length < 2) {
                setSuggestions([]);
                return;
            }
            try {
                const response = await axios.get(`http://localhost:5000/api/products/suggestions?q=${q}`);
                setSuggestions(response.data);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        }, 300),
        []
    );

    useEffect(() => {
        fetchSuggestions(query);
    }, [query, fetchSuggestions]);

    // Handle clicks outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (searchQuery) => {
        const q = searchQuery || query;
        if (q.trim()) {
            // Save to recent searches
            const updatedRecent = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
            setRecentSearches(updatedRecent);
            localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
            
            setShowSuggestions(false);
            navigate(`/search?q=${encodeURIComponent(q)}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            if (selectedIndex > -1 && suggestions[selectedIndex]) {
                handleSearch(suggestions[selectedIndex].title);
            } else {
                handleSearch();
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-3xl mx-auto group z-50">
            <form 
                onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                className="relative"
            >
                <div className="relative flex items-center bg-white border border-gray-300 p-1.5 rounded-full group-focus-within:border-[#0B1E36] group-focus-within:ring-2 group-focus-within:ring-[#0B1E36]/20 transition-all duration-300 shadow-lg">
                    <div className="flex items-center gap-3 pl-4 flex-grow">
                        <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#0B1E36] transition-colors" />
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShowSuggestions(true);
                                setSelectedIndex(-1);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search for products, brands, or categories..."
                            className="w-full bg-transparent border-none text-slate-900 text-base outline-none placeholder:text-gray-400 py-3 font-medium"
                        />
                        {query && (
                            <button 
                                type="button" 
                                onClick={() => { setQuery(''); setSuggestions([]); }}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors mr-2"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        )}
                    </div>
                    <button 
                        type="submit"
                        className="flex items-center gap-2 px-8 py-3 bg-[#0B1E36] hover:bg-[#1a365d] text-white font-bold rounded-full transition-all"
                    >
                        Search
                    </button>
                </div>
            </form>

            <AnimatePresence>
                {showSuggestions && (query || recentSearches.length > 0) && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50"
                    >
                        {/* Recent Searches */}
                        {!query && recentSearches.length > 0 && (
                            <div className="p-2 border-b border-gray-100">
                                <div className="flex items-center gap-2 mb-2 px-4 pt-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Searches</span>
                                </div>
                                {recentSearches.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSearch(s)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:text-[#0B1E36] hover:bg-slate-50 transition-all text-left font-medium"
                                    >
                                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Suggestions */}
                        {query && (
                            <div className="p-2">
                                {suggestions.length > 0 ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-1 px-4 py-2">
                                            <TrendingUp className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Product Suggestions</span>
                                        </div>
                                        {suggestions.map((p, i) => (
                                            <button
                                                key={i}
                                                onMouseEnter={() => setSelectedIndex(i)}
                                                onClick={() => handleSearch(p.title)}
                                                className={`w-full flex items-center justify-between gap-4 px-4 py-3 rounded-xl transition-all text-left ${selectedIndex === i ? 'bg-slate-50 text-[#0B1E36]' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    {p.image && <img src={p.image} alt="" className="w-10 h-10 object-contain mix-blend-multiply" />}
                                                    <div className="truncate">
                                                        <div className="font-semibold truncate">{p.title}</div>
                                                        <div className="text-xs text-slate-400">from {p.source}</div>
                                                    </div>
                                                </div>
                                                <div className="text-[#0B1E36] font-bold whitespace-nowrap">${(p.currentPrice || p.price || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                                            </button>
                                        ))}
                                    </>
                                ) : query.length >= 2 ? (
                                    <div className="px-6 py-8 text-center text-slate-500">
                                        <p>No direct matches found. Press Enter to search everywhere.</p>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

