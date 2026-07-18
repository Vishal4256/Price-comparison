import React, { useState, useEffect } from 'react';
import ProductCard from '../shared/ProductCard';
import ProductCardSkeleton from '../shared/ProductCardSkeleton';
import { Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BestOffers() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setProducts([
                { id: '21', title: 'GoPro HERO12 Black Action Camera', brand: 'GOPRO', price: 34990, originalPrice: 44990, discount: 22, image: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400&q=80', rating: 4.6, reviews: 890 },
                { id: '22', title: 'Asus ROG Strix G16 (2023) Gaming Laptop', brand: 'ASUS', price: 144990, originalPrice: 169990, discount: 14, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80', rating: 4.7, reviews: 310 },
                { id: '23', title: 'Nothing Phone (2) 256GB', brand: 'NOTHING', price: 39999, originalPrice: 49999, discount: 20, image: 'https://images.unsplash.com/photo-1662963162153-623e198d0705?w=400&q=80', rating: 4.5, reviews: 1540 },
                { id: '24', title: 'Marshall Emberton II Portable Speaker', brand: 'MARSHALL', price: 14999, originalPrice: 17499, discount: 14, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80', rating: 4.8, reviews: 3200 }
            ]);
            setLoading(false);
        }, 1400);
    }, []);

    return (
        <section className="py-16 px-4 bg-slate-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Tag className="w-5 h-5 text-blue-500" />
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Handpicked Value</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-[#0B1E36]">Best Offers Handpicked</h2>
                    </div>
                    <Link to="/search?tag=offers" className="hidden md:flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
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
