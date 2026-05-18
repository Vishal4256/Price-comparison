import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ShoppingBag, Check, X, ExternalLink, Loader2 } from 'lucide-react';

export default function Compare() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) {
            fetchComparison();
        }
    }, [query]);

    const fetchComparison = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/products/search?q=${query}`);
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const getCheapest = (source) => {
        const storeProducts = products.filter(p => p.source === source);
        if (storeProducts.length === 0) return null;
        return storeProducts.reduce((min, p) => p.currentPrice < min.currentPrice ? p : min, storeProducts[0]);
    };

    const amazon = getCheapest('Amazon');
    const flipkart = getCheapest('Flipkart');
    const ebay = getCheapest('eBay');

    const stores = [
        { name: 'Amazon', data: amazon, color: 'text-orange-400' },
        { name: 'Flipkart', data: flipkart, color: 'text-blue-400' },
        { name: 'eBay', data: ebay, color: 'text-red-400' }
    ];

    const allPrices = [amazon, flipkart, ebay].filter(p => p).map(p => p.currentPrice);
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;

    return (
        <main className="min-h-screen bg-[#0a0a0b] pt-24 pb-20 px-4">
            <Navbar />
            
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-3xl font-extrabold mb-2 text-white">Price Comparison</h1>
                    <p className="text-gray-500">Comparing "{query}" across major marketplaces.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Analyzing prices across the web...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="text-left p-6 bg-white/5 rounded-tl-[30px] border-b border-white/10 text-gray-400 text-xs font-bold uppercase">Store</th>
                                    <th className="text-left p-6 bg-white/5 border-b border-white/10 text-gray-400 text-xs font-bold uppercase">Product Info</th>
                                    <th className="text-center p-6 bg-white/5 border-b border-white/10 text-gray-400 text-xs font-bold uppercase">Price</th>
                                    <th className="text-center p-6 bg-white/5 border-b border-white/10 text-gray-400 text-xs font-bold uppercase">Savings</th>
                                    <th className="text-right p-6 bg-white/5 rounded-tr-[30px] border-b border-white/10 text-gray-400 text-xs font-bold uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stores.map((store, idx) => (
                                    <tr key={store.name} className={`group hover:bg-white/[0.02] transition-colors ${idx === stores.length - 1 ? 'rounded-b-[30px]' : ''}`}>
                                        <td className="p-6 font-bold text-lg">
                                            <span className={store.color}>{store.name}</span>
                                        </td>
                                        <td className="p-6">
                                            {store.data ? (
                                                <div className="flex items-center gap-4">
                                                    <img src={store.data.image} alt="" className="w-12 h-12 rounded-lg object-contain bg-white p-1" />
                                                    <div className="max-w-xs text-white">
                                                        <p className="text-sm font-bold line-clamp-1">{store.data.title}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex text-yellow-500">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <ShoppingBag key={i} className={`w-3 h-3 ${i < Math.round(store.data.rating || 4) ? 'fill-current' : 'opacity-20'}`} />
                                                                ))}
                                                            </div>
                                                            <span className="text-[10px] text-gray-500 font-bold">{store.data.rating || '4.0'} Rating</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 text-sm">Not found in search</span>
                                            )}
                                        </td>
                                        <td className="p-6 text-center">
                                            {store.data ? (
                                                <div className="space-y-1">
                                                    <p className={`text-xl font-black ${store.data.currentPrice === minPrice ? 'text-green-400' : 'text-white'}`}>
                                                        ₹{store.data.currentPrice.toLocaleString()}
                                                    </p>
                                                    {store.data.currentPrice === minPrice && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">CHEAPEST</span>
                                                    )}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="p-6 text-center">
                                            {store.data ? (
                                                <span className="text-sm font-bold text-gray-400">
                                                    {store.data.discountPercentage}% OFF
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="p-6 text-right">
                                            {store.data ? (
                                                <a 
                                                    href={store.data.url} 
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all"
                                                >
                                                    Buy Now
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : (
                                                <button disabled className="px-4 py-2 bg-white/5 text-gray-600 text-xs font-bold rounded-xl">
                                                    Unavailable
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
