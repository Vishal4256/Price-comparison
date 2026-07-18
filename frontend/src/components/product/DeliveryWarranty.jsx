import React from 'react';
import { Truck, ShieldCheck, RefreshCcw } from 'lucide-react';

export default function DeliveryWarranty() {
    return (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                        <Truck className="w-6 h-6 text-blue-500" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Free Delivery</h4>
                    <p className="text-xs text-slate-500">Usually arrives in 3-5 business days</p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                        <ShieldCheck className="w-6 h-6 text-green-500" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">1 Year Warranty</h4>
                    <p className="text-xs text-slate-500">Manufacturer warranty applicable globally</p>
                </div>

                <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                        <RefreshCcw className="w-6 h-6 text-purple-500" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">7 Days Return</h4>
                    <p className="text-xs text-slate-500">Hassle-free replacement if defective</p>
                </div>
            </div>
        </div>
    );
}
