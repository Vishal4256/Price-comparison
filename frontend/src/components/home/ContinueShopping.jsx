import React, { useState, useEffect } from 'react';
import ProductCard from '../shared/ProductCard';
import ProductCardSkeleton from '../shared/ProductCardSkeleton';
import { History, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContinueShopping() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // In a real app, this fetches the user's recently viewed items or active carts.
    useEffect(() => {
        setTimeout(() => {
            setProducts([
                { id: '25', title: 'Apple Watch Series 9 (GPS, 41mm)', brand: 'APPLE', price: 39900, originalPrice: 41900, discount: 5, image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&q=80', rating: 4.8, reviews: 2150 },
                { id: '26', title: 'Xbox Series X 1TB Console', brand: 'MICROSOFT', price: 49990, originalPrice: 54990, discount: 9, image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=400&q=80', rating: 4.9, reviews: 5400 }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    if (!loading && products.length === 0) return null;

    return (
        <section className="py-16 px-4 bg-slate-50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <History className="w-5 h-5 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pick up where you left off</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-[#0B1E36]">Recently Viewed</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        [1, 2].map(i => <ProductCardSkeleton key={i} />)
                    ) : (
                        <>
                            {products.map(product => <ProductCard key={product.id} product={product} />)}
                            
                            {/* Contextual Continue Browsing Card */}
                            <Link to="/search" className="hidden lg:flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-slate-200 rounded-3xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors group">
                                <div className="w-16 h-16 bg-slate-50 group-hover:bg-indigo-100 rounded-full flex items-center justify-center mb-4 transition-colors">
                                    <ArrowRight className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                </div>
                                <h3 className="font-bold text-[#0B1E36] group-hover:text-indigo-600 transition-colors">View all history</h3>
                                <p className="text-xs text-slate-400 mt-2 text-center">See all your past searches and viewed items.</p>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
