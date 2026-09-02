import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  Pill,
  DollarSign,
  Package,
  Flame,
  FileSpreadsheet,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { formatCurrency, formatDate, getExpiryStatus } from '../utils/helpers';

export const ReportsView: React.FC = () => {
  const {
    sales,
    purchases,
    medicines,
    expenses,
    stats,
  } = usePharmacy();

  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'inventory' | 'expiry' | 'profit'>('sales');

  // Category sales volume analysis
  const categorySales: Record<string, { count: number; revenue: number }> = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const med = medicines.find(m => m.id === item.medicineId);
      const cat = med ? med.category : 'General';
      if (!categorySales[cat]) {
        categorySales[cat] = { count: 0, revenue: 0 };
      }
      categorySales[cat].count += item.quantity;
      categorySales[cat].revenue += item.totalPrice;
    });
  });

  const categoryList = Object.entries(categorySales).map(([cat, data]) => ({
    category: cat,
    ...data,
  })).sort((a, b) => b.revenue - a.revenue);

  // Expiry risk analysis
  const expiredList = medicines.filter(m => getExpiryStatus(m.expiryDate).status === 'EXPIRED');
  const criticalList = medicines.filter(m => getExpiryStatus(m.expiryDate).status === 'CRITICAL');
  const warningList = medicines.filter(m => getExpiryStatus(m.expiryDate).status === 'WARNING');

  const totalExpiredValue = expiredList.reduce((acc, m) => acc + (m.currentStock * m.purchasePrice), 0);
  const totalCriticalValue = criticalList.reduce((acc, m) => acc + (m.currentStock * m.purchasePrice), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 font-bold">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Executive Pharmacy Analytics & Reports
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data insights on revenue trends, stock valuation, inventory turn ratios, and shelf expiry risk forecasts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveReportTab('sales')}
          className={`rounded-xl px-4 py-2 transition-all ${
            activeReportTab === 'sales'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Sales & Category Volume
        </button>
        <button
          onClick={() => setActiveReportTab('inventory')}
          className={`rounded-xl px-4 py-2 transition-all ${
            activeReportTab === 'inventory'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Inventory Valuation & Stock Cost
        </button>
        <button
          onClick={() => setActiveReportTab('expiry')}
          className={`rounded-xl px-4 py-2 transition-all ${
            activeReportTab === 'expiry'
              ? 'bg-white text-rose-700 shadow-sm dark:bg-slate-700 dark:text-rose-300'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Expiry Risk & Loss Forecast
        </button>
      </div>

      {activeReportTab === 'sales' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Category Volume Breakdown */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Revenue by Drug Category</h3>
            <div className="space-y-3">
              {categoryList.map(cat => {
                const maxRev = categoryList[0]?.revenue || 1;
                const percentage = (cat.revenue / maxRev) * 100;
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">{cat.category}</span>
                      <span className="font-mono text-emerald-600 font-bold">{formatCurrency(cat.revenue)} ({cat.count} units)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className="h-full rounded-full bg-emerald-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Payment Method Distribution</h3>
            <div className="space-y-3">
              {['CASH', 'EASYPAISA', 'JAZZCASH', 'CARD', 'UDHAAR'].map(pm => {
                const total = sales.filter(s => s.paymentMethod === pm).reduce((acc, s) => acc + s.grandTotal, 0);
                const count = sales.filter(s => s.paymentMethod === pm).length;
                return (
                  <div key={pm} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/50">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase">{pm}</h4>
                      <p className="text-[10px] text-slate-500">{count} Invoices processed</p>
                    </div>
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {formatCurrency(total)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Purchase Valuation</span>
              <p className="mt-2 text-xl font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(stats.totalStockValue)}
              </p>
              <div className="mt-1 text-[11px] text-slate-500">At distributor wholesale cost</div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Retail Valuation</span>
              <p className="mt-2 text-xl font-black text-emerald-600 font-mono">
                {formatCurrency(medicines.reduce((acc, m) => acc + (m.currentStock * m.retailPrice), 0))}
              </p>
              <div className="mt-1 text-[11px] text-slate-500">Expected counter retail value</div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Unrealized Gross Margin</span>
              <p className="mt-2 text-xl font-black text-teal-600 font-mono">
                {formatCurrency(
                  medicines.reduce((acc, m) => acc + (m.currentStock * (m.retailPrice - m.purchasePrice)), 0)
                )}
              </p>
              <div className="mt-1 text-[11px] text-slate-500">Potential store profit in inventory</div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Top 10 High Value Stock Formulations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                    <th className="py-2.5 px-3">Medicine</th>
                    <th className="py-2.5 px-3">Batch</th>
                    <th className="py-2.5 px-3 text-center">Stock</th>
                    <th className="py-2.5 px-3 text-right">Cost Rate</th>
                    <th className="py-2.5 px-3 text-right">Retail Rate</th>
                    <th className="py-2.5 px-3 text-right">Total Inventory Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {medicines
                    .map(m => ({ ...m, totalVal: m.currentStock * m.purchasePrice }))
                    .sort((a, b) => b.totalVal - a.totalVal)
                    .slice(0, 10)
                    .map(m => (
                      <tr key={m.id}>
                        <td className="py-2.5 px-3 font-bold">{m.name}</td>
                        <td className="py-2.5 px-3 font-mono">{m.batchNumber}</td>
                        <td className="py-2.5 px-3 text-center font-bold">{m.currentStock} {m.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(m.purchasePrice)}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(m.retailPrice)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(m.totalVal)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'expiry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm dark:border-rose-900 dark:bg-rose-950/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Total Expired Loss Value</span>
              <p className="mt-2 text-xl font-black text-rose-700 dark:text-rose-300 font-mono">
                {formatCurrency(totalExpiredValue)}
              </p>
              <div className="mt-1 text-[11px] text-rose-600">{expiredList.length} Batches already expired</div>
            </div>

            <div className="rounded-3xl border border-orange-200 bg-orange-50/40 p-5 shadow-sm dark:border-orange-900 dark:bg-orange-950/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">Near-Expiry Risk Value (&lt;45d)</span>
              <p className="mt-2 text-xl font-black text-orange-700 dark:text-orange-300 font-mono">
                {formatCurrency(totalCriticalValue)}
              </p>
              <div className="mt-1 text-[11px] text-orange-600">{criticalList.length} Batches need urgent return/discount sale</div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Expiry Action Roster</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                    <th className="py-2.5 px-3">Medicine</th>
                    <th className="py-2.5 px-3">Batch & Rack</th>
                    <th className="py-2.5 px-3">Expiry Date</th>
                    <th className="py-2.5 px-3 text-center">Stock</th>
                    <th className="py-2.5 px-3 text-right">Wholesale Loss Exposure</th>
                    <th className="py-2.5 px-3">Action Advice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[...expiredList, ...criticalList].map(m => {
                    const expiry = getExpiryStatus(m.expiryDate);
                    return (
                      <tr key={m.id}>
                        <td className="py-2.5 px-3 font-bold">{m.name}</td>
                        <td className="py-2.5 px-3 font-mono">{m.batchNumber} (Rack {m.rackLocation})</td>
                        <td className="py-2.5 px-3 font-bold text-rose-600">{formatDate(m.expiryDate)}</td>
                        <td className="py-2.5 px-3 text-center font-bold">{m.currentStock} {m.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                          {formatCurrency(m.currentStock * m.purchasePrice)}
                        </td>
                        <td className="py-2.5 px-3">
                          {expiry.status === 'EXPIRED' ? (
                            <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                              Quarantine for Supplier Credit Return
                            </span>
                          ) : (
                            <span className="rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                              Apply 15% Clearance or Fast Dispense
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
