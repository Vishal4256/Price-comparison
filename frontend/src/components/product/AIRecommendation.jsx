import React from 'react';
import { Bot, ThumbsUp, ThumbsDown, Sparkles, ArrowRight, TrendingUp, Wallet, Award, Copy } from 'lucide-react';

export default function AIRecommendation({ product }) {
    if (!product) return null;

    const isGoodBuy = product.discount >= 15;

    return (
        <div className="space-y-6 mb-8">
            {/* AI Verdict */}
            <div className={`rounded-3xl border p-6 flex flex-col md:flex-row items-start md:items-center gap-6 ${isGoodBuy ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${isGoodBuy ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                    {isGoodBuy ? <ThumbsUp className="w-8 h-8 text-white" /> : <ThumbsDown className="w-8 h-8 text-white" />}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Bot className={`w-4 h-4 ${isGoodBuy ? 'text-emerald-600' : 'text-amber-600'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isGoodBuy ? 'text-emerald-600' : 'text-amber-600'}`}>AI Verdict</span>
                    </div>
                    <h3 className={`text-xl font-black mb-1 ${isGoodBuy ? 'text-emerald-900' : 'text-amber-900'}`}>
                        {isGoodBuy ? 'Excellent time to buy.' : 'Consider waiting.'}
                    </h3>
                    <p className={`text-sm font-medium ${isGoodBuy ? 'text-emerald-800/70' : 'text-amber-800/70'}`}>
                        {isGoodBuy 
                            ? `At ₹${product.price.toLocaleString()} (${product.discount}% off), this is one of the lowest prices we've tracked in the last 6 months. It is highly unlikely to drop further in the next 30 days.`
                            : `At ₹${product.price.toLocaleString()}, this product is currently hovering near its MSRP. Historical data indicates a potential price drop within the next 45 days. Set a price alert to be notified.`}
                    </p>
                </div>
            </div>

            {/* AI Alternatives */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl border border-indigo-100 p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-6 h-6 text-indigo-500 fill-indigo-500" />
                    <h3 className="text-xl font-black text-[#0B1E36]">AI Alternatives</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Similar Products */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer group">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                    <Copy className="w-4 h-4" />
                                </div>
                                <h4 className="font-bold text-slate-800">Similar Product</h4>
                            </div>
                            <h5 className="font-bold text-sm text-[#0B1E36] mb-1 group-hover:text-indigo-600 transition-colors">Bose QuietComfort 45</h5>
                            <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">Matches the ANC quality and comfort, often found at a similar price point. Good alternative if you prefer Bose's sound signature.</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="font-black text-indigo-600 text-sm">₹29,900</span>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                    </div>

                    {/* Better Alternatives */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer group">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <h4 className="font-bold text-slate-800">Better Alternative</h4>
                            </div>
                            <h5 className="font-bold text-sm text-[#0B1E36] mb-1 group-hover:text-indigo-600 transition-colors">Sennheiser Momentum 4</h5>
                            <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">Offers superior sound quality and an incredible 60-hour battery life compared to the Sony's 30 hours, though ANC is slightly weaker.</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="font-black text-indigo-600 text-sm">₹34,990</span>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                    </div>

                    {/* Budget Alternatives */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer group">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                                    <Wallet className="w-4 h-4" />
                                </div>
                                <h4 className="font-bold text-slate-800">Budget Alternative</h4>
                            </div>
                            <h5 className="font-bold text-sm text-[#0B1E36] mb-1 group-hover:text-indigo-600 transition-colors">Sony WH-CH720N</h5>
                            <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">Get 80% of the flagship experience for less than half the price. It's lighter and shares the same V1 processor for excellent ANC.</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="font-black text-indigo-600 text-sm">₹9,990</span>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                    </div>

                    {/* Premium Alternatives */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer group">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                                    <Award className="w-4 h-4" />
                                </div>
                                <h4 className="font-bold text-slate-800">Premium Alternative</h4>
                            </div>
                            <h5 className="font-bold text-sm text-[#0B1E36] mb-1 group-hover:text-indigo-600 transition-colors">Apple AirPods Max</h5>
                            <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">Unmatched build quality with aluminum cups, seamless Apple ecosystem integration, and superior transparency mode.</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="font-black text-indigo-600 text-sm">₹59,900</span>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
