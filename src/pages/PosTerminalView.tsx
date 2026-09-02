import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  Search,
  Barcode,
  Trash2,
  Plus,
  Minus,
  User,
  CreditCard,
  DollarSign,
  Printer,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Percent,
  Calculator,
  UserPlus,
  Sparkles,
  Phone,
  Layers,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { Medicine, SaleItem } from '../types';
import {
  formatCurrency,
  getExpiryStatus,
  calculateItemProfit,
  playCashSound,
  playAlertSound,
} from '../utils/helpers';

export const PosTerminalView: React.FC = () => {
  const {
    medicines,
    customers,
    addCustomer,
    completeSale,
    holdCurrentBill,
    heldBills,
    recallHeldBill,
    deleteHeldBill,
    setActiveInvoiceToPrint,
    setIsInvoiceModalOpen,
    currentUser,
    storeSettings,
  } = usePharmacy();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cart State
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('c-walkin');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'EASYPAISA' | 'JAZZCASH' | 'CARD' | 'BANK_TRANSFER' | 'UDHAAR'>('CASH');
  
  // Bill Adjustments
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxPercentage, setTaxPercentage] = useState<number>(storeSettings.defaultTaxPercentage || 0);
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [doctorName, setDoctorName] = useState('');

  // Held Bills modal / drawer
  const [showHeldModal, setShowHeldModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustLimit, setNewCustLimit] = useState(5000);

  // Focus search input on mount & F2 shortcut
  useEffect(() => {
    searchInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleHoldBill();
      } else if (e.key === 'F8') {
        e.preventDefault();
        setShowHeldModal(true);
      } else if (e.key === 'F9') {
        e.preventDefault();
        handleClearCart();
      } else if (e.key === 'F12' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        handleCheckout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems, customerName, paymentMethod, discountValue, paidAmountInput]);

  // Categories list
  const categories = ['All', ...Array.from(new Set(medicines.map(m => m.category)))];

  // Filtered Medicines for Fast Selector
  const filteredMedicines = medicines.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.barcode.includes(searchQuery) ||
      m.rackLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add Item to Cart with Safety Checks
  const handleAddToCart = (med: Medicine) => {
    const expiry = getExpiryStatus(med.expiryDate);
    if (expiry.status === 'EXPIRED') {
      playAlertSound();
      alert(`⚠️ Cannot sell ${med.name}! This batch expired on ${med.expiryDate}. Discard immediately.`);
      return;
    }

    if (med.currentStock <= 0) {
      playAlertSound();
      alert(`⚠️ ${med.name} is currently OUT OF STOCK!`);
      return;
    }

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.medicineId === med.id && item.batchNumber === med.batchNumber);
      if (existingIndex > -1) {
        const item = prev[existingIndex];
        if (item.quantity + 1 > med.currentStock) {
          alert(`Cannot add more. Only ${med.currentStock} ${med.unit} available in stock.`);
          return prev;
        }
        const updated = [...prev];
        const newQty = item.quantity + 1;
        const newTotal = (newQty * item.unitPrice) - item.discount;
        updated[existingIndex] = {
          ...item,
          quantity: newQty,
          totalPrice: Math.max(0, newTotal),
          profit: calculateItemProfit(newTotal, item.purchasePrice * newQty),
        };
        return updated;
      } else {
        const newItem: SaleItem = {
          medicineId: med.id,
          medicineName: med.name,
          genericName: med.genericName,
          batchNumber: med.batchNumber,
          expiryDate: med.expiryDate,
          quantity: 1,
          unitPrice: med.retailPrice,
          purchasePrice: med.purchasePrice,
          discount: 0,
          totalPrice: med.retailPrice,
          profit: calculateItemProfit(med.retailPrice, med.purchasePrice),
        };
        return [...prev, newItem];
      }
    });

    // Clear search for ultra-fast barcode gun continuous scanning
    setSearchQuery('');
  };

  // Update Cart Item Quantity
  const handleUpdateQuantity = (index: number, delta: number) => {
    setCartItems(prev => {
      const item = prev[index];
      const med = medicines.find(m => m.id === item.medicineId);
      const stockLimit = med ? med.currentStock : 9999;
      const newQty = item.quantity + delta;

      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }

      if (newQty > stockLimit) {
        alert(`Only ${stockLimit} available in stock.`);
        return prev;
      }

      const updated = [...prev];
      const newTotal = (newQty * item.unitPrice) - item.discount;
      updated[index] = {
        ...item,
        quantity: newQty,
        totalPrice: Math.max(0, newTotal),
        profit: calculateItemProfit(newTotal, item.purchasePrice * newQty),
      };
      return updated;
    });
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  // Clear Cart
  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    if (window.confirm('Clear current sale invoice?')) {
      setCartItems([]);
      setDiscountValue(0);
      setPaidAmountInput('');
      setSelectedCustomerId('c-walkin');
      setCustomerName('Walk-in Customer');
      setCustomerPhone('');
    }
  };

  // Calculation Math
  const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const discountAmount = discountType === 'PERCENTAGE' ? (subtotal * (discountValue / 100)) : discountValue;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * (taxPercentage / 100);
  const grandTotal = Math.round(taxableAmount + taxAmount);
  
  const totalCost = cartItems.reduce((acc, item) => acc + (item.purchasePrice * item.quantity), 0);
  const estimatedProfit = Math.max(0, grandTotal - taxAmount - totalCost);

  const parsedPaid = paidAmountInput === '' ? grandTotal : parseFloat(paidAmountInput) || 0;
  const changeAmount = paymentMethod === 'UDHAAR' ? 0 : Math.max(0, parsedPaid - grandTotal);
  const remainingBalance = paymentMethod === 'UDHAAR' 
    ? Math.max(0, grandTotal - parsedPaid) 
    : (parsedPaid < grandTotal ? grandTotal - parsedPaid : 0);

  // Complete Sale & Trigger Invoice
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Cart is empty. Scan or select medicines first.');
      return;
    }

    if (paymentMethod === 'UDHAAR' && selectedCustomerId === 'c-walkin') {
      alert('Udhaar / Credit cannot be given to generic Walk-in customer. Please select or register a named customer.');
      return;
    }

    const completed = completeSale({
      customerId: selectedCustomerId !== 'c-walkin' ? selectedCustomerId : undefined,
      customerName,
      customerPhone: customerPhone || undefined,
      items: cartItems,
      subtotal,
      discountAmount,
      discountPercentage: discountType === 'PERCENTAGE' ? discountValue : (subtotal > 0 ? (discountAmount / subtotal) * 100 : 0),
      taxAmount,
      taxPercentage,
      grandTotal,
      paidAmount: paymentMethod === 'UDHAAR' ? (parseFloat(paidAmountInput) || 0) : parsedPaid,
      changeAmount,
      remainingBalance,
      paymentMethod,
      doctorName: doctorName || undefined,
      notes: notes || undefined,
    });

    playCashSound();
    setActiveInvoiceToPrint(completed);
    setIsInvoiceModalOpen(true);

    // Reset Cart
    setCartItems([]);
    setDiscountValue(0);
    setPaidAmountInput('');
    setSelectedCustomerId('c-walkin');
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setNotes('');
    setDoctorName('');
    searchInputRef.current?.focus();
  };

  // Hold Bill
  const handleHoldBill = () => {
    if (cartItems.length === 0) {
      alert('Cart is empty. Nothing to hold.');
      return;
    }
    holdCurrentBill(cartItems, customerName, customerPhone);
    setCartItems([]);
    setSelectedCustomerId('c-walkin');
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    alert('Bill saved to Held Queue! You can serve next customer.');
  };

  // Quick Cash Tender helper buttons
  const setQuickCash = (amount: number) => {
    setPaidAmountInput(amount.toString());
  };

  // Add New Customer Quick Handler
  const handleAddNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;
    const created = addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      customerType: 'REGULAR',
      creditLimit: newCustLimit,
      outstandingBalance: 0,
      totalPurchases: 0,
    });
    setSelectedCustomerId(created.id);
    setCustomerName(created.name);
    setCustomerPhone(created.phone);
    setShowNewCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-6.5rem)] animate-in fade-in duration-200">
      {/* Left 7 Columns: Fast Medicine Search & Catalog Grid */}
      <div className="lg:col-span-7 flex flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 h-full overflow-hidden">
        {/* Top Search Bar & Barcode Input */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Medicine, Generic, Barcode (F2)..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-10 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-emerald-500/15 transition-all dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => searchInputRef.current?.focus()}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            title="Focus Scanner (F2)"
          >
            <Barcode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Scanner</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Medicines Catalog Grid */}
        <div className="mt-3 flex-1 overflow-y-auto pr-1">
          {filteredMedicines.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-slate-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No medicines found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Try searching with a generic name, barcode, or rack location.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filteredMedicines.map(med => {
                const expiry = getExpiryStatus(med.expiryDate);
                const isOutOfStock = med.currentStock <= 0;
                const isExpired = expiry.status === 'EXPIRED';

                return (
                  <div
                    key={med.id}
                    onClick={() => handleAddToCart(med)}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                      isExpired
                        ? 'border-rose-200 bg-rose-50/40 opacity-60 dark:border-rose-900/50 dark:bg-rose-950/20'
                        : isOutOfStock
                        ? 'border-slate-200 bg-slate-50/60 opacity-60 dark:border-slate-800 dark:bg-slate-800/40'
                        : 'border-slate-200/80 bg-white hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/5 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-emerald-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {med.category}
                        </span>
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-mono font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {med.rackLocation}
                        </span>
                      </div>

                      <h4 className="mt-2 font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {med.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {med.genericName} • {med.strength}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(med.retailPrice)}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          isOutOfStock
                            ? 'text-rose-500'
                            : med.currentStock <= med.minimumStock
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {isOutOfStock ? 'Out of stock' : `${med.currentStock} ${med.unit}`}
                      </span>
                    </div>

                    {isExpired && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-rose-950/50 backdrop-blur-[1px] text-white font-bold text-xs tracking-wider">
                        EXPIRED
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hotkeys Helper footer */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-slate-800">
          <div className="flex gap-3">
            <span><kbd className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">F2</kbd> Focus</span>
            <span><kbd className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">F4</kbd> Hold</span>
            <span><kbd className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">F8</kbd> Recall</span>
            <span><kbd className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">F9</kbd> Clear</span>
            <span><kbd className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">F12</kbd> Pay</span>
          </div>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Awan POS Terminal v2.4</span>
        </div>
      </div>

      {/* Right 5 Columns: Active Billing Cart & Payment Terminal */}
      <div className="lg:col-span-5 flex flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 h-full overflow-hidden">
        {/* Customer & Bill Queue Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-1 mr-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
              <User className="h-4 w-4" />
            </div>
            <select
              value={selectedCustomerId}
              onChange={e => {
                const cid = e.target.value;
                setSelectedCustomerId(cid);
                if (cid === 'c-walkin') {
                  setCustomerName('Walk-in Customer');
                  setCustomerPhone('');
                } else {
                  const found = customers.find(c => c.id === cid);
                  if (found) {
                    setCustomerName(found.name);
                    setCustomerPhone(found.phone);
                  }
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="c-walkin">Walk-in Customer (Cash Counter)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) — Due: Rs.{c.outstandingBalance}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowNewCustomerModal(true)}
              className="rounded-xl border border-slate-200/80 bg-slate-50 p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              title="Add New Customer"
            >
              <UserPlus className="h-4 w-4" />
            </button>

            <button
              onClick={handleHoldBill}
              className="rounded-xl border border-slate-200/80 bg-slate-50 p-2 text-slate-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              title="Hold Bill (F4)"
            >
              <Clock className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowHeldModal(true)}
              className="relative rounded-xl border border-slate-200/80 bg-slate-50 p-2 text-slate-600 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              title="Recall Held Bills (F8)"
            >
              <RotateCcw className="h-4 w-4" />
              {heldBills.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white shadow-xs">
                  {heldBills.length}
                </span>
              )}
            </button>

            <button
              onClick={handleClearCart}
              className="rounded-xl border border-slate-200/80 bg-slate-50 p-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              title="Clear Cart (F9)"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Live Cart Items Table */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-slate-100 dark:divide-slate-800 pr-1">
          {cartItems.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-slate-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-2">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Cart is Empty</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Click any medicine or scan with barcode gun.</p>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-2.5">
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">{item.medicineName}</h5>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{formatCurrency(item.unitPrice)}</span>
                    <span>•</span>
                    <span className="font-mono">B: {item.batchNumber}</span>
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                  <button
                    onClick={() => handleUpdateQuantity(idx, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-slate-700 shadow-xs hover:bg-slate-100 active:scale-95 transition-all dark:bg-slate-700 dark:text-white"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-7 text-center text-xs font-extrabold text-slate-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(idx, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-slate-700 shadow-xs hover:bg-slate-100 active:scale-95 transition-all dark:bg-slate-700 dark:text-white"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Total Price & Delete */}
                <div className="text-right min-w-[75px]">
                  <p className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(item.totalPrice)}</p>
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="text-[10px] font-semibold text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Calculations & Payment Drawer */}
        <div className="border-t border-slate-200/80 pt-3.5 dark:border-slate-800 space-y-2.5 text-xs">
          {/* Discount & Tax inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800">
              <span className="text-[10px] font-bold text-slate-500">Disc:</span>
              <input
                type="number"
                min="0"
                value={discountValue || ''}
                onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none dark:text-white"
              />
              <button
                onClick={() => setDiscountType(prev => prev === 'PERCENTAGE' ? 'FIXED' : 'PERCENTAGE')}
                className="rounded-lg bg-slate-200/80 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300"
              >
                {discountType === 'PERCENTAGE' ? '%' : 'Rs'}
              </button>
            </div>

            <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800">
              <span className="text-[10px] font-bold text-slate-500">Tax %:</span>
              <input
                type="number"
                min="0"
                value={taxPercentage || ''}
                onChange={e => setTaxPercentage(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'CASH', label: 'Cash' },
              { id: 'EASYPAISA', label: 'EasyPaisa' },
              { id: 'JAZZCASH', label: 'JazzCash' },
              { id: 'CARD', label: 'Card' },
              { id: 'BANK_TRANSFER', label: 'Bank' },
              { id: 'UDHAAR', label: 'Udhaar / Due' },
            ].map(pm => (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id as any)}
                className={`rounded-xl py-1.5 text-[10px] font-bold transition-all ${
                  paymentMethod === pm.id
                    ? pm.id === 'UDHAAR'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {pm.label}
              </button>
            ))}
          </div>

          {/* Quick Cash Tender presets */}
          {paymentMethod === 'CASH' && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-bold">
              <span className="text-slate-400 text-[9px] uppercase tracking-wider font-semibold">Tender:</span>
              {[100, 500, 1000, 5000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setQuickCash(amt)}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-300"
                >
                  Rs.{amt}
                </button>
              ))}
              <button
                onClick={() => setQuickCash(grandTotal)}
                className="rounded-lg bg-emerald-100 px-2.5 py-1 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              >
                Exact
              </button>
            </div>
          )}

          {/* Amount Paid & Change Display */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60 dark:bg-slate-800/40 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tendered / Paid:</span>
              <input
                type="number"
                value={paidAmountInput}
                onChange={e => setPaidAmountInput(e.target.value)}
                placeholder={grandTotal.toString()}
                className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none dark:text-white mt-0.5"
              />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {paymentMethod === 'UDHAAR' ? 'Udhaar Balance:' : 'Change Due:'}
              </span>
              <p
                className={`text-sm font-black mt-0.5 ${
                  paymentMethod === 'UDHAAR' ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {paymentMethod === 'UDHAAR' ? formatCurrency(remainingBalance) : formatCurrency(changeAmount)}
              </p>
            </div>
          </div>

          {/* Grand Total & Checkout Button */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Grand Total</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(grandTotal)}</p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Checkout & Print (F12)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Held Bills Modal */}
      {showHeldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Held Bills Queue</h3>
            <p className="text-xs text-slate-500 mb-4">Restore pending customer transaction</p>

            {heldBills.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No held bills in queue.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {heldBills.map(hb => (
                  <div key={hb.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{hb.customerName}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{hb.items.length} items • Held at {new Date(hb.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const items = recallHeldBill(hb.id);
                          if (items) {
                            setCartItems(items);
                            setCustomerName(hb.customerName);
                            setCustomerPhone(hb.customerPhone || '');
                            setShowHeldModal(false);
                          }
                        }}
                        className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => deleteHeldBill(hb.id)}
                        className="rounded-xl p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowHeldModal(false)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Quick Modal */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3">Register New Customer</h3>
            <form onSubmit={handleAddNewCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Credit / Udhaar Limit (Rs.)</label>
                <input
                  type="number"
                  value={newCustLimit}
                  onChange={e => setNewCustLimit(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
