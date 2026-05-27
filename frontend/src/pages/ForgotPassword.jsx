import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { api } from '../api';
import Navbar from '../components/Navbar';
import { Mail, Loader2, ArrowRight, CheckCircle2, KeyRound, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [devNotice, setDevNotice] = useState('');
    const [resetUrl, setResetUrl] = useState('');

    const handleRequestLink = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setDevNotice('');
        setResetUrl('');
        try {
            const { data } = await api.post('/api/auth/forgot-password', { email });
            if (data.devFallback) {
                setDevNotice(data.message);
                setResetUrl(data.resetUrl);
            }
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request reset link. Please verify your email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            <Navbar />
            
            <div className="flex-1 flex items-center justify-center p-4 py-12 md:py-20">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="max-w-md w-full bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100 p-10 md:p-14"
                >
                    
                    <div className="mb-10 text-center">
                        <motion.div 
                            key={success ? 'success' : 'forgot'}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"
                        >
                            {success ? (
                                <CheckCircle2 className="w-8 h-8 text-green-500 animate-pulse" />
                            ) : (
                                <KeyRound className="w-8 h-8 text-[#0B1E36]" />
                            )}
                        </motion.div>
                        
                        <h1 className="text-3xl font-black text-[#0B1E36] mb-3">
                            {success ? 'Link Sent!' : 'Forgot password?'}
                        </h1>
                        
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            {success 
                                ? `We've sent a secure password reset link to ${email}.`
                                : "No worries, we'll send you secure recovery instructions."}
                        </p>

                        {success && devNotice && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-6 p-5 bg-amber-50 border border-amber-100 text-amber-800 text-xs font-semibold rounded-2xl flex flex-col gap-3 text-left shadow-sm"
                            >
                                <div>
                                    <span className="font-bold uppercase tracking-wider text-[10px] text-amber-600 block mb-1">Dev Fallback Active 🛠️</span>
                                    <span>Gmail failed to deliver, but we bypassed it for you! You can click the quick-link below to set your new password immediately.</span>
                                </div>
                                <a 
                                    href={resetUrl}
                                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-2"
                                >
                                    🔒 Reset Password Now (Dev)
                                </a>
                            </motion.div>
                        )}
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3 overflow-hidden shadow-sm"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!success && (
                        <form onSubmit={handleRequestLink} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 text-sm outline-none focus:border-[#0B1E36] focus:bg-white focus:ring-1 focus:ring-[#0B1E36] transition-all placeholder:text-slate-300"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button 
                                disabled={loading}
                                className="w-full py-4 bg-[#0B1E36] hover:bg-[#1a365d] text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group/btn disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        Send Reset Link
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <p className="mt-10 text-center text-slate-400 text-sm font-medium">
                        Remember your password? <Link to="/login" className="text-blue-600 font-bold hover:underline">Back to login</Link>
                    </p>
                </motion.div>
            </div>
            
            <footer className="py-8 text-center border-t border-slate-100 mt-auto bg-white/50">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2024 PriceWise Utility. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
