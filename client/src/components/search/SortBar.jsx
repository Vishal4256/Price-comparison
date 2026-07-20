import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

const SortBar = ({ totalResults = 0, query = '', viewMode, setViewMode }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Found <span className="font-bold text-gray-900 dark:text-white">{totalResults}</span> results 
        {query && <span> for <span className="font-bold text-gray-900 dark:text-white">"{query}"</span></span>}
      </div>
      
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <select className="h-9 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-primary-500 focus:border-primary-500 text-gray-700 dark:text-gray-300 px-3 py-1 outline-none">
          <option>Relevance</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Highest Rated</option>
          <option>Biggest Discount</option>
        </select>
        
        <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortBar;
