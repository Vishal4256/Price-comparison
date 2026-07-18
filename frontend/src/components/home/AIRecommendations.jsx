import React, { useState, useEffect } from 'react';
import ProductCard from '../shared/ProductCard';
import ProductCardSkeleton from '../shared/ProductCardSkeleton';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AIRecommendations() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        setTimeout(() => {
            setProducts([
                { id: '9', title: 'DJI Mini 3 Pro Drone', brand: 'DJI', price: 69990, originalPrice: 79990, discount: 12, image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=400&q=80', rating: 4.8, reviews: 420 },
                { id: '10', title: 'Sony Alpha ILCE-7M4 Full-Frame Camera', brand: 'SONY', price: 219990, originalPrice: 249990, discount: 12, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80', rating: 4.9, reviews: 890 },
                { id: '11', title: 'Apple iPad Pro 11-inch (M2)', brand: 'APPLE', price: 79900, originalPrice: 89900, discount: 11, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80', rating: 4.9, reviews: 2100 },
                { id: '12', title: 'Secretlab TITAN Evo 2022 Gaming Chair', brand: 'SECRETLAB', price: 44990, originalPrice: 49990, discount: 10, image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&q=80', rating: 4.7, reviews: 1560 }
            ]);
            setLoading(false);
        }, 1800);
    }, []);

    if (!user) return null; // Only show if logged in, or show a generic fallback. For this demo, let's show it anyway but change the text.

    return (
        <section className="py-16 px-4 bg-indigo-50/50">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Just For You</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-[#0B1E36]">
                            {user ? `Recommendations for ${user.name.split(' ')[0]}` : 'Smart Recommendations'}
                        </h2>
                    </div>
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
