import React, { useState, useEffect, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { productAPI } from '../api/product';
import { ApiError } from '../components/common/EmptyStates';

import ProductGallery from '../components/product/ProductGallery';
import LowestPriceCard from '../components/product/LowestPriceCard';
import RetailerTable from '../components/product/RetailerTable';
import SpecificationTable from '../components/product/SpecificationTable';
import ProductGrid from '../components/product/ProductGrid';
import { 
  ProductGallerySkeleton, 
  PriceCardSkeleton, 
  RetailerTableSkeleton, 
  ChartSkeleton, 
  SpecificationSkeleton 
} from '../components/common/skeletons';

// Lazy load components for performance
const PriceHistoryChart = React.lazy(() => import('../components/product/PriceHistoryChart'));
const AISummary = React.lazy(() => import('../components/product/AISummary'));

const ProductDetailsPage = () => {
  const { id } = useParams();
  
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productAPI.getProductDetails(id);
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch product details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (error) {
    return <div className="pt-20"><ApiError message={error} onRetry={fetchProduct} /></div>;
  }

  const { product, lowestPrice, retailers, priceHistory, specifications, aiSummary, similarProducts, recommendations } = data || {};

  return (
    <div className="w-full flex flex-col gap-12 pb-16">
      
      {/* 1. Breadcrumbs */}
      <nav className="flex text-sm text-gray-500 dark:text-gray-400 gap-2 items-center">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        {isLoading ? (
          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        ) : (
          <>
            <Link to={`/category/${product?.category?.toLowerCase()}`} className="hover:text-primary-600 transition-colors">
              {product?.category || 'Category'}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">{product?.title}</span>
          </>
        )}
      </nav>

      {/* 2 & 3. Product Header, Gallery & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <div className="order-2 lg:order-1">
          {isLoading ? <ProductGallerySkeleton /> : <ProductGallery images={product?.images || [product?.image]} />}
        </div>
        
        <div className="order-1 lg:order-2 flex flex-col gap-8">
          <div>
            {isLoading ? (
              <div className="space-y-3 mb-6">
                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                <div className="w-3/4 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                  {product?.brand}
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                  {product?.title}
                </h1>
              </>
            )}
            
            {/* 4. Lowest Price Card */}
            {isLoading ? <PriceCardSkeleton /> : <LowestPriceCard lowestPrice={lowestPrice} retailers={retailers} />}
          </div>
          
          {/* 7. AI Summary */}
          {isLoading ? <PriceCardSkeleton /> : (
            <Suspense fallback={<PriceCardSkeleton />}>
              <AISummary summary={aiSummary} />
            </Suspense>
          )}
        </div>
      </div>

      {/* 5. Retailer Comparison Table */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Compare Prices</h2>
        {isLoading ? <RetailerTableSkeleton /> : <RetailerTable retailers={retailers} />}
      </section>

      {/* 6. Price History */}
      <section>
        <Suspense fallback={<ChartSkeleton />}>
          {isLoading ? <ChartSkeleton /> : <PriceHistoryChart history={priceHistory} />}
        </Suspense>
      </section>

      {/* 8. Specifications */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Specifications</h2>
        {isLoading ? <SpecificationSkeleton /> : <SpecificationTable specifications={specifications} />}
      </section>

      {/* 9. Similar Products */}
      <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Similar Products</h2>
        {isLoading ? <ProductGrid isLoading={true} skeletonCount={4} /> : (
          similarProducts?.length > 0 ? <ProductGrid products={similarProducts} /> : <div className="text-gray-500">No similar products found.</div>
        )}
      </section>

      {/* 10. Recommendations */}
      <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recommended For You</h2>
        {isLoading ? <ProductGrid isLoading={true} skeletonCount={4} /> : (
          recommendations?.length > 0 ? <ProductGrid products={recommendations} /> : <div className="text-gray-500">No recommendations found.</div>
        )}
      </section>

    </div>
  );
};

export default ProductDetailsPage;
