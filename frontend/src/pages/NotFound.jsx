import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();
    
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
                        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="text-8xl mb-6">🏜️</div>
                <h1 className="text-4xl font-black text-[#0B1E36] mb-4">404 - Page Not Found</h1>
                <p className="text-lg text-slate-500 max-w-md mx-auto mb-8">
                    Oops! The page you're looking for doesn't exist, was moved, or is temporarily unavailable.
                </p>
                <button 
                    onClick={() => navigate('/')}
                    className="px-8 py-4 bg-[#0B1E36] hover:bg-[#1a365d] text-white font-bold rounded-xl transition-all shadow-lg hover:-translate-y-1"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}
