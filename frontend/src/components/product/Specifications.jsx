import React from 'react';

export default function Specifications() {
    const specs = [
        { label: 'Brand', value: 'Sony' },
        { label: 'Model Name', value: 'WH-1000XM5' },
        { label: 'Color', value: 'Black' },
        { label: 'Headphones Form Factor', value: 'Over Ear' },
        { label: 'Connectivity Technology', value: 'Wireless, Bluetooth' },
        { label: 'Battery Life', value: 'Up to 30 Hours' },
        { label: 'Noise Control', value: 'Active Noise Cancellation' },
        { label: 'Item Weight', value: '250 Grams' }
    ];

    return (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-[#0B1E36] mb-6">Technical Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {specs.map((spec, idx) => (
                    <div key={idx} className="flex py-3 border-b border-slate-100 last:border-0 sm:[&:nth-last-child(2)]:border-0 sm:last:border-0">
                        <div className="w-1/2 text-sm text-slate-500 font-medium">{spec.label}</div>
                        <div className="w-1/2 text-sm text-slate-900 font-bold">{spec.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
