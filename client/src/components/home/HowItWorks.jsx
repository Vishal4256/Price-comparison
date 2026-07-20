import React from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRightLeft, TrendingDown, Heart } from 'lucide-react';
import { staggerChildren, slideUp } from '../../motion/stagger';

const steps = [
  { icon: Search, title: 'Search', desc: 'Type what you need. Our AI understands your intent.' },
  { icon: ArrowRightLeft, title: 'Compare', desc: 'We instantly pull live prices from all top retailers.' },
  { icon: TrendingDown, title: 'Track', desc: 'View price history to ensure you are getting a real deal.' },
  { icon: Heart, title: 'Save', desc: 'Set alerts and buy when the price drops to your target.' },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50 rounded-3xl my-16 px-6 lg:px-12">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          Four simple steps to make sure you never overpay again.
        </p>
      </div>

      <motion.div 
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative"
      >
        {/* Connection Line (Desktop only) */}
        <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-gray-200 via-primary-300 to-gray-200 dark:from-gray-700 dark:via-primary-700 dark:to-gray-700 z-0" />

        {steps.map((step, idx) => (
          <motion.div key={idx} variants={slideUp} className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 border-4 border-gray-50 dark:border-gray-900 shadow-xl flex items-center justify-center mb-6 text-primary-500">
              <step.icon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[200px]">{step.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default HowItWorks;
