import React, { useState, useEffect } from 'react';

export default function FeaturedBrands() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setBrands([
                { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
                { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
                { name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg' },
                { name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
                { name: 'LG', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%282015%29.svg' },
                { name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' }
            ]);
            setLoading(false);
        }, 800);
    }, []);

    if (loading) {
        return (
            <div className="py-12 bg-slate-50 border-y border-slate-100 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 flex justify-between gap-8 opacity-50">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="w-24 h-8 bg-slate-200 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <section className="py-12 bg-slate-50 border-y border-slate-200 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <p className="text-[10px] font-bold text-center text-slate-400 uppercase tracking-widest mb-8">Trusted by top global brands</p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale">
                    {brands.map((brand, idx) => (
                        <img loading="lazy" decoding="async"
                            key={idx}
                            src={brand.logo} 
                            alt={brand.name} 
                            className="h-6 md:h-8 object-contain hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
