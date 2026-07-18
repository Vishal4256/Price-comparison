import React, { useState, useEffect } from 'react';
import ProductCard from '../shared/ProductCard';
import ProductCardSkeleton from '../shared/ProductCardSkeleton';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DailyDeals() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setProducts([
                { id: '13', title: 'Nespresso Vertuo Next Coffee Machine', brand: 'NESPRESSO', price: 12990, originalPrice: 19990, discount: 35, image: 'https://images.unsplash.com/photo-1517551061922-b5e5fb20b301?w=400&q=80', rating: 4.5, reviews: 340 },
                { id: '14', title: 'Fitbit Charge 6 Fitness Tracker', brand: 'FITBIT', price: 10999, originalPrice: 14999, discount: 26, image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b0?w=400&q=80', rating: 4.4, reviews: 1120 },
                { id: '15', title: 'Kindle Paperwhite (16 GB)', brand: 'AMAZON', price: 11999, originalPrice: 14999, discount: 20, image: 'https://images.unsplash.com/photo-1544642878-1a52140e6912?w=400&q=80', rating: 4.8, reviews: 15400 },
                { id: '16', title: 'Philips Hue White & Color Smart Bulb', brand: 'PHILIPS', price: 2899, originalPrice: 4299, discount: 32, image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&q=80', rating: 4.6, reviews: 2150 }
            ]);
            setLoading(false);
        }, 1100);
    }, []);

    return (
        <section className="py-16 px-4 bg-slate-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-red-500" />
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Ending Soon</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-[#0B1E36]">Deals of the Day</h2>
                    </div>
                    <div className="hidden md:flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ends in</span>
                        <div className="text-lg font-black text-red-500">08:45:12</div>
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
