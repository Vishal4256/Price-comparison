import React from 'react';
import { motion } from 'framer-motion';
import { staggerChildren, slideUp } from '../../motion/stagger'; // using our stagger logic (need to combine or adjust, but I'll use simple stagger here)
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '../common/skeletons';
import { NoProducts } from '../common/EmptyStates';

const ProductGrid = ({ products = [], isLoading = false, skeletonCount = 8 }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <NoProducts />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {products.map((product, index) => (
        <motion.div key={product.id || index} variants={itemVariants}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductGrid;
