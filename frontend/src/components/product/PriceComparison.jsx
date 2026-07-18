import React from 'react';
import { ExternalLink, Tag } from 'lucide-react';

export default function PriceComparison({ product }) {
    if (!product) return null;

    const mockRetailers = [
        { name: 'Amazon', price: product.price, logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', best: true },
        { name: 'Flipkart', price: product.price + 1200, logo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg', best: false },
        { name: 'Croma', price: product.price + 2500, logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Croma_Logo.svg', best: false }
    ];

    return (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-8">
            <div className="mb-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Lowest Price Found</div>
                <div className="flex items-end gap-3">
                    <div className="text-5xl font-black text-[#0B1E36]">₹{product.price.toLocaleString()}</div>
                    {product.originalPrice > product.price && (
                        <>
                            <div className="text-xl font-bold text-slate-400 line-through mb-1">₹{product.originalPrice.toLocaleString()}</div>
                            <div className="bg-red-50 text-red-600 text-xs font-black px-2 py-1 rounded-md mb-2">{product.discount}% OFF</div>
                        </>
                    )}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-2">Prices include all taxes. Delivery charges may apply.</p>
            </div>

            <div className="space-y-3">
                {mockRetailers.map((retailer, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border ${retailer.best ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-slate-50'}`}>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-8 bg-white rounded flex items-center justify-center p-1 border border-slate-100 mix-blend-multiply">
                                <img src={retailer.logo} alt={retailer.name} loading="lazy" decoding="async" className="max-h-full max-w-full object-contain" />
                            </div>
                            <div>
                                <div className="font-bold text-[#0B1E36]">₹{retailer.price.toLocaleString()}</div>
                                {retailer.best && <div className="text-[10px] font-black text-green-600 uppercase flex items-center gap-1"><Tag className="w-3 h-3" /> Best Price</div>}
                            </div>
                        </div>
                        <button className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${retailer.best ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                            Buy Now <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
