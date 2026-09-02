import React, { useState, useMemo } from 'react';
import {
  Pill,
  Search,
  Plus,
  Filter,
  Download,
  Printer,
  Edit2,
  Trash2,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Sliders,
  Eye,
  Barcode,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { Medicine } from '../types';
import {
  formatCurrency,
  formatDate,
  getExpiryStatus,
  getStockStatus,
  DOSAGE_FORMS,
  MEDICINE_CATEGORIES,
} from '../utils/helpers';

interface InventoryViewProps {
  filterMode?: 'all' | 'low-stock' | 'expiring-soon' | 'expired' | 'categories' | 'adjustments' | 'movements';
}

export const InventoryView: React.FC<InventoryViewProps> = ({ filterMode = 'all' }) => {
  const {
    medicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    adjustMedicineStock,
    suppliers,
    setSelectedMedicineId,
    setIsBarcodeModalOpen,
    stockMovements,
  } = usePharmacy();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDosageForm, setSelectedDosageForm] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>(
    filterMode === 'low-stock'
      ? 'LOW_STOCK'
      : filterMode === 'expiring-soon'
      ? 'EXPIRING_SOON'
      : filterMode === 'expired'
      ? 'EXPIRED'
      : 'ALL'
  );

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustMed, setAdjustMed] = useState<Medicine | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [adjustReason, setAdjustReason] = useState('Stock Audit Correction');

  // New/Edit Medicine Form Data
  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: '',
    genericName: '',
    category: MEDICINE_CATEGORIES[0],
    dosageForm: DOSAGE_FORMS[0],
    strength: '',
    sku: '',
    barcode: '',
    batchNumber: '',
    expiryDate: '',
    manufacturingDate: '',
    purchasePrice: 0,
    retailPrice: 0,
    mrp: 0,
    currentStock: 0,
    minimumStock: 10,
    maximumStock: 100,
    packSize: 1,
    rackLocation: 'A-1',
    supplierId: suppliers[0]?.id || '',
    requiresPrescription: false,
  });

  // Filter logic
  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => {
      // Search
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.barcode.includes(searchQuery) ||
        m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.rackLocation.toLowerCase().includes(searchQuery.toLowerCase());

      // Category
      const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;

      // Dosage
      const matchesDosage = selectedDosageForm === 'All' || m.dosageForm === selectedDosageForm;

      // Status
      const expiry = getExpiryStatus(m.expiryDate);
      const stock = getStockStatus(m);

      let matchesStatus = true;
      if (selectedStatus === 'LOW_STOCK') {
        matchesStatus = m.currentStock <= m.minimumStock;
      } else if (selectedStatus === 'EXPIRING_SOON') {
        matchesStatus = expiry.status === 'CRITICAL' || expiry.status === 'WARNING';
      } else if (selectedStatus === 'EXPIRED') {
        matchesStatus = expiry.status === 'EXPIRED';
      }

      return matchesSearch && matchesCat && matchesDosage && matchesStatus;
    });
  }, [medicines, searchQuery, selectedCategory, selectedDosageForm, selectedStatus]);

  // Open Edit Modal
  const handleOpenEdit = (med: Medicine) => {
    setEditingMedicine(med);
    setFormData({ ...med });
    setShowAddModal(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingMedicine(null);
    const randomBarcode = `8964000${Math.floor(100000 + Math.random() * 900000)}`;
    setFormData({
      name: '',
      genericName: '',
      category: MEDICINE_CATEGORIES[0],
      dosageForm: DOSAGE_FORMS[0],
      strength: '',
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      barcode: randomBarcode,
      batchNumber: `B-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      manufacturingDate: new Date().toISOString().split('T')[0],
      purchasePrice: 100,
      retailPrice: 130,
      mrp: 130,
      currentStock: 50,
      minimumStock: 10,
      maximumStock: 200,
      packSize: 10,
      rackLocation: 'A-1',
      supplierId: suppliers[0]?.id || '',
      requiresPrescription: false,
    });
    setShowAddModal(true);
  };

  // Save Medicine Handler
  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.genericName || !formData.batchNumber || !formData.expiryDate) {
      alert('Please fill all required fields');
      return;
    }

    if (editingMedicine) {
      updateMedicine(editingMedicine.id, formData);
    } else {
      addMedicine(formData as any);
    }

    setShowAddModal(false);
  };

  // Stock Adjustment Submit
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustMed || adjustQuantity <= 0) return;
    adjustMedicineStock(adjustMed.id, adjustQuantity, adjustType, adjustReason);
    setShowAdjustModal(false);
    setAdjustMed(null);
    setAdjustQuantity(0);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Generic', 'Category', 'Dosage', 'Strength', 'Batch', 'Expiry', 'Stock', 'Unit Price', 'Total Value'];
    const rows = filteredMedicines.map(m => [
      `"${m.name}"`,
      `"${m.genericName}"`,
      `"${m.category}"`,
      `"${m.dosageForm}"`,
      `"${m.strength}"`,
      `"${m.batchNumber}"`,
      m.expiryDate,
      m.currentStock,
      m.retailPrice,
      m.currentStock * m.purchasePrice,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Awan_Medicine_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold shadow-xs">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                {filterMode === 'low-stock'
                  ? 'Low Stock Alerts'
                  : filterMode === 'expiring-soon'
                  ? 'Expiring Soon Medicines (<45 Days)'
                  : filterMode === 'expired'
                  ? 'Expired Medicines Quarantine'
                  : filterMode === 'movements'
                  ? 'Stock Audit Trail Movements'
                  : 'Medicine Inventory & Stock'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Total {filteredMedicines.length} items listed • Batch-level expiry, formula & rack tracking
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Printer className="h-4 w-4" />
            <span>Print List</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search medicine, generic, batch..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="All">All Categories</option>
          {MEDICINE_CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Dosage Form */}
        <select
          value={selectedDosageForm}
          onChange={e => setSelectedDosageForm(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="All">All Dosage Forms</option>
          {DOSAGE_FORMS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="ALL">All Stock & Expiry Status</option>
          <option value="LOW_STOCK">⚠️ Low Stock Only</option>
          <option value="EXPIRING_SOON">🟠 Expiring Soon (&lt;45d)</option>
          <option value="EXPIRED">⛔ Expired Items</option>
        </select>
      </div>

      {/* Main Medicines Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden dark:border-slate-800/80 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Medicine / Generic</th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Category & Form</th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Batch & Rack</th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Expiry Date</th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px] text-center">Stock</th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Purchase</th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Retail</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto mb-3">
                      <Pill className="h-6 w-6" />
                    </div>
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">No medicines match your filter</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting filters or adding a new medicine to inventory.</p>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map(med => {
                  const expiry = getExpiryStatus(med.expiryDate);
                  const isOutOfStock = med.currentStock <= 0;
                  const isLowStock = med.currentStock <= med.minimumStock;

                  return (
                    <tr
                      key={med.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Generic */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{med.name}</span>
                          {med.requiresPrescription && (
                            <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                              Rx
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                          {med.genericName} • {med.strength}
                        </div>
                      </td>

                      {/* Category & Dosage */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block rounded-lg bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {med.category}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{med.dosageForm}</div>
                      </td>

                      {/* Batch & Rack */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {med.batchNumber}
                        </span>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                          Rack: {med.rackLocation}
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10px] font-bold ${expiry.badgeClass}`}>
                          {expiry.status === 'EXPIRED' ? '⛔' : expiry.status === 'CRITICAL' ? '🔥' : '🗓️'}
                          <span>{formatDate(med.expiryDate)}</span>
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {expiry.daysRemaining <= 0 ? 'Expired' : `${expiry.daysRemaining} days left`}
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block rounded-xl px-2.5 py-1 font-mono font-black text-xs ${
                            isOutOfStock
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : isLowStock
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {med.currentStock} {med.unit}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Min: {med.minimumStock}</div>
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {formatCurrency(med.purchasePrice)}
                      </td>

                      {/* Retail Price */}
                      <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(med.retailPrice)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setAdjustMed(med);
                              setAdjustQuantity(0);
                              setShowAdjustModal(true);
                            }}
                            className="rounded-xl p-2 text-slate-500 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-slate-800 transition-colors"
                            title="Adjust Stock Quantity"
                          >
                            <Sliders className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(med)}
                            className="rounded-xl p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Medicine"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${med.name} from inventory?`)) {
                                deleteMedicine(med.id);
                              }
                            }}
                            className="rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 transition-colors"
                            title="Delete Medicine"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold">
                  <Pill className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {editingMedicine ? `Edit Medicine: ${editingMedicine.name}` : 'Add New Medicine to Inventory'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Panadol Extra 500mg"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Generic / Chemical Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.genericName}
                    onChange={e => setFormData({ ...formData, genericName: e.target.value })}
                    placeholder="e.g. Paracetamol + Caffeine"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                  >
                    {MEDICINE_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Dosage Form *</label>
                  <select
                    value={formData.dosageForm}
                    onChange={e => setFormData({ ...formData, dosageForm: e.target.value as any })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                  >
                    {DOSAGE_FORMS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Strength</label>
                  <input
                    type="text"
                    value={formData.strength}
                    onChange={e => setFormData({ ...formData, strength: e.target.value })}
                    placeholder="e.g. 500mg / 5ml"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.batchNumber}
                    onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                    placeholder="e.g. B-8821"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Rack Location</label>
                  <input
                    type="text"
                    value={formData.rackLocation}
                    onChange={e => setFormData({ ...formData, rackLocation: e.target.value })}
                    placeholder="e.g. Rack A-1"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Purchase Price (Rs.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.purchasePrice}
                    onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Retail Price (Rs.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.retailPrice}
                    onChange={e => setFormData({ ...formData, retailPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-mono font-bold text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    required
                    value={formData.currentStock}
                    onChange={e => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Min Alert Stock *</label>
                  <input
                    type="number"
                    required
                    value={formData.minimumStock}
                    onChange={e => setFormData({ ...formData, minimumStock: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Barcode (EAN-13)</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Supplier Distributor</label>
                  <select
                    value={formData.supplierId}
                    onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.companyName} ({s.name})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="prescription-req"
                  checked={formData.requiresPrescription}
                  onChange={e => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="prescription-req" className="font-bold text-slate-700 dark:text-slate-300">
                  Prescription Required (Schedule Drug / Rx)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustModal && adjustMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Stock Adjustment Audit</h3>
            <p className="text-xs text-slate-500 mt-0.5">{adjustMed.name} (Current: {adjustMed.currentStock} {adjustMed.unit})</p>

            <form onSubmit={handleSaveAdjustment} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Adjustment Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('ADD')}
                    className={`rounded-2xl py-2.5 font-bold transition-all ${
                      adjustType === 'ADD' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    + Increase Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('SUBTRACT')}
                    className={`rounded-2xl py-2.5 font-bold transition-all ${
                      adjustType === 'SUBTRACT' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    - Deduct Stock
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Quantity Units</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQuantity || ''}
                  onChange={e => setAdjustQuantity(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 5"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 font-bold text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Audit Reason</label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Physical Count Audit">Physical Count Audit</option>
                  <option value="Damaged / Broken Packaging">Damaged / Broken Packaging</option>
                  <option value="Expired Quarantine Disposal">Expired Quarantine Disposal</option>
                  <option value="Supplier Return Replacement">Supplier Return Replacement</option>
                  <option value="Gift / Free Sample Stock In">Gift / Free Sample Stock In</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="rounded-2xl px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
