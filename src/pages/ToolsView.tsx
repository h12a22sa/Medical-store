import React, { useState } from 'react';
import {
  Wrench,
  Calculator,
  Percent,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export const ToolsView: React.FC = () => {
  // Calculator 1: Margin & Discount Calculator
  const [costPrice, setCostPrice] = useState<number>(100);
  const [retailPrice, setRetailPrice] = useState<number>(130);
  const [customDiscount, setCustomDiscount] = useState<number>(10);

  const profit = Math.max(0, retailPrice - costPrice);
  const markupPercent = costPrice > 0 ? ((retailPrice - costPrice) / costPrice) * 100 : 0;
  const marginPercent = retailPrice > 0 ? ((retailPrice - costPrice) / retailPrice) * 100 : 0;
  const discountedPrice = retailPrice - (retailPrice * (customDiscount / 100));
  const discountedProfit = discountedPrice - costPrice;

  // Calculator 2: Box / Pack / Strip / Tablet Unit Converter
  const [boxes, setBoxes] = useState<number>(5);
  const [stripsPerBox, setStripsPerBox] = useState<number>(10);
  const [tabletsPerStrip, setTabletsPerStrip] = useState<number>(10);

  const totalStrips = boxes * stripsPerBox;
  const totalTablets = totalStrips * tabletsPerStrip;

  // Calculator 3: Shelf Life Date Difference Calculator
  const [mfgDate, setMfgDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expDate, setExpDate] = useState<string>(
    new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const calculateMonths = () => {
    const d1 = new Date(mfgDate);
    const d2 = new Date(expDate);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = (diffDays / 30.44).toFixed(1);
    const remainingDaysFromToday = Math.ceil((d2.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return { diffDays, diffMonths, remainingDaysFromToday };
  };

  const shelfInfo = calculateMonths();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-bold">
              <Wrench className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Pharmacy Calculations & Dispensing Tools
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Practical calculators for retail markup pricing, loose tablet fractioning, and shelf life duration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tool 1: Margin & Discount Calculator */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Percent className="h-4 w-4 text-emerald-600" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Margin & Discount Matrix</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Purchase / Cost Price (Rs.)</label>
              <input
                type="number"
                value={costPrice}
                onChange={e => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Retail MRP Rate (Rs.)</label>
              <input
                type="number"
                value={retailPrice}
                onChange={e => setRetailPrice(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Discount %</label>
              <input
                type="number"
                value={customDiscount}
                onChange={e => setCustomDiscount(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Gross Markup:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{markupPercent.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Gross Margin:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{marginPercent.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between border-t border-emerald-200 pt-1.5 dark:border-emerald-800">
                <span className="font-bold text-slate-800 dark:text-slate-200">Price after {customDiscount}% Disc:</span>
                <span className="font-mono font-black text-slate-900 dark:text-white">{formatCurrency(discountedPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Net Profit per Unit:</span>
                <span className="font-mono font-bold text-emerald-600">{formatCurrency(discountedProfit)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tool 2: Box / Strip / Loose Tablet Converter */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Layers className="h-4 w-4 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Unit & Packaging Fractionator</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Number of Boxes / Packs</label>
              <input
                type="number"
                min="1"
                value={boxes}
                onChange={e => setBoxes(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Strips / Blisters per Box</label>
              <input
                type="number"
                min="1"
                value={stripsPerBox}
                onChange={e => setStripsPerBox(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tablets / Capsules per Strip</label>
              <input
                type="number"
                min="1"
                value={tabletsPerStrip}
                onChange={e => setTabletsPerStrip(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="rounded-2xl bg-blue-50/60 p-4 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Strips:</span>
                <span className="font-mono font-black text-blue-700 dark:text-blue-300 text-sm">{totalStrips} Strips</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-1.5 dark:border-blue-800">
                <span className="font-bold text-slate-800 dark:text-slate-200">Total Loose Tablets:</span>
                <span className="font-mono font-black text-slate-900 dark:text-white text-base">{totalTablets} Tabs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tool 3: Shelf Life & Expiry Date Difference */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Calendar className="h-4 w-4 text-purple-600" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Shelf Life & Expiry Days</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Manufacturing Date (MFG)</label>
              <input
                type="date"
                value={mfgDate}
                onChange={e => setMfgDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expiry Date (EXP)</label>
              <input
                type="date"
                value={expDate}
                onChange={e => setExpDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="rounded-2xl bg-purple-50/60 p-4 border border-purple-100 dark:bg-purple-950/20 dark:border-purple-900 space-y-2 mt-4">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Shelf Life:</span>
                <span className="font-mono font-bold text-purple-700 dark:text-purple-300">{shelfInfo.diffMonths} Months ({shelfInfo.diffDays} Days)</span>
              </div>
              <div className="flex justify-between border-t border-purple-200 pt-1.5 dark:border-purple-800">
                <span className="font-bold text-slate-800 dark:text-slate-200">Days Remaining from Today:</span>
                <span className={`font-mono font-black text-sm ${shelfInfo.remainingDaysFromToday > 60 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {shelfInfo.remainingDaysFromToday} Days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
