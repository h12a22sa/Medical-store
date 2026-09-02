import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Calendar,
  Building2,
  DollarSign,
  Trash2,
  CheckCircle2,
  FileText,
  Boxes,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { PurchaseItem } from '../types';
import { formatCurrency, formatDateTime, formatDate } from '../utils/helpers';

export const PurchasesView: React.FC = () => {
  const {
    purchases,
    suppliers,
    medicines,
    addPurchase,
    setActiveTab,
  } = usePharmacy();

  const [activeTabMode, setActiveTabMode] = useState<'history' | 'new'>('history');

  // New Purchase Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<PurchaseItem[]>([
    {
      medicineId: medicines[0]?.id || '',
      medicineName: medicines[0]?.name || '',
      batchNumber: 'B-NEW-01',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quantity: 50,
      purchasePrice: 100,
      retailPrice: 130,
      totalCost: 5000,
    },
  ]);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PARTIAL' | 'UNPAID'>('PAID');
  const [notes, setNotes] = useState('');

  // Add Item Line
  const handleAddItemLine = () => {
    const defaultMed = medicines[0];
    setItems(prev => [
      ...prev,
      {
        medicineId: defaultMed ? defaultMed.id : '',
        medicineName: defaultMed ? defaultMed.name : '',
        batchNumber: `B-${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        quantity: 20,
        purchasePrice: defaultMed ? defaultMed.purchasePrice : 100,
        retailPrice: defaultMed ? defaultMed.retailPrice : 130,
        totalCost: (defaultMed ? defaultMed.purchasePrice : 100) * 20,
      },
    ]);
  };

  // Remove Item Line
  const handleRemoveLine = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Update Item Line
  const handleUpdateLine = (idx: number, field: keyof PurchaseItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[idx], [field]: value };
      if (field === 'medicineId') {
        const med = medicines.find(m => m.id === value);
        if (med) {
          item.medicineName = med.name;
          item.purchasePrice = med.purchasePrice;
          item.retailPrice = med.retailPrice;
        }
      }
      if (field === 'quantity' || field === 'purchasePrice') {
        item.totalCost = item.quantity * item.purchasePrice;
      }
      updated[idx] = item;
      return updated;
    });
  };

  // Calculations
  const totalAmount = items.reduce((acc, i) => acc + i.totalCost, 0);

  // Submit Purchase
  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Add at least one item to purchase.');
      return;
    }

    const selectedSupplier = suppliers.find(s => s.id === supplierId);
    if (!selectedSupplier) {
      alert('Select a valid supplier distributor.');
      return;
    }

    addPurchase({
      supplierId,
      supplierName: selectedSupplier.name,
      supplierInvoiceNumber: supplierInvoiceNo || `PO-${Date.now().toString().slice(-5)}`,
      items,
      totalAmount,
      paidAmount: paidAmount || totalAmount,
      paymentStatus,
      notes: notes || undefined,
    });

    alert('Purchase successfully recorded! Inventory stock updated.');
    setActiveTabMode('history');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold shadow-xs">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Purchases & Inward Stock Entry
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Record distributor invoices, batch numbers, trade rates & automatic inventory updates
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-2xl bg-slate-100/80 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveTabMode('history')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTabMode === 'history'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Purchase History ({purchases.length})
            </button>
            <button
              onClick={() => setActiveTabMode('new')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTabMode === 'new'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              + New Inward Entry
            </button>
          </div>
        </div>
      </div>

      {activeTabMode === 'new' ? (
        /* New Purchase Form */
        <form onSubmit={handleSubmitPurchase} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 space-y-6 text-xs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Supplier / Distributor *</label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.companyName} ({s.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Supplier Invoice / Bill #</label>
              <input
                type="text"
                value={supplierInvoiceNo}
                onChange={e => setSupplierInvoiceNo(e.target.value)}
                placeholder="e.g. GSK-INV-9921"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Medicines Entry Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="h-4 w-4 text-emerald-600" />
                Purchased Medicines Line Items
              </h3>
              <button
                type="button"
                onClick={handleAddItemLine}
                className="rounded-2xl bg-emerald-50 px-3.5 py-1.5 font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors cursor-pointer"
              >
                + Add Item Line
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200/80 overflow-x-auto dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                    <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px]">Medicine</th>
                    <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px]">Batch Number</th>
                    <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px]">Expiry Date</th>
                    <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px] text-center">Qty (Units)</th>
                    <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Cost Price (Rs)</th>
                    <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Retail Rate (Rs)</th>
                    <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Line Total</th>
                    <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px] text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3">
                        <select
                          value={item.medicineId}
                          onChange={e => handleUpdateLine(idx, 'medicineId', e.target.value)}
                          className="w-48 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          {medicines.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.batchNumber}
                          onChange={e => handleUpdateLine(idx, 'batchNumber', e.target.value)}
                          className="w-24 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 font-mono font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="date"
                          value={item.expiryDate}
                          onChange={e => handleUpdateLine(idx, 'expiryDate', e.target.value)}
                          className="w-32 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleUpdateLine(idx, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-16 rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-1.5 text-center font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={item.purchasePrice}
                          onChange={e => handleUpdateLine(idx, 'purchasePrice', parseFloat(e.target.value) || 0)}
                          className="w-20 rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-1.5 text-right font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={item.retailPrice}
                          onChange={e => handleUpdateLine(idx, 'retailPrice', parseFloat(e.target.value) || 0)}
                          className="w-20 rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-1.5 text-right font-mono font-bold text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.totalCost)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          disabled={items.length === 1}
                          className="p-1 text-rose-500 hover:text-rose-700 disabled:opacity-20 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-slate-500 text-[11px] font-semibold">Total Order Cost:</span>
                <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(totalAmount)}</p>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] font-semibold">Paid Amount (Rs):</span>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={e => {
                    const amt = parseFloat(e.target.value) || 0;
                    setPaidAmount(amt);
                    if (amt >= totalAmount) setPaymentStatus('PAID');
                    else if (amt > 0) setPaymentStatus('PARTIAL');
                    else setPaymentStatus('UNPAID');
                  }}
                  className="w-32 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 font-bold font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTabMode('history')}
                className="rounded-2xl px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-2xl bg-emerald-600 px-6 py-2.5 font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-colors cursor-pointer"
              >
                Save & Update Inventory Stock
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Purchases History Table */
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden dark:border-slate-800/80 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">PO #</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Date & Time</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Supplier Distributor</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Distributor Bill #</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Items</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Payment Status</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-right">Total Purchase Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-slate-400">
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-200">No purchase orders recorded yet</p>
                    </td>
                  </tr>
                ) : (
                  purchases.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{p.purchaseNumber}</td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">{formatDateTime(p.timestamp)}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">{p.supplierName}</td>
                      <td className="py-3.5 px-3 font-mono text-emerald-600 font-semibold">{p.supplierInvoiceNumber}</td>
                      <td className="py-3.5 px-3">
                        {p.items.map(i => `${i.medicineName} (${i.quantity})`).join(', ')}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-block rounded-lg bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 dark:text-white text-sm">
                        {formatCurrency(p.totalAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
