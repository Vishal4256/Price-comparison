import React from 'react';
import { Package, Search, Edit2, Trash2 } from 'lucide-react';

export default function ProductsTab() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Package className="w-6 h-6 text-indigo-500" />
                    <h2 className="text-2xl font-black text-[#0B1E36]">Product Catalog</h2>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors">
                    + Add Product Manually
                </button>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search catalog by title or ID..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500" />
                    </div>
                </div>
                
                <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
                    <Package className="w-12 h-12 mb-4 text-slate-300" />
                    <h3 className="font-bold text-[#0B1E36] mb-1">Live Scraping Active</h3>
                    <p className="text-sm max-w-sm">Products are primarily fetched dynamically via Universal Search. Only cached items will appear in this local catalog.</p>
                </div>
            </div>
        </div>
    );
}
