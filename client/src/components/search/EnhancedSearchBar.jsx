import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Sparkles, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EnhancedSearchBar = ({ initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Click outside handler
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Debounced Autocomplete API call
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        try {
          const res = await axios.get(`/api/v1/search/autocomplete?q=${encodeURIComponent(query)}`);
          if (res.data.success) {
            setSuggestions(res.data.data.suggestions || []);
          }
        } catch (error) {
          console.error("Autocomplete fetch failed", error);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsFocused(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    setQuery(suggestionText);
    setIsFocused(false);
    navigate(`/search?q=${encodeURIComponent(suggestionText)}`);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'trending': return <TrendingUp size={16} className="text-orange-400" />;
      case 'ai_suggestion': return <Sparkles size={16} className="text-purple-400" />;
      case 'category': return <Tag size={16} className="text-blue-400" />;
      default: return <Search size={16} className="text-neutral-400" />;
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative z-20">
        <div className="relative flex items-center w-full bg-neutral-900 border border-neutral-700 rounded-2xl overflow-hidden shadow-sm hover:border-primary-500 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all duration-300">
          <div className="pl-4">
            <Search className="text-neutral-400" size={20} />
          </div>
          <input
            type="text"
            className="w-full py-4 pl-3 pr-4 bg-transparent text-neutral-100 placeholder-neutral-500 focus:outline-none text-lg"
            placeholder="Search products, brands, or categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
          <button
            type="submit"
            className="hidden md:block mr-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-50">
          <ul>
            {suggestions.map((item, idx) => (
              <li key={idx}>
                <button
                  onClick={() => handleSuggestionClick(item.text)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800 text-left transition-colors text-neutral-200"
                >
                  <div className="p-2 rounded-md bg-neutral-800 shrink-0">
                    {getIconForType(item.type)}
                  </div>
                  <span className="flex-1 font-medium">{item.text}</span>
                  <span className="text-xs text-neutral-500 capitalize">{item.type.replace('_', ' ')}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;
