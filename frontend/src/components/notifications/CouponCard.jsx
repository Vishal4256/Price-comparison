import React from 'react';
import { Tag, Copy, Check } from 'lucide-react';

export default function CouponCard({ coupon }) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!coupon) return null;

    return (
        <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-amber-600">
                <Tag className="w-6 h-6" />
            </div>
            <div className="flex-1 text-center sm:text-left">
                <h4 className="font-black text-amber-900">{coupon.description}</h4>
                <p className="text-xs text-amber-700 mt-1">Min order: ₹{coupon.minimumOrder} • Expires: {new Date(coupon.expiry).toLocaleDateString()}</p>
            </div>
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 bg-white border border-amber-300 hover:bg-amber-100 text-amber-800 px-4 py-2 rounded-xl font-bold transition-colors"
            >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : coupon.code}
            </button>
        </div>
    );
}
