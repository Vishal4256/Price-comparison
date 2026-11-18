import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Mic } from 'lucide-react';
import { fadeIn, slideUp } from '../../motion/slide';

const HeroSection = ({ suggestions = [] }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query) window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gray-900 dark:bg-black pt-24 pb-32 px-6 lg:px-8 text-center mb-16 shadow-2xl">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[1000px] h-[1000px] rounded-full bg-primary-600/20 blur-[120px] mix-blend-screen" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen" />
      </div>

      <motion.div 
        variants={slideUp} 
        initial="hidden" 
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-8">
          Find the Best Price <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-500">
            Across Every Store, Instantly
          </span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 font-medium">
          The AI-powered price intelligence platform. Search once, compare everywhere, and never overpay again.
        </p>

        {/* AI Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
          <div className="relative flex items-center bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-full border border-white/20 p-2 shadow-2xl transition-all hover:bg-white/15 focus-within:bg-white/20 focus-within:border-primary-500/50">
            <Search className="absolute left-6 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full h-14 pl-16 pr-16 bg-transparent border-none text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-0"
            />
            <button type="button" className="absolute right-6 p-2 text-gray-400 hover:text-white transition-colors">
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Trending Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="text-sm text-gray-400 py-1">Trending:</span>
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(suggestion);
                  window.location.href = `/search?q=${encodeURIComponent(suggestion)}`;
                }}
                className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default HeroSection;
