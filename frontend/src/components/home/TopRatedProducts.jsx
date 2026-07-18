import React, { useState, useEffect } from 'react';
import ProductCard from '../shared/ProductCard';
import ProductCardSkeleton from '../shared/ProductCardSkeleton';
import { Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopRatedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setProducts([
                { id: '17', title: 'Oculus Meta Quest 3 128GB', brand: 'META', price: 49900, originalPrice: 54900, discount: 9, image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400&q=80', rating: 4.9, reviews: 3120 },
                { id: '18', title: 'Herman Miller Aeron Ergonomic Chair', brand: 'HERMAN MILLER', price: 119999, originalPrice: 139999, discount: 14, image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400&q=80', rating: 4.8, reviews: 856 },
                { id: '19', title: 'Keychron K2 Wireless Mechanical Keyboard', brand: 'KEYCHRON', price: 7999, originalPrice: 9999, discount: 20, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&q=80', rating: 4.7, reviews: 4210 },
                { id: '20', title: 'Logitech MX Master 3S Wireless Mouse', brand: 'LOGITECH', price: 9995, originalPrice: 10995, discount: 9, image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&q=80', rating: 4.9, reviews: 12500 }
            ]);
            setLoading(false);
        }, 1300);
    }, []);

    return (
        <section className="py-16 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Community Favorites</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-[#0B1E36]">Top Rated Products</h2>
                    </div>
                    <Link to="/search?sort=rating" className="hidden md:flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
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
            </div>
        </section>
    );
}
