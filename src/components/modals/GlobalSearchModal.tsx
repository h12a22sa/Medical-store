import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Pill,
  Users,
  Building2,
  Receipt,
  Truck,
  ArrowRight,
  Barcode,
  Calendar,
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { formatCurrency, formatDate } from '../../utils/helpers';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    medicines,
    customers,
    suppliers,
    sales,
    purchases,
    setActiveTab,
    setSelectedMedicineId,
    setSelectedInvoiceId,
    setSelectedCustomerId,
    setSelectedSupplierId,
    setActiveInvoiceToPrint,
    setIsInvoiceModalOpen,
  } = usePharmacy();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isGlobalSearchOpen]);

  // Keyboard shortcut Ctrl+K to open, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Search Results Filtering
  const matchedMedicines = trimmed
    ? medicines.filter(
        m =>
          m.name.toLowerCase().includes(trimmed) ||
          m.genericName.toLowerCase().includes(trimmed) ||
          m.barcode.includes(trimmed) ||
          m.sku.toLowerCase().includes(trimmed) ||
          m.batchNumber.toLowerCase().includes(trimmed)
      ).slice(0, 5)
    : [];

  const matchedCustomers = trimmed
    ? customers.filter(
        c =>
          c.name.toLowerCase().includes(trimmed) ||
          c.phone.includes(trimmed) ||
          c.address?.toLowerCase().includes(trimmed)
      ).slice(0, 4)
    : [];

  const matchedSuppliers = trimmed
    ? suppliers.filter(
        s =>
          s.name.toLowerCase().includes(trimmed) ||
          s.companyName.toLowerCase().includes(trimmed) ||
          s.phone.includes(trimmed)
      ).slice(0, 4)
    : [];

  const matchedInvoices = trimmed
    ? sales.filter(
        s =>
          s.invoiceNumber.toLowerCase().includes(trimmed) ||
          s.customerName.toLowerCase().includes(trimmed)
      ).slice(0, 4)
    : [];

  const matchedPurchases = trimmed
    ? purchases.filter(
        p =>
          p.purchaseNumber.toLowerCase().includes(trimmed) ||
          p.supplierInvoiceNumber.toLowerCase().includes(trimmed) ||
          p.supplierName.toLowerCase().includes(trimmed)
      ).slice(0, 4)
    : [];

  const totalResults =
    matchedMedicines.length +
    matchedCustomers.length +
    matchedSuppliers.length +
    matchedInvoices.length +
    matchedPurchases.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-4 pt-16 backdrop-blur-sm">
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <Search className="h-5 w-5 text-emerald-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type medicine name, barcode (e.g. 8964000100112), customer, invoice..."
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="mr-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
          <kbd className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
          {!trimmed ? (
            <div className="py-10 text-center text-xs text-slate-400">
              <Search className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">Quick Global Search</p>
              <p className="mt-1">Try searching for "Panadol", "Brufen", "Haji Rafiq", "GSK", or "INV-"</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              <p className="font-semibold text-slate-600 dark:text-slate-300">No results found for "{query}"</p>
              <p className="mt-1">Check spelling or search by generic name / barcode.</p>
            </div>
          ) : (
            <>
              {/* Medicines Matches */}
              {matchedMedicines.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                    <Pill className="h-3.5 w-3.5" /> Medicines ({matchedMedicines.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedMedicines.map(med => (
                      <div
                        key={med.id}
                        onClick={() => {
                          setSelectedMedicineId(med.id);
                          setActiveTab('inventory/detail');
                          setIsGlobalSearchOpen(false);
                        }}
                        className="flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                            {med.category[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{med.name}</p>
                            <p className="text-[11px] text-slate-500">{med.genericName} • Batch: {med.batchNumber}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(med.retailPrice)}</p>
                          <p className="text-[10px] text-slate-500">Stock: {med.currentStock} {med.unit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices Matches */}
              {matchedInvoices.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5" /> Sales Invoices ({matchedInvoices.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedInvoices.map(inv => (
                      <div
                        key={inv.id}
                        onClick={() => {
                          setActiveInvoiceToPrint(inv);
                          setIsInvoiceModalOpen(true);
                          setIsGlobalSearchOpen(false);
                        }}
                        className="flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</p>
                          <p className="text-[11px] text-slate-500">{inv.customerName} • {formatDate(inv.timestamp)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-emerald-600">{formatCurrency(inv.grandTotal)}</p>
                          <span className="text-[10px] uppercase text-slate-400">{inv.paymentMethod}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Matches */}
              {matchedCustomers.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Customers ({matchedCustomers.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedCustomers.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomerId(c.id);
                          setActiveTab('customers/credit');
                          setIsGlobalSearchOpen(false);
                        }}
                        className="flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-[11px] text-slate-500">{c.phone} • {c.customerType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-rose-600">
                            Udhaar: {formatCurrency(c.outstandingBalance)}
                          </p>
                          <p className="text-[10px] text-slate-400">Total: {formatCurrency(c.totalPurchases)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suppliers Matches */}
              {matchedSuppliers.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Suppliers ({matchedSuppliers.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchedSuppliers.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedSupplierId(s.id);
                          setActiveTab('suppliers/ledger');
                          setIsGlobalSearchOpen(false);
                        }}
                        className="flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</p>
                          <p className="text-[11px] text-slate-500">{s.companyName} • {s.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-amber-600">
                            Payable: {formatCurrency(s.outstandingBalance)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
