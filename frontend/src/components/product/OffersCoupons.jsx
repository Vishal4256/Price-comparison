import React from 'react';
import { TicketPercent, CreditCard } from 'lucide-react';

export default function OffersCoupons() {
    const offers = [
        { type: 'bank', title: '10% Instant Discount on HDFC Cards', desc: 'Up to ₹1,500 off on Credit Card EMI transactions.' },
        { type: 'bank', title: '5% Unlimited Cashback', desc: 'On Flipkart Axis Bank Credit Card.' },
        { type: 'coupon', title: 'SAVE500', desc: 'Apply coupon at checkout for an extra ₹500 off on pre-paid orders.' }
    ];

    return (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-[#0B1E36] mb-4">Available Offers & Coupons</h3>
            <div className="space-y-4">
                {offers.map((offer, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className={`p-2 rounded-xl flex-shrink-0 ${offer.type === 'coupon' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {offer.type === 'coupon' ? <TicketPercent className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm mb-1">{offer.title}</h4>
                            <p className="text-xs text-slate-500 font-medium">{offer.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
