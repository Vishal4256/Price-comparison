import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../shared/ProductCard';

const DealCarousel = ({ items }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -400 : 400;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!items || items.length === 0) return null;

    return (
        <div className="relative group">
            {/* Left Button */}
            <button 
                onClick={() => scroll('left')}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 shadow-lg rounded-full text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50 disabled:opacity-0"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Scrollable Container */}
            <div 
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((product) => (
                    <div key={product._id} className="min-w-[280px] max-w-[280px] shrink-0 snap-start">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>

            {/* Right Button */}
            <button 
                onClick={() => scroll('right')}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 shadow-lg rounded-full text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50 disabled:opacity-0"
            >
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>
    );
};

export default DealCarousel;
