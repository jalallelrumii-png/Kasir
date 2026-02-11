
import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, Transaction, ViewType } from './types';
import { Icons, CATEGORIES } from './constants';
import Inventory from './components/Inventory';
import History from './components/History';
import PosLayout from './components/PosLayout';

// Mock Initial Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Nasi Goreng Special', price: 25000, category: 'Makanan', stock: 50, image: 'https://picsum.photos/seed/nasi/400/300' },
  { id: '2', name: 'Es Teh Manis', price: 5000, category: 'Minuman', stock: 100, image: 'https://picsum.photos/seed/teh/400/300' },
  { id: '3', name: 'Kopi Susu Gula Aren', price: 18000, category: 'Minuman', stock: 40, image: 'https://picsum.photos/seed/coffee/400/300' },
  { id: '4', name: 'Kerupuk Udang', price: 3000, category: 'Snack', stock: 200, image: 'https://picsum.photos/seed/snack/400/300' },
  { id: '5', name: 'Ayam Bakar Madu', price: 35000, category: 'Makanan', stock: 25, image: 'https://picsum.photos/seed/chicken/400/300' },
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('POS');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sk_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('sk_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('sk_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sk_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Cart Logic
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const completeTransaction = (transaction: Transaction) => {
    // Update Stock
    setProducts(prev => prev.map(p => {
      const cartItem = transaction.items.find(ci => ci.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      }
      return p;
    }));
    
    setTransactions(prev => [transaction, ...prev]);
    setCart([]);
    setIsCartOpen(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Icons.Home />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">SmartKasir <span className="text-indigo-600 font-normal">Pro</span></h1>
        </div>
        
        <div className="flex items-center gap-2">
          {activeView === 'POS' && (
            <button 
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <Icons.Cart />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-slate-50 relative">
        {activeView === 'POS' && (
          <PosLayout 
            products={products} 
            addToCart={addToCart} 
            cart={cart}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            completeTransaction={completeTransaction}
            clearCart={clearCart}
          />
        )}
        {activeView === 'INVENTORY' && (
          <Inventory 
            products={products} 
            setProducts={setProducts} 
          />
        )}
        {activeView === 'HISTORY' && (
          <History transactions={transactions} />
        )}
      </main>

      {/* Navigation Bar (Mobile Native Style) */}
      <nav className="bg-white border-t border-slate-200 px-6 py-2 pb-safe flex justify-between items-center z-50">
        <NavButton 
          active={activeView === 'POS'} 
          onClick={() => setActiveView('POS')} 
          icon={<Icons.Home />} 
          label="Kasir" 
        />
        <NavButton 
          active={activeView === 'INVENTORY'} 
          onClick={() => setActiveView('INVENTORY')} 
          icon={<Icons.Inventory />} 
          label="Stok" 
        />
        <NavButton 
          active={activeView === 'HISTORY'} 
          onClick={() => setActiveView('HISTORY')} 
          icon={<Icons.History />} 
          label="Riwayat" 
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-200 ${active ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
  >
    <div className={active ? 'bg-indigo-50 p-1 rounded-md' : ''}>
      {icon}
    </div>
    <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
  </button>
);

export default App;
