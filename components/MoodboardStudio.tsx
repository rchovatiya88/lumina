import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {OrbitControls, Grid, Plane, Text, Html, useTexture, PointerLockControls, TransformControls} from '@react-three/drei';
import * as THREE from 'three';
import { MOCK_PRODUCTS } from '../constants';
import { Product, RoomItem } from '../types';
import { 
    Plus, Trash2, Search, X, Sparkles, Camera, 
    ArrowUp, ArrowDown, RotateCw, Image as ImageIcon, Download, Share2, Box,
    PersonStanding, MousePointer2, Move
} from 'lucide-react';
import { generateRoomRender, analyzeRoomImage } from '../services/geminiService';
import ProductClipper from './ProductClipper';
import { ApartmentComplex } from './ApartmentArchitecture';

// --- 3D Components ---

const BillboardItem = ({ 
    item, 
    isSelected, 
    onSelect, 
    isLocked
}: { 
    item: RoomItem, 
    isSelected: boolean, 
        onSelect: () => void,
    isLocked: boolean
}) => {
    const texture = useTexture(item.image);
    const planeRef = useRef<THREE.Mesh>(null);
    const { camera } = useThree();
    
    // Scale factor: assume 1 unit = 1 meter approx. 
    const width = item.width / 100; 
    const height = (item.height / 100) || width; 

    const isRug = item.category?.toLowerCase().includes('rug') || item.name.toLowerCase().includes('rug');

    // Billboard effect (Only for Non-Rugs)
    useThree(({ camera }) => {
        if (planeRef.current && !isRug) {
            // Standard vertical billboard
            planeRef.current.lookAt(camera.position.x, planeRef.current.position.y, camera.position.z);
        }
    });

    // Rugs lie flat
    const finalRotation = isRug ? new THREE.Euler(-Math.PI / 2, 0, item.rotation * (Math.PI/180)) : new THREE.Euler(0, 0, 0);
    const geometryPosition = !isRug ? [0, height / 2, 0] : [0, 0, 0];
    
    return (
        <group>
            <mesh 
                ref={planeRef}
                rotation={isRug ? finalRotation : [0,0,0]}
                onClick={(e) => { 
                    if (isLocked) return;
                    e.stopPropagation(); 
                    onSelect(); 
                }}
                position={geometryPosition as [number, number, number]} 
            >
                <planeGeometry args={[width, height]} />
                <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} toneMapped={false} />
            </mesh>
            
            {/* Selection Text/Label */}
            {isSelected && (
                <Html position={[0, height + 0.2, 0]} center>
                    <div className="bg-stone-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-80 backdrop-blur-sm pointer-events-none">
                        {item.name}
                    </div>
                </Html>
            )}
        </group>
    );
};

// --- Main App Component ---

