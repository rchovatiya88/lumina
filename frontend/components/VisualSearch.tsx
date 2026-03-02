import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number | null;
  image?: string;
  store: string;
  category: string;
  style: string;
  similarity_score?: number;
}

interface VisualSearchProps {
  onResults: (products: Product[]) => void;
  onClose: () => void;
}

const backendUrl =
  (typeof process !== 'undefined' && process.env?.REACT_APP_BACKEND_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.REACT_APP_BACKEND_URL) ||
  '';

const VisualSearch: React.FC<VisualSearchProps> = ({ onResults, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload and search
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('top_k', '12');

      const response = await fetch(`${backendUrl}/api/search/visual`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.ok) {
        onResults(data.products);
      } else {
        setError(data.error || 'Visual search failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="visual-search-modal">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Camera className="text-amber-600" size={22} />
            <h2 className="font-serif text-xl">Visual Search</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition"
            data-testid="close-visual-search"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive 
                ? 'border-amber-500 bg-amber-50' 
                : 'border-stone-300 hover:border-stone-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {preview ? (
              <div className="space-y-4">
                <img 
                  src={preview} 
                  alt="Upload preview" 
                  className="max-h-48 mx-auto rounded-lg shadow"
                />
                {loading && (
                  <div className="flex items-center justify-center gap-2 text-amber-600">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Finding similar products...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto">
                  <ImageIcon className="text-stone-400" size={32} />
                </div>
                <div>
                  <p className="text-stone-700 font-medium mb-1">
                    Drop an image here
                  </p>
                  <p className="text-stone-500 text-sm">
                    or click to browse
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50 transition"
            data-testid="upload-image-btn"
          >
            <Upload size={18} />
            {loading ? 'Searching...' : 'Upload Image'}
          </button>

          {/* Error */}
          {error && (
            <p className="mt-4 text-red-600 text-sm text-center">{error}</p>
          )}

          {/* Tip */}
          <p className="mt-4 text-stone-500 text-xs text-center">
            Upload a photo of furniture you like and we'll find similar products
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisualSearch;
