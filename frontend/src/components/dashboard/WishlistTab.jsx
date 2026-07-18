import React, { useState } from 'react';
import { Heart, Trash2, Bell, Edit2 } from 'lucide-react';
import { api } from '../../api';

export default function WishlistTab({ favorites = [] }) {
    const [items, setItems] = useState(favorites);

    const handleRemove = async (itemId) => {
        try {
            await api.delete(`/api/wishlist/${itemId}`);
            setItems(items.filter(item => item._id !== itemId));
        } catch (err) {
            console.error('Failed to remove item', err);
        }
    };

    const handleUpdate = async (itemId, targetPrice, notifyOnDrop) => {
        try {
            await api.put(`/api/wishlist/${itemId}`, { targetPrice, notifyOnDrop });
            setItems(items.map(item => 
                item._id === itemId 
                    ? { ...item, targetPrice, notifyOnDrop }
                    : item
            ));
        } catch (err) {
            console.error('Failed to update item', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                <h2 className="text-2xl font-black text-[#0B1E36]">My Wishlist</h2>
            </div>
            
            {items.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-12 text-center text-slate-500 font-medium flex flex-col items-center">
                    <Heart className="w-12 h-12 text-slate-300 mb-3" />
                    Your wishlist is empty.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(fav => (
                        <div key={fav._id} className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow flex flex-col relative">
                            <div className="aspect-video bg-slate-50 rounded-xl mb-3 flex items-center justify-center p-2 mix-blend-multiply relative overflow-hidden">
                                <img src={fav.image || 'https://via.placeholder.com/150'} alt={fav.title} className="max-w-full max-h-full object-contain" />
                                <button 
                                    onClick={() => handleRemove(fav._id)}
                                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-red-500 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2">{fav.title}</h3>
                            
                            <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-100">
                                <div>
                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Current Price</div>
                                    <div className="text-lg font-black text-[#0B1E36]">₹{fav.currentPrice?.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Target Price</div>
                                    <div className="flex items-center justify-end gap-2 text-indigo-600 font-bold cursor-pointer" onClick={() => {
                                        const newTarget = prompt('Enter new target price:', fav.targetPrice || fav.currentPrice);
                                        if (newTarget && !isNaN(newTarget)) {
                                            handleUpdate(fav._id, Number(newTarget), fav.notifyOnDrop);
                                        }
                                    }}>
                                        ₹{fav.targetPrice?.toLocaleString() || 'Set'}
                                        <Edit2 className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                    <Bell className="w-3 h-3" /> Notifications
                                </span>
                                <button 
                                    onClick={() => handleUpdate(fav._id, fav.targetPrice, !fav.notifyOnDrop)}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${fav.notifyOnDrop ? 'bg-indigo-500' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${fav.notifyOnDrop ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
