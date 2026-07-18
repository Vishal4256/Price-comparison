import React from 'react';
import DailyDeals from '../components/home/DailyDeals';
import TrendingDeals from '../components/home/TrendingDeals';
import FeaturedBrands from '../components/home/FeaturedBrands';
import PopularCategories from '../components/home/PopularCategories';
import { Calendar } from 'lucide-react';

export default function Insights() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
                        
            {/* Header */}
            <div className="bg-[#0B1E36] text-white pt-16 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-black mb-4">Market Insights</h1>
                    <p className="text-blue-200/60 font-medium text-lg">
                        Track today's deals, analyze price trends, and anticipate upcoming sales.
                    </p>
                </div>
            </div>

            <main className="flex flex-col">
                {/* 1. Today's Deals */}
                <DailyDeals />

                {/* 2. Price Trends */}
                <TrendingDeals />

                {/* 3. Upcoming Sales */}
                <section className="py-16 px-4 bg-white border-y border-slate-100">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-2 mb-8">
                            <Calendar className="w-6 h-6 text-indigo-500" />
                            <h2 className="text-2xl font-black text-[#0B1E36]">Upcoming Sales</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
                                <h3 className="font-bold text-indigo-900 text-lg mb-2">Amazon Prime Day</h3>
                                <div className="flex items-center gap-2 text-sm text-indigo-700 font-medium mb-4">
                                    <Calendar className="w-4 h-4" /> July 15 - 16, 2026
                                </div>
                                <p className="text-sm text-indigo-800/80 mb-4">Expect massive drops on Amazon devices, electronics, and fashion.</p>
                                <div className="flex gap-2">
                                    <span className="bg-indigo-200/50 text-indigo-700 text-xs px-2 py-1 rounded font-bold">Electronics</span>
                                    <span className="bg-indigo-200/50 text-indigo-700 text-xs px-2 py-1 rounded font-bold">Fashion</span>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100">
                                <h3 className="font-bold text-amber-900 text-lg mb-2">Flipkart Big Billion Days</h3>
                                <div className="flex items-center gap-2 text-sm text-amber-700 font-medium mb-4">
                                    <Calendar className="w-4 h-4" /> Expected September
                                </div>
                                <p className="text-sm text-amber-800/80 mb-4">Biggest sale of the year for smartphones, appliances, and televisions.</p>
                                <div className="flex gap-2">
                                    <span className="bg-amber-200/50 text-amber-700 text-xs px-2 py-1 rounded font-bold">Mobiles</span>
                                    <span className="bg-amber-200/50 text-amber-700 text-xs px-2 py-1 rounded font-bold">TVs</span>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-2xl border border-rose-100">
                                <h3 className="font-bold text-rose-900 text-lg mb-2">Myntra EORS</h3>
                                <div className="flex items-center gap-2 text-sm text-rose-700 font-medium mb-4">
                                    <Calendar className="w-4 h-4" /> End of Reason Sale (Dec)
                                </div>
                                <p className="text-sm text-rose-800/80 mb-4">50-80% off on top fashion brands, footwear, and accessories.</p>
                                <div className="flex gap-2">
                                    <span className="bg-rose-200/50 text-rose-700 text-xs px-2 py-1 rounded font-bold">Apparel</span>
                                    <span className="bg-rose-200/50 text-rose-700 text-xs px-2 py-1 rounded font-bold">Shoes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Popular Brands */}
                <FeaturedBrands />

                {/* 5. Popular Categories */}
                <PopularCategories />

            </main>
        </div>
    );
}
