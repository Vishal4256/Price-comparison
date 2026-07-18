import React, { useState, useEffect } from 'react';
import { Target, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../api';

export default function RecommendationCard({ productId, currentPrice, productTitle }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!productId || !currentPrice) return;
        setLoading(true);
        api.post('/api/ai/recommendation', { productId, currentPrice, productTitle })
            .then(res => setData(res.data))
            .catch(err => {
                console.error("Recommendation error:", err);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, [productId, currentPrice, productTitle]);

    if (loading) {
        return (
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-pulse">
                <div className="w-16 h-16 rounded-2xl bg-slate-200 flex-shrink-0"></div>
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                </div>
            </div>
        );
    }

    if (error || !data?.data) {
        return (
            <div className="flex items-center gap-4 bg-red-50 p-4 rounded-2xl border border-red-100 text-red-500 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>Unable to load Buy/Wait recommendation.</p>
            </div>
        );
    }

    const { decision, signals, explanation } = data.data;
    const aiAvailable = data.ai?.available;

    const getDecisionStyles = (dec) => {
        if (dec === 'BUY NOW') return 'bg-emerald-50 border-emerald-200 text-emerald-600';
        if (dec === 'WAIT') return 'bg-rose-50 border-rose-200 text-rose-600';
        return 'bg-amber-50 border-amber-200 text-amber-600';
    };

    return (
        <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-white">
            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center flex-shrink-0 font-black text-xs text-center leading-tight ${getDecisionStyles(decision)}`}>
                {decision}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    <h4 className="font-bold text-[#0B1E36]">Recommendation</h4>
                </div>
                {aiAvailable ? (
                    <p className="text-sm text-slate-600 font-medium mb-2">{explanation.summary}</p>
                ) : (
                    <p className="text-sm text-slate-500 font-medium italic mb-2">AI explanation unavailable. Showing deterministic signals:</p>
                )}
                
                {/* Always show deterministic signals to build trust */}
                <ul className="text-xs text-slate-500 space-y-1 mt-1 pl-4 list-disc marker:text-indigo-300">
                    {signals.map((sig, i) => (
                        <li key={i}>{sig}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
