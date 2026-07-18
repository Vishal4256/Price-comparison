import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Search, Zap, Shield, TrendingDown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = ({ isAuthenticated }) => {
    // If user is already logged in, skip the landing page
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50 overflow-hidden">
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8"
                    >
                        Never Overpay <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                            Ever Again.
                        </span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mt-4 max-w-2xl text-xl text-slate-600 mx-auto mb-10"
                    >
                        PriceWise uses AI to instantly search Amazon, Flipkart, Myntra, and more to find the absolute lowest price for anything you want to buy.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row justify-center gap-4"
                    >
                        <Link 
                            to="/register" 
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1"
                        >
                            Get Started for Free
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <Link 
                            to="/login" 
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl text-indigo-600 bg-white border-2 border-indigo-100 hover:border-indigo-200 hover:bg-slate-50 transition-all"
                        >
                            Sign In
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Why millions use PriceWise</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">Universal Search</h3>
                            <p className="text-slate-600">Search once, check everywhere. We scan top retailers simultaneously to ensure you never miss a deal.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">AI Deal Score</h3>
                            <p className="text-slate-600">Our pricing engine analyzes historical data to tell you if a discount is real, or if you should wait for a better drop.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <TrendingDown className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">Price Drop Alerts</h3>
                            <p className="text-slate-600">Set a target price and we'll notify you the second it drops below your threshold across any supported platform.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 bg-slate-900 text-white text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-4xl font-bold mb-6">Ready to start saving?</h2>
                    <p className="text-xl text-slate-400 mb-10">Join thousands of smart shoppers who never pay retail price.</p>
                    <Link 
                        to="/register" 
                        className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold rounded-2xl text-slate-900 bg-white hover:bg-slate-100 transition-colors shadow-2xl"
                    >
                        Create Your Free Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Landing;
