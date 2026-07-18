import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Laptop, Smartphone, Headphones, Camera, Watch, Gamepad, Tv, Sofa } from 'lucide-react';

const CATEGORY_ICONS = {
    'Laptops': Laptop,
    'Smartphones': Smartphone,
    'Audio': Headphones,
    'Cameras': Camera,
    'Wearables': Watch,
    'Gaming': Gamepad,
    'Televisions': Tv,
    'Home': Sofa
};

export default function PopularCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock API call
        setTimeout(() => {
            setCategories([
                { name: 'Smartphones', count: 1240 },
                { name: 'Laptops', count: 856 },
                { name: 'Audio', count: 2150 },
                { name: 'Gaming', count: 430 },
                { name: 'Wearables', count: 920 },
                { name: 'Cameras', count: 310 },
                { name: 'Televisions', count: 540 },
                { name: 'Home', count: 1800 }
            ]);
            setLoading(false);
        }, 800);
    }, []);

    if (loading) {
        return (
            <section className="py-16 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="w-48 h-8 bg-slate-100 rounded mb-8 animate-pulse"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {[1,2,3,4,5,6,7,8].map(i => (
                            <div key={i} className="aspect-square bg-slate-100 rounded-3xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-[#0B1E36]">Shop by Category</h2>
                        <p className="text-slate-500 font-medium mt-2">Explore our most popular departments</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {categories.map((cat, idx) => {
                        const Icon = CATEGORY_ICONS[cat.name] || Smartphone;
                        return (
                            <Link 
                                key={idx}
                                to={`/search?category=${encodeURIComponent(cat.name)}`}
                                className="group flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-[#0B1E36] rounded-3xl transition-all duration-300 border border-slate-100 hover:border-[#0B1E36] shadow-sm hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 rounded-full bg-white group-hover:bg-white/10 flex items-center justify-center mb-4 transition-colors">
                                    <Icon className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-sm font-bold text-slate-700 group-hover:text-white transition-colors">{cat.name}</span>
                                <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-300 mt-1">{cat.count}+ Items</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
