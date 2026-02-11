
import React, { useState, useEffect } from 'react';
import { CartItem, Transaction } from '../types';
import { Icons } from '../constants';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  completeTransaction: (t: Transaction) => void;
  clearCart: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen,
  onClose,
  cart,
  updateQuantity,
  removeFromCart,
  completeTransaction,
  clearCart
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'DEBIT'>('CASH');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal; // Can add tax logic here
  const change = Number(receivedAmount) - total;

  useEffect(() => {
    if (!isOpen) {
      setShowCheckout(false);
      setReceivedAmount('');
    }
  }, [isOpen]);

  const handleCheckout = () => {
    if (paymentMethod === 'CASH' && Number(receivedAmount) < total) {
      alert('Uang tunai kurang!');
      return;
    }

    const transaction: Transaction = {
      id: `TRX-${Date.now()}`,
      items: [...cart],
      total,
      paymentMethod,
      timestamp: Date.now(),
      receivedAmount: paymentMethod === 'CASH' ? Number(receivedAmount) : total,
      changeAmount: paymentMethod === 'CASH' ? Math.max(0, change) : 0
    };

    completeTransaction(transaction);
    setShowCheckout(false);
    setReceivedAmount('');
  };

  return (
    <>
      {/* Overlay Background */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white z-50 transform transition-transform duration-300 shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 border-b flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Keranjang Belanja</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
             <Icons.Trash />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="mb-4 text-slate-200 scale-150">
                <Icons.Cart />
              </div>
              <p className="text-sm font-medium">Keranjang masih kosong</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm">
                <img src={item.image} className="w-16 h-16 rounded-xl object-cover" alt={item.name} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800 truncate">{item.name}</h4>
                  <p className="text-xs font-bold text-indigo-600 mt-0.5">Rp {item.price.toLocaleString('id-ID')}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                      <button onClick={() => updateQuantity(item.id, -1)} className="text-indigo-600 hover:text-indigo-800">
                        <svg width="14" height="2" viewBox="0 0 14 2" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="text-indigo-600 hover:text-indigo-800">
                        <Icons.Plus />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors">
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold text-slate-900 border-t border-slate-200 pt-2">
              <span>Total</span>
              <span className="text-indigo-600">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {!showCheckout ? (
            <button 
              disabled={cart.length === 0}
              onClick={() => setShowCheckout(true)}
              className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:bg-slate-300 disabled:shadow-none"
            >
              Lanjutkan ke Pembayaran
            </button>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-3 gap-2">
                {(['CASH', 'QRIS', 'DEBIT'] as const).map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`text-[10px] font-bold py-2 rounded-xl border transition-all ${
                      paymentMethod === method 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {paymentMethod === 'CASH' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uang Diterima</label>
                  <input 
                    type="number"
                    placeholder="Contoh: 50000"
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 font-bold text-lg focus:border-indigo-500 outline-none"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                  />
                  {Number(receivedAmount) > total && (
                    <div className="flex justify-between text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <span>Kembalian</span>
                      <span>Rp {change.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 bg-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleCheckout}
                  className="flex-[2] bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  Selesaikan Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
