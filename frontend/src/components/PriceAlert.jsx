import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';

export default function PriceAlert() {
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscriberEmail.trim()) return;

    // Email regex validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(subscriberEmail.trim())) {
      setSubmissionError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setSubmissionError('');

    try {
      await api.post('/api/alerts/subscribe', {
        email: subscriberEmail.trim().toLowerCase()
      });
      setSubmissionSuccess(true);
      setSubscriberEmail('');
      setTimeout(() => {
        setSubmissionSuccess(false);
      }, 6000);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setSubmissionError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto bg-[#0B1E36] rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl border border-slate-800">
        {/* Subtle glowing decorative gradient */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-xl text-left z-10">
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Never miss a price drop again.</h2>
          <p className="text-blue-200/90 text-base leading-relaxed">
            Set alerts for your favorite products and we'll notify you the moment the price hits your target.
          </p>
        </div>

        <div className="w-full md:w-auto z-10 relative">
          <AnimatePresence mode="wait">
            {submissionSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 px-6 py-4 rounded-2xl text-emerald-300 backdrop-blur-md"
              >
                <CheckCircle className="w-6 h-6 shrink-0 text-emerald-400" />
                <div>
                  <p className="font-bold text-white">Price alerts enabled successfully</p>
                  <p className="text-sm text-emerald-200/80">You're all set to receive notifications.</p>
                </div>
              </motion.div>
            ) : (
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubscribe} 
                className="w-full flex flex-col gap-2"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    value={subscriberEmail}
                    onChange={(e) => {
                      setSubscriberEmail(e.target.value);
                      if (submissionError) setSubmissionError('');
                    }}
                    disabled={submitting}
                    placeholder="Enter your email address" 
                    className="px-6 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25 w-full sm:w-80 outline-none text-slate-900 shadow-sm transition-all disabled:bg-slate-100 disabled:text-slate-500 placeholder-slate-400"
                  />
                  <button 
                    type="submit"
                    disabled={submitting || !subscriberEmail.trim()}
                    className="px-6 py-3.5 bg-[#D4AF37] hover:bg-[#c49e29] disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-bold rounded-xl transition-all duration-300 whitespace-nowrap shadow-md active:scale-95 flex items-center justify-center gap-2 min-w-[130px]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      'Get Alerts'
                    )}
                  </button>
                </div>
                
                <AnimatePresence>
                  {submissionError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 flex items-center gap-2 text-rose-400 text-sm px-1 bg-red-950/50 p-2 rounded-lg border border-red-500/20"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submissionError === 'This email is already subscribed!' ? 'Email already subscribed' : submissionError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
