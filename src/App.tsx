import React, { useEffect } from 'react';
import { PharmacyProvider, usePharmacy } from './context/PharmacyContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';

// Modals
import { InvoiceModal } from './components/modals/InvoiceModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { BarcodeScannerModal } from './components/modals/BarcodeScannerModal';

// Views
import { DashboardView } from './pages/DashboardView';
import { PosTerminalView } from './pages/PosTerminalView';
import { InventoryView } from './pages/InventoryView';
import { SalesHistoryView } from './pages/SalesHistoryView';
import { PurchasesView } from './pages/PurchasesView';
import { CustomersView } from './pages/CustomersView';
import { SuppliersView } from './pages/SuppliersView';
import { FinanceView } from './pages/FinanceView';
import { ReportsView } from './pages/ReportsView';
import { ToolsView } from './pages/ToolsView';
import { StaffView } from './pages/StaffView';
import { SettingsView } from './pages/SettingsView';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    isInvoiceModalOpen,
    setIsInvoiceModalOpen,
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    isBarcodeModalOpen,
    setIsBarcodeModalOpen,
  } = usePharmacy();

  // Keyboard shortcut listener (F2 -> POS, F3 -> Inventory, Shift+S / Cmd+K -> Search, Esc -> Close Modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('pos');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('inventory');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, setIsGlobalSearchOpen]);

  // View dispatcher
  const renderCurrentView = () => {
    if (activeTab === 'dashboard' || activeTab === '') {
      return <DashboardView />;
    }
    if (activeTab === 'pos' || activeTab.startsWith('sales/new') || activeTab.startsWith('sales/pos')) {
      return <PosTerminalView />;
    }
    if (activeTab.startsWith('inventory/low-stock') || activeTab === 'low-stock') {
      return <InventoryView filterPreset="low-stock" />;
    }
    if (activeTab.startsWith('inventory/expired') || activeTab.startsWith('inventory/expiring-soon') || activeTab === 'expiry-alerts') {
      return <InventoryView filterPreset="expiry" />;
    }
    if (activeTab.startsWith('inventory')) {
      return <InventoryView />;
    }
    if (activeTab.startsWith('sales')) {
      return <SalesHistoryView />;
    }
    if (activeTab.startsWith('purchases')) {
      return <PurchasesView />;
    }
    if (activeTab === 'customers/credit' || activeTab === 'udhaar-ledger') {
      return <CustomersView creditMode={true} />;
    }
    if (activeTab.startsWith('customers')) {
      return <CustomersView />;
    }
    if (activeTab.startsWith('suppliers')) {
      return <SuppliersView />;
    }
    if (activeTab.startsWith('finance') || activeTab.startsWith('expenses')) {
      return <FinanceView />;
    }
    if (activeTab.startsWith('reports')) {
      return <ReportsView />;
    }
    if (activeTab.startsWith('tools') || activeTab.startsWith('calc')) {
      return <ToolsView />;
    }
    if (activeTab.startsWith('staff') || activeTab.startsWith('audit')) {
      return <StaffView />;
    }
    if (activeTab.startsWith('settings') || activeTab.startsWith('backup')) {
      return <SettingsView />;
    }
    return <DashboardView />;
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 selection:bg-emerald-500 selection:text-white dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar />

      {/* Main App Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <Sidebar />

        {/* Content View Container */}
        <main
          className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6 pb-20 md:pb-6 transition-all duration-300 scrollbar-thin"
        >
          <div className="w-full">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Mobile Touch Navigation */}
      <MobileNav />

      {/* Global Modals */}
      {isInvoiceModalOpen && <InvoiceModal />}
      {isGlobalSearchOpen && <GlobalSearchModal />}
      {isBarcodeModalOpen && <BarcodeScannerModal />}
    </div>
  );
};

export default function App() {
  return (
    <PharmacyProvider>
      <MainLayout />
    </PharmacyProvider>
  );
}