const MoodboardStudio: React.FC = () => {
    // Mode State
    const [mode, setMode] = useState<'design' | 'walk' | 'decor'>('design');
    
    // Apartment Style State
    const [aptStyles, setAptStyles] = useState({
        living: { floor: '#d4b483', wall: '#e5e5e5' },
        master: { floor: '#a8a29e', wall: '#e5e5e5' }
    });


  // Data State
  const [availableProducts, setAvailableProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [items, setItems] = useState<RoomItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop
  const [showClipper, setShowClipper] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // AI State
  const [showRenderModal, setShowRenderModal] = useState(false);

    // Responsive Sidebar Logic
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setIsSidebarOpen(false);
            else setIsSidebarOpen(true);
        };
        handleResize(); // Init
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const addItem = (product: Product) => {
    const newItem: RoomItem = {
      ...product,
      uid: Math.random().toString(36).substr(2, 9),
      x: (Math.random() - 0.5) * 2, 
      y: (Math.random() - 0.5) * 2,
      width: 150, 
      height: 150,
      rotation: 0,
      zIndex: 0
    };
    setItems([...items, newItem]);
    setSelectedItemId(newItem.uid);
      // On mobile, close sidebar after adding to see the item
      if (window.innerWidth < 768) setIsSidebarOpen(false);
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

  const updateItem = (uid: string, updates: Partial<RoomItem>) => {
      setItems(items.map(i => i.uid === uid ? { ...i, ...updates } : i));
  };
  
  const handleItemSelect = (uid: string) => {
      if (mode === 'walk') return;
      setSelectedItemId(uid);
  };

  const filteredProducts = availableProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.store.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
  });
  
  const handleSceneClick = () => {
     if (mode === 'walk') return;
      setSelectedItemId(null);
  };

  return (
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-stone-50 select-none font-sans relative">
          {/* 1. Sidebar - Responsive Overlay on Mobile */}
          <div
              className={`bg-white border-r border-stone-200 flex flex-col transition-all duration-300 z-40 
            ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:translate-x-0'}
            absolute md:relative h-full shadow-2xl md:shadow-none
        `}
          >
        <div className="p-4 border-b border-stone-200 bg-white">
          <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif font-semibold text-lg text-stone-900">3D Assets</h2>
                      <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-stone-100 rounded-md"><X size={20} /></button>
          </div>
          
          <button 
            onClick={() => setShowClipper(true)}
                      className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 transition flex items-center justify-center gap-2 mb-4 shadow-sm active:scale-95"
          >
                      <Camera size={18} /> 
            Add New Item
          </button>

          <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
              <input 
                type="text" 
                placeholder="Search assets..." 
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['all', 'sofa', 'chair', 'table', 'lamp', 'rug'].map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${categoryFilter === cat ? 'bg-stone-900 text-white border-stone-900' : 'text-stone-500 border-stone-200 hover:bg-stone-50'}`}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
              ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 bg-stone-50/50 pb-20">
           {filteredProducts.map(product => (
               <div key={product.id} className="group relative bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-stone-400 transition cursor-pointer shadow-sm active:scale-95" onClick={() => addItem(product)}>
               <div className="aspect-square bg-white relative p-2 flex items-center justify-center">
                 <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
                 {product.store === 'Uploaded' && (
                     <div className="absolute top-1 right-1 bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1">
                         AI
                     </div>
                 )}
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* 2. Main 3D Viewport */}
      <div className="flex-1 relative flex flex-col h-full bg-stone-100 overflow-hidden">
        {!isSidebarOpen && (
                  <button onClick={() => setIsSidebarOpen(true)} className="absolute top-24 left-4 z-20 bg-white p-3 rounded-full shadow-lg border border-stone-200 text-stone-900 hover:scale-105 transition"><Plus size={24} /></button>
        )}

              {/* Toolbar - Mobile Optimized */}
              <div className="bg-white/90 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex justify-between items-center shadow-sm z-20 h-16 sticky top-0">
                  <div className="flex items-center gap-2 md:gap-4">
                      <h1 className="font-serif text-lg text-stone-900 hidden md:block">3D Studio</h1>
                 
                 {/* Mode Toggle */}
                      <div className="flex bg-stone-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setMode('design')}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${mode === 'design' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}
                    >
                              <MousePointer2 size={18} /> <span className="hidden sm:inline">Design</span>
                    </button>
                    <button 
                        onClick={() => setMode('decor')}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${mode === 'decor' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}
                    >
                              <Sparkles size={18} /> <span className="hidden sm:inline">Decor</span>
                    </button>
                    <button 
                        onClick={() => setMode('walk')}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${mode === 'walk' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}
                    >
                              <PersonStanding size={18} /> <span className="hidden sm:inline">Walk</span>
                    </button>
                      </div>
            </div>

            <div className="flex items-center gap-3">
                      <button onClick={() => setShowRenderModal(true)} disabled={items.length === 0} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50">
                          <Sparkles size={18} />
                          <span className="hidden sm:inline">Visualize</span>
                 </button>
            </div>
        </div>
        
              {/* Decor Panel */}
        {mode === 'decor' && (
            <div className="absolute top-20 right-4 z-30 bg-white p-4 rounded-xl shadow-xl border border-stone-200 w-64 animate-in slide-in-from-right-4">
                <h3 className="font-serif font-bold text-stone-900 mb-4">Room Styler</h3>
                      {/* ... existing decor controls ... */}
                <div className="mb-4">
                    <label className="text-xs font-bold text-stone-400 uppercase mb-2 block">Living Room Floor</label>
                    <div className="flex gap-2">
                         {['#d4b483', '#a8a29e', '#f5f5f5', '#292524'].map(c => (
                             <button 
                                key={c} 
                                onClick={() => setAptStyles({...aptStyles, living: {...aptStyles.living, floor: c}})}
                                 className={`w-10 h-10 rounded-full border-2 ${aptStyles.living.floor === c ? 'border-indigo-600' : 'border-transparent'}`}
                                style={{backgroundColor: c}}
                             />
                         ))}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-xs font-bold text-stone-400 uppercase mb-2 block">Living Room Walls</label>
                    <div className="flex gap-2">
                         {['#e5e5e5', '#fef3c7', '#dcfce7', '#dbeafe'].map(c => (
                             <button 
                                key={c} 
                                onClick={() => setAptStyles({...aptStyles, living: {...aptStyles.living, wall: c}})}
                                 className={`w-10 h-10 rounded-full border-2 ${aptStyles.living.wall === c ? 'border-indigo-600' : 'border-transparent'}`}
                                style={{backgroundColor: c}}
                             />
                         ))}
                    </div>
                </div>
            </div>
        )}

        {/* 3D Canvas */}
        <div className="flex-1 w-full h-full cursor-crosshair relative" onClick={handleSceneClick}>
            
                  {/* Selected Item Controls (Mobile Friendly) */}
            {selectedItemId && mode === 'design' && (
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur rounded-full shadow-xl px-6 py-3 flex items-center gap-6 border border-stone-200 animate-in slide-in-from-bottom-4">
                          <button onClick={(e) => {e.stopPropagation(); updateItem(selectedItemId, {rotation: (items.find(i => i.uid === selectedItemId)?.rotation || 0) + 45})}} className="hover:bg-stone-100 p-3 rounded-full active:scale-95 transition" title="Rotate"><RotateCw size={24} /></button>
                          <div className="h-6 w-px bg-stone-300"></div>
                          <button onClick={(e) => {e.stopPropagation(); removeItem(selectedItemId)}} className="hover:bg-red-50 text-red-500 p-3 rounded-full active:scale-95 transition"><Trash2 size={24} /></button>
                </div>
            )}
            
            {mode === 'walk' && (
                      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-black/50 text-white px-6 py-3 rounded-full text-sm backdrop-blur-sm pointer-events-none text-center w-max max-w-[90%]">
                          Tap to start. Drag to look. Joystick/WASD to move.
                </div>
            )}

            <Canvas shadows camera={{ position: [5, 5, 5], fov: 60 }} onPointerMissed={handleSceneClick}>
                <color attach="background" args={['#e5e7eb']} />

                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 20, 5]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />

                <Grid infiniteGrid cellSize={1} sectionSize={5} fadeDistance={30} sectionColor="#9ca3af" cellColor="#e5e7eb" position={[0, -0.01, 0]} />

                <Suspense fallback={null}>
                    <ApartmentComplex styles={aptStyles} />
                    
                    {items.map(item => (
                        <group key={item.uid}>
                            {/* The Content */}
                            <BillboardItem 
                                item={item}
                                isSelected={selectedItemId === item.uid}
                                onSelect={() => handleItemSelect(item.uid)}
                                isLocked={mode === 'walk'}
                            />

                            {/* The Gizmo (Wrapped around the content's position conceptually) */}
                            {selectedItemId === item.uid && mode === 'design' && (
                                <TransformControls
                                    object={undefined}
                                    position={[item.x, 0, item.y]} // Gizmo origin
                                    mode="translate"
                                    showY={false} // Lock to floor
                                    translationSnap={0.1}
                                    onObjectChange={(e: any) => {
                                        // Update state from gizmo movement
                                        // The gizmo moves a helper object; we read its position
                                        if (e?.target?.object) {
                                            updateItem(item.uid, {
                                                x: e.target.object.position.x,
                                                y: e.target.object.position.z
                                            });
                                        }
                                    }}
                                >
                                    {/* Invisible helper object that the gizmo actually moves */}
                                    <mesh visible={false}>
                                        <boxGeometry args={[1, 1, 1]} />
                                    </mesh>
                                </TransformControls>
                            )}
                        </group>
                    ))}
                </Suspense>

                      {/* Orbit Controls (Disabled when using Gizmo usually handled by drei automatically, but we check makeDefault) */}
                {mode !== 'walk' ? (
                    <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
                ) : (
                    <PointerLockControls makeDefault selector="#root" />
                )}
            </Canvas>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
               <div className="bg-white p-8 rounded-lg text-center">
                   <Sparkles size={48} className="mx-auto text-indigo-500 mb-4 animate-pulse" />
                   <h2 className="text-2xl font-serif mb-2">Generating 3D Render...</h2>
                   <p className="text-stone-500 mb-6">Taking a snapshot of your 3D scene arrangement...</p>
                   <button onClick={() => setShowRenderModal(false)} className="text-sm underline">Close</button>
               </div>
          </div>
      )}
    </div>
  );
};

export default MoodboardStudio;