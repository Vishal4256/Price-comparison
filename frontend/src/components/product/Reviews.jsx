import React from 'react';
import { Star, MessageCircle, Store, Sparkles, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function Reviews() {
    const reviews = [
        { user: 'Vikram S.', rating: 5, date: '2 days ago', text: 'Best noise cancellation on the market. Highly recommend for flights.' },
        { user: 'Priya M.', rating: 4, date: '1 week ago', text: 'Sound quality is amazing but they can get a little warm after 4 hours.' }
    ];

    const sellers = [
        { name: 'Appario Retail', rating: 4.8, fulfillment: 'Amazon' },
        { name: 'RetailNet', rating: 4.6, fulfillment: 'Flipkart' }
    ];

    return (
        <div className="space-y-8 mb-8">
            {/* AI Review Summary (Powered by Gemini) */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100 p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Sparkles className="w-32 h-32 text-indigo-500 -mt-10 -mr-10" />
                </div>
                <div className="flex items-center gap-2 mb-6 relative z-10">
                    <Sparkles className="w-6 h-6 text-indigo-500 fill-indigo-500" />
                    <h3 className="text-xl font-black text-[#0B1E36]">AI Review Summary</h3>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-lg ml-2">Powered by Gemini</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-emerald-700 flex items-center gap-2 mb-3"><CheckCircle2 className="w-5 h-5" /> Pros</h4>
                            <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5 font-medium">
                                <li>Exceptional, class-leading noise cancellation</li>
                                <li>Comfortable and lightweight for long listening sessions</li>
                                <li>Great battery life with fast charging capabilities</li>
                                <li>Outstanding microphone quality for voice calls</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-rose-700 flex items-center gap-2 mb-3"><XCircle className="w-5 h-5" /> Cons</h4>
                            <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5 font-medium">
                                <li>New design doesn't fold flat for travel</li>
                                <li>High premium price point</li>
                                <li>Case is bulkier than previous generations</li>
                            </ul>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-amber-700 flex items-center gap-2 mb-3"><AlertCircle className="w-5 h-5" /> Common Complaints</h4>
                            <p className="text-sm text-slate-700 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 leading-relaxed font-medium">
                                Users frequently mention that the "Speak-to-Chat" feature can be overly sensitive, pausing music unexpectedly when clearing their throat or singing along. A few users also experienced slight ear warmth during extended summer usage.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-indigo-700 flex items-center gap-2 mb-3"><MessageCircle className="w-5 h-5" /> Overall Opinion</h4>
                            <p className="text-sm text-slate-700 bg-white/50 p-4 rounded-2xl border border-indigo-100/50 leading-relaxed font-bold">
                                The overwhelming consensus is highly positive. It is widely considered the top-tier choice for travelers and remote workers prioritizing ANC and call quality, though the premium price makes it a significant investment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* User Reviews */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-[#0B1E36]">Recent Reviews</h3>
                        <MessageCircle className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="space-y-4">
                        {reviews.map((rev, idx) => (
                            <div key={idx} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-sm text-slate-800">{rev.user}</div>
                                    <div className="text-xs text-slate-400">{rev.date}</div>
                                </div>
                                <div className="flex mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">{rev.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Seller Ratings */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-fit">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-[#0B1E36]">Seller Ratings</h3>
                        <Store className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="space-y-4">
                        {sellers.map((seller, idx) => (
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{seller.name}</h4>
                                    <div className="text-xs text-slate-500 mt-1">Fulfilled by {seller.fulfillment}</div>
                                </div>
                                <div className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                                    {seller.rating} <Star className="w-3 h-3 fill-green-700" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
