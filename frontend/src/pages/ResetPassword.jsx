import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Lock, Loader2, ArrowRight, CheckCircle2, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Password strength state
    const [strengthScore, setStrengthScore] = useState(0);
    const [strengthLabel, setStrengthLabel] = useState('Too Short');
    const [strengthColor, setStrengthColor] = useState('bg-slate-200');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    // Password validation rules
    const rules = {
        length: password.length >= 6,
        hasNumber: /\d/.test(password),
        hasLetter: /[a-zA-Z]/.test(password),
        hasSpecial: /[^A-Za-z0-9]/.test(password)
    };

    // Calculate password strength
    useEffect(() => {
        if (!password) {
            setStrengthScore(0);
            setStrengthLabel('Empty');
            setStrengthColor('bg-slate-200');
            return;
        }

        if (password.length < 6) {
            setStrengthScore(1);
            setStrengthLabel('Too Short');
            setStrengthColor('bg-red-400');
            return;
        }

        let score = 1;
        if (rules.hasNumber) score += 1;
        if (rules.hasLetter) score += 1;
        if (rules.hasSpecial && password.length >= 8) score += 1;

        setStrengthScore(score);

        switch (score) {
            case 1:
                setStrengthLabel('Weak');
                setStrengthColor('bg-red-500');
                break;
            case 2:
                setStrengthLabel('Medium');
                setStrengthColor('bg-amber-500');
                break;
            case 3:
                setStrengthLabel('Good');
                setStrengthColor('bg-blue-500');
                break;
            case 4:
                setStrengthLabel('Strong 💪');
                setStrengthColor('bg-green-500');
                break;
            default:
                setStrengthLabel('Weak');
                setStrengthColor('bg-red-500');
        }
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!token) {
            setError('Missing or invalid reset token.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await axios.post('http://localhost:5000/api/auth/reset-password', { token, password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The link might be invalid or expired.');
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
                            key={success ? 'success' : 'reset'}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"
                        >
                            {success ? (
                                <CheckCircle2 className="w-8 h-8 text-green-500 animate-pulse" />
                            ) : (
                                <Lock className="w-8 h-8 text-[#0B1E36]" />
                            )}
                        </motion.div>
                        
                        <h1 className="text-3xl font-black text-[#0B1E36] mb-3">
                            {success ? 'Password Reset!' : 'Set new password'}
                        </h1>
                        
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            {success 
                                ? 'Your password has been reset successfully. Redirecting you to login...' 
                                : 'Please construct a strong, unique password to secure your account.'}
                        </p>
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
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">New Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 pr-12 text-slate-900 text-sm outline-none focus:border-[#0B1E36] focus:bg-white focus:ring-1 focus:ring-[#0B1E36] transition-all placeholder:text-slate-300"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Password Strength Meter */}
                                {password && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="pt-2 px-1 space-y-1"
                                    >
                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                            <span className="text-slate-400 uppercase tracking-wider">Security Strength:</span>
                                            <span className={`px-2 py-0.5 rounded text-white ${strengthColor} font-bold text-[9px] uppercase tracking-wide transition-all duration-300`}>
                                                {strengthLabel}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${strengthColor} transition-all duration-500 ease-out`}
                                                style={{ width: `${(strengthScore / 4) * 100}%` }}
                                            />
                                        </div>
                                        
                                        {/* Security Checklist Details */}
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1.5">
                                            <div className="flex items-center gap-1.5 text-[10px] font-medium">
                                                {rules.length ? <Check className="w-3.5 h-3.5 text-green-500" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                                                <span className={rules.length ? "text-slate-600 font-bold" : "text-slate-400"}>At least 6 chars</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-medium">
                                                {rules.hasLetter ? <Check className="w-3.5 h-3.5 text-green-500" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                                                <span className={rules.hasLetter ? "text-slate-600 font-bold" : "text-slate-400"}>Contains letters</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-medium">
                                                {rules.hasNumber ? <Check className="w-3.5 h-3.5 text-green-500" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                                                <span className={rules.hasNumber ? "text-slate-600 font-bold" : "text-slate-400"}>Contains numbers</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-medium">
                                                {rules.hasSpecial ? <Check className="w-3.5 h-3.5 text-green-500" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                                                <span className={rules.hasSpecial ? "text-slate-600 font-bold" : "text-slate-400"}>Special symbol</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Confirm Password</label>
                                <div className="relative">
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 pr-12 text-slate-900 text-sm outline-none focus:border-[#0B1E36] focus:bg-white focus:ring-1 focus:ring-[#0B1E36] transition-all placeholder:text-slate-300"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <motion.span 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        className="text-[10px] font-bold text-red-500 pl-1 inline-block"
                                    >
                                        Passwords do not match yet.
                                    </motion.span>
                                )}
                                {confirmPassword && password === confirmPassword && (
                                    <motion.span 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        className="text-[10px] font-bold text-green-600 pl-1 inline-block"
                                    >
                                        Passwords match!
                                    </motion.span>
                                )}
                            </div>

                            <button 
                                disabled={loading || (password !== confirmPassword && confirmPassword.length > 0) || password.length < 6}
                                className="w-full py-4 bg-[#0B1E36] hover:bg-[#1a365d] text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group/btn disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        Reset Password
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
