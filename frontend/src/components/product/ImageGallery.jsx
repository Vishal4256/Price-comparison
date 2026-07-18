import React, { useState } from 'react';

export default function ImageGallery({ images = [] }) {
    const defaultImages = images.length > 0 ? images : [
        'https://via.placeholder.com/600',
        'https://via.placeholder.com/600?text=Image+2',
        'https://via.placeholder.com/600?text=Image+3',
        'https://via.placeholder.com/600?text=Image+4'
    ];
    
    const [mainImage, setMainImage] = useState(defaultImages[0]);

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-3xl border border-slate-200 overflow-hidden flex items-center justify-center p-8 shadow-sm">
                <img loading="lazy" decoding="async"
                    src={mainImage} 
                    alt="Product Main" 
                    className="w-full h-full object-contain hover:scale-110 transition-transform duration-500 cursor-zoom-in mix-blend-multiply" 
                />
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                {defaultImages.map((img, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setMainImage(img)}
                        className={`w-20 h-20 flex-shrink-0 bg-white rounded-xl border-2 overflow-hidden p-2 transition-all ${mainImage === img ? 'border-indigo-500 shadow-md' : 'border-slate-200 hover:border-indigo-300'}`}
                    >
                        <img src={img} alt={`Thumbnail ${idx}`} loading="lazy" decoding="async" className="w-full h-full object-contain mix-blend-multiply" />
                    </button>
                ))}
            </div>
        </div>
    );
}
