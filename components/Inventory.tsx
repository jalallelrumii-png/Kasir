
import React, { useState } from 'react';
import { Product } from '../types';
import { Icons, CATEGORIES } from '../constants';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts }) => {
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) return;

    if (editingProduct.id) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct as Product : p));
    } else {
      const newProduct = {
        ...editingProduct,
        id: Date.now().toString(),
        image: editingProduct.image || `https://picsum.photos/seed/${editingProduct.name}/400/300`,
      } as Product;
      setProducts(prev => [...prev, newProduct]);
    }
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (confirm('Hapus produk ini?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="p-4 pb-20 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Stok</h2>
          <p className="text-slate-500 text-sm">Update katalog dan stok barang Anda</p>
        </div>
        <button 
          onClick={() => setEditingProduct({ category: 'Lainnya', stock: 0 })}
          className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Icons.Plus />
          <span className="hidden sm:inline font-bold text-sm">Produk Baru</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">Produk</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Harga</th>
              <th className="px-6 py-4">Stok</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={product.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                    <span className="text-sm font-semibold text-slate-800">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{product.category}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-slate-900">Rp {product.price.toLocaleString('id-ID')}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-bold ${product.stock < 10 ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingProduct(product)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Icons.Inventory />
                    </button>
                    <button 
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Edit/Add */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">{editingProduct.id ? 'Edit Produk' : 'Tambah Produk'}</h3>
            <form onSubmit={saveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Nama Produk</label>
                <input 
                  autoFocus
                  required
                  className="w-full bg-slate-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 outline-none transition-all font-medium"
                  value={editingProduct.name || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Harga</label>
                  <input 
                    type="number"
                    required
                    className="w-full bg-slate-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 outline-none transition-all font-medium"
                    value={editingProduct.price || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Stok</label>
                  <input 
                    type="number"
                    required
                    className="w-full bg-slate-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 outline-none transition-all font-medium"
                    value={editingProduct.stock || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Kategori</label>
                <select 
                  className="w-full bg-slate-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 outline-none transition-all font-medium appearance-none"
                  value={editingProduct.category}
                  onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                >
                  {CATEGORIES.filter(c => c !== 'Semua').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
