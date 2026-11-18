import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-black font-sans">
      
      {/* Left Side: Animated Background (Hidden on small screens) */}
      <div className="hidden md:flex flex-1 relative overflow-hidden bg-gray-900 justify-center items-center p-12">
        {/* Animated Gradients */}
        <div className="absolute -top-1/2 -left-1/2 w-[150%] h-[150%] bg-gradient-to-br from-primary-600/30 to-blue-600/30 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
        
        {/* Floating Glass Blob */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 w-full max-w-md bg-white/10 dark:bg-black/20 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-12 shadow-2xl"
        >
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/30">
            <span className="text-3xl font-extrabold text-white">P</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
            Stop Overpaying. <br /> Start Saving.
          </h2>
          <p className="text-primary-100 text-lg leading-relaxed">
            Join the ultimate AI-powered price intelligence platform. Compare millions of products instantly.
          </p>
        </motion.div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 lg:p-24 relative bg-gray-50 dark:bg-gray-900/50">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 dark:border-gray-700 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{title}</h1>
            {subtitle && <p className="text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
