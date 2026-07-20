import React, { useState } from 'react';
import Image from '../common/Image';

const ProductGallery = ({ images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex items-center justify-center p-8 group">
        <Image 
          src={images[activeIndex]} 
          alt={`Product image ${activeIndex + 1}`}
          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 h-20 rounded-xl border-2 flex-shrink-0 overflow-hidden bg-white dark:bg-gray-800 p-2 transition-all ${
                activeIndex === idx ? 'border-primary-500 shadow-md' : 'border-gray-100 dark:border-gray-700 hover:border-primary-300'
              }`}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
