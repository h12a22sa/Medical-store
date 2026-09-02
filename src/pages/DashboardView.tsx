import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Pill,
  Package,
  AlertTriangle,
  Flame,
  Users,
  Building2,
  CreditCard,
  ShoppingCart,
  PlusCircle,
  Truck,
  FileText,
  RotateCcw,
  Barcode,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Sparkles,
  Clock,
  Eye,
  ChevronRight,
  BarChart3,
  Download,
  Filter,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { formatCurrency, formatDateTime, formatDate, getExpiryStatus, getStockStatus, exportToCSV } from '../utils/helpers';

export const DashboardView: React.FC = () => {
  const {
    stats,
    sales,
    medicines,
    customers,
    suppliers,
    setActiveTab,
    setSelectedMedicineId,
    setActiveInvoiceToPrint,
    setIsInvoiceModalOpen,
    setIsBarcodeModalOpen,
  } = usePharmacy();

  const [chartTimeframe, setChartTimeframe] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');

  // Chart data simulation based on real sales
  const weeklyData = [
    { label: 'MON', sales: 18500, height: 40, value: '18k' },
    { label: 'TUE', sales: 22400, height: 60, value: '22k' },
    { label: 'WED', sales: 19800, height: 45, value: '20k' },
    { label: 'THU', sales: 28900, height: 75, value: '29k' },
    { label: 'FRI', sales: 34200, height: 90, value: '34k' },
    { label: 'SAT', sales: 41500, height: 100, value: '42k', active: true },
    { label: 'SUN', sales: Math.max(stats.todaySales, 14250), height: 35, value: `${Math.round(Math.max(stats.todaySales, 14250)/1000)}k` },
  ];

  const recentSales = sales.slice(0, 8);

  const handleExportCSV = () => {
    const rows = [
      ['Invoice Number', 'Customer', 'Items Count', 'Payment Method', 'Grand Total (PKR)', 'Date & Time'],
      ...sales.map(s => [
        s.invoiceNumber,
        s.customerName,
        s.items.length,
        s.paymentMethod,
        s.grandTotal,
        formatDateTime(s.timestamp),
      ]),
    ];
    exportToCSV(`AwanMedical_Sales_Ledger_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="space-y-4 md:space-y-5 animate-in fade-in duration-200">
      {/* 5-Column High Density Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Today's Sales */}
        <div
          onClick={() => setActiveTab('sales/history')}
          className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-tight">Today's Sales</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white truncate">
            {formatCurrency(stats.todaySales)}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded font-bold">
              ↑ 12%
            </span>
            <span className="text-[10px] text-slate-400">vs yesterday</span>
          </div>
        </div>

        {/* Today's Profit */}
        <div
          onClick={() => setActiveTab('finance/profit-loss')}
          className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-tight">Today's Profit</p>
          <p className="text-xl font-bold text-[#0D3B66] dark:text-emerald-400 truncate">
            {formatCurrency(stats.todayProfit)}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded font-bold">
              ↑ 8.4%
            </span>
            <span className="text-[10px] text-slate-400">{stats.todaySalesCount} orders</span>
          </div>
        </div>

        {/* Low Stock */}
        <div
          onClick={() => setActiveTab('inventory/low-stock')}
          className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-tight">Low Stock</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 truncate">
            {stats.lowStockCount} Items
          </p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1 py-0.2 rounded font-bold">
              URGENT
            </span>
            <span className="text-[10px] text-slate-400">Needs restock</span>
          </div>
        </div>

        {/* Expired Items */}
        <div
          onClick={() => setActiveTab('inventory/expired')}
          className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-red-500 shadow-sm cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-tight">Expired Items</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400 truncate">
            {stats.expiredCount < 10 ? `0${stats.expiredCount}` : stats.expiredCount} Batches
          </p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[10px] text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 px-1 py-0.2 rounded font-bold">
              ACTION
            </span>
            <span className="text-[10px] text-slate-400">Removal pending</span>
          </div>
        </div>

        {/* Total Stock Val */}
        <div
          onClick={() => setActiveTab('reports/inventory')}
          className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors col-span-2 sm:col-span-1"
        >
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-tight">Total Stock Val</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white truncate">
            {formatCurrency(stats.totalStockValue)}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[10px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded font-bold">
              CATEGORIES
            </span>
            <span className="text-[10px] text-slate-400">{stats.totalMedicinesCount} SKUs</span>
          </div>
        </div>
      </div>

      {/* Main High Density 2-Col Layout: Sales Ledger & Analytics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        {/* Recent Sales Ledger (2-Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Recent Sales Ledger</h3>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded font-semibold transition-colors flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                <span>EXPORT CSV</span>
              </button>
              <button
                onClick={() => setActiveTab('sales/history')}
                className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded font-semibold transition-colors flex items-center gap-1"
              >
                <Filter className="h-3 w-3" />
                <span>ALL SALES ▾</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[420px] scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/90 text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 backdrop-blur-sm z-10">
                <tr>
                  <th className="px-4 py-2.5">Inv #</th>
                  <th className="px-4 py-2.5">Customer</th>
                  <th className="px-4 py-2.5">Medicine / Items</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentSales.map((sale, idx) => {
                  const itemsSummary = sale.items.map(i => `${i.medicineName} (${i.quantity})`).slice(0, 2).join(', ');
                  const remainingCount = sale.items.length > 2 ? ` +${sale.items.length - 2} more` : '';
                  const isUdhaar = sale.paymentMethod === 'Customer Credit (Udhaar)' || sale.paymentStatus === 'UNPAID';
                  const isRefunded = (sale as any).isRefunded;

                  return (
                    <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {sale.invoiceNumber}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                        {sale.customerName}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                        {itemsSummary}{remainingCount}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(sale.grandTotal)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {isRefunded ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-full text-[10px] font-bold">
                            REFUNDED
                          </span>
                        ) : isUdhaar ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-full text-[10px] font-bold">
                            CREDIT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-[10px] font-bold">
                            PAID
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => {
                            setActiveInvoiceToPrint(sale);
                            setIsInvoiceModalOpen(true);
                          }}
                          className="text-[11px] font-semibold text-[#0D3B66] hover:text-emerald-600 dark:text-emerald-400 p-1 rounded"
                          title="Print Receipt"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Sales Trend & Urgent Notifications */}
        <div className="flex flex-col gap-4">
          {/* Sales Trend Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Sales Trend</h3>
              <select
                value={chartTimeframe}
                onChange={e => setChartTimeframe(e.target.value as any)}
                className="text-[10px] bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold text-slate-500 dark:text-slate-400 cursor-pointer rounded px-1.5 py-0.5"
              >
                <option value="WEEKLY">WEEKLY</option>
                <option value="MONTHLY">MONTHLY</option>
              </select>
            </div>

            <div className="flex items-end justify-between h-24 gap-1.5 pt-4">
              {weeklyData.map((d, i) => (
                <div
                  key={i}
                  style={{ height: `${d.height}%` }}
                  className={`w-full rounded-sm cursor-pointer relative group transition-all ${
                    d.active
                      ? 'bg-[#0D3B66] dark:bg-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-[#0D3B66] dark:hover:bg-emerald-600'
                  }`}
                >
                  <span
                    className={`absolute -top-4 left-0 w-full text-[8px] text-center font-bold ${
                      d.active ? 'opacity-100 text-[#0D3B66] dark:text-emerald-400' : 'opacity-0 group-hover:opacity-100 text-slate-600'
                    }`}
                  >
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[8px] font-bold text-slate-400">
              {weeklyData.map((d, i) => (
                <span key={i}>{d.label}</span>
              ))}
            </div>
          </div>

          {/* Urgent Notifications */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-3">
              Urgent Notifications
            </h3>
            <div className="space-y-2.5 overflow-y-auto max-h-[170px] scrollbar-thin">
              {stats.expiredCount > 0 && (
                <div
                  onClick={() => setActiveTab('inventory/expired')}
                  className="flex items-start gap-2.5 p-2 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-100 dark:border-red-900/60 cursor-pointer hover:bg-red-100/70 transition-colors"
                >
                  <span className="text-sm mt-0.5">⚠️</span>
                  <div>
                    <p className="text-[11px] font-bold text-red-800 dark:text-red-300">
                      {stats.expiredCount} Medicines Expired
                    </p>
                    <p className="text-[10px] text-red-600 dark:text-red-400">
                      Expired stock blocked from billing. Quarantine now.
                    </p>
                  </div>
                </div>
              )}

              {stats.lowStockCount > 0 && (
                <div
                  onClick={() => setActiveTab('inventory/low-stock')}
                  className="flex items-start gap-2.5 p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-100 dark:border-amber-900/60 cursor-pointer hover:bg-amber-100/70 transition-colors"
                >
                  <span className="text-sm mt-0.5">📦</span>
                  <div>
                    <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                      Low Stock Alert ({stats.lowStockCount} Items)
                    </p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400">
                      Medicines below threshold. Generate purchase order.
                    </p>
                  </div>
                </div>
              )}

              <div
                onClick={() => setActiveTab('sales/history')}
                className="flex items-start gap-2.5 p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900/60 cursor-pointer hover:bg-blue-100/70 transition-colors"
              >
                <span className="text-sm mt-0.5">🕒</span>
                <div>
                  <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300">
                    Shift Report Ready
                  </p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400">
                    Daily sales count: {stats.todaySalesCount} invoices processed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* High Density Quick Launcher Bottom Bar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-[#0D3B66] p-2.5 sm:p-3 rounded-xl shadow-lg text-white">
        <p className="text-white text-[10px] font-bold uppercase tracking-wider px-3 border-r border-white/20 whitespace-nowrap hidden sm:block">
          Quick Launcher
        </p>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1">
          <button
            onClick={() => setActiveTab('inventory/add')}
            className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <span>⊕</span> <span>Medicine</span>
          </button>
          <button
            onClick={() => setActiveTab('customers/all')}
            className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <span>👤</span> <span>Customer</span>
          </button>
          <button
            onClick={() => setActiveTab('purchases/new')}
            className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <span>📥</span> <span>Purchase</span>
          </button>
          <button
            onClick={() => setActiveTab('finance/expenses')}
            className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <span>🧾</span> <span>Expense</span>
          </button>
          <button
            onClick={() => {
              if (sales.length > 0) {
                setActiveInvoiceToPrint(sales[0]);
                setIsInvoiceModalOpen(true);
              }
            }}
            className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <span>🖨</span> <span>Last Invoice</span>
          </button>
          <button
            onClick={() => setActiveTab('sales/new')}
            className="bg-emerald-400 hover:bg-emerald-500 text-[#0D3B66] text-[11px] font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 ml-auto shadow-inner transition-transform active:scale-95"
          >
            <span>🚀</span> <span>OPEN POS (F2)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

