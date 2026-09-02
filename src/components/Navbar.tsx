import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Moon,
  Sun,
  Bell,
  ShoppingCart,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronDown,
  Sparkles,
  Plus,
  User,
  LogOut,
  Shield,
  Activity,
  Sliders,
  Pill,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { formatDateTime } from '../utils/helpers';

export const Navbar: React.FC = () => {
  const {
    storeSettings,
    updateStoreSettings,
    currentUser,
    users,
    setCurrentUser,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    setIsMobileDrawerOpen,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    heldBills,
    activeTab,
    setActiveTab,
    setIsGlobalSearchOpen,
    stats,
  } = usePharmacy();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const quickAddRef = useRef<HTMLDivElement>(null);

  // Live Pakistan Standard Time (PST) Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(e.target as Node)) {
        setShowQuickAddMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifs = notifications.filter(n => !n.read);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const toggleTheme = () => {
    const nextTheme = storeSettings.theme === 'dark' ? 'light' : 'dark';
    updateStoreSettings({ theme: nextTheme });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning 👋';
    if (hour < 17) return 'Good Afternoon ☀️';
    return 'Good Evening 🌙';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Left side: Hamburger, Greeting, Mobile Brand */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          id="btn-sidebar-toggle-desktop"
          onClick={() => setIsSidebarCollapsed(prev => !prev)}
          className="hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors md:flex"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          id="btn-sidebar-toggle-mobile"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Brand Logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-sm font-bold text-sm">
            ✚
          </div>
          <div>
            <h1 className="text-xs font-black tracking-tight text-slate-900 dark:text-white truncate max-w-[120px]">
              {storeSettings.storeName}
            </h1>
            <span className="text-[10px] text-emerald-600 font-medium">Pharmacy OS</span>
          </div>
        </div>

        {/* Desktop Welcoming Header */}
        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{getGreeting()}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Welcome back to Awan Medical Store</span>
          </div>
        </div>
      </div>

      {/* Center: Spacious Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden lg:block">
        <div
          onClick={() => setIsGlobalSearchOpen(true)}
          className="group relative flex items-center bg-slate-50 dark:bg-slate-800/80 rounded-2xl px-3.5 py-2 cursor-pointer border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-500/60 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-xs"
        >
          <Search className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
          <span className="text-xs text-slate-400 ml-2.5 truncate flex-1 font-medium">Search medicines, generic, invoices (Ctrl + /)</span>
          <kbd className="text-[10px] bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-600 font-mono shadow-xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side: PST Clock, Quick Add, Notifications, Theme, User Profile, POS CTA */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Clock & Location Pill */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 px-3 py-1.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300">
          <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Islamabad</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>{formattedDate}</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{formattedTime}</span>
        </div>

        {/* Quick Add Floating Trigger */}
        <div className="relative" ref={quickAddRef}>
          <button
            id="btn-quick-add-toggle"
            onClick={() => setShowQuickAddMenu(prev => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            title="Quick Add Action"
          >
            <Plus className="h-4 w-4" />
          </button>

          {showQuickAddMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">Quick Actions</div>
              <button
                onClick={() => {
                  setActiveTab('sales/new');
                  setShowQuickAddMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShoppingCart className="h-3.5 w-3.5" />
                </div>
                <span>New POS Sale (F2)</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('inventory/add');
                  setShowQuickAddMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                  <Pill className="h-3.5 w-3.5" />
                </div>
                <span>Add Medicine</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('purchases/new');
                  setShowQuickAddMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-800 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <span>Purchase Stock In</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('finance/expenses');
                  setShowQuickAddMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-800 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  <Activity className="h-3.5 w-3.5" />
                </div>
                <span>Record Expense</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Toggle */}
        <div className="relative" ref={notifRef}>
          <button
            id="btn-notifications-toggle"
            onClick={() => setShowNotifications(prev => !prev)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            title="System Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs">System Notifications</h3>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {notifications.length} alerts
                  </span>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto py-1 dark:divide-slate-800 scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <CheckCircle2 className="mx-auto mb-1.5 h-6 w-6 text-emerald-500" />
                    All pharmacy alerts cleared!
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.linkTab) {
                          setActiveTab(notif.linkTab);
                          setShowNotifications(false);
                        }
                      }}
                      className={`cursor-pointer py-2.5 px-2 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70 text-xs ${
                        !notif.read ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {notif.type === 'EXPIRED' ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs">
                              ⛔
                            </div>
                          ) : notif.type === 'EXPIRING_SOON' ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                              <AlertTriangle className="h-3.5 w-3.5" />
                            </div>
                          ) : notif.type === 'LOW_STOCK' ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 text-xs">
                              ⚠️
                            </div>
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              <Sparkles className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{notif.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block">{formatDateTime(notif.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <button
          id="btn-theme-toggle"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          title="Toggle light/dark theme"
        >
          {storeSettings.theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600" />
          )}
        </button>

        {/* User Profile Floating Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(prev => !prev)}
            className="flex items-center gap-2 rounded-2xl border border-slate-200/80 p-1 pr-2 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-all"
          >
            <div className="relative">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 font-bold text-xs text-white shadow-xs">
                {currentUser?.name?.slice(0, 2).toUpperCase() || 'ZA'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-none truncate max-w-[100px]">
                {currentUser?.name || 'Zeeshan Awan'}
              </p>
              <p className="text-[9px] text-slate-400 capitalize">{currentUser?.role || 'Admin'}</p>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="border-b border-slate-100 pb-2 mb-2 dark:border-slate-800">
                <p className="font-bold text-xs text-slate-900 dark:text-white">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {currentUser?.role} Role
                </span>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('staff/users');
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Shield className="h-3.5 w-3.5 text-emerald-600" />
                  <span>User & Roles</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('staff/activity');
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Activity className="h-3.5 w-3.5 text-teal-600" />
                  <span>Activity Logs</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('settings/store');
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Sliders className="h-3.5 w-3.5 text-slate-500" />
                  <span>Store Settings</span>
                </button>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 mb-1 font-semibold px-2">Switch Active User</p>
                <div className="space-y-0.5">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowUserMenu(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-[11px] ${
                        currentUser.id === u.id
                          ? 'bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-300'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{u.name}</span>
                      <span className="text-[9px] uppercase font-mono opacity-60">{u.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary CTA (POS Terminal F2) */}
        <button
          id="btn-navbar-pos"
          onClick={() => setActiveTab('sales/new')}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all"
          title="Open POS Terminal (F2)"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">New Sale</span>
          <kbd className="hidden sm:inline-block rounded-md bg-white/20 px-1 py-0.2 text-[9px] font-mono">F2</kbd>
          {heldBills.length > 0 && (
            <span className="rounded-full bg-amber-400 text-slate-900 px-1.5 py-0.2 text-[9px] font-black">
              {heldBills.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
