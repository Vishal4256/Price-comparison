import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) onSearch(query);
  };

  return (
    <div className="relative w-full max-w-2xl z-50">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search for products, brands, or models..."
          className="w-full h-12 pl-12 pr-10 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 dark:text-white"
        />
        {query && (
          <button 
            type="button" 
            onClick={() => setQuery('')}
            className="absolute right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      <AnimatePresence>
        {isFocused && query.length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-14 left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-4">
              <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Suggestions</h4>
              <ul className="space-y-2">
                {/* Placeholder for dynamic suggestions */}
                <li className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors text-sm dark:text-gray-200">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span>{query} in Electronics</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
