import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { ArrowRight, Loader2, RefreshCw, CheckCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VerifyOTP = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [resendCooldown, setResendCooldown] = useState(60); // 60 seconds
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timerId = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendCooldown]);

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    const focusIndex = Math.min(pastedData.length, 5);
    if(inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/api/auth/verify-otp', {
        email,
        otp: otpValue
      });
      
      setSuccess(response.data.message);
      
      // Save token and user details
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email
      }));
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    setResending(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await api.post('/api/auth/resend-otp', { email });
      setSuccess(response.data.message);
      setResendCooldown(60);
      setTimeLeft(600); // reset main timer
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#fafafb] font-sans flex flex-col relative overflow-hidden items-center justify-center p-4">
      <div className="mb-8 text-center mt-[-10vh]">
        <h2 className="text-[32px] font-extrabold text-[#111827] mb-3 tracking-tight">Verify your email</h2>
        <p className="text-slate-500 text-[15px]">
          We sent a 6-digit verification code to <span className="text-[#5046e5] font-medium">{email}</span>.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-slate-100 p-8 relative z-10"
      >
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg"
            >
              <p className="text-red-600 text-[14px] text-center font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleVerify}>
          <div className="mb-6">
            <label className="block text-[14px] font-semibold text-[#374151] mb-2">
              Verification Code
            </label>
            <div 
              className="flex justify-between w-full border border-slate-200 rounded-lg bg-white h-[52px] items-center px-4 focus-within:border-[#5046e5] focus-within:ring-1 focus-within:ring-[#5046e5] transition-all shadow-sm"
              onPaste={handlePaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  placeholder="-"
                  className="w-8 h-10 text-center text-xl font-semibold text-[#111827] outline-none bg-transparent placeholder-slate-400"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-[#5046e5] text-white py-[14px] rounded-lg font-medium text-[15px] hover:bg-[#4338ca] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Verify and Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[14px]">
          <span className="text-slate-500">Didn't receive the code? </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || resending}
            className={`font-medium transition-colors ${
              resendCooldown > 0 ? 'text-[#8b85fa] cursor-not-allowed' : 'text-[#5046e5] hover:text-[#4338ca]'
            }`}
          >
            {resending ? 'Sending...' : (resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code')}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verified!</h3>
              <p className="text-gray-500">{success}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerifyOTP;