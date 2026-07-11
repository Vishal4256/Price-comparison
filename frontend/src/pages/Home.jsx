import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import PriceAlert from '../components/PriceAlert';

// Custom CountUp Component
const CountUp = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count.toLocaleString('en-IN')}</span>;
};

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ models: 0, retailers: 0 });

  useEffect(() => {
    fetchFeatured();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/api/stats');
      setStats({
        models: data.totalProducts || 0,
        retailers: data.totalRetailers || 0
      });
    } catch (err) {
      console.error('Error fetching statistics:', err);
      // Fallback
      setStats({ models: 2404, retailers: 2 });
    }
  };

  const fetchFeatured = async () => {
    try {
      const { data } = await api.get('/api/products/featured');
      setFeatured(data);
    } catch (err) {
      console.error(err);
      setFeatured([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 px-4" style={{ marginBottom: '80px' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-[#0B1E36]">
            Compare. Save. Smile.
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            The smartest way to compare prices across thousands of retailers in real-time. Don't overpay for the things you love.
          </p>
          
          <div className="max-w-2xl mx-auto">
            <SearchBar />
            <div className="flex items-center justify-center gap-4 mt-6 text-sm font-bold text-slate-500">
              <span className="flex items-center gap-1">🔥 <CountUp end={stats.models} /> Total Products</span>
              <span>•</span>
              <span className="flex items-center gap-1">🛒 <CountUp end={stats.retailers} /> Retailers Supported</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Categories Section */}
      <section className="px-4 max-w-7xl mx-auto w-full" style={{ marginTop: '80px', marginBottom: '100px' }}>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-[#0B1E36]">Trending Categories</h2>
          <Link to="/search" className="text-sm font-semibold text-blue-600 hover:underline">See All ↗</Link>
        </div>
        
        {/* Responsive Grid: Using repeat auto-fill as requested */}
        <div className="grid gap-[24px] min-h-fit h-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          <div className="lg:col-span-2 h-auto min-h-[250px] flex flex-col">
            <CategoryCard 
              title="Electronics" 
              subtitle="Smartphones, Laptops, Audio & more"
              image="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80"
              path="/search?q=electronics"
              className="w-full h-full flex-1"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:col-span-2 lg:grid-rows-2 h-auto min-h-[250px]">
            <div className="h-auto min-h-[150px] flex flex-col">
              <CategoryCard 
                title="Home & Kitchen" 
                image="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80"
                path="/search?q=home kitchen"
                className="w-full h-full flex-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6 h-auto min-h-[150px]">
              <CategoryCard 
                title="Fashion" 
                image="https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80"
                path="/search?q=fashion"
                className="w-full h-full bg-[#0B1E36] flex-1"
              />
              <CategoryCard 
                title="Beauty" 
                image="https://images.unsplash.com/photo-1596462502278-27bf85033c44?w=500&q=80"
                path="/search?q=beauty"
                className="w-full h-full bg-[#0B1E36] flex-1"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products px-4 max-w-7xl mx-auto w-full" style={{ marginTop: '80px', marginBottom: '100px' }}>
        <h2 className="text-2xl font-bold text-[#0B1E36] mb-8 flex items-center gap-2">
          <span>🔥</span> Featured Products
        </h2>

        {loading ? (
          <div className="featured-grid grid gap-[24px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl h-auto min-h-[350px] animate-pulse border border-gray-100 p-4 flex flex-col">
                <div className="h-48 bg-slate-100 rounded-lg mb-4 w-full aspect-square"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-6"></div>
                <div className="mt-auto h-16 bg-slate-100 rounded w-full mb-4"></div>
                <div className="h-10 bg-slate-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="featured-grid grid gap-[24px] items-stretch" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-slate-500 shadow-sm">
            <p className="text-lg font-semibold text-slate-600 mb-2">No featured deals available right now.</p>
            <p className="text-sm">Check back later or search for a specific product!</p>
          </div>
        )}
      </section>

      {/* Newsletter / Price Alert Section */}
      <div style={{ marginTop: '80px', marginBottom: '80px' }}>
        <PriceAlert />
      </div>

      {/* Footer Links */}
      <footer className="px-4 text-center text-sm text-slate-500 border-t border-gray-200 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 py-8" style={{ marginTop: '80px' }}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">PriceWise</span>
          <span>© {new Date().getFullYear()} PriceWise. All rights reserved.</span>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link to="/about" className="hover:text-slate-900 font-medium transition-colors">About Us</Link>
          <Link to="/terms" className="hover:text-slate-900 font-medium transition-colors">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-slate-900 font-medium transition-colors">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-slate-900 font-medium transition-colors">Contact Support</Link>
        </div>
      </footer>
    </div>
  );
}
