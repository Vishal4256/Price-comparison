import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import ProductCard from '../shared/ProductCard';
import ProductCardSkeleton from '../shared/ProductCardSkeleton';

export default function RecentViewsTab() {
    const [views, setViews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data fetching
        setTimeout(() => {
            setViews([
                { id: '34', title: 'Samsung Galaxy S24 Ultra 5G AI Smartphone', brand: 'SAMSUNG', price: 129999, originalPrice: 134999, discount: 4, image: 'https://images.unsplash.com/photo-1705646199343-7f28741364b4?w=400&q=80', rating: 4.8, reviews: 1120 },
                { id: '27', title: 'Bose QuietComfort 45 Wireless Noise Cancelling Headphones', brand: 'BOSE', price: 29900, originalPrice: 32900, discount: 9, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80', rating: 4.6, reviews: 3120 }
            ]);
            setLoading(false);
        }, 800);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Eye className="w-6 h-6 text-indigo-500" />
                <h2 className="text-2xl font-black text-[#0B1E36]">Recently Viewed</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <ProductCardSkeleton key={i} />)
                ) : (
                    views.map(product => <ProductCard key={product.id} product={product} />)
                )}
            </div>
        </div>
    );
}
