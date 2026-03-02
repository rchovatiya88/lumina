import React, { useState, useEffect } from 'react';
import { X, ExternalLink, TrendingDown, Store, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number | null;
  image?: string;
  store: string;
  buyUrl?: string;
  affiliateLink?: string;
  url?: string;
}

interface StorePrice {
  store: string;
  price: number | null;
  product: Product;
  is_target: boolean;
}

interface PriceComparisonProps {
  productId: string;
  productName: string;
  onClose: () => void;
}

const backendUrl =
  (typeof process !== 'undefined' && process.env?.REACT_APP_BACKEND_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.REACT_APP_BACKEND_URL) ||
  '';

const PriceComparison: React.FC<PriceComparisonProps> = ({ productId, productName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComparison();
  }, [productId]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/products/compare?product_id=${productId}`);
      const data = await response.json();
      
      if (data.ok) {
        setComparison(data.comparison);
      } else {
        setError(data.error || 'Failed to load comparison');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getProductUrl = (product: Product) => {
    return product.buyUrl || product.affiliateLink || product.url || '#';
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'Check price';
    return `$${price.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="price-comparison-modal">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <TrendingDown className="text-green-600" size={22} />
            <h2 className="font-serif text-xl">Price Comparison</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition"
            data-testid="close-price-comparison"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-stone-400" size={32} />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-stone-500">{error}</div>
          ) : comparison ? (
            <div className="space-y-6">
              {/* Product Info */}
              <div className="flex gap-4 items-start">
                {comparison.target_product.image && (
                  <img 
                    src={comparison.target_product.image}
                    alt={comparison.target_product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="font-medium text-stone-900 line-clamp-2">
                    {comparison.target_product.name}
                  </h3>
                  <p className="text-stone-500 text-sm mt-1">
                    {comparison.target_product.category} • {comparison.target_product.style}
                  </p>
                </div>
              </div>

              {/* Savings Banner */}
              {comparison.price_range.potential_savings > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">
                      Save up to ${comparison.price_range.potential_savings}
                    </p>
                    <p className="text-green-600 text-sm">
                      Prices range from ${comparison.price_range.min} to ${comparison.price_range.max}
                    </p>
                  </div>
                </div>
              )}

              {/* Store Prices */}
              <div>
                <h4 className="text-sm font-medium text-stone-700 mb-3">Compare Prices</h4>
                <div className="space-y-2">
                  {comparison.stores
                    .sort((a: StorePrice, b: StorePrice) => (a.price || 999999) - (b.price || 999999))
                    .map((store: StorePrice, idx: number) => (
                    <div 
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        idx === 0 && store.price ? 'border-green-300 bg-green-50' : 'border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Store size={18} className="text-stone-400" />
                        <span className="font-medium">{store.store}</span>
                        {idx === 0 && store.price && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                            Best Price
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${idx === 0 ? 'text-green-700' : 'text-stone-900'}`}>
                          {formatPrice(store.price)}
                        </span>
                        <a
                          href={getProductUrl(store.product)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Similar Products */}
              {comparison.similar_products.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-stone-700 mb-3">Similar Products</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {comparison.similar_products.slice(0, 4).map((product: Product) => (
                      <div 
                        key={product.id}
                        className="border border-stone-200 rounded-lg p-3 hover:shadow-md transition"
                      >
                        <p className="text-sm font-medium text-stone-900 line-clamp-2 mb-1">
                          {product.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 text-xs">{product.store}</span>
                          <span className="font-bold text-stone-900">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PriceComparison;
