import React from 'react';
import HomeFeed from '../components/feed/HomeFeed';

export default function Home() {
    return (
        <div className="bg-slate-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-4 px-2">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Dashboard</h1>
                    <p className="mt-2 text-sm text-slate-600">Track your favorite products, monitor price drops, and view personalized insights.</p>
                </div>
                
                {/* Render the Personalized Feed */}
                <HomeFeed />
            </div>
        </div>
    );
}
