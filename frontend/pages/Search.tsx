import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, ExternalLink, Filter, Loader2, ImageIcon, Store, DollarSign, Sparkles, Star, Heart, ShoppingBag, Camera, TrendingDown, Grid3X3 } from 'lucide-react';
import { trackAffiliateClick } from '../services/monetizationService';
import VisualSearch from '../components/VisualSearch';
import PriceComparison from '../components/PriceComparison';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number | null;
  url?: string;
  buyUrl?: string;
  affiliateLink?: string;
  store: string;
  category: string;
  style: string;
  image?: string | null;
  source?: 'curated' | 'web';
}

interface ImageResult {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  source: string;
  source_url: string;
}

const CATEGORIES = ['all', 'sofa', 'chair', 'table', 'bed', 'lamp', 'rug', 'storage', 'decor'];
const STYLES = ['all', 'modern', 'boho', 'industrial', 'mid-century', 'mcm', 'scandi', 'japandi', 'glam', 'coastal'];
const PRICE_RANGES = [
  { label: 'All Prices', min: null, max: null },
  { label: 'Under $200', min: null, max: 200 },
  { label: '$200 - $500', min: 200, max: 500 },
  { label: '$500 - $1000', min: 500, max: 1000 },
  { label: '$1000 - $2000', min: 1000, max: 2000 },
  { label: 'Over $2000', min: 2000, max: null },
];

const backendUrl =
  (typeof process !== 'undefined' && process.env?.REACT_APP_BACKEND_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.REACT_APP_BACKEND_URL) ||
  '';

