import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  RotateCcw,
  Pill,
  AlertTriangle,
  Flame,
  Archive,
  Sliders,
  History,
  Users,
  CreditCard,
  Building2,
  Truck,
  TrendingUp,
  DollarSign,
  FileText,
  ShieldCheck,
  Activity,
  Barcode,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Layers,
  Clock,
  Package,
  PlusCircle,
  ArrowDownToLine,
  Boxes,
  Calculator,
  UserCheck,
  Database,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeColor?: string;
  shortcut?: string;
  subItems?: {
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    heldBills,
    stats,
    storeSettings,
  } = usePharmacy();

  // Keep track of which parent menus are expanded
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    sales: true,
    inventory: true,
    customers: false,
    purchases: false,
    finance: false,
    tools: false,
    staff: false,
    settings: false,
  });

  // Automatically expand parent menu if active tab changes to one of its children
  useEffect(() => {
    const parentId = activeTab.split('/')[0];
    if (parentId) {
      setExpandedMenus(prev => ({ ...prev, [parentId]: true }));
    }
  }, [activeTab]);

  const toggleExpand = (menuId: string) => {
    setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      shortcut: '⌘1',
    },
    {
      id: 'sales',
      label: 'Sales & POS',
      icon: <ShoppingCart className="h-4 w-4" />,
      badge: heldBills.length > 0 ? `${heldBills.length} held` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      subItems: [
        { id: 'sales/new', label: 'POS Terminal (New Sale)', icon: <PlusCircle className="h-3.5 w-3.5 text-emerald-500" /> },
        { id: 'sales/history', label: 'All Sales Invoices', icon: <Receipt className="h-3.5 w-3.5" /> },
        { id: 'sales/returns', label: 'Sales Returns & Refund', icon: <RotateCcw className="h-3.5 w-3.5 text-amber-500" /> },
        {
          id: 'sales/held',
          label: 'Held Bills Queue',
          icon: <Clock className="h-3.5 w-3.5" />,
          badge: heldBills.length || undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
      ],
    },
    {
      id: 'inventory',
      label: 'Medicine Inventory',
      icon: <Pill className="h-4 w-4" />,
      badge: (stats.expiredCount + stats.lowStockCount) > 0 ? `${stats.expiredCount + stats.lowStockCount} alerts` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
      shortcut: '⌘2',
      subItems: [
        { id: 'inventory/all', label: 'All Medicines (List)', icon: <Boxes className="h-3.5 w-3.5" /> },
        { id: 'inventory/add', label: 'Add New Medicine', icon: <PlusCircle className="h-3.5 w-3.5 text-emerald-500" /> },
        { id: 'inventory/categories', label: 'Categories & Dosage', icon: <Layers className="h-3.5 w-3.5" /> },
        {
          id: 'inventory/low-stock',
          label: 'Low Stock Alert',
          icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />,
          badge: stats.lowStockCount || undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
        {
          id: 'inventory/expiring-soon',
          label: 'Expiring Soon (<45d)',
          icon: <Flame className="h-3.5 w-3.5 text-orange-500" />,
          badge: stats.expiringSoonCount || undefined,
          badgeColor: 'bg-orange-500 text-white',
        },
        {
          id: 'inventory/expired',
          label: 'Expired Medicines',
          icon: <span className="text-xs">⛔</span>,
          badge: stats.expiredCount || undefined,
          badgeColor: 'bg-rose-600 text-white',
        },
        { id: 'inventory/adjustments', label: 'Stock Adjustments', icon: <Sliders className="h-3.5 w-3.5" /> },
        { id: 'inventory/movements', label: 'Stock Audit Movements', icon: <History className="h-3.5 w-3.5" /> },
      ],
    },
    {
      id: 'purchases',
      label: 'Purchases & Stock In',
      icon: <Truck className="h-4 w-4" />,
      subItems: [
        { id: 'purchases/new', label: 'New Purchase Order', icon: <PlusCircle className="h-3.5 w-3.5 text-emerald-500" /> },
        { id: 'purchases/history', label: 'Purchase History', icon: <ArrowDownToLine className="h-3.5 w-3.5" /> },
        { id: 'purchases/returns', label: 'Supplier Returns', icon: <RotateCcw className="h-3.5 w-3.5" /> },
      ],
    },
    {
      id: 'customers',
      label: 'Customers & Udhaar',
      icon: <Users className="h-4 w-4" />,
      badge: stats.totalPendingUdhaar > 0 ? `Rs.${Math.round(stats.totalPendingUdhaar / 1000)}k` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      shortcut: '⌘3',
      subItems: [
        { id: 'customers/all', label: 'All Customers Directory', icon: <Users className="h-3.5 w-3.5" /> },
        { id: 'customers/credit', label: 'Credit / Udhaar Ledger', icon: <CreditCard className="h-3.5 w-3.5 text-rose-500" /> },
        { id: 'customers/payments', label: 'Payment Receipts', icon: <DollarSign className="h-3.5 w-3.5" /> },
      ],
    },
    {
      id: 'suppliers',
      label: 'Suppliers & Vendors',
      icon: <Building2 className="h-4 w-4" />,
      subItems: [
        { id: 'suppliers/all', label: 'All Suppliers (Distributors)', icon: <Building2 className="h-3.5 w-3.5" /> },
        { id: 'suppliers/ledger', label: 'Supplier Ledger & Payables', icon: <FileText className="h-3.5 w-3.5" /> },
      ],
    },
    {
      id: 'finance',
      label: 'Finance & Expenses',
      icon: <DollarSign className="h-4 w-4" />,
      subItems: [
        { id: 'finance/expenses', label: 'Pharmacy Expenses', icon: <Receipt className="h-3.5 w-3.5 text-rose-500" /> },
        { id: 'finance/profit-loss', label: 'Profit & Loss Statement', icon: <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> },
      ],
    },
    {
      id: 'reports',
      label: 'Analytics & Reports',
      icon: <FileText className="h-4 w-4" />,
      subItems: [
        { id: 'reports/sales', label: 'Sales Reports' },
        { id: 'reports/purchases', label: 'Purchase Reports' },
        { id: 'reports/inventory', label: 'Inventory Valuation' },
        { id: 'reports/profit', label: 'Gross & Net Profit Reports' },
        { id: 'reports/expiry', label: 'Expiry Risk Forecast' },
      ],
    },
    {
      id: 'tools',
      label: 'Pharmacy Tools',
      icon: <Calculator className="h-4 w-4" />,
      subItems: [
        { id: 'tools/calculator', label: 'Smart Basic Calculator', icon: <Calculator className="h-3.5 w-3.5" /> },
        { id: 'tools/discount', label: 'Discount & Margin Calc' },
        { id: 'tools/stock-units', label: 'Box to Tablet Converter' },
        { id: 'tools/expiry-calc', label: 'Shelf Life & Date Difference' },
      ],
    },
    {
      id: 'staff',
      label: 'Staff & Audit Logs',
      icon: <ShieldCheck className="h-4 w-4" />,
      subItems: [
        { id: 'staff/users', label: 'Users & Roles (RBAC)', icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> },
        { id: 'staff/activity', label: 'Live Activity Audit Logs', icon: <Activity className="h-3.5 w-3.5" /> },
      ],
    },
    {
      id: 'settings',
      label: 'Store Settings',
      icon: <Settings className="h-4 w-4" />,
      subItems: [
        { id: 'settings/store', label: 'Store Profile & License' },
        { id: 'settings/billing', label: 'Billing & Receipt Config' },
        { id: 'settings/backup', label: 'Backup, Restore & Reset', icon: <Database className="h-3.5 w-3.5 text-teal-500" /> },
      ],
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 dark:bg-slate-900 dark:border-slate-800 z-20 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header Brand */}
      <div className="flex h-16 items-center px-4 border-b border-slate-100 dark:border-slate-800">
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer w-full group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <span className="font-black text-lg leading-none tracking-tighter">✚</span>
          </div>

          {!isSidebarCollapsed && (
            <div className="flex-1 overflow-hidden">
              <h1 className="text-xs font-black text-slate-900 dark:text-white tracking-tight uppercase truncate">
                {storeSettings.storeName || 'Awan Medical'}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide">
                  Pharmacy OS
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links with Nested Accordions */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-thin">
        {!isSidebarCollapsed && (
          <div className="px-2 mb-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Navigation Menu
          </div>
        )}

        <div className="space-y-1">
          {navItems.map(item => {
            const isItemActive = activeTab === item.id || activeTab.startsWith(`${item.id}/`);
            const isExpanded = expandedMenus[item.id];
            const hasSubItems = item.subItems && item.subItems.length > 0;

            if (isSidebarCollapsed) {
              return (
                <button
                  key={item.id}
                  id={`sidebar-item-${item.id}`}
                  onClick={() => {
                    if (hasSubItems) {
                      setActiveTab(item.subItems![0].id);
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  title={item.label}
                  className={`flex w-full items-center justify-center rounded-2xl p-3 text-xs transition-all my-0.5 ${
                    isItemActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold shadow-xs'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span className={isItemActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                </button>
              );
            }

            return (
              <div key={item.id} className="space-y-0.5">
                <button
                  id={`sidebar-parent-${item.id}`}
                  onClick={() => {
                    if (hasSubItems) {
                      toggleExpand(item.id);
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`group flex w-full items-center justify-between rounded-2xl px-3 py-2 text-xs font-semibold transition-all ${
                    isItemActive && !hasSubItems
                      ? 'bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950/40 dark:text-emerald-300 shadow-xs'
                      : isItemActive
                      ? 'bg-slate-50 text-slate-900 font-bold dark:bg-slate-800/60 dark:text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className={`shrink-0 transition-colors ${
                      isItemActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.badgeColor || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {hasSubItems && (
                      <span className="text-slate-400 transition-transform duration-200">
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </span>
                    )}
                  </div>
                </button>

                {/* Sub-items accordion */}
                {hasSubItems && isExpanded && (
                  <div className="ml-4 pl-3 border-l-2 border-slate-100 dark:border-slate-800 space-y-0.5 py-1">
                    {item.subItems!.map(sub => {
                      const isSubActive = activeTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          id={`sidebar-subitem-${sub.id.replace('/', '-')}`}
                          onClick={() => setActiveTab(sub.id)}
                          className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-colors ${
                            isSubActive
                              ? 'bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {sub.icon || <span className="opacity-40 text-xs">•</span>}
                            <span className="truncate">{sub.label}</span>
                          </div>
                          {sub.badge !== undefined && (
                            <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold">
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Sidebar Footer System Status */}
      {!isSidebarCollapsed ? (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 p-3 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">System Ready</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">2026 v2.4</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
              Awan Medical DB synced • Offline-First active
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex justify-center">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" title="System Ready" />
        </div>
      )}
    </aside>
  );
};
