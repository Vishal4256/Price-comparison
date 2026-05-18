import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
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
            const { data } = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
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
                    <div className="md:w-1/2 bg-white p-10 md:p-14 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="relative z-10">
                            <div className="text-[#0B1E36] text-xl font-black mb-14 tracking-tight">PriceWise</div>
                            
                            <h2 className="text-4xl lg:text-5xl font-black text-[#0B1E36] leading-[1.1] mb-6">
                                Smart Comparison. <br />
                                <span className="text-[#D4AF37]">Precision Savings.</span>
                            </h2>
                            <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-12 font-medium">
                                Join thousands of savvy shoppers who use our precision-engineered tools to track prices and secure the best deals across the digital marketplace.
                            </p>
                        </div>

                        <div className="relative h-64 rounded-3xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50 p-6">
                            <img 
                                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" 
                                alt="Savings Chart" 
                                className="w-full h-full object-contain mix-blend-multiply opacity-80"
                            />
                        </div>
                    </div>

                    {/* Right Side: Register Form */}
                    <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center border-l border-slate-50 bg-white">
                        <div className="mb-10 text-center md:text-left">
                            <h1 className="text-3xl font-black text-[#0B1E36] mb-3">Create Account</h1>
                            <p className="text-slate-400 text-sm font-medium">Start your journey to precision saving today.</p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3">
                                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 text-sm outline-none focus:border-[#0B1E36] focus:bg-white transition-all placeholder:text-slate-300"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

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
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Password</label>
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
                                <input type="checkbox" id="terms" required className="w-4 h-4 rounded border-slate-300 text-[#0B1E36] focus:ring-[#0B1E36]" />
                                <label htmlFor="terms" className="text-xs text-slate-400 font-bold leading-tight">
                                    I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                                </label>
                            </div>

                            <button 
                                disabled={loading}
                                className="w-full py-4 bg-[#0B1E36] hover:bg-[#1a365d] text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group/btn"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        Create Account
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10">
                            <p className="text-center text-slate-400 text-sm font-medium">
                                Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <footer className="py-8 text-center border-t border-slate-100 mt-auto bg-white/50">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2024 PriceWise Utility. All rights reserved. Precision in Comparison.</p>
                    <div className="flex gap-8">
                        <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-[#0B1E36] tracking-widest uppercase">About Us</a>
                        <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-[#0B1E36] tracking-widest uppercase">Terms</a>
                        <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-[#0B1E36] tracking-widest uppercase">Privacy</a>
                        <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-[#0B1E36] tracking-widest uppercase">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
