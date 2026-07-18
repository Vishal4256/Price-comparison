import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { api } from '../api';

// Sub-components
import ImageGallery from '../components/product/ImageGallery';
import ProductHeader from '../components/product/ProductHeader';
import PriceComparison from '../components/product/PriceComparison';
import PriceHistoryChart from '../components/product/PriceHistoryChart';
import AIRecommendation from '../components/product/AIRecommendation';
import OffersCoupons from '../components/product/OffersCoupons';
import DeliveryWarranty from '../components/product/DeliveryWarranty';
import Specifications from '../components/product/Specifications';
import Reviews from '../components/product/Reviews';
import RelatedProducts from '../components/product/RelatedProducts';

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [productData, setProductData] = useState(null);
    const [aiData, setAiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchAiAnalysis = async () => {
            setAiLoading(true);
            try {
                const aiRes = await api.get(`/api/products/${id}/analysis`);
                setAiData(aiRes.data.analysis);
            } catch (err) {
                console.error('AI Analysis failed, but page will gracefully ignore:', err);
                setAiData(null); 
            } finally {
                setAiLoading(false);
            }
        };

        const fetchProductDetails = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await api.get(`/api/products/${id}`);
                setProductData(response.data);
                setLoading(false);
                fetchAiAnalysis();
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to load product details.');
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center justify-center">
                                <h2 className="text-xl font-bold text-red-500 mb-4">{error}</h2>
                <button onClick={() => navigate(-1)} className="text-indigo-600 underline font-bold">Go back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
                        
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Back Navigation */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to results
                </button>

                {loading || !productData ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                        <h2 className="text-xl font-bold text-slate-700">Loading Product Intel...</h2>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            {/* Left Pane - Gallery */}
                            <div className="lg:col-span-5 relative">
                                <div className="sticky top-24">
                                    <ImageGallery images={productData.product?.gallery || []} />
                                </div>
                            </div>

                            {/* Right Pane - Details & Actions */}
                            <div className="lg:col-span-7">
                                <ProductHeader product={productData.product} pricing={productData.pricing} />
                                
                                <PriceComparison pricing={productData.pricing} />
                                
                                <AIRecommendation aiData={aiData} loading={aiLoading} />
                                
                                <DeliveryWarranty />
                                
                                <OffersCoupons coupons={productData.pricing?.coupons} />

                                <PriceHistoryChart />
                                
                                <Specifications specs={productData.product?.specifications} />
                            </div>
                        </div>

                        {/* Full Width Sections below the fold */}
                        <div className="mt-12">
                            <Reviews />
                            <RelatedProducts />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
