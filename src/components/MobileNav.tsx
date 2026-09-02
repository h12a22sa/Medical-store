import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Pill,
  Receipt,
  MoreHorizontal,
  X,
  PlusCircle,
  Truck,
  Users,
  Building2,
  DollarSign,
  BarChart3,
  Calculator,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';

export const MobileNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    heldBills,
    stats,
    storeSettings,
  } = usePharmacy();

  const mainTabs = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'sales/new', label: 'POS', icon: <ShoppingCart className="h-5 w-5" />, highlight: true },
    { id: 'inventory/all', label: 'Medicines', icon: <Pill className="h-5 w-5" /> },
    { id: 'sales/history', label: 'Sales', icon: <Receipt className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Mobile Bottom Dock (Fixed at bottom on screens < md) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 pb-safe backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
        {mainTabs.map(tab => {
          const isActive = activeTab === tab.id || (tab.id === 'inventory/all' && activeTab.startsWith('inventory/'));
          if (tab.highlight) {
            return (
              <button
                key={tab.id}
                id={`mobile-nav-${tab.id.replace('/', '-')}`}
                onClick={() => setActiveTab(tab.id)}
                className="relative -top-4 flex h-12 w-12 flex-col items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/40 active:scale-95"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="text-[9px] font-bold">POS</span>
                {heldBills.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white ring-2 ring-white">
                    {heldBills.length}
                  </span>
                )}
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              id={`mobile-nav-${tab.id.replace('/', '-')}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-1 text-xs transition-colors ${
                isActive
                  ? 'font-bold text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {tab.icon}
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}

        {/* More Drawer Trigger */}
        <button
          id="mobile-nav-more"
          onClick={() => setIsMobileDrawerOpen(true)}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-1 text-xs transition-colors ${
            isMobileDrawerOpen ? 'text-emerald-600' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>

      {/* Mobile Drawer (Full Menu Slide-over) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/60 backdrop-blur-sm md:hidden">
          <div className="relative flex h-full w-4/5 max-w-sm flex-col bg-white p-4 shadow-2xl dark:bg-slate-900 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white">
                  ✚
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{storeSettings.storeName}</h3>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Navigation Menu</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Core Modules</div>
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LayoutDashboard className="h-4 w-4 text-emerald-500" /> Dashboard
              </button>
              <button
                onClick={() => setActiveTab('sales/new')}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-4 w-4 text-emerald-600" /> POS Billing Terminal
                </div>
                <span className="rounded bg-emerald-200 px-1.5 py-0.5 text-[9px] font-bold text-emerald-900">F2</span>
              </button>
              <button
                onClick={() => setActiveTab('inventory/all')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Pill className="h-4 w-4 text-teal-500" /> Medicine Inventory
              </button>
              <button
                onClick={() => setActiveTab('inventory/low-stock')}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-amber-500">⚠️</span> Low Stock Alerts
                </div>
                {stats.lowStockCount > 0 && (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {stats.lowStockCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('inventory/expired')}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-rose-500">⛔</span> Expired Medicines
                </div>
                {stats.expiredCount > 0 && (
                  <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    {stats.expiredCount}
                  </span>
                )}
              </button>

              <div className="pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Management</div>

              <button
                onClick={() => setActiveTab('purchases/new')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Truck className="h-4 w-4 text-indigo-500" /> Purchases & Orders
              </button>
              <button
                onClick={() => setActiveTab('customers/credit')}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-blue-500" /> Customer Udhaar / Credit
                </div>
                {stats.totalPendingUdhaar > 0 && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                    Rs.{Math.round(stats.totalPendingUdhaar)}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('suppliers/all')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Building2 className="h-4 w-4 text-purple-500" /> Suppliers & Distributors
              </button>
              <button
                onClick={() => setActiveTab('finance/expenses')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <DollarSign className="h-4 w-4 text-emerald-500" /> Expenses & P&L
              </button>
              <button
                onClick={() => setActiveTab('reports/sales')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <BarChart3 className="h-4 w-4 text-orange-500" /> Reports & Analytics
              </button>
              <button
                onClick={() => setActiveTab('tools/calculator')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Calculator className="h-4 w-4 text-cyan-500" /> Pharmacy Tools & Calculators
              </button>
              <button
                onClick={() => setActiveTab('staff/users')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ShieldCheck className="h-4 w-4 text-slate-500" /> Staff & Audit Logs
              </button>
              <button
                onClick={() => setActiveTab('settings/store')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Settings className="h-4 w-4 text-slate-500" /> Store Settings & Backup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
