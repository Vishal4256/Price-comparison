import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { api } from '../api';
import Navbar from '../components/Navbar';
import PriceChart from '../components/PriceChart';
import { Star, Bell, ChevronRight, Check } from 'lucide-react';

export default function ProductDetails() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alertPrice, setAlertPrice] = useState('');
    const [alertSuccess, setAlertSuccess] = useState(false);
    const [wishlistSuccess, setWishlistSuccess] = useState(false);

    useEffect(() => {
        if (id) {
            fetchDetails();
        }
    }, [id]);

    const fetchDetails = async () => {
        try {
            const { data } = await api.get(`/api/products/${id}`);
            setData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSetAlert = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return alert('Please login to set alerts');
        
        try {
            await api.post('/api/alerts', {
                productId: id,
                targetPrice: parseFloat(alertPrice),
                email: user.email
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setAlertSuccess(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to set alert');
        }
    };

    const handleAddToWishlist = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return alert('Please login to save products');
        
        try {
            await api.post('/api/wishlist/add', {
                productId: id
            }, {
                headers: { Authorization: `Bearer ${user.token || localStorage.getItem('token')}` }
            });
            setWishlistSuccess(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save product');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-[#0B1E36]">
            Loading...
        </div>
    );

    if (!data) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">
            Product not found.
        </div>
    );

    const { product, history } = data;
    const currentPrice = product.currentPrice || 0;
    const originalPrice = product.originalPrice || currentPrice;
    
    // Fallback UI data if missing from backend
    const specs = product.specs || {
        "Ear Cushion Size": "40mm Premium Comfort",
        "Frequency Response": "10Hz - 40,000Hz",
        "Battery Life": "Up to 30 Hours",
        "Charging Time": "2 Hours (Fast: 10 min = 5 hours)",
        "Noise Canceling": "Active Hybrid (3 Modes)"
    };
    const features = product.features || {
        "Bluetooth Version": "5.2 Multipoint Support",
        "Audio Codecs": "SBC, AAC, LDAC, aptX HD",
        "Weight": "254g",
        "Water Resistance": "IPX4 Sweat Resistant",
        "Voice Assistant": "Siri, Google, Alexa Built-in"
    };

    const retailerComparison = [
        { name: 'Amazon', price: currentPrice, shipping: 'Free Prime Delivery', availability: 'In Stock', source: 'amazon' },
        { name: 'Best Buy', price: currentPrice + 10, shipping: 'Free 2-Day Shipping', availability: 'Ready for Pickup', source: 'bestbuy' },
        { name: 'Walmart', price: currentPrice + 15, shipping: 'Free Shipping', availability: 'In Stock', source: 'walmart' },
        { name: 'Target', price: currentPrice + 20, shipping: '$5.99 Standard', availability: 'Limited Stock', source: 'target' },
        { name: 'Newegg', price: currentPrice + 5, shipping: 'Free Shipping', availability: 'In Stock', source: 'newegg' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                    <span className="hover:text-[#0B1E36] cursor-pointer">Electronics</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="hover:text-[#0B1E36] cursor-pointer">Audio</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-[#0B1E36] font-medium">Headphones</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* Left Column: Images, Chart, Table */}
                    <div className="lg:w-2/3 space-y-8">
                        {/* Images */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col items-center">
                            <div className="h-80 w-full flex items-center justify-center mb-6">
                                <img src={product.image} alt={product.title} className="max-h-full object-contain mix-blend-multiply" />
                            </div>
                            {/* Mock thumbnails */}
                            <div className="flex gap-4">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className={`w-16 h-16 rounded-lg border ${i === 1 ? 'border-[#0B1E36]' : 'border-gray-200'} p-1 cursor-pointer bg-gray-50 flex items-center justify-center`}>
                                        <img src={product.image} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price History */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h3 className="font-bold text-lg text-slate-900 mb-2">Price History</h3>
                            <p className="text-sm text-slate-500 mb-6">Last 12 months trend across all tracked retailers</p>
                            <div className="h-64">
                                <PriceChart data={history} />
                            </div>
                        </div>

                        {/* Live Retailer Comparison */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="font-bold text-lg text-slate-900">Live Retailer Comparison</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Retailer</th>
                                            <th className="px-6 py-4 font-medium">Price</th>
                                            <th className="px-6 py-4 font-medium">Shipping</th>
                                            <th className="px-6 py-4 font-medium">Availability</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {retailerComparison.map((ret, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                                                    {/* Mock logo circle */}
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase">{ret.name.charAt(0)}</div>
                                                    {ret.name}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-900">
                                                    {idx === 0 && <span className="text-orange-500 mr-2 text-xs">Lowest:</span>}
                                                    ₹{ret.price.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{ret.shipping}</td>
                                                <td className="px-6 py-4 text-slate-600">{ret.availability}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="px-4 py-2 bg-[#0B1E36] hover:bg-[#1a365d] text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap">
                                                        View Deal
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Info, Alert, Specs */}
                    <div className="lg:w-1/3 space-y-6">
                        
                        {/* Title and Price card */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h1 className="text-2xl font-extrabold text-[#0B1E36] mb-4 leading-tight">{product.title}</h1>
                            
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex text-[#D4AF37]">
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current text-gray-300" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">{product.rating || 4.5}</span>
                                <span className="text-sm text-slate-500 underline ml-2">1,245 Reviews</span>
                            </div>

                            <div className="mb-8">
                                <div className="text-4xl font-black text-slate-900 mb-1">₹{currentPrice.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                                {originalPrice > currentPrice && (
                                    <div className="text-sm text-slate-500">
                                        List price: <span className="line-through">₹{originalPrice.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Target Price Alert</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                            <input 
                                                type="number" 
                                                value={alertPrice}
                                                onChange={(e) => setAlertPrice(e.target.value)}
                                                placeholder="Target Price"
                                                className="w-full pl-7 pr-3 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#0B1E36] text-sm font-semibold"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handleSetAlert}
                                    className="w-full py-4 bg-[#0B1E36] hover:bg-[#1a365d] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    {alertSuccess ? <Check className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                    {alertSuccess ? 'Alert Set!' : 'Add to PriceDrop'}
                                </button>
                                
                                <button 
                                    onClick={handleAddToWishlist}
                                    className="w-full py-4 bg-white hover:bg-slate-50 border border-gray-300 text-slate-700 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    {wishlistSuccess ? <Check className="w-5 h-5 text-green-600" /> : <Star className="w-5 h-5 text-slate-400" />}
                                    {wishlistSuccess ? 'Saved to Wishlist!' : 'Save to Wishlist'}
                                </button>

                                <p className="text-xs text-center text-slate-500">We'll email you the moment the price hits your target.</p>
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-slate-50">
                                <h3 className="font-bold text-sm text-slate-900 uppercase">Core Specifications</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {Object.entries(specs).map(([key, val]) => (
                                    <div key={key} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                        <span className="text-slate-500">{key}</span>
                                        <span className="font-semibold text-slate-900 text-right">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-slate-50">
                                <h3 className="font-bold text-sm text-slate-900 uppercase">Connectivity & Features</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {Object.entries(features).map(([key, val]) => (
                                    <div key={key} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                        <span className="text-slate-500">{key}</span>
                                        <span className="font-semibold text-slate-900 text-right max-w-[60%]">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
