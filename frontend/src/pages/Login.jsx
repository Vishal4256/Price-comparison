import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            <Navbar />
            
            <div className="flex-1 flex items-center justify-center p-4 py-12 md:py-20">
                <div className="max-w-6xl w-full bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 overflow-hidden flex flex-col md:flex-row border border-slate-100">
                    
                    {/* Left Side: Visual/Banner */}
                    <div className="md:w-1/2 bg-[#0B1E36] p-10 md:p-14 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
                        
                        <div className="relative z-10">
                            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg inline-block text-white text-[10px] font-bold mb-8 tracking-[0.2em] uppercase">
                                PriceWise
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] mb-6">
                                Precision in every <br />
                                <span className="text-[#D4AF37]">purchase.</span>
                            </h2>
                            <p className="text-blue-100/60 text-sm max-w-sm leading-relaxed mb-12">
                                Join thousands of savvy consumers using data-centric insights to master their spending and find the ultimate value in every transaction.
                            </p>

                            <div className="flex gap-4">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex-1 backdrop-blur-sm">
                                    <div className="text-[10px] font-bold text-blue-300 uppercase mb-1 tracking-wider">Avg Savings</div>
                                    <div className="text-2xl font-black text-white">24%</div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex-1 backdrop-blur-sm">
                                    <div className="text-[10px] font-bold text-[#D4AF37] uppercase mb-1 tracking-wider">Price Updates</div>
                                    <div className="text-2xl font-black text-white">Live</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 relative h-48 md:h-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                            <img 
                                src="https://images.unsplash.com/photo-1551288049-bbbda540d379?w=800&q=80" 
                                alt="Dashboard Preview" 
                                className="w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E36] via-transparent to-transparent opacity-60"></div>
                        </div>
                    </div>

                    {/* Right Side: Login Form */}
                    <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-white">
                        <div className="mb-10 text-center md:text-left">
                            <h1 className="text-3xl font-black text-[#0B1E36] mb-3">Welcome back</h1>
                            <p className="text-slate-400 text-sm font-medium">Log in to your account to continue comparing.</p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3">
                                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 text-sm outline-none focus:border-[#0B1E36] focus:bg-white transition-all placeholder:text-slate-300"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Password</label>
                                    <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-blue-600 hover:underline">Forgot password?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 text-sm outline-none focus:border-[#0B1E36] focus:bg-white transition-all placeholder:text-slate-300"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 px-1">
                                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-[#0B1E36] focus:ring-[#0B1E36]" />
                                <label htmlFor="remember" className="text-xs text-slate-400 font-bold">Remember this device for 30 days</label>
                            </div>

                            <button 
                                disabled={loading}
                                className="w-full py-4 bg-[#0B1E36] hover:bg-[#1a365d] text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group/btn"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        Login
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10">
                            <p className="text-center text-slate-400 text-sm font-medium">
                                Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Sign up for free</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <footer className="py-8 text-center border-t border-slate-100 mt-auto bg-white/50">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2024 PriceWise Utility. All rights reserved. Precision in Comparison.</p>
                    <div className="flex gap-8">
                        <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-[#0B1E36] tracking-widest uppercase">Privacy Policy</a>
                        <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-[#0B1E36] tracking-widest uppercase">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
