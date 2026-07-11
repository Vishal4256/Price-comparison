import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryCard({ title, image, path, subtitle, className = '' }) {
  return (
    <Link 
      to={path} 
      className={`relative rounded-2xl overflow-hidden group cursor-pointer block ${className}`}
    >
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
      />
      {/* Dark overlay animation */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
      
      {/* Content overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E36]/90 via-[#0B1E36]/30 to-transparent flex flex-col justify-end p-6">
        <h3 className="text-white text-2xl font-bold mb-2 transform group-hover:-translate-y-1 transition-transform duration-300">{title}</h3>
        {subtitle && (
          <p className="text-blue-200 text-sm transform opacity-90 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300">
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}
