
import React from 'react';
import { Transaction } from '../types';
import { Icons } from '../constants';

interface HistoryProps {
  transactions: Transaction[];
}

const History: React.FC<HistoryProps> = ({ transactions }) => {
  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="p-4 pb-20 max-w-4xl mx-auto space-y-6">
      <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-indigo-100 text-sm font-medium uppercase tracking-widest mb-1">Total Penjualan Hari Ini</p>
          <h2 className="text-4xl font-extrabold">Rp {totalSales.toLocaleString('id-ID')}</h2>
          <div className="mt-4 flex gap-4">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl">
              <p className="text-[10px] text-indigo-100 uppercase font-bold tracking-tight">Transaksi</p>
              <p className="text-xl font-bold">{transactions.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl">
              <p className="text-[10px] text-indigo-100 uppercase font-bold tracking-tight">Rata-rata</p>
              <p className="text-xl font-bold">Rp {transactions.length > 0 ? (totalSales / transactions.length).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '0'}</p>
            </div>
          </div>
        </div>
        {/* Abstract shapes for design */}
        <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-[-20%] left-[-5%] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 ml-1">Transaksi Terakhir</h3>
        {transactions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
            <div className="text-slate-200 mb-4 scale-150"><Icons.History /></div>
            <p className="text-slate-400 font-medium">Belum ada transaksi</p>
          </div>
        ) : (
          transactions.map(trx => (
            <div key={trx.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-400">{trx.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      trx.paymentMethod === 'QRIS' ? 'bg-indigo-100 text-indigo-600' : 
                      trx.paymentMethod === 'CASH' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {trx.paymentMethod}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{new Date(trx.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'long' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900 leading-none">Rp {trx.total.toLocaleString('id-ID')}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-3 space-y-2">
                {trx.items.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">{item.quantity}x {item.name}</span>
                    <span className="text-slate-400">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
