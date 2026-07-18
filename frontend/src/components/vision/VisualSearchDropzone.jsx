import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

const VisualSearchDropzone = ({ onImageSelected, error }) => {
    const [dragActive, setDragActive] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFile = (file) => {
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Only JPG, PNG, and WebP are allowed.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File must be less than 5MB');
            return;
        }

        // Preview
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target.result);
        reader.readAsDataURL(file);

        // Notify Parent
        onImageSelected(file);
    };

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const clearPreview = () => {
        setPreviewUrl(null);
        onImageSelected(null);
    };

    if (previewUrl) {
        return (
            <div className="relative w-full max-w-md mx-auto aspect-video rounded-xl overflow-hidden bg-gray-900 border-2 border-indigo-500 shadow-xl group">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
                <button 
                    onClick={clearPreview}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <form 
            className={`relative w-full max-w-md mx-auto aspect-video rounded-xl flex flex-col items-center justify-center p-6 border-2 border-dashed transition-all ${
                dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-600 hover:border-indigo-400 bg-gray-800'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleChange} 
            />
            
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-gray-400 hover:text-white transition-colors">
                <UploadCloud className="w-10 h-10 mb-3 text-indigo-400" />
                <p className="mb-2 text-sm font-medium">
                    <span className="text-indigo-400 underline decoration-indigo-400/50 underline-offset-4">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">JPG, PNG or WebP (MAX. 5MB)</p>
            </label>

            {error && (
                <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-red-400 bg-black/50 py-1">
                    {error}
                </div>
            )}
        </form>
    );
};

export default VisualSearchDropzone;