const apiUrl = (path: string) => {
  if (!backendUrl) return path;
  return `${backendUrl.replace(/\/$/, '')}${path}`;
};

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [curatedCount, setCuratedCount] = useState(0);
  const [webCount, setWebCount] = useState(0);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'products' | 'images'>('products');
  
  // Filters
  const [category, setCategory] = useState('all');
  const [style, setStyle] = useState('all');
  const [priceRange, setPriceRange] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Saved items
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  
  // Visual search & price comparison
  const [showVisualSearch, setShowVisualSearch] = useState(false);
  const [showPriceComparison, setShowPriceComparison] = useState<{productId: string; productName: string} | null>(null);

  // Load curated products on mount
  useEffect(() => {
    loadCuratedProducts();
  }, []);

  const loadCuratedProducts = async () => {
    setInitialLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      const res = await fetch(apiUrl(`/api/products/curated?${params}`));
      const data = await res.json();
      if (data.ok) {
        setProducts(data.products || []);
        setCuratedCount(data.total || 0);
        setWebCount(0);
      }
    } catch (error) {
      console.error('Error loading curated products:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  // Debounced suggestion fetching
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(apiUrl(`/api/search/suggestions?q=${encodeURIComponent(query)}`));
        const data = await res.json();
        if (data.ok) {
          setSuggestions(data.suggestions || []);
        }
      } catch {
        // Ignore suggestion errors
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setSearchedQuery(searchQuery);
    setShowSuggestions(false);
    
    const params = new URLSearchParams({
      q: searchQuery,
      max_results: '40',
    });
    
    if (category !== 'all') params.append('category', category);
    if (style !== 'all') params.append('style', style);
    
    const range = PRICE_RANGES[priceRange];
    if (range.min !== null) params.append('min_price', String(range.min));
    if (range.max !== null) params.append('max_price', String(range.max));
    
    try {
      // Use unified discover endpoint
      const productRes = await fetch(apiUrl(`/api/products/discover?${params}`));
      const productData = await productRes.json();
      if (productData.ok) {
        setProducts(productData.products || []);
        setCuratedCount(productData.curated_count || 0);
        setWebCount(productData.web_count || 0);
      }
      
      // Fetch images if we have a query
      if (searchQuery) {
        const imageRes = await fetch(apiUrl(`/api/search/images?q=${encodeURIComponent(searchQuery)}&max_results=12`));
        const imageData = await imageRes.json();
        if (imageData.ok) {
          setImages(imageData.images || []);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [category, style, priceRange]);

  // Re-search when filters change (if there's an active search)
  useEffect(() => {
    if (searchedQuery) {
      handleSearch(searchedQuery);
    }
  }, [category, style, priceRange]);

  const handleProductClick = async (product: Product) => {
    const destinationUrl = product.buyUrl || product.affiliateLink || product.url || '#';
    
    // Track the click
    try {
      await trackAffiliateClick({
        product_id: product.id,
        product_name: product.name,
        store: product.store,
        price: product.price || 0,
        destination_url: destinationUrl,
      });
    } catch {
      // Tracking failed, still open the link
    }
    
    if (destinationUrl && destinationUrl !== '#') {
      window.open(destinationUrl, '_blank');
    }
  };

  const toggleSaved = (productId: string) => {
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearSearch = () => {
    setQuery('');
    setSearchedQuery('');
    loadCuratedProducts();
  };

  const popularSearches = [
    'velvet sofa',
    'mid century chair',
    'marble table',
    'rattan lamp',
    'boho rug',
    'japandi decor',
  ];

  const getProductUrl = (product: Product) => {
    return product.buyUrl || product.affiliateLink || product.url || '#';
  };

  return (
    <div className="min-h-screen bg-stone-50" data-testid="search-page">
      {/* Hero Search Section */}
      <div className="bg-gradient-to-b from-stone-900 to-stone-800 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShoppingBag className="text-amber-400" size={22} />
            <span className="text-amber-400 text-sm font-medium uppercase tracking-wider">Product Discovery</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif mb-3" data-testid="search-page-title">
            Discover Your Perfect Piece
          </h1>
          <p className="text-stone-300 text-base mb-6 max-w-xl mx-auto">
            {curatedCount > 0 ? `${curatedCount}+ curated products` : 'Curated picks'} + live search across Amazon, Wayfair, IKEA & more
          </p>
          
          {/* Search Input */}
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search... e.g., 'velvet sofa' or 'boho lamp'"
                className="w-full pl-11 pr-28 py-3.5 bg-white text-stone-900 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-amber-400/30 shadow-lg"
                data-testid="search-input"
              />
              <button
                onClick={() => handleSearch(query)}
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-stone-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-stone-800 disabled:opacity-50 transition flex items-center gap-2 text-sm"
                data-testid="search-button"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                Search
              </button>
            </div>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden z-50">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full px-4 py-2.5 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-3 border-b border-stone-100 last:border-0 text-sm"
                  >
                    <Search size={14} className="text-stone-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Popular Searches */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="text-stone-400 text-xs">Popular:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setQuery(term);
                  handleSearch(term);
                }}
                className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition"
                data-testid={`popular-search-${term.replace(/\s+/g, '-')}`}
              >
                {term}
              </button>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setShowVisualSearch(true)}
              className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-full font-medium hover:bg-amber-600 transition text-sm"
              data-testid="visual-search-btn"
            >
              <Camera size={18} />
              Search by Image
            </button>
            <Link
              to="/moodboard"
              className="flex items-center gap-2 bg-white/10 border border-white/30 text-white px-5 py-2.5 rounded-full font-medium hover:bg-white/20 transition text-sm"
              data-testid="moodboard-link"
            >
              <Grid3X3 size={18} />
              Mood Board
            </Link>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            {searchedQuery ? (
              <>
                <h2 className="text-lg font-serif text-stone-900">
                  Results for "<span className="text-amber-700">{searchedQuery}</span>"
                </h2>
                <button onClick={clearSearch} className="text-xs text-stone-500 hover:text-stone-700 underline">
                  Clear
                </button>
              </>
            ) : (
              <h2 className="text-lg font-serif text-stone-900">
                Browse Curated Collection
              </h2>
            )}
            <div className="flex items-center gap-2 text-xs text-stone-500">
              {curatedCount > 0 && (
                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star size={10} fill="currentColor" /> {curatedCount} curated
                </span>
              )}
              {webCount > 0 && (
                <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                  +{webCount} from web
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-stone-200 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('products')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  viewMode === 'products' ? 'bg-white shadow text-stone-900' : 'text-stone-600'
                }`}
                data-testid="view-products-btn"
              >
                <Store size={14} className="inline mr-1" /> Products
              </button>
              <button
                onClick={() => setViewMode('images')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  viewMode === 'images' ? 'bg-white shadow text-stone-900' : 'text-stone-600'
                }`}
                data-testid="view-images-btn"
              >
                <ImageIcon size={14} className="inline mr-1" /> Images
              </button>
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition ${
                showFilters ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
              }`}
              data-testid="toggle-filters-btn"
            >
              <Filter size={14} />
              Filters
            </button>
          </div>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-stone-200 p-4 mb-5 shadow-sm" data-testid="filters-panel">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  data-testid="category-filter"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Style Filter */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  data-testid="style-filter"
                >
                  {STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Price Filter */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">Price Range</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  data-testid="price-filter"
                >
                  {PRICE_RANGES.map((range, idx) => (
                    <option key={idx} value={idx}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {(loading || initialLoading) && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-stone-400" size={36} />
          </div>
        )}

        {/* Products Grid */}
        {!loading && !initialLoading && viewMode === 'products' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
                data-testid={`product-card-${product.id}`}
              >
                {/* Product Image */}
                <div 
                  className="aspect-square bg-stone-100 relative overflow-hidden cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  {product.image ? (
                    <img
                      src={product.image.startsWith('http') ? product.image : `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=300&h=300`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=300&h=300';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-50">
                      <Store className="text-stone-300" size={32} />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.source === 'curated' && (
                      <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                        <Star size={8} fill="currentColor" /> Curated
                      </span>
                    )}
                    {product.source === 'web' && (
                      <span className="bg-stone-700 text-white px-2 py-0.5 rounded text-[10px] font-medium">
                        Web
                      </span>
                    )}
                  </div>
                  
                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaved(product.id);
                    }}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition ${
                      savedItems.has(product.id) 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 text-stone-600 hover:bg-white'
                    }`}
                  >
                    <Heart size={14} fill={savedItems.has(product.id) ? "currentColor" : "none"} />
                  </button>
                  
                  {/* Store Badge */}
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-stone-700">
                    {product.store}
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-3">
                  <h3 
                    className="font-medium text-stone-900 text-sm line-clamp-2 mb-1 cursor-pointer hover:text-amber-700 transition"
                    onClick={() => handleProductClick(product)}
                  >
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    {product.price && product.price > 0 ? (
                      <span className="text-base font-bold text-stone-900">
                        ${product.price.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-xs text-stone-500">View price</span>
                    )}
                    
                    <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded capitalize">
                      {product.category}
                    </span>
                  </div>
                  
                  {getProductUrl(product) !== '#' && (
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => handleProductClick(product)}
                        className="flex-1 flex items-center justify-center gap-1 bg-stone-900 text-white py-2 rounded-lg text-xs font-medium hover:bg-stone-800 transition"
                      >
                        View <ExternalLink size={12} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPriceComparison({ productId: product.id, productName: product.name });
                        }}
                        className="p-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition"
                        title="Compare prices"
                        data-testid={`compare-price-${product.id}`}
                      >
                        <TrendingDown size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {products.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Search className="text-stone-300 mx-auto mb-3" size={40} />
                <h3 className="text-lg font-serif text-stone-900 mb-1">No products found</h3>
                <p className="text-stone-500 text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}

        {/* Images Grid */}
        {!loading && !initialLoading && viewMode === 'images' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image) => (
              <a
                key={image.id}
                href={image.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square bg-stone-100 rounded-lg overflow-hidden hover:shadow-lg transition"
                data-testid={`image-card-${image.id}`}
              >
                <img
                  src={image.thumbnail || image.url}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiNhOGEyOWUiIGR5PSIuM2VtIiBzdHlsZT0iZm9udC1mYW1pbHk6c2Fucy1zZXJpZjtmb250LXNpemU6MTRweDt0ZXh0LWFuY2hvcjptaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-xs font-medium line-clamp-2">{image.title}</p>
                  </div>
                </div>
              </a>
            ))}
            
            {images.length === 0 && (
              <div className="col-span-full text-center py-12">
                <ImageIcon className="text-stone-300 mx-auto mb-3" size={40} />
                <h3 className="text-lg font-serif text-stone-900 mb-1">No images yet</h3>
                <p className="text-stone-500 text-sm">Search for something to see images</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Visual Search Modal */}
      {showVisualSearch && (
        <VisualSearch 
          onResults={(products) => {
            setProducts(products);
            setCuratedCount(products.length);
            setWebCount(0);
            setSearchedQuery('Visual Search Results');
            setShowVisualSearch(false);
          }}
          onClose={() => setShowVisualSearch(false)}
        />
      )}
      
      {/* Price Comparison Modal */}
      {showPriceComparison && (
        <PriceComparison
          productId={showPriceComparison.productId}
          productName={showPriceComparison.productName}
          onClose={() => setShowPriceComparison(null)}
        />
      )}
    </div>
  );
};

export default SearchPage;
