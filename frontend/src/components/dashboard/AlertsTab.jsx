import React from 'react';
import { Bell, TrendingDown, ExternalLink } from 'lucide-react';

export default function AlertsTab({ alerts = [] }) {
    const triggeredAlerts = alerts.filter(a => a.currentPrice <= a.targetPrice);

    return (
        <div className="space-y-8">
            {/* Notifications Zone */}
            {triggeredAlerts.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-emerald-700">
                        <Bell className="w-5 h-5 fill-emerald-700 animate-bounce" />
                        <h3 className="font-black text-lg">Target Prices Reached!</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {triggeredAlerts.map(alert => (
                            <div key={alert._id} className="bg-white p-4 rounded-2xl border border-emerald-100 flex items-center justify-between shadow-sm hover:shadow transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center p-1 mix-blend-multiply">
                                        <img src={alert.productImage} alt={alert.productTitle} loading="lazy" decoding="async" className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{alert.productTitle}</h4>
                                        <p className="text-xs font-bold text-emerald-600">Dropped to ₹{alert.currentPrice.toLocaleString()}</p>
                                    </div>
                                </div>
                                <a href={`/product/${alert.productId}`} className="w-8 h-8 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-full flex items-center justify-center transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Alerts Grid */}
            <div className="flex items-center gap-2 mb-6">
                <TrendingDown className="w-6 h-6 text-indigo-500" />
                <h2 className="text-2xl font-black text-[#0B1E36]">Active Price Alerts</h2>
            </div>
            
            {alerts.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-12 text-center text-slate-500 font-medium">
                    You have no active price alerts. Find a product and click "Set Alert" to track its price.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {alerts.map(alert => {
                        const targetReached = alert.currentPrice <= alert.targetPrice;
                        return (
                            <div key={alert._id} className={`bg-white rounded-3xl border p-5 shadow-sm transition-all hover:shadow-md ${targetReached ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'}`}>
                                <div className="aspect-[4/3] bg-slate-50 rounded-2xl mb-4 flex items-center justify-center p-4 mix-blend-multiply relative">
                                    <img src={alert.productImage} alt={alert.productTitle} loading="lazy" decoding="async" className="max-w-full max-h-full object-contain" />
                                    {targetReached && (
                                        <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">Target Hit</div>
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-4 h-10">{alert.productTitle}</h3>
                                
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Price</div>
                                        <div className="text-lg font-black text-[#0B1E36]">₹{alert.targetPrice.toLocaleString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current</div>
                                        <div className={`text-sm font-black ${targetReached ? 'text-emerald-600' : 'text-slate-500'}`}>₹{alert.currentPrice.toLocaleString()}</div>
                                    </div>
                                </div>
                                <a href={`/product/${alert.productId}`} className="w-full block text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-colors border border-slate-200">
                                    View Details
                                </a>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
