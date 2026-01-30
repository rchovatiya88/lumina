import React, { useState, useRef, useEffect } from 'react';
import { MOCK_PRODUCTS } from '../constants';
import { Product, RoomItem } from '../types';
import { 
    Plus, Move, Trash2, ShoppingCart, Info, RotateCw, X, Sparkles, 
    Loader2, ExternalLink, Image as ImageIcon, Upload, Layers, 
    ArrowUp, ArrowDown, Scaling, Search, Box, Grid3X3, Camera, Eye,
    Ruler, LayoutTemplate, PenTool
} from 'lucide-react';
import { generateRoomLayoutIdeas, analyzeRoomImage, generateRoomRender } from '../services/geminiService';
import ProductClipper from './ProductClipper';

const RoomBuilder: React.FC = () => {
  // Room Configuration State
  const [roomConfig, setRoomConfig] = useState<{width: number, depth: number} | null>(null);
  const [tempConfig, setTempConfig] = useState({width: 12, depth: 15});
  const [scale, setScale] = useState(1); // pixels per foot
  
    // Data State
    const [availableProducts, setAvailableProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [items, setItems] = useState<RoomItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
    const [showClipper, setShowClipper] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // AI & Vision State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{style: string, colors: string[]} | null>(null);
  const [showRenderModal, setShowRenderModal] = useState(false);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [background, setBackground] = useState<string | null>(null);
  
  // Interaction States
  const [activeOperation, setActiveOperation] = useState<{
      type: 'drag' | 'resize' | 'rotate';
      uid: string;
      startX: number;
      startY: number;
      initialX: number;
      initialY: number;
      initialWidth: number;
      initialRotation: number;
  } | null>(null);

  // Initialize Scale on Mount or Resize
  useEffect(() => {
    if (canvasRef.current && roomConfig) {
       const { clientWidth, clientHeight } = canvasRef.current;
       // Add padding (0.8) so the room doesn't touch edges
       const scaleX = (clientWidth * 0.8) / roomConfig.width;
       const scaleY = (clientHeight * 0.8) / roomConfig.depth;
       // Use the smaller scale to fit whole room
       setScale(Math.min(scaleX, scaleY)); 
    }
  }, [roomConfig, canvasRef.current]);

  const addItem = (product: Product) => {
    if (!roomConfig) return;

    // Convert real inches to feet, then to pixels based on current dynamic scale
    const realWidthFeet = (product.dimensions?.width || 24) / 12; 
    const initialPixelWidth = realWidthFeet * scale;

    // Center in room
    const roomPixelWidth = roomConfig.width * scale;
    const roomPixelDepth = roomConfig.depth * scale;

    const newItem: RoomItem = {
      ...product,
      uid: Math.random().toString(36).substr(2, 9),
      // Place in center of room
      x: (roomPixelWidth / 2) - (initialPixelWidth / 2), 
      y: (roomPixelDepth / 2) - (initialPixelWidth / 2),
      width: initialPixelWidth,
      height: initialPixelWidth,
      rotation: 0,
      zIndex: items.length + 1
    };
    setItems([...items, newItem]);
    setSelectedItemId(newItem.uid);
  };

  const removeItem = (uid: string) => {
    setItems(items.filter(i => i.uid !== uid));
    if (selectedItemId === uid) setSelectedItemId(null);
  };

    const handleClipperSave = (newProduct: Product) => {
        setAvailableProducts([newProduct, ...availableProducts]);
        setShowClipper(false);
        addItem(newProduct);
    };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
            const base64 = ev.target.result as string;
            setBackground(base64);
            setIsAnalyzing(true);
            const result = await analyzeRoomImage(base64);
            setAnalysisResult({ style: result.style, colors: result.colors });
            setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Pointer Events ---
  const handlePointerDown = (e: React.PointerEvent, uid: string, type: 'drag' | 'resize' | 'rotate') => {
      e.preventDefault();
      e.stopPropagation();
      const item = items.find(i => i.uid === uid);
      if (!item) return;
      setSelectedItemId(uid);
      (e.target as Element).setPointerCapture(e.pointerId);
      setActiveOperation({
          type,
          uid,
          startX: e.clientX,
          startY: e.clientY,
          initialX: item.x,
          initialY: item.y,
          initialWidth: item.width,
          initialRotation: item.rotation
      });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!activeOperation) return;
      e.preventDefault();
      e.stopPropagation();
      const { type, uid, startX, startY, initialX, initialY, initialWidth, initialRotation } = activeOperation;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      setItems(prev => prev.map(item => {
          if (item.uid !== uid) return item;
          if (type === 'drag') return { ...item, x: initialX + dx, y: initialY + dy };
          if (type === 'resize') return { ...item, width: Math.max(20, initialWidth + dx) };
          if (type === 'rotate') return { ...item, rotation: initialRotation + (dx * 0.5) };
          return item;
      }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      if (activeOperation) {
          e.preventDefault();
          (e.target as Element).releasePointerCapture(e.pointerId);
          setActiveOperation(null);
      }
  };

  const handleGenerateRender = async () => {
      setShowRenderModal(true);
      setRenderUrl(null);
      const itemNames = items.map(i => i.name);
      const style = analysisResult?.style || "Modern Luxury";
      const url = await generateRoomRender(itemNames, style, roomConfig || undefined);
      setRenderUrl(url);
  }

    const filteredProducts = availableProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.store.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
  });

  // --- Initial Setup View ---
  if (!roomConfig) {
      return (
          <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-stone-100 p-4">
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-stone-200">
                  <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-stone-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <LayoutTemplate size={32} />
                      </div>
                      <h2 className="font-serif text-2xl text-stone-900 mb-2">Create Your Space</h2>
                      <p className="text-stone-500">Define your room dimensions to get started with accurate scale.</p>
                  </div>
                  
                  <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-stone-700 mb-2">Width (Feet)</label>
                              <div className="relative">
                                  <input 
                                    type="number" 
                                    value={tempConfig.width} 
                                    onChange={(e) => setTempConfig({...tempConfig, width: Number(e.target.value)})}
                                    className="w-full pl-4 pr-10 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none"
                                  />
                                  <span className="absolute right-4 top-3.5 text-stone-400 text-sm">ft</span>
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-stone-700 mb-2">Depth (Feet)</label>
                              <div className="relative">
                                  <input 
                                    type="number" 
                                    value={tempConfig.depth} 
                                    onChange={(e) => setTempConfig({...tempConfig, depth: Number(e.target.value)})}
                                    className="w-full pl-4 pr-10 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none"
                                  />
                                  <span className="absolute right-4 top-3.5 text-stone-400 text-sm">ft</span>
                              </div>
                          </div>
                      </div>

                      <div className="bg-stone-50 p-4 rounded-lg flex items-start gap-3">
                          <Info className="text-stone-400 shrink-0 mt-0.5" size={18} />
                          <p className="text-xs text-stone-500 leading-relaxed">
                              Accurate dimensions help our AI generate realistic renders and ensure furniture actually fits your floor plan.
                          </p>
                      </div>

                      <button 
                        onClick={() => setRoomConfig(tempConfig)}
                        className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 transition shadow-lg"
                      >
                          Start Designing
                      </button>
                      
                      <button onClick={() => setRoomConfig({width: 15, depth: 20})} className="w-full text-stone-500 text-sm hover:text-stone-900">
                          Use Sample Room (15' x 20')
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-stone-100 select-none">
      {/* 1. Sidebar */}
          <div className={`bg-white border-r border-stone-200 flex flex-col transition-all duration-300 z-20 ${isSidebarOpen ? 'w-[400px]' : 'w-0'}`}>
              <div className="p-5 border-b border-stone-200 bg-white">
          <div className="flex justify-between items-center mb-4">
                      <h2 className="font-serif font-semibold text-xl text-stone-800">My Collection</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><X size={20}/></button>
          </div>

                  <button
                      onClick={() => setShowClipper(true)}
                      className="w-full bg-indigo-50 text-indigo-700 border border-indigo-100 py-3 rounded-xl font-medium hover:bg-indigo-100 transition flex items-center justify-center gap-2 mb-4 group"
                  >
                      <Camera size={18} className="group-hover:scale-110 transition" />
                      Scan New Item
                  </button>

          <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
              <input 
                type="text" 
                          placeholder="Search collection..." 
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['all', 'sofa', 'chair', 'table', 'lamp', 'rug'].map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${categoryFilter === cat ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200'}`}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
              ))}
          </div>
        </div>
              <div className="flex-1 overflow-y-auto p-4 bg-stone-50">
                  <div className="columns-2 gap-3 space-y-3 pb-20">
                      {filteredProducts.map(product => (
                <div key={product.id} className="break-inside-avoid group relative bg-white border border-stone-100 rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer" onClick={() => addItem(product)}>
                    <div className="relative">
                        <img src={product.image} alt={product.name} className="w-full h-auto object-cover" />
                        {product.store === 'Uploaded' && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                                <Sparkles size={8} /> AI
                            </div>
                        )}
                        {!product.store.includes('Uploaded') && (
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-bold text-stone-600 uppercase">{product.store}</div>
                        )}
                    </div>
                    <div className="p-3">
                        <p className="font-semibold text-sm text-stone-900 leading-tight mb-1">{product.name}</p>
                        {product.dimensions && (
                            <p className="text-[10px] text-stone-500">{product.dimensions.width}"w x {product.dimensions.depth}"d</p>
                        )}
                    </div>
                </div>
            ))}
                  </div>
        </div>
      </div>

      {/* 2. Main Canvas */}
      <div className="flex-1 relative flex flex-col h-full bg-stone-200">
        {!isSidebarOpen && (
             <button onClick={() => setIsSidebarOpen(true)} className="absolute top-20 left-4 z-10 bg-white p-3 rounded-full shadow-xl border border-stone-200 text-stone-900 hover:scale-110 transition"><Plus size={24} /></button>
        )}

        {/* Toolbar */}
        <div className="bg-white border-b border-stone-200 px-6 py-3 flex justify-between items-center shadow-sm z-20">
            <div className="flex items-center gap-4">
                 <div className="flex items-center bg-stone-100 rounded-lg p-1">
                     <button onClick={() => setViewMode('2d')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${viewMode === '2d' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}><Grid3X3 size={16} /> Blueprint</button>
                     <button onClick={() => setViewMode('3d')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${viewMode === '3d' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}><Box size={16} /> 3D View</button>
                 </div>
                 <div className="h-6 w-px bg-stone-200 mx-2"></div>
                 <div className="text-sm font-medium text-stone-900 flex items-center gap-2">
                    <Ruler size={16} className="text-stone-400" />
                    {roomConfig.width}' x {roomConfig.depth}' Room
                 </div>
            </div>
            <div className="flex items-center gap-3">
                 <button onClick={() => setRoomConfig(null)} className="text-xs text-stone-500 hover:text-stone-900 underline mr-2">Resize Room</button>
                 <button onClick={handleGenerateRender} disabled={items.length === 0} className="hidden md:flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-md disabled:opacity-50"><Sparkles size={16} /> Generate Render</button>
                      <a href="#checkout" className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition">Complete Design ({items.length})</a>
            </div>
        </div>

        {/* Drawing Area */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center perspective-container touch-none p-8">
            <div 
                ref={canvasRef}
                className="relative transition-transform duration-700 ease-out transform-style-3d shadow-2xl bg-white ring-1 ring-stone-300"
                style={{
                    width: roomConfig.width * scale,
                    height: roomConfig.depth * scale,
                    transform: viewMode === '3d' ? 'perspective(1500px) rotateX(30deg) scale(0.95)' : 'none',
                    backgroundImage: viewMode === '2d' 
                        // Blueprint Grid: 1 line every 1 foot
                        ? `linear-gradient(to right, #e7e5e4 1px, transparent 1px), linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)`
                        // 3D Floor
                        : background ? `url(${background})` : 'none',
                    backgroundSize: `${scale}px ${scale}px`,
                    backgroundColor: '#fff'
                }}
                onClick={() => setSelectedItemId(null)}
            >
                {/* Wall Labels (Outside the box) */}
                <div className="absolute -top-6 left-0 w-full text-center text-xs font-mono text-stone-400">{roomConfig.width} ft</div>
                <div className="absolute top-0 -left-6 h-full flex items-center text-xs font-mono text-stone-400 -rotate-90">{roomConfig.depth} ft</div>

                {items.map(item => (
                    <div
                        key={item.uid}
                        className={`absolute cursor-move select-none group ${item.uid === selectedItemId ? 'z-50' : ''}`}
                        style={{
                            left: item.x,
                            top: item.y,
                            width: item.width,
                            zIndex: item.zIndex,
                            transform: viewMode === '3d' ? `translateZ(${item.zIndex}px) rotate(${item.rotation}deg)` : `rotate(${item.rotation}deg)`,
                            touchAction: 'none'
                        }}
                        onPointerDown={(e) => handlePointerDown(e, item.uid, 'drag')}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                    >
                        <div className={`relative transition-all ${item.uid === selectedItemId ? 'ring-2 ring-indigo-500 ring-offset-4 ring-offset-transparent' : ''}`}>
                             <img src={item.image} alt={item.name} className="w-full h-auto drop-shadow-lg select-none pointer-events-none" draggable={false} />
                             
                             {/* Real World Dimensions Label */}
                             {item.uid === selectedItemId && (
                                 <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] px-2 py-1 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-50">
                                     <Ruler size={10} />
                                     {/* Calculate feet based on current pixel width vs scale */}
                                     {((item.width / scale)).toFixed(1)}' width
                                 </div>
                             )}

                             {/* Controls */}
                             {item.uid === selectedItemId && (
                                <>
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-lg flex items-center p-1 gap-1 border border-stone-100 z-50">
                                        <button className="p-1.5 hover:bg-stone-100 rounded text-stone-500" onClick={(e) => {e.stopPropagation(); removeItem(item.uid)}}><Trash2 size={14}/></button>
                                        <div className="w-px h-4 bg-stone-200"></div>
                                        <div className="p-1.5 hover:bg-stone-100 rounded text-stone-500 cursor-grab" onPointerDown={(e) => handlePointerDown(e, item.uid, 'rotate')}><RotateCw size={14}/></div>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white border border-stone-300 rounded-full shadow flex items-center justify-center cursor-nwse-resize z-50 hover:bg-stone-100" onPointerDown={(e) => handlePointerDown(e, item.uid, 'resize')}><Scaling size={12} className="text-stone-500" /></div>
                                </>
                             )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

          {/* Product Clipper Modal */}
          {showClipper && (
              <ProductClipper
                  onClose={() => setShowClipper(false)}
                  onSave={handleClipperSave}
              />
          )}

      {/* Render Modal */}
      {showRenderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-md p-4">
              <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row h-[70vh]">
                  <div className="md:w-2/3 bg-black flex items-center justify-center relative">
                      {renderUrl ? (
                          <img src={renderUrl} className="w-full h-full object-contain animate-in fade-in duration-1000" />
                      ) : (
                          <div className="text-center text-white/50">
                              <Sparkles size={48} className="mx-auto mb-4 animate-pulse text-indigo-400" />
                              <p className="font-serif text-xl text-white">Generating Photorealistic Render...</p>
                              <p className="text-sm mt-2">Incorporating {roomConfig.width}'x{roomConfig.depth}' spatial data...</p>
                          </div>
                      )}
                  </div>
                  <div className="md:w-1/3 p-8 flex flex-col justify-between bg-white">
                      <div>
                          <h3 className="font-serif text-2xl text-stone-900 mb-2">Your Dream Room</h3>
                          <p className="text-stone-500 text-sm leading-relaxed mb-6">
                              Our AI has visualized your design in 4K resolution using the {analysisResult?.style || 'Modern'} style palette.
                          </p>
                      </div>
                      <button onClick={() => setShowRenderModal(false)} className="w-full text-stone-500 hover:text-stone-900 py-2 text-sm">Back to Editor</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default RoomBuilder;