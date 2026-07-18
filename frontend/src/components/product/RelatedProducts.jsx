import React, { useState, useEffect } from 'react';
import ProductCard from '../shared/ProductCard';
import ProductCardSkeleton from '../shared/ProductCardSkeleton';
import { Layers } from 'lucide-react';

export default function RelatedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setProducts([
                { id: '27', title: 'Bose QuietComfort 45 Wireless Noise Cancelling Headphones', brand: 'BOSE', price: 29900, originalPrice: 32900, discount: 9, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80', rating: 4.6, reviews: 3120 },
                { id: '28', title: 'Sennheiser Momentum 4 Wireless', brand: 'SENNHEISER', price: 34990, originalPrice: 34990, discount: 0, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80', rating: 4.8, reviews: 856 },
                { id: '29', title: 'Apple AirPods Max', brand: 'APPLE', price: 59900, originalPrice: 59900, discount: 0, image: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=400&q=80', rating: 4.7, reviews: 4210 },
                { id: '30', title: 'Sony WH-1000XM4', brand: 'SONY', price: 22990, originalPrice: 29990, discount: 23, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80', rating: 4.8, reviews: 12500 }
            ]);
            setLoading(false);
        }, 1200);
    }, []);

    return (
        <section className="py-12 border-t border-slate-200 mt-12">
            <div className="flex items-center gap-2 mb-8">
                <Layers className="w-5 h-5 text-indigo-500" />
                <h2 className="text-2xl font-black text-[#0B1E36]">Compare Similar Items</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    [1, 2, 3, 4].map(i => <ProductCardSkeleton key={i} />)
                ) : (
                    products.map(product => <ProductCard key={product.id} product={product} />)
                )}
            </div>
        </section>
    );
}
