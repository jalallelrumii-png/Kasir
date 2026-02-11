
import React, { useState, useMemo } from 'react';
import { Product, CartItem, Transaction } from '../types';
import { Icons, CATEGORIES } from '../constants';
import CartSidebar from './CartSidebar';

interface PosLayoutProps {
  products: Product[];
  addToCart: (product: Product) => void;
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  completeTransaction: (t: Transaction) => void;
  clearCart: () => void;
}

const PosLayout: React.FC<PosLayoutProps> = ({ 
  products, 
  addToCart, 
  cart, 
  isCartOpen, 
  setIsCartOpen,
  updateQuantity,
  removeFromCart,
  completeTransaction,
  clearCart
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Semua' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  return (
    <div className="flex h-full w-full">
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCartOpen ? 'lg:mr-96' : ''}`}>
        {/* Sub-Header / Filters */}
        <div className="bg-white border-b px-4 py-3 space-y-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Icons.Search />
            </span>
            <input 
              type="text" 
              placeholder="Cari produk..." 
              className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 p-4 overflow-y-auto">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <button
                key={product.id}
                disabled={product.stock <= 0}
                onClick={() => addToCart(product)}
                className={`group flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md active:scale-95 transition-all overflow-hidden relative ${product.stock <= 0 ? 'opacity-60 grayscale' : ''}`}
              >
                <div className="aspect-[4/3] w-full relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">Sisa {product.stock}</span>
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Habis</span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col text-left">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide">{product.category}</span>
                  <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 mb-1">{product.name}</h3>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Rp {product.price.toLocaleString('id-ID')}</span>
                    <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icons.Plus />
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
               <div className="p-4 bg-slate-100 rounded-full mb-4">
                 <Icons.Search />
               </div>
               <p className="text-sm">Produk tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar Overlay for Mobile / Side for Desktop */}
      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        completeTransaction={completeTransaction}
        clearCart={clearCart}
      />
    </div>
  );
};

export default PosLayout;
