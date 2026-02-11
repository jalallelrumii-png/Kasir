
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

// --- TYPES ---
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'CASH' | 'QRIS' | 'DEBIT';
  timestamp: number;
  receivedAmount: number;
  changeAmount: number;
}

type ViewType = 'POS' | 'INVENTORY' | 'HISTORY';

// --- CONSTANTS & ICONS ---
const CATEGORIES = ['Semua', 'Makanan', 'Minuman', 'Snack', 'Lainnya'];

const Icons = {
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Inventory: () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  History: () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>,
  Cart: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
};

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Nasi Goreng Special', price: 25000, category: 'Makanan', stock: 50, image: 'https://picsum.photos/seed/nasi/400/300' },
  { id: '2', name: 'Es Teh Manis', price: 5000, category: 'Minuman', stock: 100, image: 'https://picsum.photos/seed/teh/400/300' },
  { id: '3', name: 'Kopi Susu Aren', price: 18000, category: 'Minuman', stock: 40, image: 'https://picsum.photos/seed/coffee/400/300' },
  { id: '4', name: 'Kerupuk Udang', price: 3000, category: 'Snack', stock: 200, image: 'https://picsum.photos/seed/snack/400/300' },
];

// --- MAIN APP COMPONENT ---
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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  // Persistence
  useEffect(() => {
    localStorage.setItem('sk_products', JSON.stringify(products));
    localStorage.setItem('sk_transactions', JSON.stringify(transactions));
  }, [products, transactions]);

  // Logic
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const processPayment = (method: 'CASH' | 'QRIS' | 'DEBIT', received: number) => {
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const newTrx: Transaction = {
      id: `TRX-${Date.now()}`,
      items: [...cart],
      total,
      paymentMethod: method,
      timestamp: Date.now(),
      receivedAmount: received,
      changeAmount: Math.max(0, received - total)
    };

    setTransactions(prev => [newTrx, ...prev]);
    setProducts(prev => prev.map(p => {
      const sold = cart.find(ci => ci.id === p.id);
      return sold ? { ...p, stock: p.stock - sold.quantity } : p;
    }));
    setCart([]);
    setIsCartOpen(false);
    alert(`Pembayaran Berhasil!\nKembalian: Rp ${newTrx.changeAmount.toLocaleString('id-ID')}`);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Semua' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
            <Icons.Home />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">SmartKasir <span className="text-indigo-600 font-medium">Pro</span></h1>
        </div>
        <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-all">
          <Icons.Cart />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </header>

      {/* Main View Container */}
      <main className="flex-1 overflow-auto relative">
        {activeView === 'POS' && (
          <div className="h-full flex flex-col">
            <div className="bg-white border-b p-4 space-y-3">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400"><Icons.Search /></span>
                <input 
                  type="text" placeholder="Cari menu atau snack..." 
                  className="w-full bg-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-300'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <button key={product.id} onClick={() => addToCart(product)} disabled={product.stock <= 0}
                  className={`bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md active:scale-95 transition-all text-left group ${product.stock <= 0 ? 'opacity-50 grayscale' : ''}`}>
                  <div className="aspect-[4/3] bg-slate-200 relative">
                    <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                    {product.stock <= 5 && product.stock > 0 && <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Stok Tipis</span>}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase">{product.category}</p>
                    <h3 className="text-sm font-bold text-slate-800 truncate">{product.name}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900">Rp {product.price.toLocaleString('id-ID')}</span>
                      <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Icons.Plus /></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeView === 'INVENTORY' && <InventoryView products={products} setProducts={setProducts} />}
        {activeView === 'HISTORY' && <HistoryView transactions={transactions} />}
      </main>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} 
        cart={cart} updateQty={updateCartQty} onPay={processPayment} 
      />

      {/* Navigation */}
      <nav className="bg-white border-t px-8 py-3 pb-safe flex justify-between items-center shadow-2xl z-40">
        <NavButton active={activeView === 'POS'} onClick={() => setActiveView('POS')} icon={<Icons.Home />} label="Kasir" />
        <NavButton active={activeView === 'INVENTORY'} onClick={() => setActiveView('INVENTORY')} icon={<Icons.Inventory />} label="Stok" />
        <NavButton active={activeView === 'HISTORY'} onClick={() => setActiveView('HISTORY')} icon={<Icons.History />} label="Riwayat" />
      </nav>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
    <div className={active ? 'bg-indigo-50 p-2 rounded-xl' : 'p-2'}>{icon}</div>
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

const CartSidebar: React.FC<{ isOpen: boolean, onClose: () => void, cart: CartItem[], updateQty: (id: string, d: number) => void, onPay: (m: any, r: number) => void }> = ({ isOpen, onClose, cart, updateQty, onPay }) => {
  const [cashReceived, setCashReceived] = useState('');
  const [method, setMethod] = useState<'CASH' | 'QRIS' | 'DEBIT'>('CASH');
  const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

  return (
    <div className={`fixed inset-0 z-[100] transition-all ${isOpen ? 'visible' : 'invisible'}`}>
      <div className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">Keranjang</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><Icons.ChevronLeft /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
              <Icons.Cart /><p className="mt-2 text-sm font-medium">Belum ada item</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 items-center">
                <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate">{item.name}</h4>
                  <p className="text-xs text-indigo-600 font-bold">Rp {item.price.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1 px-2">
                  <button onClick={() => updateQty(item.id, -1)} className="font-bold text-slate-500">-</button>
                  <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="font-bold text-indigo-600">+</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 bg-slate-50 border-t space-y-4">
          <div className="flex justify-between text-lg font-black">
            <span>Total</span>
            <span className="text-indigo-600">Rp {total.toLocaleString('id-ID')}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['CASH', 'QRIS', 'DEBIT'].map(m => (
              <button key={m} onClick={() => setMethod(m as any)} className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${method === m ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white border-slate-200 text-slate-500'}`}>{m}</button>
            ))}
          </div>
          {method === 'CASH' && (
            <input type="number" placeholder="Jumlah Tunai..." value={cashReceived} onChange={e => setCashReceived(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-black text-center focus:border-indigo-500 outline-none" />
          )}
          <button disabled={cart.length === 0 || (method === 'CASH' && Number(cashReceived) < total)}
            onClick={() => onPay(method, method === 'CASH' ? Number(cashReceived) : total)}
            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:bg-slate-300 transition-all">
            BAYAR SEKARANG
          </button>
        </div>
      </div>
    </div>
  );
};

const InventoryView: React.FC<{ products: Product[], setProducts: any }> = ({ products, setProducts }) => {
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.name || !editing?.price) return;
    if (editing.id) {
      setProducts(prev => prev.map(p => p.id === editing.id ? editing : p));
    } else {
      setProducts(prev => [...prev, { ...editing, id: Date.now().toString(), stock: editing.stock || 0, image: editing.image || 'https://picsum.photos/400/300' }]);
    }
    setEditing(null);
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800">Stok Barang</h2>
        <button onClick={() => setEditing({ category: 'Lainnya', stock: 0 })} className="bg-indigo-600 text-white p-3 px-6 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100"><Icons.Plus /> Baru</button>
      </div>
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
            <tr><th className="p-4">Produk</th><th className="p-4">Stok</th><th className="p-4">Harga</th><th className="p-4 text-right">Aksi</th></tr>
          </thead>
          <tbody className="divide-y">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4 font-bold">{p.name}</td>
                <td className={`p-4 font-black ${p.stock < 10 ? 'text-rose-500' : 'text-emerald-500'}`}>{p.stock}</td>
                <td className="p-4">Rp {p.price.toLocaleString('id-ID')}</td>
                <td className="p-4 text-right">
                  <button onClick={() => setEditing(p)} className="text-indigo-600 font-bold hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <form onSubmit={save} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 space-y-4 shadow-2xl">
            <h3 className="text-xl font-black">{editing.id ? 'Edit Produk' : 'Tambah Baru'}</h3>
            <input required placeholder="Nama Produk" className="w-full bg-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={editing.name || ''} onChange={e => setEditing({...editing, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <input required type="number" placeholder="Harga" className="w-full bg-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={editing.price || ''} onChange={e => setEditing({...editing, price: Number(e.target.value)})} />
              <input required type="number" placeholder="Stok" className="w-full bg-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={editing.stock || ''} onChange={e => setEditing({...editing, stock: Number(e.target.value)})} />
            </div>
            <select className="w-full bg-slate-100 rounded-2xl p-4 font-bold outline-none" value={editing.category} onChange={e => setEditing({...editing, category: e.target.value})}>
              {CATEGORIES.filter(c => c !== 'Semua').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-2 pt-4">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 py-4 font-bold text-slate-400">Batal</button>
              <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100">SIMPAN</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const HistoryView: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const totalToday = transactions.reduce((s, t) => s + t.total, 0);
  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200">
        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Total Penjualan</p>
        <h2 className="text-4xl font-black">Rp {totalToday.toLocaleString('id-ID')}</h2>
        <div className="mt-4 flex gap-4">
           <div className="bg-white/10 p-3 rounded-2xl"><p className="text-[10px] font-bold uppercase opacity-60">Transaksi</p><p className="text-xl font-black">{transactions.length}</p></div>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="font-black text-slate-800 ml-2">Transaksi Terakhir</h3>
        {transactions.map(t => (
          <div key={t.id} className="bg-white rounded-[2rem] p-6 border shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400">{new Date(t.timestamp).toLocaleTimeString('id-ID')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">{t.paymentMethod}</span>
                  <span className="text-xs font-medium text-slate-500">#{t.id.slice(-5)}</span>
                </div>
              </div>
              <p className="text-lg font-black">Rp {t.total.toLocaleString('id-ID')}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed space-y-1">
              {t.items.map(i => <div key={i.id} className="flex justify-between text-xs text-slate-500"><span>{i.quantity}x {i.name}</span><span>Rp {(i.price * i.quantity).toLocaleString('id-ID')}</span></div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- RENDER ---
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
