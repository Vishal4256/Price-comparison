import React, { useRef, useState, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Camera, XCircle } from 'lucide-react';

const BarcodeScanner = ({ onResult, onError }) => {
    const videoRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const controlsRef = useRef(null);

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        
        const startScanning = async () => {
            try {
                setIsScanning(true);
                const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
                const selectedDeviceId = videoInputDevices[0]?.deviceId;
                
                if (!selectedDeviceId) {
                    throw new Error('No camera found');
                }

                codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err, controls) => {
                    controlsRef.current = controls;
                    if (result) {
                        onResult(result.getText());
                        controls.stop();
                        setIsScanning(false);
                    }
                    if (err && !(err.name === 'NotFoundException')) {
                        console.warn(err);
                    }
                });
            } catch (err) {
                console.error(err);
                onError(err.message || "Failed to start camera");
                setIsScanning(false);
            }
        };

        startScanning();

        return () => {
            if (controlsRef.current) {
                controlsRef.current.stop();
            }
        };
    }, [onResult, onError]);

    return (
        <div className="relative w-full max-w-md mx-auto aspect-video bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center border-2 border-indigo-500 shadow-xl">
            {isScanning ? (
                <>
                    <video ref={videoRef} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-2 border-dashed border-white/50 m-8 rounded-lg pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                        <p className="text-white text-sm bg-black/50 inline-block px-3 py-1 rounded-full">
                            Align barcode within the frame
                        </p>
                    </div>
                </>
            ) : (
                <div className="text-gray-400 flex flex-col items-center gap-2 p-6">
                    <Camera className="w-8 h-8" />
                    <p>Initializing camera...</p>
                </div>
            )}
        </div>
    );
};

export default BarcodeScanner;
