import React, { useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  Phone,
  Mail,
  DollarSign,
  FileText,
  MapPin,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { Supplier, SupplierPayment } from '../types';
import { formatCurrency, formatDateTime } from '../utils/helpers';

export const SuppliersView: React.FC = () => {
  const {
    suppliers,
    addSupplier,
    recordSupplierPayment,
    supplierPayments,
  } = usePharmacy();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'payments'>('all');

  // Modals
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSupplierForPay, setSelectedSupplierForPay] = useState<Supplier | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CHEQUE'>('BANK_TRANSFER');
  const [payNotes, setPayNotes] = useState('');

  // Add Supplier form
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ntn, setNtn] = useState('');

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery)
  );

  const handleOpenPay = (s: Supplier) => {
    setSelectedSupplierForPay(s);
    setPayAmount(s.outstandingBalance);
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPay || payAmount <= 0) return;

    recordSupplierPayment({
      supplierId: selectedSupplierForPay.id,
      supplierName: selectedSupplierForPay.name,
      amount: payAmount,
      paymentMethod: payMethod,
      notes: payNotes || undefined,
    });

    setShowPaymentModal(false);
    setSelectedSupplierForPay(null);
    setPayAmount(0);
    setPayNotes('');
    alert('Supplier payment logged! Outstanding balance updated.');
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !companyName || !phone) return;

    addSupplier({
      name,
      companyName,
      phone,
      email: email || undefined,
      address: address || undefined,
      ntnNumber: ntn || undefined,
      outstandingBalance: 0,
    });

    setShowAddSupplierModal(false);
    setName('');
    setCompanyName('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 font-bold">
              <Building2 className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Suppliers & Pharmaceutical Distributors
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage medicine distributor accounts, purchase bills, and outgoing payment ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Suppliers ({suppliers.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === 'payments'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Payment History ({supplierPayments.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddSupplierModal(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {activeTab === 'all' ? (
        <>
          {/* Search bar */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by supplier name, company (e.g. GSK, Abbott, Martin Dow)..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Suppliers Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSuppliers.map(s => (
              <div
                key={s.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:border-emerald-500 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Distributor
                      </span>
                      <h3 className="mt-1.5 font-bold text-sm text-slate-900 dark:text-white">{s.companyName}</h3>
                      <p className="text-xs text-slate-500 font-medium">Rep: {s.name}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold">
                      {s.companyName[0]}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{s.phone}</span>
                    </div>
                    {s.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>{s.email}</span>
                      </div>
                    )}
                    {s.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">{s.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Payable Due</span>
                    <p className={`font-mono font-black text-sm ${s.outstandingBalance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                      {formatCurrency(s.outstandingBalance)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenPay(s)}
                    className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-600 transition-all"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Pay Bill</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Payments Table */
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Payment #</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Date & Time</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Supplier Distributor</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Payment Method</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Notes</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {supplierPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{p.paymentNumber}</td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">{formatDateTime(p.timestamp)}</td>
                    <td className="py-3.5 px-3 font-bold">{p.supplierName}</td>
                    <td className="py-3.5 px-3 font-semibold uppercase">{p.paymentMethod}</td>
                    <td className="py-3.5 px-3 text-slate-500">{p.notes || '—'}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 dark:text-white">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {showPaymentModal && selectedSupplierForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Make Supplier Payment</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distributor: <span className="font-bold text-slate-900 dark:text-white">{selectedSupplierForPay.companyName}</span>
            </p>
            <p className="text-xs font-bold text-amber-600 mt-1">
              Outstanding Payable: {formatCurrency(selectedSupplierForPay.outstandingBalance)}
            </p>

            <form onSubmit={handleSubmitPayment} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amount to Pay (Rs.) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={payAmount || ''}
                  onChange={e => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono font-bold text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (HBL / Meezan)</option>
                  <option value="CASH">Cash Counter</option>
                  <option value="CHEQUE">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cheque / Reference Note</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  placeholder="e.g. Cleared PO-8812 via Online Transfer"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-md hover:bg-emerald-500"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Add New Supplier Distributor</h3>

            <form onSubmit={handleSaveSupplier} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company / Agency Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. GSK Distribution Agency"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Asif Raza (Order Booker)"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0300-9876543"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="orders@gskpharma.pk"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Warehouse Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. G.T Road Industrial Estate"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-md hover:bg-emerald-500"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
