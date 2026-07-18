import React from 'react';
import { Lightbulb, TrendingDown, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIShoppingTips() {
    const tips = [
        {
            icon: <TrendingDown className="w-5 h-5 text-indigo-500" />,
            title: "Wait to buy iPhones",
            desc: "Historical data suggests iPhone 15 Pro will drop by ~12% in September.",
            bg: "bg-indigo-50"
        },
        {
            icon: <Clock className="w-5 h-5 text-amber-500" />,
            title: "Best time for TVs",
            desc: "OLED TVs hit their lowest prices during Diwali and Black Friday sales.",
            bg: "bg-amber-50"
        },
        {
            icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
            title: "Price match guarantee",
            desc: "Reliance Digital often matches Amazon prices if you show them in-store.",
            bg: "bg-emerald-50"
        }
    ];

    return (
        <section className="py-16 px-4 bg-white border-y border-slate-100">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3">
                    <div className="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full mb-6">
                        <Lightbulb className="w-4 h-4 text-indigo-600" />
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">AI Insights</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#0B1E36] mb-4 leading-tight">Shop smarter, not harder.</h2>
                    <p className="text-slate-500 font-medium mb-8">
                        Our AI engine analyzes millions of price points historically to tell you exactly when to buy and when to wait.
                    </p>
                    <button className="bg-[#0B1E36] text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200">
                        View All Insights
                    </button>
                </div>
                
                <div className="md:w-2/3 grid sm:grid-cols-3 gap-6 w-full">
                    {tips.map((tip, idx) => (
                        <motion.div 
                            key={idx}
                            whileHover={{ y: -5 }}
                            className={`${tip.bg} p-6 rounded-3xl border border-white/50 shadow-sm`}
                        >
                            <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                                {tip.icon}
                            </div>
                            <h3 className="font-bold text-slate-800 mb-2">{tip.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{tip.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
