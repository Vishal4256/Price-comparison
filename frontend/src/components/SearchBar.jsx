import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, X, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { debounce } from 'lodash';
import axios from 'axios';
import { api } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar({ initialValue = '' }) {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [toastMsg, setToastMsg] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
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
                // If there's no token, we shouldn't even fetch suggestions to avoid 401s in console
                if (!localStorage.getItem('token')) return;
                const response = await api.get(`/api/products/suggestions?q=${q}`);
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
        if (!localStorage.getItem('token')) {
            setShowAuthModal(true);
            setShowSuggestions(false);
            return;
        }

        const q = searchQuery || query;
        if (q.trim()) {
            // Save to recent searches
            const updatedRecent = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
            setRecentSearches(updatedRecent);
            localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
            
            setShowSuggestions(false);
            navigate(`/search?q=${encodeURIComponent(q)}`);
        } else {
            setToastMsg('Please enter a product name');
            setTimeout(() => setToastMsg(''), 3000);
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
                        {/* Recent Searches & Popular Searches */}
                        {!query && (
                            <div className="p-2 border-b border-gray-100">
                                {recentSearches.length > 0 && (
                                    <div className="mb-4">
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
                                <div>
                                    <div className="flex items-center gap-2 mb-2 px-4 pt-2">
                                        <TrendingUp className="w-4 h-4 text-slate-400" />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Popular Searches</span>
                                    </div>
                                    {['iphone 15', 'realme 5', 'jbl headphones', 'nothing phone 3'].map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSearch(s)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:text-[#0B1E36] hover:bg-slate-50 transition-all text-left font-medium"
                                        >
                                            <Search className="w-3.5 h-3.5 text-slate-400" />
                                            {s}
                                        </button>
                                    ))}
                                </div>
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
            
            {/* Custom Toast for Empty Search */}
            <AnimatePresence>
                {toastMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg z-[100] font-medium"
                    >
                        {toastMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Auth Modal */}
            <AnimatePresence>
                {showAuthModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowAuthModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
                        >
                            <button 
                                onClick={() => setShowAuthModal(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <Search className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-black text-center text-[#0B1E36] mb-3">Login Required</h3>
                            <p className="text-center text-slate-600 mb-8 leading-relaxed">
                                Please login or create an account to search and compare product prices across thousands of retailers.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => navigate('/login?redirect=/search')}
                                    className="w-full py-3.5 bg-[#0B1E36] text-white font-bold rounded-xl hover:bg-[#1a365d] transition-colors"
                                >
                                    Login
                                </button>
                                <button 
                                    onClick={() => navigate('/register?redirect=/search')}
                                    className="w-full py-3.5 bg-slate-100 text-[#0B1E36] font-bold rounded-xl hover:bg-slate-200 transition-colors border border-slate-200"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

