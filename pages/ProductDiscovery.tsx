import React, { useState } from 'react';
import { Search, Heart, MessageCircle, ExternalLink, Plus, Filter, LayoutGrid, ArrowUpDown, X, Check, Eye } from 'lucide-react';
import { MOCK_PRODUCTS } from '../constants';
import SCRAPED_ITEMS from '../src/data/imported_products.json';
import { Product } from '../types';

// Quick View Modal Component
const ProductModal = ({ product, isOpen, onClose, onLike, isLiked }: { product: Product | null, isOpen: boolean, onClose: () => void, onLike: (id: string) => void, isLiked: boolean }) => {
    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative z-10 animate-in fade-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition z-20">
                    <X size={20} className="text-stone-500" />
                </button>

                {/* Left: Image */}
                <div className="w-full md:w-1/2 bg-stone-50 p-8 flex items-center justify-center relative">
                    <img 
                        src={product.image} 
                        alt={product.name}
                        className="max-w-full max-h-full object-contain mix-blend-multiply"
                    />
                    <div className="absolute bottom-4 left-4">
                        <span className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-stone-600 border border-stone-200">
                            {product.category}
                        </span>
                    </div>
                </div>

                {/* Right: Details */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-white flex flex-col">
                    <div className="mb-auto">
                        <div className="flex items-center gap-2 mb-2 text-stone-500 text-sm font-medium">
                            <span className="uppercase tracking-wider">{product.store}</span>
                            {product.style && <span className="w-1 h-1 bg-stone-300 rounded-full" />}
                            {product.style && <span className="capitalize">{product.style}</span>}
                        </div>
                        
                        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2 leading-tight">
                            {product.name}
                        </h2>
                        
                        {product.price > 0 && (
                            <div className="text-2xl font-medium text-stone-900 mb-6">
                                ${product.price.toLocaleString()}
                            </div>
                        )}

                        <p className="text-stone-600 leading-relaxed mb-6">
                            {product.description || "No description available for this item. A perfect addition to your curated sanctuary."}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                                <span className="block text-xs font-bold text-stone-400 uppercase mb-1">Dimensions</span>
                                <span className="font-medium text-stone-800">
                                    {product.dimensions ? `${product.dimensions.width}"W x ${product.dimensions.depth}"D x ${product.dimensions.height}"H` : 'N/A'}
                                </span>
                            </div>
                            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                                <span className="block text-xs font-bold text-stone-400 uppercase mb-1">Material</span>
                                <span className="font-medium text-stone-800">Premium Finish</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4 pt-6 border-t border-stone-100">
                        <button 
                            onClick={() => onLike(product.id)}
                            className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border ${
                                isLiked 
                                ? 'bg-red-50 text-red-600 border-red-100' 
                                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                            }`}
                        >
                            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                            {isLiked ? 'Saved' : 'Save Item'}
                        </button>
                        
                        {product.buyUrl ? (
                            <a 
                                href={product.buyUrl}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-[2] bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition shadow-lg shadow-stone-200"
                            >
                                Visit Store <ExternalLink size={18} />
                            </a>
                        ) : (
                            <button className="flex-[2] bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition shadow-lg shadow-stone-200">
                                Add to Project
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductDiscovery: React.FC = () => {
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortOption, setSortOption] = useState<'relevance' | 'price-asc' | 'price-desc'>('relevance');
    const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [styleFilter, setStyleFilter] = useState('all');

    // Combine Data
    const allProducts = [...MOCK_PRODUCTS, ...SCRAPED_ITEMS as Product[]];

    // Filter Logic
    const filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              product.store.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const matchesStyle = styleFilter === 'all' || (product.style && product.style.toLowerCase() === styleFilter);
        return matchesSearch && matchesCategory && matchesStyle;
    });

    // Sort Logic
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        return 0; // relevance (default order)
    });

    const toggleLike = (id: string) => {
        const newLiked = new Set(likedItems);
        if (newLiked.has(id)) newLiked.delete(id);
        else newLiked.add(id);
        setLikedItems(newLiked);
    };

    const categories = ['all', 'sofa', 'chair', 'table', 'lamp', 'rug', 'decor'];
    const styles = ['all', 'japandi', 'industrial', 'boho', 'modern', 'mcm', 'scandi'];

    return (
        <div className="min-h-screen bg-stone-50 pb-20 font-sans">
            {/* Modal */}
            <ProductModal 
                product={selectedProduct} 
                isOpen={!!selectedProduct} 
                onClose={() => setSelectedProduct(null)}
                onLike={toggleLike}
                isLiked={selectedProduct ? likedItems.has(selectedProduct.id) : false}
            />

            {/* Hero Section */}
            <div className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm/50 backdrop-blur-xl bg-white/90 supports-[backdrop-filter]:bg-white/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">Design Studio</h1>
                            <p className="text-stone-500 mt-1 font-medium">Curate your sanctuary with discovered treasures.</p>
                        </div>
                        <div className="flex gap-3">
                             <div className="bg-stone-100 rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium text-stone-600">
                                <Heart size={16} className="text-red-500 fill-current" />
                                <span>{likedItems.size} Saved</span>
                             </div>
                            <button className="bg-stone-900 text-white px-5 py-2.5 rounded-full font-bold hover:bg-stone-800 transition flex items-center gap-2 text-sm shadow-lg shadow-stone-200 active:scale-95">
                                <Plus size={18} /> New Moodboard
                            </button>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3.5 top-3 text-stone-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search furniture, lighting, decor..." 
                                className="w-full pl-11 pr-4 py-3 bg-stone-100 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900 transition-all text-sm outline-none font-medium placeholder:font-normal"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-1 md:pb-0 scrollbar-hide items-center">
                            {/* Categories */}
                            <div className="flex gap-2 bg-stone-100 p-1 rounded-xl">
                                {categories.map(cat => (
                                    <button 
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                                            categoryFilter === cat 
                                            ? 'bg-white text-stone-900 shadow-sm' 
                                            : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
                                        }`}
                                    >
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="h-8 w-px bg-stone-200 mx-2 hidden md:block"></div>

                            {/* Sort */}
                            <div className="relative">
                                <select 
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value as any)}
                                    className="appearance-none bg-white border border-stone-200 text-stone-700 py-3 pl-4 pr-10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-stone-900 cursor-pointer hover:border-stone-300 transition"
                                >
                                    <option value="relevance">Relevance</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                </select>
                                <ArrowUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Collections / Styles Filter */}
                    <div className="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                         {styles.map(style => (
                             <button
                                key={style}
                                onClick={() => setStyleFilter(style)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-all ${
                                    styleFilter === style 
                                    ? 'bg-stone-800 text-white border-stone-800'
                                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                                }`}
                             >
                                 {style}
                             </button>
                         ))}
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedProducts.map(product => (
                        <div key={product.id} className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-2xl hover:border-stone-200 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                            {/* Image Area */}
                            <div 
                                className="aspect-[4/3] bg-stone-50 relative p-6 flex items-center justify-center overflow-hidden cursor-pointer"
                                onClick={() => setSelectedProduct(product)}
                            >
                                <img 
                                    src={product.image} 
                                    alt={product.name}
                                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400?text=Image+Unavailable'; }}
                                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                                />
                                
                                {/* Overlay Actions */}
                                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleLike(product.id); }}
                                        className={`p-2.5 rounded-full shadow-md hover:scale-110 transition ${likedItems.has(product.id) ? "bg-red-50 text-red-500" : "bg-white text-stone-400 hover:text-stone-900"}`}
                                    >
                                        <Heart size={18} fill={likedItems.has(product.id) ? "currentColor" : "none"} />
                                    </button>
                                    <button 
                                        className="p-2.5 bg-white rounded-full shadow-md hover:scale-110 transition text-stone-400 hover:text-indigo-600"
                                        onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                                    >
                                        <Eye size={18} />
                                    </button>
                                </div>

                                <div className="absolute top-3 left-3">
                                    <span className="bg-white/90 backdrop-blur text-stone-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide border border-stone-100 shadow-sm">
                                        {product.store}
                                    </span>
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="flex justify-between items-start gap-3 mb-2">
                                    <h3 
                                        className="font-bold text-stone-900 text-sm line-clamp-2 leading-snug cursor-pointer hover:text-indigo-600 transition"
                                        onClick={() => setSelectedProduct(product)}
                                    >
                                        {product.name}
                                    </h3>
                                    {product.price > 0 && (
                                        <span className="font-serif font-bold text-stone-900 shrink-0 bg-stone-50 px-2 py-1 rounded-md text-xs border border-stone-100">
                                            ${product.price}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-stone-50">
                                    <div className="flex gap-3 text-stone-400">
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-50 px-2 py-1 rounded-full">{product.category}</span>
                                    </div>
                                    
                                    {product.buyUrl && (
                                        <a 
                                            href={product.buyUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group/link"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Visit Store <ExternalLink size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {sortedProducts.length === 0 && (
                    <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-stone-200">
                        <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="text-stone-300" size={32} />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">No treasures found</h3>
                        <p className="text-stone-500 max-w-sm mx-auto">We couldn't find any matches for your search. Try adjusting your filters.</p>
                        <button 
                            onClick={() => {setSearchQuery(''); setCategoryFilter('all');}}
                            className="mt-8 bg-stone-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-stone-800 transition"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
                {/* Tray */}
                {likedItems.size > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 shadow-2xl z-40 animate-in slide-in-from-bottom-10">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h4 className="font-serif font-bold text-stone-900">Your Collection</h4>
                                <div className="h-8 w-px bg-stone-200"></div>
                                <div className="flex -space-x-3">
                                    {Array.from(likedItems).slice(0, 5).map(id => {
                                        const p = allProducts.find(x => x.id === id);
                                        if (!p) return null;
                                        return (
                                            <div key={id} className="w-10 h-10 rounded-full border-2 border-white bg-stone-100 overflow-hidden relative">
                                                <img src={p.image} className="w-full h-full object-cover" />
                                            </div>
                                        );
                                    })}
                                    {likedItems.size > 5 && (
                                        <div className="w-10 h-10 rounded-full border-2 border-white bg-stone-900 text-white flex items-center justify-center text-xs font-bold">
                                            +{likedItems.size - 5}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="text-sm font-medium text-stone-500 hover:text-stone-900" onClick={() => setLikedItems(new Set())}>Clear</button>
                                <button className="bg-stone-900 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-stone-800 transition">
                                    Create Moodboard
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDiscovery;