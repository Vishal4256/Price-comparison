import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

const Image = ({ src, alt, className = '', fallbackClassName = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <ImageIcon className="text-gray-400 w-8 h-8 opacity-50" />
        </div>
      )}
      
      {hasError ? (
        <div className={`flex flex-col items-center justify-center bg-gray-100 text-gray-400 w-full h-full ${fallbackClassName}`}>
          <ImageIcon className="w-8 h-8 mb-2" />
          <span className="text-xs">No image available</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default Image;
