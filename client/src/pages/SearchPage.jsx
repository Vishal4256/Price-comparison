import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchAPI } from '../api/search';
import FilterSidebar from '../components/search/FilterSidebar';
import SortBar from '../components/search/SortBar';
import ProductGrid from '../components/product/ProductGrid';
import { NoResults, ApiError } from '../components/common/EmptyStates';
import { motion } from 'framer-motion';
import { fadeIn } from '../motion/fade';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({});

  const fetchResults = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await searchAPI.searchProducts(query, filters);
      setProducts(response.data?.products || []);
    } catch (err) {
      setError('Failed to fetch search results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [query, filters]);

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="flex flex-col md:flex-row gap-6">
      
      {/* Sidebar Filters */}
      <FilterSidebar filters={filters} onFilterChange={setFilters} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <SortBar 
          totalResults={products.length} 
          query={query} 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
        />
        
        {/* State Management */}
        <div className="flex-1">
          {error ? (
            <ApiError message={error} onRetry={fetchResults} />
          ) : isLoading ? (
            <ProductGrid isLoading={true} skeletonCount={8} />
          ) : products.length === 0 ? (
            <NoResults query={query} />
          ) : (
            <ProductGrid products={products} isLoading={false} />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchPage;
