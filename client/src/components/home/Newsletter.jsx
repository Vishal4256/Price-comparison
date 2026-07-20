import React from 'react';
import { Mail } from 'lucide-react';
import Button from '../ui/Button';

const Newsletter = () => {
  return (
    <section className="py-12 mb-12">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-600 to-blue-700 p-8 md:p-16 text-center text-white shadow-2xl">
        {/* Glassmorphism Pattern Overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Never Miss a Price Drop</h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join 50,000+ smart shoppers. Get weekly alerts on the biggest tech discounts and exclusive deals directly to your inbox.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-grow h-12 rounded-xl px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
              required
            />
            <Button variant="secondary" className="h-12 border-0 bg-white text-primary-700 hover:bg-gray-50 shrink-0">
              Subscribe
            </Button>
          </form>
          <p className="mt-4 text-xs text-primary-200/80">We respect your privacy. No spam, ever.</p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
