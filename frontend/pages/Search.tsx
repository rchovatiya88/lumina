import React, { useState, useEffect, useCallback } from 'react';
import { Search, ExternalLink, Filter, X, Loader2, ImageIcon, Grid3X3, Store, DollarSign, Sparkles } from 'lucide-react';
import { trackAffiliateClick } from '../services/monetizationService';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number | null;
  url: string;
  store: string;
  category: string;
  style: string;
  image: string | null;
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
const STYLES = ['all', 'modern', 'boho', 'industrial', 'mid-century', 'scandinavian', 'farmhouse', 'glam', 'coastal'];
const PRICE_RANGES = [
  { label: 'All Prices', min: null, max: null },
  { label: 'Under $100', min: null, max: 100 },
  { label: '$100 - $300', min: 100, max: 300 },
  { label: '$300 - $500', min: 300, max: 500 },
  { label: '$500 - $1000', min: 500, max: 1000 },
  { label: 'Over $1000', min: 1000, max: null },
];

const backendUrl = import.meta.env.VITE_BACKEND_URL || 
  (typeof process !== 'undefined' && process.env?.REACT_APP_BACKEND_URL) || '';

const apiUrl = (path: string) => {
  if (!backendUrl) return path;
  return `${backendUrl.replace(/\/$/, '')}${path}`;
};

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'products' | 'images'>('products');
  
  // Filters
  const [category, setCategory] = useState('all');
  const [style, setStyle] = useState('all');
  const [priceRange, setPriceRange] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setSearchedQuery(searchQuery);
    setShowSuggestions(false);
    
    const params = new URLSearchParams({
      q: searchQuery,
      max_results: '20',
    });
    
    if (category !== 'all') params.append('category', category);
    if (style !== 'all') params.append('style', style);
    
    const range = PRICE_RANGES[priceRange];
    if (range.min !== null) params.append('min_price', String(range.min));
    if (range.max !== null) params.append('max_price', String(range.max));
    
    try {
      // Fetch products
      const productRes = await fetch(apiUrl(`/api/search/products?${params}`));
      const productData = await productRes.json();
      if (productData.ok) {
        setProducts(productData.products || []);
      }
      
      // Fetch images
      const imageRes = await fetch(apiUrl(`/api/search/images?q=${encodeURIComponent(searchQuery)}&max_results=12`));
      const imageData = await imageRes.json();
      if (imageData.ok) {
        setImages(imageData.images || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [category, style, priceRange]);

  const handleProductClick = async (product: Product) => {
    // Track the click
    try {
      await trackAffiliateClick({
        product_id: product.id,
        product_name: product.name,
        store: product.store,
        price: product.price || 0,
        destination_url: product.url,
      });
    } catch {
      // Tracking failed, still open the link
    }
    
    window.open(product.url, '_blank');
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

  const popularSearches = [
    'modern velvet sofa',
    'mid-century chair',
    'marble coffee table',
    'scandinavian bookshelf',
    'boho area rug',
    'industrial floor lamp',
  ];

  return (
    <div className="min-h-screen bg-stone-50" data-testid="search-page">
      {/* Hero Search Section */}
      <div className="bg-gradient-to-b from-stone-900 to-stone-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-amber-400" size={24} />
            <span className="text-amber-400 text-sm font-medium uppercase tracking-wider">Live Product Search</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif mb-4" data-testid="search-page-title">
            Find Your Perfect Piece
          </h1>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
            Search across Amazon, Wayfair, IKEA, West Elm, and more. Discover furniture from the entire web in one place.
          </p>
          
          {/* Search Input */}
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={22} />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search for furniture... e.g., 'velvet sofa under $800'"
                className="w-full pl-12 pr-32 py-4 bg-white text-stone-900 rounded-2xl text-lg focus:outline-none focus:ring-4 focus:ring-amber-400/30 shadow-xl"
                data-testid="search-input"
              />
              <button
                onClick={() => handleSearch(query)}
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-stone-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50 transition flex items-center gap-2"
                data-testid="search-button"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
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
                    className="w-full px-4 py-3 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-3 border-b border-stone-100 last:border-0"
                  >
                    <Search size={16} className="text-stone-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Popular Searches */}
          {!searchedQuery && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="text-stone-400 text-sm">Try:</span>
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    handleSearch(term);
                  }}
                  className="text-sm px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition"
                  data-testid={`popular-search-${term.replace(/\s+/g, '-')}`}
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {searchedQuery && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-serif text-stone-900">
                Results for "<span className="text-amber-700">{searchedQuery}</span>"
              </h2>
              <span className="text-stone-500 text-sm">
                {viewMode === 'products' ? products.length : images.length} items
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-stone-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('products')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    viewMode === 'products' ? 'bg-white shadow text-stone-900' : 'text-stone-600'
                  }`}
                  data-testid="view-products-btn"
                >
                  <Store size={16} className="inline mr-1" /> Products
                </button>
                <button
                  onClick={() => setViewMode('images')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    viewMode === 'images' ? 'bg-white shadow text-stone-900' : 'text-stone-600'
                  }`}
                  data-testid="view-images-btn"
                >
                  <ImageIcon size={16} className="inline mr-1" /> Images
                </button>
              </div>
              
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  showFilters ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                }`}
                data-testid="toggle-filters-btn"
              >
                <Filter size={18} />
                Filters
              </button>
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6 shadow-sm" data-testid="filters-panel">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      handleSearch(query);
                    }}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                  <label className="block text-sm font-medium text-stone-700 mb-2">Style</label>
                  <select
                    value={style}
                    onChange={(e) => {
                      setStyle(e.target.value);
                      handleSearch(query);
                    }}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                  <label className="block text-sm font-medium text-stone-700 mb-2">Price Range</label>
                  <select
                    value={priceRange}
                    onChange={(e) => {
                      setPriceRange(Number(e.target.value));
                      handleSearch(query);
                    }}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-stone-400" size={40} />
            </div>
          )}

          {/* Products Grid */}
          {!loading && viewMode === 'products' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleProductClick(product)}
                  data-testid={`product-card-${product.id}`}
                >
                  {/* Product Image Placeholder */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center relative overflow-hidden">
                    <div className="text-center p-4">
                      <Store className="text-stone-300 mx-auto mb-2" size={32} />
                      <span className="text-stone-400 text-sm">View on {product.store}</span>
                    </div>
                    
                    {/* Store Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-stone-700 shadow-sm">
                      {product.store}
                    </div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 bg-stone-900/80 text-white px-2 py-1 rounded-md text-xs uppercase">
                      {product.category}
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="font-medium text-stone-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition">
                      {product.name}
                    </h3>
                    
                    {product.description && (
                      <p className="text-stone-500 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {product.price ? (
                          <span className="text-lg font-bold text-stone-900">
                            ${product.price.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-sm text-stone-500">View price on site</span>
                        )}
                      </div>
                      
                      <span className="text-xs px-2 py-1 bg-stone-100 text-stone-600 rounded-full capitalize">
                        {product.style}
                      </span>
                    </div>
                    
                    <button className="w-full mt-4 flex items-center justify-center gap-2 bg-stone-900 text-white py-2.5 rounded-xl font-medium hover:bg-stone-800 transition">
                      View Product <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              {products.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <Search className="text-stone-300 mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-serif text-stone-900 mb-2">No products found</h3>
                  <p className="text-stone-500">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}

          {/* Images Grid */}
          {!loading && viewMode === 'images' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <a
                  key={image.id}
                  href={image.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square bg-stone-100 rounded-xl overflow-hidden hover:shadow-xl transition"
                  data-testid={`image-card-${image.id}`}
                >
                  <img
                    src={image.thumbnail || image.url}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiNhOGEyOWUiIGR5PSIuM2VtIiBzdHlsZT0iZm9udC1mYW1pbHk6c2Fucy1zZXJpZjtmb250LXNpemU6MTRweDt0ZXh0LWFuY2hvcjptaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-sm font-medium line-clamp-2">{image.title}</p>
                      <p className="text-white/70 text-xs mt-1">{image.source}</p>
                    </div>
                  </div>
                </a>
              ))}
              
              {images.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <ImageIcon className="text-stone-300 mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-serif text-stone-900 mb-2">No images found</h3>
                  <p className="text-stone-500">Try a different search term</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!searchedQuery && !loading && (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 border border-stone-200">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-amber-700" size={24} />
              </div>
              <h3 className="font-serif text-lg mb-2">Search Anything</h3>
              <p className="text-stone-500 text-sm">
                "blue velvet sofa", "mid-century chair under $500", "boho rug"
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-stone-200">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="text-amber-700" size={24} />
              </div>
              <h3 className="font-serif text-lg mb-2">Compare Stores</h3>
              <p className="text-stone-500 text-sm">
                See products from Amazon, Wayfair, IKEA, West Elm & more
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-stone-200">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-amber-700" size={24} />
              </div>
              <h3 className="font-serif text-lg mb-2">Best Prices</h3>
              <p className="text-stone-500 text-sm">
                Filter by budget and find the best deals across the web
              </p>
            </div>
          </div>
          
          <p className="text-stone-400 text-sm">
            Powered by live web search. Results update in real-time.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
