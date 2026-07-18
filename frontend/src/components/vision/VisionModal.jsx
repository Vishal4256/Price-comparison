import React, { useState } from 'react';
import { X, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import VisualSearchDropzone from './VisualSearchDropzone';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { getApiError } from '../../utils/errorHandler';

const VisionModal = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState('upload'); // 'upload' or 'barcode'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lowConfidenceResult, setLowConfidenceResult] = useState(null);
    const navigate = useNavigate();

    if (!isOpen) return null;

    const executeSearch = (query) => {
        onClose();
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    const handleVisionResponse = (data) => {
        if (data.confidence >= 0.80) {
            executeSearch(data.query);
        } else {
            setLowConfidenceResult(data.query);
        }
    };

    const handleImageUpload = async (file) => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setLowConfidenceResult(null);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await api.post('/api/vision/search', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            handleVisionResponse(response.data.data);
        } catch (err) {
            console.error('Vision search failed:', err);
            setError(getApiError(err, 'Failed to analyze image'));
        } finally {
            setLoading(false);
        }
    };

    const handleBarcodeScanned = async (barcode) => {
        setLoading(true);
        setError(null);
        setLowConfidenceResult(null);

        try {
            const response = await api.post('/api/vision/barcode', { barcode });
            handleVisionResponse(response.data.data);
        } catch (err) {
            console.error('Barcode search failed:', err);
            setError(getApiError(err, 'Failed to process barcode'));
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setLowConfidenceResult(null);
        setError(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <h3 className="text-lg font-semibold text-white">Visual Search</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800">
                    <button
                        onClick={() => { setMode('upload'); reset(); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                            mode === 'upload' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                        }`}
                    >
                        <ImageIcon className="w-4 h-4" /> Upload Image
                    </button>
                    <button
                        onClick={() => { setMode('barcode'); reset(); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                            mode === 'barcode' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                        }`}
                    >
                        <Camera className="w-4 h-4" /> Scan Barcode
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 relative min-h-[300px] flex flex-col items-center justify-center">
                    {loading ? (
                        <div className="flex flex-col items-center text-indigo-400">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <p className="font-medium animate-pulse">Analyzing...</p>
                        </div>
                    ) : lowConfidenceResult ? (
                        <div className="text-center w-full animate-in zoom-in-95 duration-200">
                            <h4 className="text-gray-400 mb-2">We found a possible match:</h4>
                            <p className="text-2xl font-bold text-white mb-6">"{lowConfidenceResult}"</p>
                            <div className="flex gap-3 justify-center">
                                <button 
                                    onClick={reset}
                                    className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                                >
                                    Try Again
                                </button>
                                <button 
                                    onClick={() => executeSearch(lowConfidenceResult)}
                                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors font-medium shadow-lg shadow-indigo-500/20"
                                >
                                    Search for this
                                </button>
                            </div>
                        </div>
                    ) : mode === 'upload' ? (
                        <VisualSearchDropzone onImageSelected={handleImageUpload} error={error} />
                    ) : (
                        <BarcodeScanner onResult={handleBarcodeScanned} onError={setError} />
                    )}

                    {!loading && !lowConfidenceResult && mode === 'barcode' && error && (
                        <p className="mt-4 text-red-400 text-sm text-center bg-red-400/10 py-2 px-4 rounded-lg w-full">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VisionModal;
