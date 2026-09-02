import React, { useState, useEffect } from 'react';
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
    setActiveTab,
    setIsGlobalSearchOpen,
    stats,
  } = usePharmacy();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Live Pakistan Standard Time (PST) Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
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
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const toggleTheme = () => {
    const nextTheme = storeSettings.theme === 'dark' ? 'light' : 'dark';
    updateStoreSettings({ theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 transition-colors dark:border-slate-800 dark:bg-slate-900 sm:px-6">
      {/* Left side: Hamburger & Store Brand on Mobile */}
      <div className="flex items-center gap-3">
        <button
          id="btn-sidebar-toggle-desktop"
          onClick={() => setIsSidebarCollapsed(prev => !prev)}
          className="hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 md:flex"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <Menu className="h-4 w-4" />
        </button>

        <button
          id="btn-sidebar-toggle-mobile"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <div className="bg-[#0D3B66] text-white rounded p-1 flex items-center justify-center font-bold text-xs">
            ✚
          </div>
          <h1 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-[120px]">
            {storeSettings.storeName}
          </h1>
        </div>

        {/* Global Search Bar (High Density pattern) */}
        <div
          onClick={() => setIsGlobalSearchOpen(true)}
          className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg px-3 py-1.5 w-72 md:w-96 cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 ml-2 truncate flex-1">Search medicine, invoice, customer (Ctrl + /)</span>
          <kbd className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side: PST Clock, Notification, Theme, POS CTA Button */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* City & Live Clock Widget */}
        <div className="hidden lg:block text-right">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-none">Islamabad, PK</p>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
            {formattedDate} • <span className="font-mono font-bold text-[#0D3B66] dark:text-emerald-400">{formattedTime}</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 border-l pl-3 sm:pl-5 border-slate-200 dark:border-slate-800">
          {/* Notifications Toggle */}
          <div className="relative">
            <button
              id="btn-notifications-toggle"
              onClick={() => setShowNotifications(prev => !prev)}
              className="relative p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs">System Alerts</h3>
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {notifications.length}
                    </span>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto py-1 dark:divide-slate-800 scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="py-5 text-center text-xs text-slate-400">
                      <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-emerald-500" />
                      All systems operational!
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
                        className={`cursor-pointer py-2 px-1.5 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70 text-xs ${
                          !notif.read ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">
                            {notif.type === 'EXPIRED' ? (
                              <span className="text-xs">⛔</span>
                            ) : notif.type === 'EXPIRING_SOON' ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            ) : notif.type === 'LOW_STOCK' ? (
                              <span className="text-xs">⚠️</span>
                            ) : (
                              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{notif.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{notif.message}</p>
                            <span className="text-[9px] text-slate-400">{formatDateTime(notif.timestamp)}</span>
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
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {storeSettings.theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>

          {/* High Density Primary CTA (NEW SALE F2) */}
          <button
            id="btn-navbar-pos"
            onClick={() => setActiveTab('sales/new')}
            className="ml-1 bg-[#0D3B66] hover:bg-[#092b4a] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm active:scale-95 transition-transform flex items-center gap-1.5"
            title="Open POS Terminal (F2)"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>NEW SALE (F2)</span>
            {heldBills.length > 0 && (
              <span className="ml-1 rounded-full bg-amber-400 text-slate-900 px-1 py-0.2 text-[9px] font-extrabold">
                {heldBills.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
