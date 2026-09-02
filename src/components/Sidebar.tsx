import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Pill,
  Truck,
  Users,
  Building2,
  DollarSign,
  BarChart3,
  Calculator,
  UserCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  Clock,
  RotateCcw,
  Layers,
  AlertTriangle,
  Flame,
  Boxes,
  ArrowDownToLine,
  History,
  CreditCard,
  Receipt,
  FileText,
  Calendar,
  Sparkles,
  ShieldCheck,
  Sliders,
  Database,
  HelpCircle,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeColor?: string;
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
      badge: stats.totalPendingUdhaar > 0 ? `Rs.${Math.round(stats.totalPendingUdhaar)}` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
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
        { id: 'finance/profit-loss', label: 'Profit & Loss Statement', icon: <BarChart3 className="h-3.5 w-3.5 text-emerald-500" /> },
      ],
    },
    {
      id: 'reports',
      label: 'Analytics & Reports',
      icon: <BarChart3 className="h-4 w-4" />,
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
      icon: <UserCheck className="h-4 w-4" />,
      subItems: [
        { id: 'staff/users', label: 'Users & Roles (RBAC)', icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> },
        { id: 'staff/activity', label: 'Live Activity Audit Logs', icon: <History className="h-3.5 w-3.5" /> },
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
      className={`hidden md:flex flex-col bg-[#0D3B66] text-white transition-all duration-300 dark:bg-[#08223d] shadow-xl z-20 ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header Brand */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="bg-white rounded p-1.5 flex items-center justify-center shrink-0 shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D3B66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5L12 21l7-7z"></path>
          </svg>
        </div>
        {!isSidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm leading-tight uppercase tracking-wider text-white truncate">
              {storeSettings.storeName || 'Awan Medical'}
            </h1>
            <p className="text-[10px] text-white/60 font-mono tracking-tight">Pharmacy OS v2.0</p>
          </div>
        )}
      </div>

      {/* Navigation Links with Nested Accordions */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {!isSidebarCollapsed && (
          <div className="px-4 mb-1.5 text-[10px] uppercase font-semibold text-white/40 tracking-widest">
            Main Console
          </div>
        )}

        <div className="space-y-0.5 px-2">
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
                  className={`flex w-full items-center justify-center rounded-lg p-2.5 text-xs transition-all my-0.5 ${
                    isItemActive
                      ? 'bg-white/15 text-white border-l-4 border-emerald-400 font-bold'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.icon}
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
                  className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                    isItemActive && !hasSubItems
                      ? 'bg-white/15 border-l-4 border-emerald-400 text-white font-bold'
                      : isItemActive
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isItemActive ? 'text-emerald-400' : 'text-white/60'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span className="rounded-full bg-emerald-500 text-white px-1.5 py-0.2 text-[9px] font-bold">
                        {item.badge}
                      </span>
                    )}
                    {hasSubItems && (
                      <span className="text-white/40 transition-transform duration-200">
                        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      </span>
                    )}
                  </div>
                </button>

                {/* Sub-items accordion */}
                {hasSubItems && isExpanded && (
                  <div className="ml-3 pl-2 border-l border-white/10 space-y-0.5 py-0.5">
                    {item.subItems!.map(sub => {
                      const isSubActive = activeTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          id={`sidebar-subitem-${sub.id.replace('/', '-')}`}
                          onClick={() => setActiveTab(sub.id)}
                          className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-[11px] font-normal transition-colors ${
                            isSubActive
                              ? 'bg-white/15 text-white font-bold border-l-2 border-emerald-400'
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {sub.icon || <span className="opacity-40">•</span>}
                            <span className="truncate">{sub.label}</span>
                          </div>
                          {sub.badge !== undefined && (
                            <span className="rounded-full bg-emerald-500/80 text-white px-1.5 py-0.2 text-[8px] font-bold">
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

      {/* Sidebar Footer Mini Profile / Status */}
      {!isSidebarCollapsed ? (
        <div className="p-3 bg-black/20 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm">
              ZA
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-medium text-white truncate leading-tight">Zeeshan Awan</p>
              <p className="text-[9px] text-white/50 uppercase font-mono truncate">Administrator</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 bg-black/20 border-t border-white/10 flex justify-center">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-[10px] text-white">
            ZA
          </div>
        </div>
      )}
    </aside>
  );
};
