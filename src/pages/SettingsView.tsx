import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Store,
  Printer,
  ShieldAlert,
  Download,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  Moon,
  Sun,
  Database,
  Building,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { StoreSettings } from '../types';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    darkMode,
    setDarkMode,
    resetToDemoData,
    exportDataBackup,
    importDataBackup,
  } = usePharmacy();

  const [formSettings, setFormSettings] = useState<StoreSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataBackup(content);
        if (success) {
          alert('Database restored successfully from backup!');
        } else {
          alert('Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Store Configuration & System Settings
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize pharmacy identity, billing parameters, thermal printer preferences, and local data backups.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Pharmacy Profile */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Store className="h-4 w-4 text-emerald-600" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Pharmacy Identity & Header</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pharmacy Name</label>
              <input
                type="text"
                value={formSettings.pharmacyName}
                onChange={e => setFormSettings({ ...formSettings, pharmacyName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tagline / Slogan</label>
              <input
                type="text"
                value={formSettings.tagline}
                onChange={e => setFormSettings({ ...formSettings, tagline: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone / Helpline</label>
              <input
                type="text"
                value={formSettings.phone}
                onChange={e => setFormSettings({ ...formSettings, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Drug License #</label>
              <input
                type="text"
                value={formSettings.licenseNumber}
                onChange={e => setFormSettings({ ...formSettings, licenseNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tax NTN #</label>
              <input
                type="text"
                value={formSettings.ntnNumber}
                onChange={e => setFormSettings({ ...formSettings, ntnNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Currency Code</label>
              <input
                type="text"
                value={formSettings.currency}
                onChange={e => setFormSettings({ ...formSettings, currency: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Physical Store Address</label>
              <input
                type="text"
                value={formSettings.address}
                onChange={e => setFormSettings({ ...formSettings, address: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Invoice & Receipts Settings */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Printer className="h-4 w-4 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">POS Checkout & Thermal Printing Setup</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Receipt Footer Note</label>
              <input
                type="text"
                value={formSettings.invoiceFooterMessage}
                onChange={e => setFormSettings({ ...formSettings, invoiceFooterMessage: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Default Sales Tax / GST %</label>
              <input
                type="number"
                value={formSettings.defaultTaxRate}
                onChange={e => setFormSettings({ ...formSettings, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoPrint"
                checked={formSettings.autoPrintReceipt}
                onChange={e => setFormSettings({ ...formSettings, autoPrintReceipt: e.target.checked })}
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="autoPrint" className="font-bold text-slate-800 dark:text-slate-200">
                Automatically popup print dialog after checkout completion
              </label>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500"
          >
            <Save className="h-4 w-4" />
            <span>Save All Configuration Changes</span>
          </button>
        </div>
      </form>

      {/* Database Backup & Maintenance */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <Database className="h-4 w-4 text-purple-600" />
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">Database Backup, Export & Reset</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
          {/* Export */}
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Download className="h-4 w-4 text-emerald-600" /> Export JSON Backup
            </h3>
            <p className="text-slate-500">Download a full timestamped JSON copy of medicines, sales, purchases, and customers.</p>
            <button
              type="button"
              onClick={exportDataBackup}
              className="w-full rounded-xl bg-slate-100 py-2 font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              Download Backup File
            </button>
          </div>

          {/* Import */}
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-blue-600" /> Restore Database
            </h3>
            <p className="text-slate-500">Restore your complete store database from an exported backup JSON file.</p>
            <label className="block w-full cursor-pointer rounded-xl bg-slate-100 py-2 text-center font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
              Select JSON File
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
          </div>

          {/* Reset Demo Data */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/20 p-4 dark:border-rose-900/40 space-y-3">
            <h3 className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <RotateCcw className="h-4 w-4" /> Reset Sample Data
            </h3>
            <p className="text-slate-500">Reset all inventory, sales, purchases, and ledgers back to realistic demo data.</p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all data back to realistic demo defaults?')) {
                  resetToDemoData();
                  alert('Store data reset to default demo dataset!');
                }
              }}
              className="w-full rounded-xl bg-rose-600 py-2 font-bold text-white shadow hover:bg-rose-500"
            >
              Reset to Demo Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
