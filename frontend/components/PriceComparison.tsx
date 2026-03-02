import React, { useState, useEffect } from 'react';
import { X, ExternalLink, TrendingDown, Store, Loader2, Globe, Star, RefreshCw } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number | null;
  image?: string;
  store: string;
  buyUrl?: string;
  affiliateLink?: string;
  url?: string;
  source?: string;
}

interface StorePrice {
  store: string;
  price: number | null;
  product: Product;
  is_target: boolean;
  source: string;
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

const STORE_COLORS: Record<string, string> = {
  'Amazon': '#FF9900',
  'Wayfair': '#7B2D8E',
  'IKEA': '#0058A3',
  'Target': '#CC0000',
  'West Elm': '#2C2C2C',
  'CB2': '#1A1A1A',
  'Pottery Barn': '#6B4226',
  'Overstock': '#D32F2F',
  'Home Depot': '#F96302',
  "Lowe's": '#004990',
  'Etsy': '#F1641E',
  'AllModern': '#333333',
  'Article': '#1A1A1A',
  'World Market': '#006241',
  'Anthropologie': '#2C2C2C',
};

const PriceComparison: React.FC<PriceComparisonProps> = ({ productId, productName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComparison();
  }, [productId]);

  const fetchComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (productId) params.append('product_id', productId);
      if (productName) params.append('product_name', productName);

      const response = await fetch(`${backendUrl}/api/products/compare?${params}`);
      const data = await response.json();

      if (data.ok) {
        setComparison(data.comparison);
      } else {
        setError(data.error || 'Failed to load comparison');
      }
    } catch {
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

  const getStoreColor = (store: string) => STORE_COLORS[store] || '#6B7280';

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      data-testid="price-comparison-modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2">
            <TrendingDown className="text-emerald-600" size={22} />
            <h2 className="font-serif text-xl" data-testid="price-comparison-title">Price Comparison</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchComparison}
              className="p-2 hover:bg-stone-200 rounded-full transition text-stone-500"
              title="Refresh prices"
              data-testid="refresh-prices-btn"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-200 rounded-full transition"
              data-testid="close-price-comparison"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="animate-spin text-stone-400" size={32} />
              <p className="text-stone-500 text-sm" data-testid="price-comparison-loading">
                Searching stores for best prices...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-stone-500" data-testid="price-comparison-error">{error}</div>
          ) : comparison ? (
            <div className="space-y-5">
              {/* Product Info */}
              <div className="flex gap-4 items-start">
                {comparison.target_product.image && (
                  <img
                    src={comparison.target_product.image}
                    alt={comparison.target_product.name}
                    className="w-20 h-20 object-cover rounded-lg border border-stone-200"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-stone-900 line-clamp-2 text-sm" data-testid="compared-product-name">
                    {comparison.target_product.name}
                  </h3>
                  <p className="text-stone-500 text-xs mt-1">
                    {comparison.target_product.category} &middot; {comparison.target_product.style}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-400">
                    {comparison.curated_matches > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={10} /> {comparison.curated_matches} curated
                      </span>
                    )}
                    {comparison.web_matches > 0 && (
                      <span className="flex items-center gap-1">
                        <Globe size={10} /> {comparison.web_matches} live stores
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Savings Banner */}
              {comparison.price_range.potential_savings > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3" data-testid="savings-banner">
                  <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="text-emerald-600" size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-800 text-sm">
                      Save up to ${comparison.price_range.potential_savings.toLocaleString()}
                    </p>
                    <p className="text-emerald-600 text-xs">
                      Prices range from ${comparison.price_range.min?.toLocaleString()} to ${comparison.price_range.max?.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Store Prices */}
              {comparison.stores.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                    Prices Across Stores ({comparison.stores.length})
                  </h4>
                  <div className="space-y-1.5" data-testid="store-prices-list">
                    {comparison.stores.map((store: StorePrice, idx: number) => {
                      const isBest = idx === 0 && store.price;
                      return (
                        <div
                          key={`${store.store}-${idx}`}
                          className={`flex items-center justify-between p-3 rounded-lg border transition ${
                            isBest
                              ? 'border-emerald-300 bg-emerald-50'
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                          data-testid={`store-price-${store.store.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ backgroundColor: getStoreColor(store.store) }}
                            >
                              {store.store.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-sm">{store.store}</span>
                                {isBest && (
                                  <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-semibold">
                                    Best Price
                                  </span>
                                )}
                                {store.source === 'web' && (
                                  <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                                    Live
                                  </span>
                                )}
                                {store.is_target && (
                                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-400 truncate max-w-[200px]">
                                {store.product?.name?.substring(0, 50)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`font-bold text-sm ${isBest ? 'text-emerald-700' : 'text-stone-900'}`}>
                              {formatPrice(store.price)}
                            </span>
                            <a
                              href={getProductUrl(store.product)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 bg-stone-900 text-white rounded-lg hover:bg-stone-700 transition"
                              data-testid={`visit-store-${store.store.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No stores found */}
              {comparison.stores.length === 0 && (
                <div className="text-center py-8 text-stone-400" data-testid="no-stores-found">
                  <Globe size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No store listings found for this product.</p>
                  <p className="text-xs mt-1">Try searching with a more specific product name.</p>
                </div>
              )}

              {/* Similar Curated Products */}
              {comparison.similar_products && comparison.similar_products.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                    Similar Products
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {comparison.similar_products.slice(0, 4).map((product: Product) => (
                      <div
                        key={product.id}
                        className="border border-stone-200 rounded-lg p-2.5 hover:shadow-md transition cursor-pointer"
                        onClick={() => {
                          const url = getProductUrl(product);
                          if (url !== '#') window.open(url, '_blank');
                        }}
                      >
                        <p className="text-xs font-medium text-stone-900 line-clamp-2 mb-1">
                          {product.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 text-[10px]">{product.store}</span>
                          <span className="font-bold text-stone-900 text-xs">
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
