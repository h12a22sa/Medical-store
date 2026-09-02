import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  CreditCard,
  DollarSign,
  Phone,
  FileText,
  Printer,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  TrendingDown,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { Customer, CustomerPayment } from '../types';
import { formatCurrency, formatDateTime, formatDate } from '../utils/helpers';

interface CustomersViewProps {
  creditMode?: boolean;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ creditMode = false }) => {
  const {
    customers,
    addCustomer,
    recordCustomerPayment,
    customerPayments,
    sales,
    selectedCustomerId,
    setSelectedCustomerId,
  } = usePharmacy();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'credit' | 'payments'>(creditMode ? 'credit' : 'all');

  // Modals
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustForPayment, setSelectedCustForPayment] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'EASYPAISA' | 'JAZZCASH' | 'BANK_TRANSFER'>('CASH');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Add Customer Form
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custCreditLimit, setCustCreditLimit] = useState(10000);
  const [custType, setCustType] = useState<'REGULAR' | 'WHOLESALE' | 'WALK_IN'>('REGULAR');

  // Filter Customers
  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeSubTab === 'credit') {
      return matchesSearch && c.outstandingBalance > 0;
    }
    return matchesSearch;
  });

  // Open Payment Modal
  const handleOpenPayment = (c: Customer) => {
    setSelectedCustForPayment(c);
    setPaymentAmount(c.outstandingBalance);
    setShowPaymentModal(true);
  };

  // Submit Payment
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustForPayment || paymentAmount <= 0) return;

    recordCustomerPayment({
      customerId: selectedCustForPayment.id,
      customerName: selectedCustForPayment.name,
      amount: paymentAmount,
      paymentMethod,
      notes: paymentNotes || undefined,
    });

    setShowPaymentModal(false);
    setSelectedCustForPayment(null);
    setPaymentAmount(0);
    setPaymentNotes('');
    alert('Payment recorded successfully! Customer Udhaar balance reduced.');
  };

  // Add Customer Submit
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) return;

    addCustomer({
      name: custName,
      phone: custPhone,
      address: custAddress || undefined,
      creditLimit: custCreditLimit,
      customerType: custType,
      outstandingBalance: 0,
      totalPurchases: 0,
    });

    setShowAddCustomerModal(false);
    setCustName('');
    setCustPhone('');
    setCustAddress('');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold shadow-xs">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Customer Ledger & Udhaar Book
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Track patient credit accounts, due dates, payment history & recovery receipts
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-2xl bg-slate-100/80 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              All ({customers.length})
            </button>
            <button
              onClick={() => setActiveSubTab('credit')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'credit'
                  ? 'bg-rose-50 text-rose-700 shadow-xs dark:bg-rose-950/60 dark:text-rose-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Udhaar Due ({customers.filter(c => c.outstandingBalance > 0).length})
            </button>
            <button
              onClick={() => setActiveSubTab('payments')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'payments'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Receipts ({customerPayments.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {activeSubTab !== 'payments' ? (
        <>
          {/* Search bar */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, phone number, address..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Customers Table */}
          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden dark:border-slate-800/80 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Customer Name</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Phone Number</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Type & Address</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Credit Limit</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Total Purchases</th>
                    <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Outstanding Udhaar</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-14 text-center text-slate-400">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto mb-3">
                          <Users className="h-6 w-6" />
                        </div>
                        <p className="font-bold text-sm text-slate-700 dark:text-slate-200">No customers found</p>
                        <p className="text-xs text-slate-500 mt-1">Try changing your search query or add a new customer.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</span>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {c.phone}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-block rounded-lg bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {c.customerType}
                          </span>
                          {c.address && <span className="block text-[10px] text-slate-400 mt-0.5">{c.address}</span>}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {formatCurrency(c.creditLimit)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(c.totalPurchases)}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <span
                            className={`inline-block rounded-xl px-2.5 py-1 font-mono font-black text-xs ${
                              c.outstandingBalance > 0
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            {formatCurrency(c.outstandingBalance)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {c.outstandingBalance > 0 ? (
                            <button
                              onClick={() => handleOpenPayment(c)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
                            >
                              <DollarSign className="h-3.5 w-3.5" />
                              <span>Receive Pay</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Cleared
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Payments History */
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden dark:border-slate-800/80 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Receipt #</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Date & Time</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Customer</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Payment Method</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Notes</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-right">Recovered Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customerPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-slate-400">
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-200">No payment receipts logged yet</p>
                    </td>
                  </tr>
                ) : (
                  customerPayments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{p.receiptNumber}</td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">{formatDateTime(p.timestamp)}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">{p.customerName}</td>
                      <td className="py-3.5 px-3">
                        <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">{p.notes || '—'}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        + {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {showPaymentModal && selectedCustForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Receive Udhaar Payment</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <span className="font-bold text-slate-900 dark:text-white">{selectedCustForPayment.name}</span>
            </p>
            <div className="mt-2 rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              Current Due: {formatCurrency(selectedCustForPayment.outstandingBalance)}
            </div>

            <form onSubmit={handleSubmitPayment} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amount Receiving (Rs.) *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedCustForPayment.outstandingBalance}
                  required
                  value={paymentAmount || ''}
                  onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-mono font-bold text-sm text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="CASH">Cash Counter</option>
                  <option value="EASYPAISA">EasyPaisa</option>
                  <option value="JAZZCASH">JazzCash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Remarks / Note</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Cleared monthly medicine bill"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="rounded-2xl px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  Save Payment Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Register New Customer</h3>

            <form onSubmit={handleSaveCustomer} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  placeholder="e.g. Haji Muhammad Rafiq"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={custPhone}
                  onChange={e => setCustPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Type</label>
                <select
                  value={custType}
                  onChange={e => setCustType(e.target.value as any)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="REGULAR">Regular Patient</option>
                  <option value="WHOLESALE">Wholesale / Clinic</option>
                  <option value="WALK_IN">Walk-in</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Credit / Udhaar Limit (Rs.)</label>
                <input
                  type="number"
                  value={custCreditLimit}
                  onChange={e => setCustCreditLimit(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={custAddress}
                  onChange={e => setCustAddress(e.target.value)}
                  placeholder="e.g. Mohallah Awan, Gujrat"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="rounded-2xl px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
