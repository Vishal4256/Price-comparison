import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ models: 2431, retailers: 98 });

  useEffect(() => {
    fetchTrending();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/products/public-stats');
      setStats({
        models: data.models,
        retailers: data.retailers
      });
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchTrending = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/products/trending');
      setTrending(data);
    } catch (err) {
      console.error(err);
      setTrending([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-[#0B1E36]">
            Compare. Save. Smile.
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            The smartest way to compare prices across thousands of retailers in real-time. Don't overpay for the things you love.
          </p>
          
          <div className="max-w-2xl mx-auto">
            <SearchBar />
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-500">
              <span>🔥 {stats.models.toLocaleString('en-IN')} Models</span>
              <span>•</span>
              <span>🛍️ {stats.retailers} Retailers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Categories Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-[#0B1E36]">Trending Categories</h2>
          <a href="#" className="text-sm font-semibold text-blue-600 hover:underline">See All ↗</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
          <Link to="/search?q=Electronics" className="relative rounded-2xl overflow-hidden group cursor-pointer block">
            <img src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80" alt="Electronics" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E36]/90 to-transparent flex items-end p-6">
              <div>
                <h3 className="text-white text-2xl font-bold mb-2">Electronics</h3>
                <p className="text-blue-200 text-sm">Smartphones, Laptops, Audio & more</p>
              </div>
            </div>
          </Link>
          
          <div className="grid grid-rows-2 gap-4">
            <Link to="/search?q=Home%20&%20Kitchen" className="relative rounded-2xl overflow-hidden group cursor-pointer block">
              <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80" alt="Home & Kitchen" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E36]/90 to-transparent flex items-end p-6">
                <h3 className="text-white text-xl font-bold">Home & Kitchen</h3>
              </div>
            </Link>
            
            <div className="grid grid-cols-2 gap-4">
              <Link to="/search?q=Fashion" className="relative rounded-2xl overflow-hidden group cursor-pointer bg-[#0B1E36] block">
                <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80" alt="Fashion" className="w-full h-full object-cover mix-blend-overlay group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 flex items-end justify-center pb-6">
                  <h3 className="text-white text-lg font-bold">Fashion</h3>
                </div>
              </Link>
              <Link to="/search?q=Beauty" className="relative rounded-2xl overflow-hidden group cursor-pointer bg-[#0B1E36] block">
                <img src="https://images.unsplash.com/photo-1596462502278-27bf85033c44?w=500&q=80" alt="Beauty" className="w-full h-full object-cover mix-blend-overlay group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 flex items-end justify-center pb-6">
                  <h3 className="text-white text-lg font-bold">Beauty</h3>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Deals Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-[#0B1E36] mb-8 flex items-center gap-2">
          <span>🔥</span> Hot Deals
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl h-[350px] animate-pulse border border-gray-100 p-4">
                <div className="h-40 bg-slate-100 rounded-lg mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-6"></div>
                <div className="h-8 bg-slate-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : trending.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trending.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-slate-500">
            <p>No trending deals available at the moment.</p>
            <p className="text-sm mt-2">Try searching for a product above!</p>
          </div>
        )}
      </section>

      {/* Newsletter Footer Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto bg-[#0B1E36] rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-left">
            <h2 className="text-3xl font-bold text-white mb-4">Never miss a price drop again.</h2>
            <p className="text-blue-200">Set alerts for your favorite products and we'll notify you the moment the price hits your target.</p>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="px-6 py-3 rounded-xl bg-white border border-transparent focus:border-blue-400 focus:ring-0 w-full sm:w-80 outline-none text-slate-900"
            />
            <button className="px-6 py-3 bg-[#D4AF37] hover:bg-[#c49e29] text-white font-bold rounded-xl transition-colors whitespace-nowrap">
              Get Alerts
            </button>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-8 px-4 text-center text-sm text-slate-500 border-t border-gray-200 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">PriceWise</span>
          <span>© 2024 PriceWise Utility. All rights reserved.</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-900">About Us</a>
          <a href="#" className="hover:text-slate-900">Terms of Service</a>
          <a href="#" className="hover:text-slate-900">Privacy Policy</a>
          <a href="#" className="hover:text-slate-900">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}
