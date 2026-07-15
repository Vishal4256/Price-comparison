import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';
import { Mail, Lock, User, Loader2, ArrowRight, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const registerSchema = z.object({
  name: z.string()
    .min(3, 'Name required (min 3 chars)')
    .max(50, 'Name max 50 chars')
    .regex(/^[a-zA-Z\s]+$/, 'Only alphabets and spaces allowed')
    .transform(val => val.trim()),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email')
    .transform(val => val.toLowerCase()),
  password: z.string()
    .min(8, 'Weak password (min 8 chars)')
    .max(64, 'Password max 64 chars')
    .regex(/[A-Z]/, 'Weak password (must contain uppercase)')
    .regex(/[a-z]/, 'Weak password (must contain lowercase)')
    .regex(/[0-9]/, 'Weak password (must contain number)')
    .regex(/[^A-Za-z0-9]/, 'Weak password (must contain special character)'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, 'Terms must be accepted')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Register() {
    const { register, handleSubmit, watch, formState: { errors, isValid, isSubmitting } } = useForm({
        resolver: zodResolver(registerSchema),
        mode: 'onChange',
        defaultValues: { terms: false }
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Password strength state
    const [strengthScore, setStrengthScore] = useState(0);
    const [strengthLabel, setStrengthLabel] = useState('Too Short');
    const [strengthColor, setStrengthColor] = useState('bg-slate-200');
    
    const [apiError, setApiError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const passwordValue = watch('password', '');
    const confirmPasswordValue = watch('confirmPassword', '');

    // Password validation rules for UI
    const rules = {
        length: passwordValue.length >= 8,
        hasNumber: /\d/.test(passwordValue),
        hasLetter: /[a-zA-Z]/.test(passwordValue),
        hasSpecial: /[^A-Za-z0-9]/.test(passwordValue)
    };

    // Calculate password strength
    useEffect(() => {
        if (!passwordValue) {
            setStrengthScore(0);
            setStrengthLabel('Empty');
            setStrengthColor('bg-slate-200');
            return;
        }

        if (passwordValue.length < 8) {
            setStrengthScore(1);
            setStrengthLabel('Too Short');
            setStrengthColor('bg-red-400');
            return;
        }

        let score = 1; // base score for >= 8 chars
        if (rules.hasNumber) score += 1;
        if (rules.hasLetter) score += 1;
        if (rules.hasSpecial && passwordValue.length >= 8) score += 1;

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
    }, [passwordValue]);

    const onSubmit = async (data) => {
        setApiError('');
        setSuccessMsg('');
        try {
            const res = await api.post('/api/auth/register', { 
                name: data.name, 
                email: data.email, 
                password: data.password 
            });
            
            localStorage.setItem('user', JSON.stringify(res.data));
            localStorage.setItem('token', res.data.token);

            setSuccessMsg('Account created successfully!');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
            
        } catch (err) {
            setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                    className="max-w-6xl w-full bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 overflow-hidden flex flex-col md:flex-row border border-slate-100"
                >
                    
                    {/* Left Side: Visual/Banner */}
                    <div className="md:w-1/2 bg-[#0B1E36] p-10 md:p-14 flex flex-col justify-between relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
                        
                        <div className="relative z-10">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl font-black mb-14 tracking-tight"
                            >
                                PriceWise
                            </motion.div>
                            
                            <motion.h2 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="text-4xl lg:text-5xl font-black leading-[1.1] mb-6"
                            >
                                Smart Comparison. <br />
                                <span className="text-[#D4AF37]">Precision Savings.</span>
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-blue-100/60 text-sm max-w-sm leading-relaxed mb-12 font-medium"
                            >
                                Join thousands of savvy shoppers who use our precision-engineered tools to track prices and secure the best deals across the digital marketplace.
                            </motion.p>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.7 }}
                            className="relative h-64 rounded-3xl overflow-hidden border border-white/10 shadow-inner bg-white/5 p-6 backdrop-blur-sm"
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" 
                                alt="Savings Chart" 
                                className="w-full h-full object-contain opacity-80 filter brightness-110"
                            />
                        </motion.div>
                    </div>

                    {/* Right Side: Register Form */}
                    <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center border-l border-slate-50 bg-white relative">
                        <div className="mb-8 text-center md:text-left">
                            <h1 className="text-3xl font-black text-[#0B1E36] mb-3">Create Account</h1>
                            <p className="text-slate-400 text-sm font-medium">Start your journey to precision saving today.</p>
                        </div>

                        <AnimatePresence>
                            {apiError && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3 overflow-hidden shadow-sm"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <span>{apiError}</span>
                                </motion.div>
                            )}
                            {successMsg && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 text-xs font-bold rounded-2xl flex items-center gap-3 overflow-hidden shadow-sm"
                                >
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span>{successMsg}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-1.5 relative">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        {...register('name')}
                                        className={`w-full bg-slate-50 border ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#0B1E36] focus:ring-[#0B1E36]'} rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 text-sm outline-none focus:bg-white focus:ring-1 transition-all placeholder:text-slate-300`}
                                        placeholder="John Doe"
                                    />
                                </div>
                                {errors.name && <span className="text-red-500 text-[10px] font-bold ml-1 absolute -bottom-4">{errors.name.message}</span>}
                            </div>

                            <div className="space-y-1.5 relative pt-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="email" 
                                        {...register('email')}
                                        className={`w-full bg-slate-50 border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#0B1E36] focus:ring-[#0B1E36]'} rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 text-sm outline-none focus:bg-white focus:ring-1 transition-all placeholder:text-slate-300`}
                                        placeholder="name@company.com"
                                    />
                                </div>
                                {errors.email && <span className="text-red-500 text-[10px] font-bold ml-1 absolute -bottom-4">{errors.email.message}</span>}
                            </div>

                            <div className="space-y-1.5 relative pt-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        {...register('password')}
                                        className={`w-full bg-slate-50 border ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#0B1E36] focus:ring-[#0B1E36]'} rounded-2xl py-3.5 pl-12 pr-12 text-slate-900 text-sm outline-none focus:bg-white focus:ring-1 transition-all placeholder:text-slate-300`}
                                        placeholder="••••••••"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <span className="text-red-500 text-[10px] font-bold ml-1 absolute -bottom-4">{errors.password.message}</span>}

                                {/* Password Strength Meter */}
                                {passwordValue && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="pt-4 px-1 space-y-1"
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
                                                <span className={rules.length ? "text-slate-600 font-bold" : "text-slate-400"}>At least 8 chars</span>
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

                            <div className="space-y-1.5 relative pt-4">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        {...register('confirmPassword')}
                                        className={`w-full bg-slate-50 border ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#0B1E36] focus:ring-[#0B1E36]'} rounded-2xl py-3.5 pl-12 pr-12 text-slate-900 text-sm outline-none focus:bg-white focus:ring-1 transition-all placeholder:text-slate-300`}
                                        placeholder="••••••••"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <motion.span 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        className="text-[10px] font-bold text-red-500 pl-1 inline-block absolute -bottom-4"
                                    >
                                        {errors.confirmPassword.message}
                                    </motion.span>
                                )}
                                {!errors.confirmPassword && confirmPasswordValue && confirmPasswordValue === passwordValue && (
                                    <motion.span 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        className="text-[10px] font-bold text-green-600 pl-1 inline-block absolute -bottom-4"
                                    >
                                        Passwords match!
                                    </motion.span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 px-1 pt-3 relative">
                                <input type="checkbox" id="terms" {...register('terms')} className="w-4 h-4 rounded border-slate-300 text-[#0B1E36] focus:ring-[#0B1E36]" />
                                <label htmlFor="terms" className="text-xs text-slate-400 font-bold leading-tight">
                                    I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                                </label>
                            </div>

                            <button 
                                type="submit"
                                disabled={isSubmitting || !isValid}
                                className="w-full py-4 bg-[#0B1E36] hover:bg-[#1a365d] text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group/btn disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        Create Account
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8">
                            <p className="text-center text-slate-400 text-sm font-medium">
                                Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
            
            <footer className="py-8 text-center border-t border-slate-100 mt-auto bg-white/50">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2024 PriceWise Utility. All rights reserved. Precision in Comparison.</p>
                    <div className="flex gap-8">
                        <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-[#0B1E36] tracking-widest uppercase">About Us</a>
                        <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-[#0B1E36] tracking-widest uppercase">Terms</a>
                        <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-[#0B1E36] tracking-widest uppercase">Privacy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
