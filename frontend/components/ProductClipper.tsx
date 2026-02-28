import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Loader2, Sparkles, Scan, Tag } from 'lucide-react';
import { analyzeFurnitureImage } from '../services/geminiService';
import { Product } from '../types';

interface ProductClipperProps {
    onClose: () => void;
    onSave: (product: Product) => void;
}

const ProductClipper: React.FC<ProductClipperProps> = ({ onClose, onSave }) => {
    const [image, setImage] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scannedData, setScannedData] = useState<Partial<Product> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = async (ev) => {
                if (ev.target?.result) {
                    const base64 = ev.target.result as string;
                    setImage(base64);
                    startScanning(base64);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const startScanning = async (base64: string) => {
        setIsScanning(true);
        // Call the AI Service
        const result = await analyzeFurnitureImage(base64);
        setScannedData(result);
        setIsScanning(false);
    };

    const handleSave = () => {
        if (scannedData && image) {
            const newProduct: Product = {
                id: Math.random().toString(36).substr(2, 9),
                image: image,
                originalImage: image,
                price: 0, // AI doesn't know price yet
                affiliateLink: '#',
                store: 'Uploaded',
                name: scannedData.name || 'New Item',
                category: scannedData.category as any,
                style: scannedData.style as any,
                dimensions: scannedData.dimensions,
                description: scannedData.description,
                colors: scannedData.colors,
            };
            onSave(newProduct);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-4 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-serif text-xl text-stone-900 flex items-center gap-2">
                        <Sparkles size={20} className="text-indigo-600"/> 
                        Smart Clipper
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition">
                        <X size={20} className="text-stone-500" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    {/* 1. Upload State */}
                    {!image && (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-3 border-dashed border-stone-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition group"
                        >
                            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition">
                                <Camera size={32} className="text-stone-400 group-hover:text-indigo-600" />
                            </div>
                            <h4 className="font-medium text-stone-900 text-lg mb-1">Snap or Upload</h4>
                            <p className="text-stone-500 text-sm max-w-xs">Upload a photo of any furniture, and our AI will extract the details.</p>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </div>
                    )}

                    {/* 2. Scanning / Result State */}
                    {image && (
                        <div className="space-y-6">
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 group">
                                <img src={image} className="w-full h-full object-cover" />
                                
                                {isScanning && (
                                    <div className="absolute inset-0 bg-stone-900/20 flex flex-col items-center justify-center backdrop-blur-[2px]">
                                        <div className="relative">
                                            <div className="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-75"></div>
                                            <div className="relative bg-white p-4 rounded-full shadow-xl">
                                                <Scan size={32} className="text-indigo-600 animate-pulse" />
                                            </div>
                                        </div>
                                        <p className="mt-4 text-white font-medium text-lg drop-shadow-md">Analyzing Dimensions...</p>
                                    </div>
                                )}
                            </div>

                            {scannedData && !isScanning && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                                        <div className="flex gap-3 mb-3">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-indigo-600 font-bold shrink-0">
                                                AI
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-indigo-900">{scannedData.name}</h4>
                                                <p className="text-xs text-indigo-700">{scannedData.description}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="bg-white/60 p-2 rounded flex items-center gap-2 text-indigo-800">
                                                <Tag size={14} /> {scannedData.category}
                                            </div>
                                            <div className="bg-white/60 p-2 rounded flex items-center gap-2 text-indigo-800">
                                                <Scan size={14} /> {scannedData.dimensions?.width}"W x {scannedData.dimensions?.depth}"D
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => setImage(null)} className="flex-1 py-3 text-stone-500 font-medium hover:bg-stone-100 rounded-xl transition">
                                            Retake
                                        </button>
                                        <button onClick={handleSave} className="flex-1 bg-stone-900 text-white chat-shadow font-medium rounded-xl py-3 hover:bg-stone-800 transition flex items-center justify-center gap-2">
                                            <Check size={18} /> Add to Room
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductClipper;
