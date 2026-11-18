import React from 'react';
import { motion } from 'framer-motion';
import { Bot, LineChart, Bell, Zap, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { hoverLift } from '../../motion/hover';
import { staggerChildren, slideUp } from '../../motion/stagger';

const features = [
  { icon: Bot, title: 'AI Powered Search', desc: 'Smart intent recognition matches you with the exact product instantly.' },
  { icon: ArrowRightLeft, title: 'Compare Across Retailers', desc: 'See real-time prices from Amazon, Flipkart, Croma, and more.' },
  { icon: LineChart, title: 'Price History', desc: 'Track historical pricing trends to know if it is a good time to buy.' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Set a target price and get notified instantly when the price drops.' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Optimized search engine returning results in milliseconds.' },
  { icon: ShieldCheck, title: 'Trusted Retailers', desc: 'We only scrape and compare prices from verified, authentic sellers.' },
];

const FeatureCards = () => {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why PriceSmart?</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          We bring transparency to shopping by giving you the data you need to make the smartest purchasing decisions.
        </p>
      </div>

      <motion.div 
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {features.map((feature, idx) => (
          <motion.div key={idx} variants={slideUp}>
            <motion.div
              variants={hoverLift}
              initial="rest"
              whileHover="hover"
              className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 h-full shadow-sm"
            >
              <div className="w-12 h-12 bg-primary-50 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default FeatureCards;
