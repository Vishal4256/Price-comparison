import React from 'react';
import { Tag } from 'lucide-react';

export default function CategoriesTab() {
    const categories = [
        { name: 'Smartphones', emoji: '📱', tracked: true },
        { name: 'Laptops', emoji: '💻', tracked: true },
        { name: 'Headphones', emoji: '🎧', tracked: true },
        { name: 'Smartwatches', emoji: '⌚', tracked: false },
        { name: 'Cameras', emoji: '📷', tracked: false },
        { name: 'Gaming Consoles', emoji: '🎮', tracked: false },
        { name: 'Men Fashion', emoji: '👕', tracked: false },
        { name: 'Women Fashion', emoji: '👗', tracked: false },
        { name: 'Sneakers', emoji: '👟', tracked: true },
        { name: 'Home Appliances', emoji: '🏠', tracked: false }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Tag className="w-6 h-6 text-indigo-500" />
                <h2 className="text-2xl font-black text-[#0B1E36]">Favorite Categories</h2>
            </div>
            
            <p className="text-slate-500 font-medium mb-6 -mt-4">Select categories you want to see more of in your recommendations.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((cat, idx) => (
                    <button 
                        key={idx}
                        className={`p-4 rounded-2xl border text-left transition-all ${cat.tracked ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                    >
                        <div className="text-3xl mb-2">{cat.emoji}</div>
                        <div className={`font-bold text-sm ${cat.tracked ? 'text-indigo-900' : 'text-slate-700'}`}>{cat.name}</div>
                        <div className={`text-[10px] uppercase tracking-widest font-black mt-1 ${cat.tracked ? 'text-indigo-600' : 'text-slate-400'}`}>
                            {cat.tracked ? 'Following' : 'Follow'}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
