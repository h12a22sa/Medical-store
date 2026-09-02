import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Receipt,
  BarChart3,
  Calendar,
  Trash2,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { Expense } from '../types';
import { formatCurrency, formatDateTime, formatDate, EXPENSE_CATEGORIES } from '../utils/helpers';

export const FinanceView: React.FC = () => {
  const {
    expenses,
    addExpense,
    deleteExpense,
    sales,
    purchases,
    stats,
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'expenses' | 'profit-loss'>('expenses');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Expense form
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER'>('CASH');
  const [notes, setNotes] = useState('');

  // Calculations for Profit & Loss Statement
  const totalRevenue = sales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalCostOfGoods = sales.reduce((acc, s) => {
    return acc + s.items.reduce((itemAcc, i) => itemAcc + (i.purchasePrice * i.quantity), 0);
  }, 0);
  const grossProfit = Math.max(0, totalRevenue - totalCostOfGoods);
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  const totalOperatingExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalOperatingExpenses;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Expenses category breakdown
  const categoryBreakdown = EXPENSE_CATEGORIES.map(cat => {
    const total = expenses.filter(e => e.category === cat).reduce((acc, e) => acc + e.amount, 0);
    return { category: cat, total };
  }).filter(c => c.total > 0);

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;

    addExpense({
      title,
      category,
      amount,
      paymentMethod,
      notes: notes || undefined,
    });

    setShowAddModal(false);
    setTitle('');
    setAmount(0);
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
              <DollarSign className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Finance, Expenses & Profit / Loss Statement
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time financial accounting, operational expense logging, and gross vs net margin tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'expenses'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Expenses ({expenses.length})
            </button>
            <button
              onClick={() => setActiveTab('profit-loss')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'profit-loss'
                  ? 'bg-white text-emerald-800 shadow-sm dark:bg-slate-700 dark:text-emerald-300'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              P&L Statement
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/30 hover:bg-rose-500"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {activeTab === 'expenses' ? (
        <>
          {/* Expenses Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Expenses</span>
              <p className="mt-2 text-xl font-black text-rose-600 dark:text-rose-400">
                {formatCurrency(totalOperatingExpenses)}
              </p>
              <div className="mt-1 text-[11px] text-slate-500">{expenses.length} Entries Logged</div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Highest Category</span>
              <p className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                {categoryBreakdown[0]?.category || 'None'}
              </p>
              <div className="mt-1 text-[11px] text-slate-500">{formatCurrency(categoryBreakdown[0]?.total || 0)}</div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment Modes</span>
              <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Cash & Online Banking
              </p>
              <div className="mt-1 text-[11px] text-emerald-600 font-bold">Auto Synchronized</div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Expense Title</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Category</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Date & Time</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Payment Method</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Notes</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Amount</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenses.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{e.title}</td>
                      <td className="py-3.5 px-3">
                        <span className="inline-block rounded-lg bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">{formatDateTime(e.timestamp)}</td>
                      <td className="py-3.5 px-3 font-semibold uppercase text-slate-600">{e.paymentMethod}</td>
                      <td className="py-3.5 px-3 text-slate-500">{e.notes || '—'}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-black text-rose-600">
                        {formatCurrency(e.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete expense "${e.title}"?`)) {
                              deleteExpense(e.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4 ml-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Profit & Loss Statement Detailed Card */
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 max-w-3xl mx-auto space-y-6">
            <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Commercial Statement of Profit & Loss</h2>
              <p className="text-xs text-slate-500">Awan Medical Store • Real-time Financial Ledger</p>
            </div>

            {/* Income Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">1. Revenue & Sales</h3>
              <div className="rounded-2xl bg-emerald-50/40 p-4 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40 space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                  <span>Gross Sales Invoices ({sales.length} orders):</span>
                  <span className="font-mono font-bold">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Less: Cost of Goods Sold (COGS purchase rate):</span>
                  <span className="font-mono text-rose-600">- {formatCurrency(totalCostOfGoods)}</span>
                </div>
                <div className="flex justify-between border-t border-emerald-200 pt-2 text-sm font-black text-emerald-900 dark:text-emerald-200 dark:border-emerald-800">
                  <span>GROSS PROFIT:</span>
                  <span className="font-mono">{formatCurrency(grossProfit)} ({grossMargin.toFixed(1)}%)</span>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">2. Operating Expenses</h3>
              <div className="rounded-2xl bg-rose-50/40 p-4 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40 space-y-2 text-xs">
                {categoryBreakdown.map(cat => (
                  <div key={cat.category} className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>{cat.category}:</span>
                    <span className="font-mono font-semibold">{formatCurrency(cat.total)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-rose-200 pt-2 text-sm font-black text-rose-900 dark:text-rose-200 dark:border-rose-800">
                  <span>TOTAL OPERATING EXPENSES:</span>
                  <span className="font-mono">- {formatCurrency(totalOperatingExpenses)}</span>
                </div>
              </div>
            </div>

            {/* Final Net Profit */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white shadow-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">NET CLEAN PROFIT</span>
                <h4 className="text-2xl font-black mt-1 font-mono">{formatCurrency(netProfit)}</h4>
                <p className="text-xs opacity-90">Net Profit Margin: {netMargin.toFixed(1)}%</p>
              </div>

              <div className="text-right">
                <button
                  onClick={() => window.print()}
                  className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-900 shadow hover:bg-emerald-50"
                >
                  Print P&L
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Record Pharmacy Expense</h3>

            <form onSubmit={handleSaveExpense} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Electric Bill WAPDA / Pharmacy Rent"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {EXPENSE_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (Rs.) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount || ''}
                  onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 5000"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono font-bold text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="CASH">Cash Drawer</option>
                  <option value="BANK_TRANSFER">Bank Online (HBL / Meezan)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes / Receipt Reference</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Month of August bill"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-5 py-2 font-bold text-white shadow-md hover:bg-rose-500"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
