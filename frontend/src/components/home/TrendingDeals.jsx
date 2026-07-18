import React, { useState, useEffect } from 'react';
import ProductCard from '../shared/ProductCard';
import ProductCardSkeleton from '../shared/ProductCardSkeleton';
import { Flame, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TrendingDeals() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setProducts([
                { id: '1', title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', brand: 'SONY', price: 29990, originalPrice: 34990, discount: 14, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80', rating: 4.8, reviews: 1240 },
                { id: '2', title: 'Apple MacBook Air M2 (2022) 8GB RAM 256GB SSD', brand: 'APPLE', price: 94900, originalPrice: 114900, discount: 17, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80', rating: 4.9, reviews: 3420 },
                { id: '3', title: 'Dyson Airwrap Multi-styler Complete Long', brand: 'DYSON', price: 44900, originalPrice: 49900, discount: 10, image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&q=80', rating: 4.7, reviews: 856 },
                { id: '4', title: 'Samsung Galaxy S24 Ultra 5G AI Smartphone', brand: 'SAMSUNG', price: 129999, originalPrice: 139999, discount: 7, image: 'https://images.unsplash.com/photo-1610945265064-3234dac1505c?w=400&q=80', rating: 4.6, reviews: 2150 }
            ]);
            setLoading(false);
        }, 1200);
    }, []);

    return (
        <section className="py-16 px-4 bg-slate-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-5 h-5 text-orange-500" />
                            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Hot Right Now</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-[#0B1E36]">Trending Deals</h2>
                    </div>
                    <Link to="/search?tag=trending" className="hidden md:flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        [1, 2, 3, 4].map(i => <ProductCardSkeleton key={i} />)
                    ) : (
                        products.map(product => <ProductCard key={product.id} product={product} />)
                    )}
                </div>
                
                <Link to="/search?tag=trending" className="md:hidden mt-8 w-full py-4 bg-white border border-slate-200 text-[#0B1E36] font-bold rounded-xl flex items-center justify-center gap-2">
                    View All Trending Deals <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </section>
    );
}
