import React from 'react';
import { motion } from 'framer-motion';

const FilterSidebar = ({ filters, onFilterChange }) => {
  // Mock filter categories
  const categories = ['Electronics', 'Laptops', 'Headphones', 'Smartphones', 'Wearables'];
  const brands = ['Apple', 'Sony', 'Samsung', 'Bose', 'Dell'];

  return (
    <div className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 h-fit sticky top-24">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Filters</h3>
      
      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary-600 transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Brand</h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary-600 transition-colors">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Price Range</h4>
        <input type="range" min="0" max="100000" className="w-full accent-primary-500" />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>₹0</span>
          <span>₹1,00,000+</span>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
