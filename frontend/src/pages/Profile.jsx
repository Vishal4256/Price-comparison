import React from 'react';

export default function Profile() {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-black text-[#0B1E36] mb-6">User Profile</h1>
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800">{user.name || 'User Profile'}</h2>
                    <p className="text-slate-500">{user.email}</p>
                </div>
                <hr className="mb-6 border-gray-100" />
                <p className="text-slate-500 text-center">User profile features will be implemented in v2.0.</p>
            </div>
        </div>
    );
}
