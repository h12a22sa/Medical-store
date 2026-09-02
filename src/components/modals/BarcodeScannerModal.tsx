import React, { useState } from 'react';
import {
  X,
  Barcode,
  Printer,
  Sparkles,
  Camera,
  CheckCircle2,
  Copy,
  Search,
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { formatCurrency } from '../../utils/helpers';

export const BarcodeScannerModal: React.FC = () => {
  const {
    isBarcodeModalOpen,
    setIsBarcodeModalOpen,
    medicines,
    setSelectedMedicineId,
    setActiveTab,
    storeSettings,
  } = usePharmacy();

  const [selectedMedId, setSelectedMedId] = useState<string>(medicines[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [testScanInput, setTestScanInput] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);

  if (!isBarcodeModalOpen) return null;

  const currentMed = medicines.find(m => m.id === selectedMedId) || medicines[0];

  const handleCopyBarcode = () => {
    if (currentMed) {
      navigator.clipboard.writeText(currentMed.barcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTestScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testScanInput.trim()) return;
    const found = medicines.find(
      m => m.barcode === testScanInput.trim() || m.sku.toLowerCase() === testScanInput.trim().toLowerCase()
    );
    if (found) {
      setScanResult(`Found: ${found.name} (Stock: ${found.currentStock} ${found.unit})`);
      setSelectedMedId(found.id);
    } else {
      setScanResult(`No medicine found with barcode "${testScanInput}"`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              <Barcode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Barcode Generator & Label System
              </h3>
              <p className="text-xs text-slate-500">
                EAN-13 & Code-128 compliance with instant label printing
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBarcodeModalOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Medicine Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Medicine to Generate Label
            </label>
            <select
              value={selectedMedId}
              onChange={e => setSelectedMedId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {medicines.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.genericName}) — Barcode: {m.barcode}
                </option>
              ))}
            </select>
          </div>

          {/* Barcode Label Preview (Printable Sticker format) */}
          {currentMed && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-6 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40">
              <div className="w-72 rounded-xl bg-white p-4 shadow-sm border border-slate-200 text-center font-mono">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{storeSettings.storeName}</p>
                <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1 mt-0.5">{currentMed.name}</h4>
                <p className="text-[10px] text-slate-600 font-sans">{currentMed.genericName} • {currentMed.strength}</p>

                {/* Vector Barcode Graphic */}
                <div className="my-2.5 flex flex-col items-center justify-center bg-slate-950 text-white py-2 px-3 rounded-lg">
                  <div className="h-10 w-full flex items-center justify-center space-x-1 tracking-widest font-mono text-sm font-black">
                    ||| | |||| | || ||| || ||| |
                  </div>
                  <span className="text-[10px] tracking-widest text-slate-300 font-mono mt-0.5">
                    {currentMed.barcode}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold pt-1 border-t border-slate-100 text-slate-700 font-sans">
                  <span>Batch: {currentMed.batchNumber}</span>
                  <span className="text-emerald-700 text-xs font-black">{formatCurrency(currentMed.retailPrice)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleCopyBarcode}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied Barcode!' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Shelf Label</span>
                </button>
              </div>
            </div>
          )}

          {/* Test Scanner Input Simulation */}
          <div className="rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-emerald-600" /> Test Hardware / Camera Scanner Input
            </h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
              Connect any standard USB/Bluetooth barcode scanner gun or paste a scanned barcode below:
            </p>
            <form onSubmit={handleTestScan} className="mt-2.5 flex gap-2">
              <input
                type="text"
                value={testScanInput}
                onChange={e => setTestScanInput(e.target.value)}
                placeholder="Scan or type barcode (e.g. 8964000100112)..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-700"
              >
                Simulate Scan
              </button>
            </form>
            {scanResult && (
              <div className="mt-2 rounded-lg bg-white p-2.5 text-xs font-bold text-slate-800 dark:bg-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {scanResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
