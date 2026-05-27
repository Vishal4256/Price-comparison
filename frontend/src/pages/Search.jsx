import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { api } from '../api';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { Loader2, SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        stores: [],
        minPrice: '',
        maxPrice: '',
        sortBy: 'Recommended'
    });

    useEffect(() => {
        if (query) {
            fetchProducts();
        }
    }, [query]);

    useEffect(() => {
        applyFilters();
    }, [products, filters]);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/products/search?q=${query}`);
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch products. Please try again.');
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...products];

        if (filters.stores.length > 0) {
            filtered = filtered.filter(p => filters.stores.includes(p.source));
        }

        if (filters.minPrice) {
            filtered = filtered.filter(p => p.currentPrice >= parseFloat(filters.minPrice));
        }
        if (filters.maxPrice) {
            filtered = filtered.filter(p => p.currentPrice <= parseFloat(filters.maxPrice));
        }

        // Sorting
        if (filters.sortBy === 'Price: Low to High') {
            filtered.sort((a, b) => (a.currentPrice || a.price || 0) - (b.currentPrice || b.price || 0));
        } else if (filters.sortBy === 'Price: High to Low') {
            filtered.sort((a, b) => (b.currentPrice || b.price || 0) - (a.currentPrice || a.price || 0));
        } else if (filters.sortBy === 'Top Rated') {
            filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        setFilteredProducts(filtered);
    };

    const toggleStore = (store) => {
        setFilters(prev => ({
            ...prev,
            stores: prev.stores.includes(store) 
                ? prev.stores.filter(s => s !== store)
                : [...prev.stores, store]
        }));
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 py-8">
                
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-[#0B1E36]">Filters</h3>
                            <button className="text-sm font-semibold text-blue-600 hover:underline">Clear all</button>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Store/Retailer filter mockup */}
                            <div className="border-b border-gray-200 pb-6">
                                <h4 className="font-bold text-sm text-slate-900 mb-4">Retailer</h4>
                                <div className="space-y-3">
                                    {['Amazon', 'Flipkart', 'eBay'].map(store => (
                                        <label key={store} className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                checked={filters.stores.includes(store)}
                                                onChange={() => toggleStore(store)}
                                                className="w-4 h-4 rounded border-gray-300 text-[#0B1E36] focus:ring-[#0B1E36]" 
                                            />
                                            <span className="text-sm text-slate-600 group-hover:text-slate-900">{store}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price filter mockup */}
                            <div className="border-b border-gray-200 pb-6">
                                <h4 className="font-bold text-sm text-slate-900 mb-4">Price</h4>
                                <div className="space-y-3">
                                    {['Under ₹1,000', '₹1,000 - ₹5,000', '₹5,000 - ₹10,000', '₹10,000 - ₹50,000', 'Over ₹50,000'].map(range => (
                                        <label key={range} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0B1E36] focus:ring-[#0B1E36]" />
                                            <span className="text-sm text-slate-600 group-hover:text-slate-900">{range}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                        <input 
                                            type="number" 
                                            placeholder="Min"
                                            value={filters.minPrice}
                                            onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                                            className="w-full bg-white border border-gray-300 rounded-lg text-sm text-slate-900 p-2 pl-6 outline-none focus:border-[#0B1E36]"
                                        />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                        <input 
                                            type="number" 
                                            placeholder="Max"
                                            value={filters.maxPrice}
                                            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                                            className="w-full bg-white border border-gray-300 rounded-lg text-sm text-slate-900 p-2 pl-6 outline-none focus:border-[#0B1E36]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Brand filter mockup */}
                            <div className="border-b border-gray-200 pb-6">
                                <h4 className="font-bold text-sm text-slate-900 mb-4">Brand</h4>
                                <div className="space-y-3">
                                    {['Apple', 'Sony', 'Bose', 'Samsung', 'JBL'].map(brand => (
                                        <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0B1E36] focus:ring-[#0B1E36]" />
                                            <span className="text-sm text-slate-600 group-hover:text-slate-900">{brand}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                             {/* Condition filter mockup */}
                             <div className="border-b border-gray-200 pb-6">
                                <h4 className="font-bold text-sm text-slate-900 mb-4">Condition</h4>
                                <div className="space-y-3">
                                    {['New', 'Renewed', 'Used'].map(cond => (
                                        <label key={cond} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0B1E36] focus:ring-[#0B1E36]" />
                                            <span className="text-sm text-slate-600 group-hover:text-slate-900">{cond}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Results Area */}
                    <div className="flex-1">
                        <div className="mb-6">
                            <SearchBar initialValue={query} />
                        </div>

                        <div className="flex justify-between items-center mb-6 py-2 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-slate-900">
                                {loading ? 'Searching...' : `${filteredProducts.length} Results for "${query}"`}
                            </h2>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Sort by:</span>
                                <div className="relative">
                                    <select 
                                        value={filters.sortBy}
                                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                                        className="appearance-none bg-white border border-gray-300 text-sm font-semibold text-slate-900 rounded-lg pl-3 pr-8 py-2 outline-none cursor-pointer hover:border-gray-400"
                                    >
                                        <option value="Recommended">Recommended</option>
                                        <option value="Price: Low to High">Price: Low to High</option>
                                        <option value="Price: High to Low">Price: High to Low</option>
                                        <option value="Top Rated">Top Rated</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 text-[#0B1E36] animate-spin mb-4" />
                                <p className="text-slate-500">Scraping multiple stores. Please wait...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-20">
                                <p className="text-red-500">{error}</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
                                <p className="text-slate-500 mb-2">No products match your current filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {filteredProducts.map((product, idx) => (
                                    <ProductCard key={idx} product={product} />
                                ))}
                            </div>
                        )}
                        
                        {/* Pagination Mockup */}
                        {!loading && filteredProducts.length > 0 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-slate-500 hover:bg-slate-50">&lt;</button>
                                <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0B1E36] text-white font-bold">1</button>
                                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-slate-700 hover:bg-slate-50">2</button>
                                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-slate-700 hover:bg-slate-50">3</button>
                                <span className="text-slate-500">...</span>
                                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-slate-700 hover:bg-slate-50">12</button>
                                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-slate-500 hover:bg-slate-50">&gt;</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
