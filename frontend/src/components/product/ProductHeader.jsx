import React, { useState, useEffect } from 'react';
import { Star, Sparkles, Share2, Heart } from 'lucide-react';
import { api } from '../../api';

export default function ProductHeader({ product, pricing }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [wishlistItemId, setWishlistItemId] = useState(null);

    if (!product) return null;

    useEffect(() => {
        // Check if item is in wishlist on load
        api.get('/api/wishlist').then(res => {
            const items = res.data.data?.items || [];
            const existing = items.find(i => i.productId === product.id);
            if (existing) {
                setIsFavorite(true);
                setWishlistItemId(existing._id);
            }
        }).catch(err => console.error(err));
    }, [product.id]);

    const toggleFavorite = async () => {
        try {
            if (isFavorite && wishlistItemId) {
                await api.delete(`/api/wishlist/${wishlistItemId}`);
                setIsFavorite(false);
                setWishlistItemId(null);
            } else {
                const res = await api.post('/api/wishlist', {
                    productId: product.id,
                    title: product.title,
                    image: product.gallery ? product.gallery[0] : 'https://via.placeholder.com/400',
                    currentPrice: pricing?.lowestPrice || 0
                });
                
                setIsFavorite(true);
                // Find the new item id
                const newItem = res.data.data.items.find(i => i.productId === product.id);
                if (newItem) setWishlistItemId(newItem._id);
            }
        } catch (error) {
            console.error("Failed to toggle favorite. Ensure you are logged in.", error);
        }
    };

    return (
        <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg mb-3">
                        {product.brand}
                    </span>
                    <h1 className="text-2xl md:text-4xl font-black text-[#0B1E36] leading-tight">
                        {product.title}
                    </h1>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={toggleFavorite}
                        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${isFavorite ? 'bg-red-50 border-red-200 text-red-500' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200'}`}
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-amber-700">{product.rating}</span>
                    <span className="text-xs font-bold text-amber-900/50 ml-1">({product.reviews.toLocaleString()} reviews)</span>
                </div>
                <div className="text-sm font-bold text-green-600">
                    In Stock
                </div>
            </div>

            {/* AI Summary Banner */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4">
                <div className="bg-indigo-100 p-2 rounded-xl h-fit">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h4 className="font-bold text-indigo-900 text-sm mb-1">AI Product Summary</h4>
                    <p className="text-sm text-indigo-900/70 leading-relaxed font-medium">
                        {product.aiSummary || "This product is highly rated for its premium build quality and excellent battery life. Users frequently praise the seamless integration, though some note it is slightly heavier than previous models."}
                    </p>
                </div>
            </div>
        </div>
    );
}
