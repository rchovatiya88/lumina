import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {OrbitControls, Grid, Html, useTexture, PointerLockControls, TransformControls} from '@react-three/drei';
import * as THREE from 'three';
import { MOCK_PRODUCTS } from '../constants';
import { Product, RoomItem } from '../types';
import { 
    Plus, Trash2, Search, X, Sparkles, Camera, 
    RotateCw, MousePointer2, PersonStanding, ExternalLink
} from 'lucide-react';
import ProductClipper from '../components/ProductClipper';
import { ApartmentComplex } from '../components/ApartmentArchitecture';
import SCRAPED_ITEMS from '../src/data/imported_products.json';

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
            
            {/* Selection Text/Label & Buy Button */}
            {isSelected && (
                <Html position={[0, height + 0.4, 0]} center>
                    <div className="flex flex-col items-center gap-1">
                        <div className="bg-stone-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-90 backdrop-blur-sm shadow-xl border border-stone-700">
                            {item.name}
                        </div>
                        {item.price > 0 && (
                             <div className="flex gap-2">
                                <span className="bg-green-600 text-white text-[10px] px-2 py-1 rounded-md font-bold shadow-sm">
                                    ${item.price}
                                </span>
                                {item.buyUrl && (
                                    <a 
                                        href={item.buyUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] px-2 py-1 rounded-md font-bold shadow-sm flex items-center gap-1 pointer-events-auto cursor-pointer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Buy <ExternalLink size={8} />
                                    </a>
                                )}
                             </div>
                        )}
                    </div>
                </Html>
            )}
        </group>
    );
};

// --- Main App Component ---

