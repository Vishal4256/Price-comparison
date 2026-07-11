import React from 'react';
import Navbar from '../components/Navbar';

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-[#0B1E36]">Terms of Service</h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-slate-600 mb-4">
            By using PriceWise, you agree to these terms. We aggregate public pricing data for informational purposes only.
          </p>
          <p className="text-slate-600">
            We are not responsible for price changes, out-of-stock items, or discrepancies at third-party retailers. Always verify the price on the retailer's site before purchasing.
          </p>
        </div>
      </div>
    </div>
  );
}
