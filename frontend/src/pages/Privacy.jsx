import React from 'react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-[#0B1E36]">Privacy Policy</h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-slate-600 mb-4">
            Your privacy is important to us. We only collect the necessary information to provide our services, such as your email address for price drop alerts.
          </p>
          <p className="text-slate-600">
            We do not sell your personal data to third parties. We use secure methods to store your information and ensure it is protected.
          </p>
        </div>
      </div>
    </div>
  );
}
