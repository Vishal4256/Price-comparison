import React, { useState, useEffect } from 'react';
import ProductCard from '../shared/ProductCard';
import ProductCardSkeleton from '../shared/ProductCardSkeleton';
import { ArrowDownCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PriceDrops() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setProducts([
                { id: '5', title: 'LG C3 55-inch evo OLED TV (2023)', brand: 'LG', price: 119990, originalPrice: 189990, discount: 36, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&q=80', rating: 4.9, reviews: 512 },
                { id: '6', title: 'Nike Air Force 1 \'07 Men\'s Shoes', brand: 'NIKE', price: 5495, originalPrice: 7495, discount: 26, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80', rating: 4.5, reviews: 8900 },
                { id: '7', title: 'Bose QuietComfort Earbuds II', brand: 'BOSE', price: 18990, originalPrice: 25900, discount: 26, image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80', rating: 4.6, reviews: 1120 },
                { id: '8', title: 'Vitamix 5200 Professional-Grade Blender', brand: 'VITAMIX', price: 34990, originalPrice: 49990, discount: 30, image: 'https://images.unsplash.com/photo-1585237432811-5b7fbab6f2a6?w=400&q=80', rating: 4.8, reviews: 340 }
            ]);
            setLoading(false);
        }, 1500);
    }, []);

    return (
        <section className="py-16 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowDownCircle className="w-5 h-5 text-green-500" />
                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Major Savings</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-[#0B1E36]">Biggest Price Drops</h2>
                    </div>
                    <Link to="/search?tag=drops" className="hidden md:flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
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
