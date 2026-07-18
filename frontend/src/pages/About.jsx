import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-[#0B1E36]">About Us</h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-slate-600 mb-4">
            Welcome to PriceWise, your ultimate destination for smart shopping. Our mission is to help you find the best deals across multiple retailers without the hassle of checking each site individually.
          </p>
          <p className="text-slate-600">
            We track prices in real-time, alert you when prices drop, and provide historical data so you know you're getting a true deal. Shop smarter, save more!
          </p>
        </div>
      </div>
    </div>
  );
}
