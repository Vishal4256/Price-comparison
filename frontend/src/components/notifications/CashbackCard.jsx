import React from 'react';
import { Wallet, Zap } from 'lucide-react';

export default function CashbackCard({ cashback, originalPrice, effectivePrice }) {
    if (!cashback) return null;

    return (
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm mt-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 text-emerald-600">
                <Wallet className="w-6 h-6" />
            </div>
            <div className="flex-1 text-center sm:text-left">
                <h4 className="font-black text-emerald-900">Get {cashback.type === 'percentage' ? `${cashback.value}%` : `₹${cashback.value}`} via {cashback.provider}</h4>
                <p className="text-xs text-emerald-700 mt-1">
                    Effective price drops from ₹{originalPrice.toLocaleString()} to <strong className="text-emerald-900 text-sm">₹{effectivePrice.toLocaleString()}</strong>
                </p>
            </div>
            <div className="bg-white border border-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-emerald-800">Best Offer</span>
            </div>
        </div>
    );
}
