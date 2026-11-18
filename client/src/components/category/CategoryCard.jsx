import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { hoverLift } from '../../motion/hover';
import Image from '../common/Image';

const CategoryCard = ({ category }) => {
  return (
    <motion.div
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
      className="h-full"
    >
      <Link to={`/category/${category.slug}`} className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors hover:border-primary-500/50 dark:hover:border-primary-500/50 group h-full justify-center">
        <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-gray-700/50 flex items-center justify-center mb-3 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
          <Image src={category.icon} alt={category.name} className="w-8 h-8 object-contain" />
        </div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white text-center">
          {category.name}
        </h4>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
