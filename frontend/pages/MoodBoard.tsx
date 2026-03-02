import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Save, Share2, X, Move, Grid3X3, Loader2, ArrowLeft, Download } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number | null;
  image?: string;
  store: string;
}

interface BoardItem {
  product_id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  z_index: number;
  product?: Product;
}

interface MoodBoard {
  id: string;
  name: string;
  items: BoardItem[];
  created_at: string;
  updated_at: string;
}

const backendUrl =
  (typeof process !== 'undefined' && process.env?.REACT_APP_BACKEND_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.REACT_APP_BACKEND_URL) ||
  '';

const MoodBoardBuilder: React.FC = () => {
  const [boards, setBoards] = useState<MoodBoard[]>([]);
  const [currentBoard, setCurrentBoard] = useState<MoodBoard | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [boardName, setBoardName] = useState('My Mood Board');
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadBoards();
    loadProducts();
  }, []);

  const loadBoards = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/moodboards`);
      const data = await response.json();
      if (data.ok) {
        setBoards(data.boards);
      }
    } catch (err) {
      console.error('Failed to load boards:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/products/curated?limit=50`);
      const data = await response.json();
      if (data.ok) {
        setProducts(data.products.filter((p: Product) => p.image));
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNewBoard = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/moodboards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: boardName, items: [] }),
      });
      const data = await response.json();
      if (data.ok) {
        setCurrentBoard(data.board);
        setBoards([data.board, ...boards]);
      }
    } catch (err) {
      console.error('Failed to create board:', err);
    }
  };

  const loadBoard = async (boardId: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/moodboards/${boardId}`);
      const data = await response.json();
      if (data.ok) {
        setCurrentBoard(data.board);
        setBoardName(data.board.name);
      }
    } catch (err) {
      console.error('Failed to load board:', err);
    }
  };

  const saveBoard = async () => {
    if (!currentBoard) return;
    
    try {
      const response = await fetch(`${backendUrl}/api/moodboards/${currentBoard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: boardName, 
          items: currentBoard.items.map(item => ({
            product_id: item.product_id,
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
            rotation: item.rotation,
            z_index: item.z_index,
          })),
        }),
      });
      const data = await response.json();
      if (data.ok) {
        setCurrentBoard({ ...currentBoard, name: boardName });
      }
    } catch (err) {
      console.error('Failed to save board:', err);
    }
  };

  const addProductToBoard = (product: Product) => {
    if (!currentBoard) return;
    
    const newItem: BoardItem = {
      product_id: product.id,
      x: 10 + Math.random() * 30,
      y: 10 + Math.random() * 30,
      width: 25,
      height: 25,
      rotation: 0,
      z_index: currentBoard.items.length,
      product,
    };
    
    setCurrentBoard({
      ...currentBoard,
      items: [...currentBoard.items, newItem],
    });
    setShowProductPicker(false);
  };

  const removeItemFromBoard = (productId: string) => {
    if (!currentBoard) return;
    
    setCurrentBoard({
      ...currentBoard,
      items: currentBoard.items.filter(item => item.product_id !== productId),
    });
  };

  const handleDragStart = (e: React.MouseEvent, productId: string) => {
    setDraggingItem(productId);
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!draggingItem || !currentBoard || !canvasRef.current) return;
    
    const canvas = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - canvas.left) / canvas.width) * 100;
    const y = ((e.clientY - canvas.top) / canvas.height) * 100;
    
    setCurrentBoard({
      ...currentBoard,
      items: currentBoard.items.map(item => 
        item.product_id === draggingItem 
          ? { ...item, x: Math.max(0, Math.min(x, 100 - item.width)), y: Math.max(0, Math.min(y, 100 - item.height)) }
          : item
      ),
    });
  };

  const handleDragEnd = () => {
    setDraggingItem(null);
  };

  const deleteBoard = async (boardId: string) => {
    try {
      await fetch(`${backendUrl}/api/moodboards/${boardId}`, { method: 'DELETE' });
      setBoards(boards.filter(b => b.id !== boardId));
      if (currentBoard?.id === boardId) {
        setCurrentBoard(null);
      }
    } catch (err) {
      console.error('Failed to delete board:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-stone-400" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50" data-testid="moodboard-page">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/search" className="p-2 hover:bg-stone-100 rounded-lg transition">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <Grid3X3 className="text-amber-600" size={22} />
              <h1 className="font-serif text-xl">Mood Board Builder</h1>
            </div>
          </div>
          
          {currentBoard && (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Board name"
              />
              <button
                onClick={saveBoard}
                className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition"
                data-testid="save-board-btn"
              >
                <Save size={16} /> Save
              </button>
              <button
                onClick={() => setShowProductPicker(true)}
                className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition"
                data-testid="add-product-btn"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {!currentBoard ? (
          /* Board Selection */
          <div className="space-y-6">
            {/* Create New */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="font-serif text-lg mb-4">Create New Board</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  className="flex-1 border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Enter board name..."
                />
                <button
                  onClick={createNewBoard}
                  className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-stone-800 transition"
                  data-testid="create-board-btn"
                >
                  <Plus size={18} /> Create Board
                </button>
              </div>
            </div>

            {/* Existing Boards */}
            {boards.length > 0 && (
              <div>
                <h2 className="font-serif text-lg mb-4">Your Boards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {boards.map((board) => (
                    <div
                      key={board.id}
                      className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition cursor-pointer group"
                    >
                      <div 
                        className="aspect-video bg-stone-100 rounded-lg mb-3 flex items-center justify-center"
                        onClick={() => loadBoard(board.id)}
                      >
                        <Grid3X3 className="text-stone-300" size={32} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div onClick={() => loadBoard(board.id)}>
                          <h3 className="font-medium text-stone-900">{board.name}</h3>
                          <p className="text-stone-500 text-sm">{board.items?.length || 0} items</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBoard(board.id);
                          }}
                          className="p-2 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Board Canvas */
          <div className="flex gap-6">
            {/* Canvas */}
            <div className="flex-1">
              <div
                ref={canvasRef}
                className="bg-white rounded-2xl border-2 border-dashed border-stone-300 aspect-[4/3] relative overflow-hidden"
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                data-testid="board-canvas"
              >
                {currentBoard.items.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-stone-400">
                    <div className="text-center">
                      <Grid3X3 size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Click "Add Product" to start building your mood board</p>
                    </div>
                  </div>
                )}
                
                {currentBoard.items.map((item) => (
                  <div
                    key={item.product_id}
                    className={`absolute cursor-move group ${draggingItem === item.product_id ? 'z-50' : ''}`}
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      width: `${item.width}%`,
                      transform: `rotate(${item.rotation}deg)`,
                    }}
                    onMouseDown={(e) => handleDragStart(e, item.product_id)}
                  >
                    <div className="relative">
                      <img
                        src={item.product?.image || 'https://via.placeholder.com/200'}
                        alt={item.product?.name}
                        className="w-full rounded-lg shadow-lg"
                        draggable={false}
                      />
                      
                      {/* Controls */}
                      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItemFromBoard(item.product_id);
                          }}
                          className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      
                      {/* Label */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition">
                        <p className="truncate">{item.product?.name}</p>
                        {item.product?.price && (
                          <p className="font-bold">${item.product.price}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Canvas Actions */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setCurrentBoard(null)}
                  className="text-stone-600 hover:text-stone-900 text-sm"
                >
                  ← Back to Boards
                </button>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 text-stone-600 hover:text-stone-900 text-sm">
                    <Share2 size={16} /> Share
                  </button>
                  <button className="flex items-center gap-2 text-stone-600 hover:text-stone-900 text-sm">
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="w-64 bg-white rounded-xl border border-stone-200 p-4 h-fit">
              <h3 className="font-medium text-stone-900 mb-3">Items ({currentBoard.items.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {currentBoard.items.map((item) => (
                  <div 
                    key={item.product_id}
                    className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg"
                  >
                    <img
                      src={item.product?.image || 'https://via.placeholder.com/40'}
                      alt={item.product?.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.product?.name}</p>
                      <p className="text-xs text-stone-500">{item.product?.store}</p>
                    </div>
                    <button
                      onClick={() => removeItemFromBoard(item.product_id)}
                      className="p-1 text-stone-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Picker Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <h2 className="font-serif text-xl">Add Product</h2>
              <button 
                onClick={() => setShowProductPicker(false)}
                className="p-2 hover:bg-stone-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <div className="grid grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addProductToBoard(product)}
                    className="cursor-pointer border border-stone-200 rounded-lg overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{product.name}</p>
                      <p className="text-xs text-stone-500">${product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodBoardBuilder;
