import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Mail, Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [devNote, setDevNote] = useState(''); // Just for development simulation

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        setDevNote('');
        
        try {
            const { data } = await api.post('/api/auth/forgot-password', { email });
            setMessage(data.message);
            if (data.dev_note) {
                setDevNote(data.dev_note);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
                        
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 p-10 border border-slate-100">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-black text-[#0B1E36] mb-3">Reset Password</h1>
                        <p className="text-slate-400 text-sm font-medium">
                            Enter your email and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {message ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Check your email</h2>
                            <p className="text-slate-500 text-sm mb-6">{message}</p>
                            
                            {/* Development helper - simulates clicking the link in the email */}
                            {devNote && (
                                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-left">
                                    <p className="text-xs font-bold text-yellow-800 mb-2 uppercase">Dev Mode</p>
                                    <p className="text-xs text-yellow-700 break-all">{devNote}</p>
                                </div>
                            )}

                            <Link to="/login" className="mt-8 inline-block text-sm font-bold text-[#0B1E36] hover:text-blue-700">
                                Return to login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                disabled={loading || !email}
                                className="w-full py-4 bg-[#0B1E36] hover:bg-[#1a365d] text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                            </button>

                            <div className="text-center pt-2">
                                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#0B1E36] transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
