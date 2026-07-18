import React from 'react';
import { Store, Power, Settings } from 'lucide-react';

export default function RetailersTab() {
    const retailers = [
        { name: 'Amazon', status: 'active', latency: '420ms' },
        { name: 'Flipkart', status: 'active', latency: '380ms' },
        { name: 'Myntra', status: 'active', latency: '510ms' },
        { name: 'Ajio', status: 'active', latency: '490ms' },
        { name: 'Nykaa', status: 'maintenance', latency: '-' },
        { name: 'Croma', status: 'active', latency: '600ms' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Store className="w-6 h-6 text-indigo-500" />
                <h2 className="text-2xl font-black text-[#0B1E36]">Retailer Management</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {retailers.map((retailer, idx) => (
                    <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-lg text-[#0B1E36]">{retailer.name}</h3>
                            <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${retailer.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {retailer.status}
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Latency</div>
                            <div className="font-black text-slate-800">{retailer.latency}</div>
                        </div>

                        <div className="flex gap-2">
                            <button className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-xl font-bold text-sm transition-colors ${retailer.status === 'active' ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}>
                                <Power className="w-4 h-4" /> {retailer.status === 'active' ? 'Disable' : 'Enable'}
                            </button>
                            <button className="w-10 flex-shrink-0 bg-slate-50 text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-xl flex items-center justify-center transition-colors">
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
