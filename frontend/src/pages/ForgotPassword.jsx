import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Mail, Loader2, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('http://localhost:5000/api/auth/reset-password', { email, otp, password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            <Navbar />
            
            <div className="flex-1 flex items-center justify-center p-4 py-12 md:py-20">
                <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100 p-10 md:p-14">
                    
                    <div className="mb-10 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            {success ? <CheckCircle2 className="w-8 h-8 text-green-500" /> : <KeyRound className="w-8 h-8 text-[#0B1E36]" />}
                        </div>
                        <h1 className="text-3xl font-black text-[#0B1E36] mb-3">
                            {success ? 'Success!' : step === 1 ? 'Forgot password?' : 'Reset password'}
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">
                            {success 
                                ? 'Your password has been reset successfully. Redirecting to login...' 
                                : step === 1 
                                    ? "No worries, we'll send you reset instructions." 
                                    : `We've sent a 6-digit code to ${email}`}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                            {error}
                        </div>
                    )}

                    {!success && (
                        step === 1 ? (
                            <form onSubmit={handleRequestOTP} className="space-y-6">
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

                                <button 
                                    disabled={loading}
                                    className="w-full py-4 bg-[#0B1E36] hover:bg-[#1a365d] text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group/btn"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            Send Code
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">6-Digit Code</label>
                                    <input 
                                        type="text" 
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-slate-900 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-[#0B1E36] focus:bg-white transition-all placeholder:text-slate-200"
                                        placeholder="000000"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">New Password</label>
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-slate-900 text-sm outline-none focus:border-[#0B1E36] focus:bg-white transition-all placeholder:text-slate-300"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <button 
                                    disabled={loading}
                                    className="w-full py-4 bg-[#0B1E36] hover:bg-[#1a365d] text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group/btn"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            Reset Password
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                
                                <button 
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full text-center text-slate-400 text-xs font-bold hover:text-[#0B1E36]"
                                >
                                    Resend code
                                </button>
                            </form>
                        )
                    )}

                    <p className="mt-10 text-center text-slate-400 text-sm font-medium">
                        Remember your password? <Link to="/login" className="text-blue-600 font-bold hover:underline">Back to login</Link>
                    </p>
                </div>
            </div>
            
            <footer className="py-8 text-center border-t border-slate-100 mt-auto bg-white/50">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2024 PriceWise Utility. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
