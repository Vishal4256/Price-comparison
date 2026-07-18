import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import ProductCard from '../shared/ProductCard';
import ProductCardSkeleton from '../shared/ProductCardSkeleton';

export default function RecommendationsTab() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setProducts([
                { id: '11', title: 'Apple Watch Series 9 [GPS 45mm]', brand: 'APPLE', price: 44900, originalPrice: 44900, discount: 0, image: 'https://images.unsplash.com/photo-1434493789847-2f02b0c1e851?w=400&q=80', rating: 4.9, reviews: 2150 },
                { id: '12', title: 'Samsung Galaxy Watch 6 Classic', brand: 'SAMSUNG', price: 36999, originalPrice: 42999, discount: 14, image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80', rating: 4.6, reviews: 890 }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />
                <h2 className="text-2xl font-black text-[#0B1E36]">AI Recommended For You</h2>
            </div>
            
            <p className="text-slate-500 font-medium mb-6 -mt-4">Based on your recent searches and wishlist items.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2].map(i => <ProductCardSkeleton key={i} />)
                ) : (
                    products.map(product => <ProductCard key={product.id} product={product} />)
                )}
            </div>
        </div>
    );
}
