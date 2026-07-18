import React, { useState, useEffect } from 'react';
import { Zap, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../api';

export default function DealScoreCard({ productId, currentPrice, productTitle }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!productId || !currentPrice) return;
        setLoading(true);
        api.post('/api/ai/deal-score', { productId, currentPrice, productTitle })
            .then(res => setData(res.data))
            .catch(err => {
                console.error("Deal Score error:", err);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, [productId, currentPrice, productTitle]);

    if (loading) {
        return (
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-slate-200 flex-shrink-0"></div>
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (error || !data?.data) {
        return (
            <div className="flex items-center gap-4 bg-red-50 p-4 rounded-2xl border border-red-100 text-red-500 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>Unable to load Deal Score at this time.</p>
            </div>
        );
    }

    const { score, explanation } = data.data;
    const aiAvailable = data.ai?.available;

    const getScoreColor = (value) => {
        if (value >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-200';
        if (value >= 60) return 'text-amber-500 bg-amber-50 border-amber-200';
        return 'text-rose-500 bg-rose-50 border-rose-200';
    };

    return (
        <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-white">
            <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-4 flex-shrink-0 ${getScoreColor(score.value)}`}>
                <span className="text-xl font-black">{score.value}</span>
            </div>
            <div>
                <div className="flex items-center gap-1 mb-1">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <h4 className="font-bold text-[#0B1E36]">Deal Score: {score.rating}</h4>
                </div>
                {aiAvailable ? (
                    <p className="text-sm text-slate-600 font-medium">{explanation.summary}</p>
                ) : (
                    <p className="text-sm text-slate-500 font-medium italic">AI explanation temporarily unavailable. Based on deterministic math.</p>
                )}
            </div>
        </div>
    );
}
