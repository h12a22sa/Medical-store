import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Printer,
  RotateCcw,
  Calendar,
  DollarSign,
  ChevronRight,
  User,
  CheckCircle2,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { Sale, SaleReturn } from '../types';
import { formatCurrency, formatDateTime, formatDate } from '../utils/helpers';

export const SalesHistoryView: React.FC = () => {
  const {
    sales,
    setActiveInvoiceToPrint,
    setIsInvoiceModalOpen,
    processSalesReturn,
    salesReturns,
  } = usePharmacy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('ALL');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'this-month'>('all');
  const [activeTab, setActiveTab] = useState<'sales' | 'returns'>('sales');

  // Return modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedSaleForReturn, setSelectedSaleForReturn] = useState<Sale | null>(null);
  const [returnItems, setReturnItems] = useState<{
    medicineId: string;
    medicineName: string;
    batchNumber: string;
    quantity: number;
    unitPrice: number;
    totalRefund: number;
  }[]>([]);
  const [returnReason, setReturnReason] = useState('Customer Changed Mind');
  const [refundMethod, setRefundMethod] = useState<'CASH' | 'CREDIT_ADJUSTMENT'>('CASH');

  // Filter Sales
  const filteredSales = sales.filter(s => {
    const matchesSearch =
      s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.customerPhone && s.customerPhone.includes(searchQuery)) ||
      s.cashierName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPayment = selectedPaymentMethod === 'ALL' || s.paymentMethod === selectedPaymentMethod;

    let matchesDate = true;
    if (dateRange === 'today') {
      const today = new Date().toISOString().split('T')[0];
      matchesDate = s.timestamp.startsWith(today);
    }

    return matchesSearch && matchesPayment && matchesDate;
  });

  // Open Return Modal
  const handleOpenReturnModal = (sale: Sale) => {
    setSelectedSaleForReturn(sale);
    setReturnItems(
      sale.items.map(item => ({
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        batchNumber: item.batchNumber,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalRefund: item.totalPrice,
      }))
    );
    setShowReturnModal(true);
  };

  // Submit Return
  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleForReturn) return;

    const totalRefundAmount = returnItems.reduce((acc, i) => acc + i.totalRefund, 0);

    processSalesReturn({
      originalSaleId: selectedSaleForReturn.id,
      originalInvoiceNumber: selectedSaleForReturn.invoiceNumber,
      customerId: selectedSaleForReturn.customerId,
      customerName: selectedSaleForReturn.customerName,
      items: returnItems,
      totalRefundAmount,
      refundMethod,
      reason: returnReason,
    });

    setShowReturnModal(false);
    setSelectedSaleForReturn(null);
    alert('Sales return processed successfully! Stock restored to inventory.');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold shadow-xs">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Sales History & Returns Log
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Browse commercial receipts, reprint customer invoices, and process refunds
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-2xl bg-slate-100/80 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('sales')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sales'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Sales Invoices ({sales.length})
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'returns'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Returns & Refunds ({salesReturns.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'sales' ? (
        <>
          {/* Filter Bar */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search invoice #, customer name, phone..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <select
              value={selectedPaymentMethod}
              onChange={e => setSelectedPaymentMethod(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="CASH">Cash</option>
              <option value="EASYPAISA">EasyPaisa</option>
              <option value="JAZZCASH">JazzCash</option>
              <option value="CARD">Debit/Credit Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="UDHAAR">Udhaar / Credit</option>
            </select>

            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as any)}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Dates</option>
              <option value="today">Today Only</option>
              <option value="this-month">This Month</option>
            </select>
          </div>

          {/* Invoices Table */}
          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden dark:border-slate-800/80 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Invoice #</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Date & Time</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Customer</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Items Breakdown</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Payment</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Grand Total</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-14 text-center text-slate-400">
                        <Receipt className="mx-auto mb-2.5 h-8 w-8 text-slate-300 dark:text-slate-700" />
                        <p className="font-bold text-xs text-slate-600 dark:text-slate-300">No sales invoices found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map(sale => (
                      <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {sale.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                          {formatDateTime(sale.timestamp)}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-slate-900 dark:text-white">{sale.customerName}</span>
                          {sale.customerPhone && (
                            <span className="block text-[10px] text-slate-400 font-mono">{sale.customerPhone}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-900 dark:text-white">{sale.items.length} items</span>
                          <span className="text-[10px] text-slate-400 block line-clamp-1">
                            {sale.items.map(i => `${i.medicineName} (${i.quantity})`).join(', ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-block rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              sale.paymentMethod === 'UDHAAR'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900 dark:text-white text-sm">
                          {formatCurrency(sale.grandTotal)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setActiveInvoiceToPrint(sale);
                                setIsInvoiceModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer transition-colors"
                              title="Reprint Invoice"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>Print</span>
                            </button>

                            <button
                              onClick={() => handleOpenReturnModal(sale)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 cursor-pointer transition-colors"
                              title="Process Return & Refund"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Return</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Returns Table */
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden dark:border-slate-800/80 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Return #</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Orig Invoice</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Customer</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Returned Items</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Reason</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Refund Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {salesReturns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-slate-400">
                      <RotateCcw className="mx-auto mb-2.5 h-8 w-8 text-slate-300 dark:text-slate-700" />
                      <p className="font-bold text-xs text-slate-600 dark:text-slate-300">No returns recorded</p>
                    </td>
                  </tr>
                ) : (
                  salesReturns.map(ret => (
                    <tr key={ret.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{ret.returnNumber}</td>
                      <td className="py-3.5 px-3 font-mono text-emerald-600 font-semibold">{ret.originalInvoiceNumber}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">{ret.customerName}</td>
                      <td className="py-3.5 px-3">
                        {ret.items.map(i => `${i.medicineName} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">{ret.reason}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600">
                        - {formatCurrency(ret.totalRefundAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedSaleForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Process Return for Invoice {selectedSaleForReturn.invoiceNumber}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: {selectedSaleForReturn.customerName}
            </p>

            <form onSubmit={handleSubmitReturn} className="mt-5 space-y-4 text-xs">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 space-y-2.5">
                <p className="font-bold text-slate-700 dark:text-slate-300">Items to Return & Restock:</p>
                {returnItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{item.medicineName}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Batch: {item.batchNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={selectedSaleForReturn.items[idx]?.quantity || 1}
                        value={item.quantity}
                        onChange={e => {
                          const newQty = parseInt(e.target.value) || 0;
                          const updated = [...returnItems];
                          updated[idx] = {
                            ...item,
                            quantity: newQty,
                            totalRefund: newQty * item.unitPrice,
                          };
                          setReturnItems(updated);
                        }}
                        className="w-16 rounded-xl border border-slate-200 bg-white px-2 py-1 text-center font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(item.totalRefund)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Return Reason</label>
                <select
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Customer Changed Mind">Customer Changed Mind</option>
                  <option value="Doctor Changed Prescription">Doctor Changed Prescription</option>
                  <option value="Wrong Item Dispensed">Wrong Item Dispensed</option>
                  <option value="Damaged / Seal Broken">Damaged / Seal Broken</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Refund Method</label>
                <select
                  value={refundMethod}
                  onChange={e => setRefundMethod(e.target.value as any)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="CASH">Cash Refund</option>
                  <option value="CREDIT_ADJUSTMENT">Customer Account Credit / Udhaar Deduct</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="rounded-2xl px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-amber-600 px-5 py-2 font-bold text-white shadow-md shadow-amber-600/20 hover:bg-amber-500 transition-colors cursor-pointer"
                >
                  Complete Return & Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
