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
  CheckCircle2,
  Printer,
  ShieldAlert,
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
    { label: 'Mon', sales: 18500, height: 45, value: '18.5k' },
    { label: 'Tue', sales: 22400, height: 60, value: '22.4k' },
    { label: 'Wed', sales: 19800, height: 50, value: '19.8k' },
    { label: 'Thu', sales: 28900, height: 75, value: '28.9k' },
    { label: 'Fri', sales: 34200, height: 88, value: '34.2k' },
    { label: 'Sat', sales: 41500, height: 100, value: '41.5k', active: true },
    { label: 'Sun', sales: Math.max(stats.todaySales, 14250), height: 38, value: `${Math.round(Math.max(stats.todaySales, 14250)/1000)}k` },
  ];

  const recentSales = sales.slice(0, 7);

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
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner / Welcome Bar */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-5 md:p-6 text-white shadow-lg shadow-emerald-700/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
            Live Pharmacy Terminal
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
            Pharmacy Control Overview
          </h2>
          <p className="text-xs md:text-sm text-emerald-100/90 mt-1 max-w-xl">
            Real-time sales velocity, medicine stock alerts, and financial reconciliations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('sales/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-black shadow-md transition-all active:scale-95"
          >
            <ShoppingCart className="h-4 w-4 text-emerald-600" />
            <span>New POS Bill (F2)</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory/add')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-md transition-all border border-white/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Today's Sales */}
        <div
          onClick={() => setActiveTab('sales/history')}
          className="group bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Today's Sales
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2 truncate">
            {formatCurrency(stats.todaySales)}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> +12%
            </span>
            <span className="text-[10px] text-slate-400">vs yesterday</span>
          </div>
        </div>

        {/* Today's Profit */}
        <div
          onClick={() => setActiveTab('finance/profit-loss')}
          className="group bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Today's Profit
            </span>
            <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2 truncate">
            {formatCurrency(stats.todayProfit)}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> +8.4%
            </span>
            <span className="text-[10px] text-slate-400">{stats.todaySalesCount} orders</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div
          onClick={() => setActiveTab('inventory/low-stock')}
          className="group bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Low Stock Alert
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-2 truncate">
            {stats.lowStockCount} Items
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full font-bold">
              Restock Needed
            </span>
            <span className="text-[10px] text-slate-400">Below min</span>
          </div>
        </div>

        {/* Expired Quarantine */}
        <div
          onClick={() => setActiveTab('inventory/expired')}
          className="group bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Expired Quarantine
            </span>
            <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-2 truncate">
            {stats.expiredCount < 10 ? `0${stats.expiredCount}` : stats.expiredCount} Batches
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full font-bold">
              Blocked POS
            </span>
            <span className="text-[10px] text-slate-400">Disposal list</span>
          </div>
        </div>

        {/* Inventory Valuation */}
        <div
          onClick={() => setActiveTab('reports/inventory')}
          className="group bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Stock Valuation
            </span>
            <div className="h-8 w-8 rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2 truncate">
            {formatCurrency(stats.totalStockValue)}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] text-cyan-800 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full font-bold">
              {stats.totalMedicinesCount} SKUs
            </span>
            <span className="text-[10px] text-slate-400">Total catalogue</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Sales Ledger & Analytics / Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Sales Ledger (2-Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Sales Activity</h3>
              <p className="text-[11px] text-slate-400">Invoices generated in the current pharmacy session</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => setActiveTab('sales/history')}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[420px] scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-800/90 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 backdrop-blur-sm z-10">
                <tr>
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Medicines & Items</th>
                  <th className="px-4 py-3 text-right">Grand Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Print</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentSales.map((sale) => {
                  const itemsSummary = sale.items.map(i => `${i.medicineName} (x${i.quantity})`).slice(0, 2).join(', ');
                  const remainingCount = sale.items.length > 2 ? ` +${sale.items.length - 2} more` : '';
                  const isUdhaar = sale.paymentMethod === 'Customer Credit (Udhaar)' || sale.paymentStatus === 'UNPAID';
                  const isRefunded = (sale as any).isRefunded;

                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {sale.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {sale.customerName}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                        {itemsSummary}{remainingCount}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(sale.grandTotal)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isRefunded ? (
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-full text-[10px] font-bold">
                            Refunded
                          </span>
                        ) : isUdhaar ? (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-full text-[10px] font-bold">
                            Udhaar Credit
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-[10px] font-bold">
                            Paid Cash
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setActiveInvoiceToPrint(sale);
                            setIsInvoiceModalOpen(true);
                          }}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                          title="Print Thermal Receipt"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Analytics & Critical Alerts */}
        <div className="flex flex-col gap-5">
          {/* Sales Trend Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Weekly Sales Velocity</h3>
                <p className="text-[11px] text-slate-400">Mon - Sun revenue comparison</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                Real-time
              </span>
            </div>

            <div className="flex items-end justify-between h-28 gap-2 pt-2 px-1">
              {weeklyData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full flex items-end justify-center h-full">
                    <div
                      style={{ height: `${d.height}%` }}
                      className={`w-full rounded-xl transition-all duration-300 relative group cursor-pointer ${
                        d.active
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-500 shadow-sm shadow-emerald-500/20'
                          : 'bg-slate-100 hover:bg-emerald-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity whitespace-nowrap z-20">
                        {d.value} PKR
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold ${d.active ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent Pharmacy Alerts */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Pharmacy Alerts</h3>
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[180px] scrollbar-thin">
              {stats.expiredCount > 0 && (
                <div
                  onClick={() => setActiveTab('inventory/expired')}
                  className="flex items-start gap-3 p-3 bg-rose-50/80 dark:bg-rose-950/40 rounded-2xl border border-rose-100 dark:border-rose-900/60 cursor-pointer hover:bg-rose-100 transition-colors"
                >
                  <div className="h-7 w-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      {stats.expiredCount} Medicines Expired
                    </p>
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                      Stock is safely quarantined and locked from sale.
                    </p>
                  </div>
                </div>
              )}

              {stats.lowStockCount > 0 && (
                <div
                  onClick={() => setActiveTab('inventory/low-stock')}
                  className="flex items-start gap-3 p-3 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-100 dark:border-amber-900/60 cursor-pointer hover:bg-amber-100 transition-colors"
                >
                  <div className="h-7 w-7 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Low Stock Warning ({stats.lowStockCount} SKUs)
                    </p>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                      Items have breached re-order thresholds.
                    </p>
                  </div>
                </div>
              )}

              <div
                onClick={() => setActiveTab('sales/history')}
                className="flex items-start gap-3 p-3 bg-teal-50/80 dark:bg-teal-950/40 rounded-2xl border border-teal-100 dark:border-teal-900/60 cursor-pointer hover:bg-teal-100 transition-colors"
              >
                <div className="h-7 w-7 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-teal-900 dark:text-teal-200">
                    Shift Sales Verified
                  </p>
                  <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5">
                    {stats.todaySalesCount} invoices processed without discrepancies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Bar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Actions</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('inventory/add')}
            className="px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200/60 dark:border-slate-700"
          >
            <PlusCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span>New Medicine</span>
          </button>
          <button
            onClick={() => setActiveTab('customers/all')}
            className="px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200/60 dark:border-slate-700"
          >
            <Users className="h-3.5 w-3.5 text-blue-600" />
            <span>Customer Directory</span>
          </button>
          <button
            onClick={() => setActiveTab('purchases/new')}
            className="px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200/60 dark:border-slate-700"
          >
            <Truck className="h-3.5 w-3.5 text-indigo-600" />
            <span>Purchase Order</span>
          </button>
          <button
            onClick={() => setActiveTab('finance/expenses')}
            className="px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200/60 dark:border-slate-700"
          >
            <DollarSign className="h-3.5 w-3.5 text-teal-600" />
            <span>Record Expense</span>
          </button>
          <button
            onClick={() => {
              if (sales.length > 0) {
                setActiveInvoiceToPrint(sales[0]);
                setIsInvoiceModalOpen(true);
              }
            }}
            className="px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200/60 dark:border-slate-700"
          >
            <Printer className="h-3.5 w-3.5 text-slate-600" />
            <span>Reprint Last Bill</span>
          </button>
          <button
            onClick={() => setActiveTab('sales/new')}
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Open POS Terminal (F2)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

