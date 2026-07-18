import React from 'react';
import { Package } from 'lucide-react';

export default function OrdersTab() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Package className="w-6 h-6 text-indigo-500" />
                <h2 className="text-2xl font-black text-[#0B1E36]">My Orders</h2>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-12 text-center flex flex-col items-center">
                <Package className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Orders Yet</h3>
                <p className="text-slate-500 font-medium max-w-sm">
                    Since PriceWise is primarily a price tracking and comparison platform, order history will be introduced in v3.0 when native checkout is integrated.
                </p>
            </div>
        </div>
    );
}
