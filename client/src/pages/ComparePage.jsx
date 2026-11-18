import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { compareAPI } from '../api/compare';
import { ApiError } from '../components/common/EmptyStates';
import Button from '../components/ui/Button';
import ProductCard from '../components/product/ProductCard';
import { 
  CompareHeaderSkeleton, 
  CompareCardSkeleton, 
  CompareTableSkeleton 
} from '../components/common/skeletons';
import { Plus, Trash2, Share2, X } from 'lucide-react';

const CompareMatrix = React.lazy(() => import('../components/compare/CompareMatrix'));
const SpecificationsComparison = React.lazy(() => import('../components/compare/SpecificationsComparison'));
const AISummary = React.lazy(() => import('../components/product/AISummary'));

const ComparePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const idsParam = searchParams.get('ids');
  const initialIds = idsParam ? idsParam.split(',').filter(Boolean) : [];
  
  // Hardcoded for MVP if no query param is passed
  const productIds = initialIds.length > 0 ? initialIds : ['p1', 'p2']; 

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComparison = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await compareAPI.compareProducts(productIds);
      setData(response.data);
    } catch (err) {
      setError('Failed to load comparison data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productIds.length > 0) {
      fetchComparison();
    } else {
      setIsLoading(false);
    }
  }, [idsParam]);

  const removeProduct = (idToRemove) => {
    const newIds = productIds.filter(id => id !== idToRemove);
    setSearchParams({ ids: newIds.join(',') });
  };

  if (!productIds.length) {
    return (
      <div className="pt-20 text-center">
        <h2 className="text-2xl font-bold mb-4">No products selected</h2>
        <p className="text-gray-500 mb-8">Add products to compare their features and prices.</p>
        <Button onClick={() => window.location.href='/search'}>Go to Search</Button>
      </div>
    );
  }

  if (error) {
    return <div className="pt-20"><ApiError message={error} onRetry={fetchComparison} /></div>;
  }

  const { products = [], lowestPrices = [], retailers = [], specifications = [], aiSummary } = data || {};

  return (
    <div className="w-full flex flex-col gap-12 pb-16">
      
      {/* Header */}
      {isLoading ? <CompareHeaderSkeleton /> : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Compare Products</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {products.length} of 4 selected
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => setSearchParams({ ids: '' })}>
              <Trash2 className="w-4 h-4 mr-2" /> Clear All
            </Button>
            <Button variant="secondary" size="sm">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button variant="primary" size="sm" onClick={() => window.location.href='/search'} disabled={products.length >= 4}>
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </div>
        </div>
      )}

      {/* Selected Products Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {isLoading 
          ? Array.from({ length: productIds.length }).map((_, i) => <CompareCardSkeleton key={i} />)
          : products.map(product => {
              // Create a mock product object format for ProductCard
              const lp = lowestPrices.find(l => l.productId === product.id);
              const cardProduct = {
                ...product,
                lowestPrice: lp
              };
              return (
                <div key={product.id} className="relative group">
                  <button 
                    onClick={() => removeProduct(product.id)}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white rounded-full flex items-center justify-center z-10 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <ProductCard product={cardProduct} />
                </div>
              );
            })
        }
      </div>

      {/* Retailer Comparison Matrix */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Price & Availability</h2>
        {isLoading ? <CompareTableSkeleton /> : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-2 shadow-sm">
            <Suspense fallback={<CompareTableSkeleton />}>
              <CompareMatrix products={products} lowestPrices={lowestPrices} retailers={retailers} />
            </Suspense>
          </div>
        )}
      </section>

      {/* Specifications Comparison */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Specifications</h2>
        {isLoading ? <CompareTableSkeleton /> : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-2 shadow-sm">
            <Suspense fallback={<CompareTableSkeleton />}>
              <SpecificationsComparison products={products} specifications={specifications} />
            </Suspense>
          </div>
        )}
      </section>

      {/* AI Verdict */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">AI Verdict</h2>
        {isLoading ? <CompareTableSkeleton /> : (
          <Suspense fallback={<CompareTableSkeleton />}>
            <AISummary summary={{ 
              verdict: aiSummary?.recommendation,
              pros: [`Best Overall: Product ${aiSummary?.bestOverall}`, `Best Budget: Product ${aiSummary?.bestBudget}`] 
            }} />
          </Suspense>
        )}
      </section>

    </div>
  );
};

export default ComparePage;
