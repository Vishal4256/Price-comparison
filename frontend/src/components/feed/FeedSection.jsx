import React from 'react';
import DealCarousel from './DealCarousel';

const FeedSection = ({ title, items, description }) => {
    if (!items || items.length === 0) return null;

    return (
        <section className="mb-12">
            <div className="mb-6 px-2">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
                {description && <p className="text-slate-500 mt-1">{description}</p>}
            </div>
            
            <DealCarousel items={items} />
        </section>
    );
};

export default FeedSection;
