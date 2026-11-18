import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, TrendingDown, Star } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import Image from '../common/Image';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { hoverLift } from '../../motion/hover';

const ProductCard = ({ product }) => {
  if (!product) return null;

  return (
    <motion.div
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
      className="h-full"
    >
      <Card className="h-full flex flex-col group relative overflow-hidden transition-all duration-300">
        
        {/* Wishlist Button (Absolute) */}
        <button className="absolute top-3 right-3 z-10 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-full text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <Link to={`/product/${product.id}`} className="relative aspect-square p-6 bg-white dark:bg-gray-800 flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
          <Image 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform group-hover:scale-105 transition-transform duration-500"
          />
          {product.lowestPrice?.discount > 0 && (
            <Badge variant="danger" className="absolute bottom-3 left-3 flex items-center gap-1 shadow-sm">
              <TrendingDown className="w-3 h-3" />
              {product.lowestPrice.discount}% OFF
            </Badge>
          )}
        </Link>

        {/* Product Details */}
        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase tracking-wider">
            {product.brand}
          </div>
          <Link to={`/product/${product.id}`} className="group-hover:text-primary-600 transition-colors">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2 mt-2 pt-1 text-xs">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-semibold ml-1">{product.rating}</span>
            </div>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-gray-500">{product.retailers?.length || 1} offers</span>
          </div>
        </CardContent>

        {/* Price & Action */}
        <CardFooter className="p-4 pt-0 flex items-end justify-between mt-auto">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Starting at</div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ₹{product.lowestPrice?.price?.toLocaleString() || '---'}
              </span>
              {product.lowestPrice?.oldPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.lowestPrice.oldPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <Button variant="primary" size="sm" className="px-4 py-2 font-semibold">
            Compare
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
