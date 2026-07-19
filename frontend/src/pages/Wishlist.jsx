import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ExternalLink, Loader2, Search, AlertCircle, Bell, BellOff } from 'lucide-react';
import { api } from '../api';
import { getApiError } from '../utils/errorHandler';
import { motion, AnimatePresence } from 'framer-motion';

export default function Wishlist() {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [removingId, setRemovingId] = useState(null);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await api.get('/api/wishlist');
            setWishlist(res.data.data);
        } catch (err) {
            setError(getApiError(err, 'Failed to load wishlist. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (itemId) => {
        setRemovingId(itemId);
        try {
            await api.delete(`/api/wishlist/${itemId}`);
            setWishlist(prev => ({
                ...prev,
                items: prev.items.filter(i => i._id !== itemId)
            }));
        } catch (err) {
            setError(getApiError(err, 'Failed to remove item.'));
        } finally {
            setRemovingId(null);
        }
    };

    const handleToggleNotify = async (item) => {
        try {
            const res = await api.put(`/api/wishlist/${item._id}`, {
                notifyOnDrop: !item.notifyOnDrop
            });
            setWishlist(res.data.data);
        } catch (err) {
            setError(getApiError(err, 'Failed to update notification setting.'));
        }
    };

    const items = wishlist?.items || [];

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 py-10">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-[#0B1E36] flex items-center gap-3">
                            <Heart className="w-7 h-7 text-rose-500" /> My Wishlist
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {loading ? 'Loading...' : `${items.length} item${items.length !== 1 ? 's' : ''} tracked`}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/search')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#0B1E36] text-white rounded-xl hover:bg-indigo-700 transition-colors font-bold text-sm"
                    >
                        <Search className="w-4 h-4" /> Add Products
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Loading your wishlist...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && items.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-9 h-9 text-rose-300" />
                        </div>
                        <h2 className="text-2xl font-black text-[#0B1E36] mb-2">Your Wishlist is Empty</h2>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8">
                            Search for products and save them here to track price drops and get alerts.
                        </p>
                        <button
                            onClick={() => navigate('/search')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B1E36] text-white rounded-xl hover:bg-indigo-700 transition-colors font-bold"
                        >
                            <Search className="w-4 h-4" /> Start Searching
                        </button>
                    </div>
                )}

                {/* Items Grid */}
                {!loading && items.length > 0 && (
                    <AnimatePresence>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {items.map(item => (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                                >
                                    {/* Product Image */}
                                    <div className="aspect-video bg-slate-50 flex items-center justify-center p-4 relative">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="max-h-32 object-contain mix-blend-multiply"
                                                onError={e => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <Heart className="w-10 h-10 text-slate-200" />
                                        )}
                                        {/* Retailer badge */}
                                        {item.retailer && (
                                            <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                                                {item.retailer}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-[#0B1E36] text-sm line-clamp-2 mb-3 leading-snug">
                                            {item.title || 'Unnamed Product'}
                                        </h3>

                                        <div className="flex items-end justify-between mb-4">
                                            <div>
                                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Current Price</p>
                                                <p className="text-xl font-black text-[#0B1E36]">
                                                    ₹{item.currentPrice?.toLocaleString() || '—'}
                                                </p>
                                            </div>
                                            {item.targetPrice && (
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Target</p>
                                                    <p className={`text-sm font-bold ${item.currentPrice <= item.targetPrice ? 'text-green-600' : 'text-slate-500'}`}>
                                                        ₹{item.targetPrice.toLocaleString()}
                                                        {item.currentPrice <= item.targetPrice && ' ✓'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Row */}
                                        <div className="flex items-center gap-2">
                                            {item.productUrl && (
                                                <a
                                                    href={item.productUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl text-xs font-bold transition-colors border border-slate-100"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> View Deal
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleToggleNotify(item)}
                                                className={`p-2 rounded-xl border transition-colors ${item.notifyOnDrop ? 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                                                title={item.notifyOnDrop ? 'Notifications on' : 'Notifications off'}
                                            >
                                                {item.notifyOnDrop ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleRemove(item._id)}
                                                disabled={removingId === item._id}
                                                className="p-2 rounded-xl bg-red-50 border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                                title="Remove from wishlist"
                                            >
                                                {removingId === item._id
                                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                                    : <Trash2 className="w-4 h-4" />
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