const RoomDesign: React.FC = () => {
    // Mode State
    const [mode, setMode] = useState<'design' | 'walk' | 'decor'>('design');
    
    // Apartment Style State
    const [aptStyles, setAptStyles] = useState({
        living: { floor: '#d4b483', wall: '#e5e5e5' },
        master: { floor: '#a8a29e', wall: '#e5e5e5' }
    });

    // Data State
    const [availableProducts, setAvailableProducts] = useState<Product[]>([...MOCK_PRODUCTS, ...SCRAPED_ITEMS as Product[]]);
    const [items, setItems] = useState<RoomItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showClipper, setShowClipper] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
    // AI State
    const [showRenderModal, setShowRenderModal] = useState(false);

    // Drag State
    const [draggedProduct, setDraggedProduct] = useState<Product | null>(null);

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

    // Drag Handlers
    const handleDragStart = (product: Product) => {
        setDraggedProduct(product);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // allow drop
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedProduct) return;
        addItem(draggedProduct, undefined); // undefined position means random/center
        setDraggedProduct(null);
    };

    // Snapping Helper
    const snapToGrid = (val: number) => Math.round(val * 10) / 10; // Snap to 0.1m

    // Update addItem to accept optional position and include snap
    const addItem = (product: Product, position?: {x: number, y: number}) => {
        const newItem: RoomItem = {
            ...product,
            uid: Math.random().toString(36).substr(2, 9),
            x: position ? snapToGrid(position.x) : (Math.random() - 0.5) * 2,
            y: position ? snapToGrid(position.y) : (Math.random() - 0.5) * 2,
            width: 150,
            height: 150,
            rotation: 0,
            zIndex: 0
        };
        setItems([...items, newItem]);
        setSelectedItemId(newItem.uid);
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
        setItems(items.map(i => i.uid === uid ? {...i, ...updates} : i));
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

    // Keyboard Shortcuts (Clone, Delete)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;

            // Delete
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedItemId) removeItem(selectedItemId);
            }

            // Clone (Ctrl+D or Cmd+D)
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                if (selectedItemId) {
                    const itemToClone = items.find(i => i.uid === selectedItemId);
                    if (itemToClone) {
                        // Offset slightly so it's visible
                        addItem(itemToClone, {x: itemToClone.x + 0.2, y: itemToClone.y + 0.2});
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedItemId, items]);


    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-stone-50 select-none font-sans relative">
          {/* 1. Sidebar - Responsive Overlay on Mobile */}
          <div
                className={`bg-white/80 backdrop-blur-xl border-r border-stone-200 flex flex-col transition-all duration-300 z-40 
            ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:translate-x-0'}
            absolute md:relative h-full shadow-2xl md:shadow-none
        `}
          >
                <div className="p-5 border-b border-stone-100 bg-white/50">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="font-serif font-semibold text-xl text-stone-900 tracking-tight">3D Assets</h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500"><X size={18} /></button>
          </div>
          
          <button 
            onClick={() => setShowClipper(true)}
                        className="w-full bg-stone-900 text-white py-3.5 rounded-2xl font-medium hover:bg-stone-800 transition-all flex items-center justify-center gap-2 mb-5 shadow-lg shadow-stone-200 active:scale-[0.98]"
          >
                      <Camera size={18} /> 
            Add New Item
          </button>

                    <div className="relative mb-4 group">
                        <Search className="absolute left-3.5 top-3 text-stone-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search assets..." 
                            className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border-0 ring-1 ring-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
              {['all', 'sofa', 'chair', 'table', 'lamp', 'rug'].map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${categoryFilter === cat ? 'bg-stone-900 text-white border-stone-900 shadow-md transform scale-105' : 'text-stone-500 border-stone-200 hover:bg-stone-50 hover:border-stone-300'}`}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
              ))}
          </div>
        </div>
        
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 bg-stone-50/30 pb-24">
           {filteredProducts.map(product => (
               <div
                   key={product.id}
                   draggable
                   onDragStart={() => handleDragStart(product)}
                   className="group relative bg-white rounded-2xl overflow-hidden ring-1 ring-stone-200 hover:ring-indigo-500 transition-all duration-300 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-xl hover:-translate-y-1"
                   onClick={() => addItem(product)}
               >
                   <div className="aspect-square bg-white relative p-4 flex items-center justify-center">
                       <img 
                          src={product.image} 
                          alt={product.name} 
                          onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBwcmVzZXJ2ZUFzcGVjdHJhdGlvPSJ4TWlkWU1pZCBzbGljZSIgZm9jdXNhYmxlPSJmYWxzZSIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJQbGFjZWhvbGRlciI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y1ZjVmNSI+PC9yZWN0Pjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjYThhMjllIiBkeT0iLjNlbSIgc3R5bGU9ImZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7Zm9udC1zaXplOjE0cHg7dGV4dC1hbmNob3I6bWlkZGxlIj5JbWFnZSBVbmF2YWlsYWJsZTwvdGV4dD48L3N2Zz4='; e.currentTarget.onerror = null; }}
                          className="max-w-full max-h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500" 
                        />
                       {/* Tags */}
                       <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                            {product.store === 'Uploaded' && (
                                <div className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border border-indigo-100">AI</div>
                            )}
                            {product.price > 0 && (
                                <div className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-[10px] font-bold border border-green-100">${product.price}</div>
                            )}
                       </div>
                    </div>
                   <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                       <span className="text-white text-xs font-medium truncate px-2">{product.name}</span>
                   </div>
             </div>
           ))}
        </div>
      </div>

            {/* Drop Zone Wrapper */}
            <div
                className="flex-1 relative flex flex-col h-full bg-stone-100 overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {/* Toolbar - Floating & Mobile Optimized */}
                <div className="absolute top-4 left-4 right-4 md:left-8 md:right-8 z-20 flex justify-between items-start pointer-events-none">

                    {/* Left: Mobile Toggle (Visible on Mobile Only) */}
                    <div className="pointer-events-auto">
                        {!isSidebarOpen && (
                            <button onClick={() => setIsSidebarOpen(true)} className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-white/20 text-stone-900 hover:scale-110 transition active:scale-95"><Plus size={24} /></button>
                        )}
                    </div>

                    {/* Center: Mode Toggles */}
                    <div className="bg-white/90 backdrop-blur-xl border border-white/20 p-1.5 rounded-full shadow-xl pointer-events-auto flex gap-1">
                        <button
                            onClick={() => setMode('design')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === 'design' ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-500 hover:bg-stone-100'}`}
                        >
                            <MousePointer2 size={16} /> <span className="hidden sm:inline">Design</span>
                        </button>
                        <button
                            onClick={() => setMode('decor')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === 'decor' ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-500 hover:bg-stone-100'}`}
                        >
                            <Sparkles size={16} /> <span className="hidden sm:inline">Decor</span>
                        </button>
                        <button
                            onClick={() => setMode('walk')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === 'walk' ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-500 hover:bg-stone-100'}`}
                        >
                            <PersonStanding size={16} /> <span className="hidden sm:inline">Walk</span>
                        </button>
                    </div>

                    {/* Right: Visualize Button */}
                    <div className="pointer-events-auto">
                        <button onClick={() => setShowRenderModal(true)} disabled={items.length === 0} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-full text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 disabled:opacity-50 hover:scale-105 active:scale-95">
                            <Sparkles size={18} />
                            <span className="hidden sm:inline">Visualize</span>
                        </button>
                    </div>
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


      {/* Product Clipper Modal */}
      {showClipper && (
          <ProductClipper 
            onClose={() => setShowClipper(false)} 
            onSave={handleClipperSave}
          />
      )}

      {/* Render Modal / Project Summary */}
      {showRenderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
               <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative">
                   <button onClick={() => setShowRenderModal(false)} className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition"><X size={20} /></button>
                   
                   <div className="text-center mb-6">
                       <h2 className="text-2xl font-serif font-bold text-stone-900">Project Summary</h2>
                       <p className="text-stone-500 text-sm">Review your curated sanctuary</p>
                   </div>

                   <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-3">
                       {items.map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center text-sm p-3 bg-stone-50 rounded-lg border border-stone-100">
                               <div className="flex items-center gap-3">
                                   <img src={item.image} className="w-10 h-10 object-contain mix-blend-multiply" alt={item.name} />
                                   <span className="font-medium text-stone-700 truncate max-w-[150px]">{item.name}</span>
                               </div>
                               <span className="font-bold text-stone-900">${item.price}</span>
                           </div>
                       ))}
                       {items.length === 0 && <p className="text-center text-stone-400 py-4">Your room is empty!</p>}
                   </div>

                   <div className="flex justify-between items-center border-t border-stone-200 pt-4 mb-6">
                       <span className="font-serif text-lg text-stone-600">Total Estimate</span>
                       <span className="font-serif text-2xl font-bold text-stone-900">
                           ${items.reduce((sum, i) => sum + i.price, 0).toLocaleString()}
                       </span>
                   </div>

                   <div className="flex flex-col gap-3">
                       <button className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold hover:bg-stone-800 transition shadow-lg flex items-center justify-center gap-2">
                           Export Shopping List <ExternalLink size={16} />
                       </button>
                       <button className="w-full bg-indigo-50 text-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-100 transition border border-indigo-100 flex items-center justify-center gap-2">
                           <Camera size={18} /> Download 3D Render
                       </button>
                   </div>
               </div>
          </div>
      )}
    </div>
  );
};

export default RoomDesign;