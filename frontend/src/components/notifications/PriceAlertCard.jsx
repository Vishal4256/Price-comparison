import React, { useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';

export default function PriceAlertCard({ productId, retailer, currentPrice, hasAlert, onToggleAlert }) {
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        await onToggleAlert(!hasAlert);
        setLoading(false);
    };

    return (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between shadow-sm mt-4">
            <div>
                <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                    <Bell className="w-4 h-4" /> Price Drop Alerts
                </h4>
                <p className="text-xs text-indigo-700/70 mt-1">
                    We'll notify you if the price drops below ₹{currentPrice.toLocaleString()}
                </p>
            </div>
            
            <button 
                onClick={handleToggle}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                    hasAlert 
                        ? 'bg-indigo-200 text-indigo-800 hover:bg-indigo-300'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (hasAlert ? 'Disable Alert' : 'Set Alert')}
            </button>
        </div>
    );
}
