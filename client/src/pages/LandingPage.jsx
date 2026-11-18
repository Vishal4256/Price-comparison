import React, { useEffect, useState, Suspense } from 'react';
import { homeAPI } from '../api/home';
import { ApiError } from '../components/common/EmptyStates';
import { HeroSkeleton, CategorySkeleton, ProductCardSkeleton } from '../components/common/skeletons';
import HeroSection from '../components/home/HeroSection';

// Lazy loaded below-the-fold components for performance
const CategoryCard = React.lazy(() => import('../components/category/CategoryCard'));
const ProductGrid = React.lazy(() => import('../components/product/ProductGrid'));
const FeatureCards = React.lazy(() => import('../components/home/FeatureCards'));
const HowItWorks = React.lazy(() => import('../components/home/HowItWorks'));
const Newsletter = React.lazy(() => import('../components/home/Newsletter'));

const LandingPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHomeData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await homeAPI.getHomeData();
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  if (error) {
    return (
      <div className="pt-20">
        <ApiError message={error} onRetry={fetchHomeData} />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 1. Hero Section (Above the fold - loaded immediately or with specific skeleton) */}
      {isLoading ? <HeroSkeleton /> : <HeroSection suggestions={data?.heroSuggestions || []} />}

      {/* 2. Popular Categories */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Popular Categories</h2>
          <a href="/categories" className="text-primary-600 dark:text-primary-400 font-medium hover:underline text-sm">View All</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {isLoading ? (
             Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
          ) : (
            <Suspense fallback={<CategorySkeleton />}>
              {data?.popularCategories?.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </Suspense>
          )}
        </div>
      </section>

      {/* 3. Trending Products */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Trending Right Now</h2>
        </div>
        <Suspense fallback={<ProductGrid isLoading={true} skeletonCount={4} />}>
          <ProductGrid products={data?.trendingProducts || []} isLoading={isLoading} skeletonCount={4} />
        </Suspense>
      </section>

      {/* 4. Biggest Price Drops */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Biggest Price Drops</h2>
        </div>
        <Suspense fallback={<ProductGrid isLoading={true} skeletonCount={4} />}>
          <ProductGrid products={data?.biggestPriceDrops || []} isLoading={isLoading} skeletonCount={4} />
        </Suspense>
      </section>

      {/* 5. Recommended For You */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Recommended For You</h2>
        </div>
        <Suspense fallback={<ProductGrid isLoading={true} skeletonCount={4} />}>
          <ProductGrid products={data?.recommended || []} isLoading={isLoading} skeletonCount={4} />
        </Suspense>
      </section>

      {/* 6. Why PriceSmart */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 rounded-3xl" />}>
        <FeatureCards />
      </Suspense>

      {/* 7. How It Works */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 rounded-3xl" />}>
        <HowItWorks />
      </Suspense>

      {/* 8. Newsletter */}
      <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 rounded-3xl" />}>
        <Newsletter />
      </Suspense>
    </div>
  );
};

export default LandingPage;
