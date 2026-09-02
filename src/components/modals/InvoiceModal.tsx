import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Receipt,
  FileText,
  Share2,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  QrCode,
  Calendar,
  Clock,
  User,
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/helpers';

export const InvoiceModal: React.FC = () => {
  const {
    isInvoiceModalOpen,
    setIsInvoiceModalOpen,
    activeInvoiceToPrint,
    storeSettings,
  } = usePharmacy();

  const [receiptType, setReceiptType] = useState<'thermal' | 'a4'>('thermal');

  if (!isInvoiceModalOpen || !activeInvoiceToPrint) return null;

  const sale = activeInvoiceToPrint;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Controls Header (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Invoice {sale.invoiceNumber}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Print or export commercial customer receipt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle: 80mm POS Thermal vs A4 */}
            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                onClick={() => setReceiptType('thermal')}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  receiptType === 'thermal'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Thermal (80mm)
              </button>
              <button
                onClick={() => setReceiptType('a4')}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  receiptType === 'a4'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Standard (A4)
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 active:scale-95"
            >
              <Printer className="h-4 w-4" />
              <span>Print (Ctrl+P)</span>
            </button>

            <button
              onClick={() => setIsInvoiceModalOpen(false)}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950/50 flex justify-center">
          {receiptType === 'thermal' ? (
            /* 80mm Thermal Receipt Layout */
            <div className="w-[320px] bg-white p-4 font-mono text-xs text-slate-900 shadow-md border border-slate-300 rounded-lg print:w-full print:shadow-none print:border-none print:m-0 print:p-0">
              {/* Header */}
              <div className="text-center pb-3 border-b border-dashed border-slate-400">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm mb-1">
                  ✚
                </div>
                <h2 className="font-extrabold text-sm uppercase tracking-wide">{storeSettings.storeName}</h2>
                <p className="text-[10px] text-slate-600 leading-tight">{storeSettings.tagline}</p>
                <p className="text-[9px] text-slate-600 mt-1">{storeSettings.address}</p>
                <p className="text-[9px] text-slate-600">Ph: {storeSettings.phone}</p>
                <p className="text-[9px] text-slate-600 font-semibold">Lic: {storeSettings.drugLicenseNumber} | NTN: {storeSettings.ntnNumber}</p>
              </div>

              {/* Invoice Meta */}
              <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice #:</span>
                  <span className="font-bold">{sale.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date/Time:</span>
                  <span>{formatDateTime(sale.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cashier:</span>
                  <span>{sale.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold">{sale.customerName}</span>
                </div>
                {sale.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span>{sale.customerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment:</span>
                  <span className="font-bold uppercase">{sale.paymentMethod}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-2 border-b border-dashed border-slate-400">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th className="pb-1">Item</th>
                      <th className="pb-1 text-center">Qty</th>
                      <th className="pb-1 text-right">Rate</th>
                      <th className="pb-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sale.items.map((item, idx) => (
                      <tr key={idx} className="py-1">
                        <td className="py-1 pr-1 font-semibold leading-tight">
                          <div>{item.medicineName}</div>
                          <div className="text-[8px] text-slate-500">
                            B: {item.batchNumber} | Exp: {formatDate(item.expiryDate)}
                          </div>
                        </td>
                        <td className="py-1 text-center font-bold">{item.quantity}</td>
                        <td className="py-1 text-right">{item.unitPrice.toFixed(2)}</td>
                        <td className="py-1 text-right font-bold">{item.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(sale.subtotal)}</span>
                </div>
                {sale.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span>- {formatCurrency(sale.discountAmount)}</span>
                  </div>
                )}
                {sale.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({sale.taxPercentage}%):</span>
                    <span>{formatCurrency(sale.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-300 pt-1 text-xs font-black">
                  <span>GRAND TOTAL:</span>
                  <span>{formatCurrency(sale.grandTotal)}</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span>Paid Amount:</span>
                  <span className="font-semibold">{formatCurrency(sale.paidAmount)}</span>
                </div>
                {sale.changeAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Change Returned:</span>
                    <span>{formatCurrency(sale.changeAmount)}</span>
                  </div>
                )}
                {sale.remainingBalance > 0 && (
                  <div className="flex justify-between font-bold text-rose-600">
                    <span>Udhaar / Due:</span>
                    <span>{formatCurrency(sale.remainingBalance)}</span>
                  </div>
                )}
              </div>

              {/* Barcode & Footer */}
              <div className="pt-3 text-center text-[9px] space-y-2">
                {/* Simulated Barcode */}
                <div className="flex flex-col items-center justify-center">
                  <div className="h-9 w-44 tracking-widest font-mono text-center flex items-center justify-center bg-slate-900 text-white font-extrabold text-xs px-2">
                    |||| || ||| ||||| ||| ||
                  </div>
                  <span className="text-[8px] text-slate-500 mt-0.5">{sale.invoiceNumber}</span>
                </div>

                <p className="italic text-slate-600 leading-tight">
                  "{storeSettings.invoiceFooterNote}"
                </p>
                <p className="font-bold uppercase text-[9px]">Thank you for visiting Awan Medical Store!</p>
                <p className="text-[8px] text-slate-400">Software by Awan Smart Pharmacy</p>
              </div>
            </div>
          ) : (
            /* Standard A4 Formal Invoice Layout */
            <div className="w-full max-w-xl bg-white p-8 font-sans text-slate-800 shadow-md border border-slate-200 rounded-2xl print:w-full print:shadow-none print:border-none print:m-0 print:p-0">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
                      ✚
                    </div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">{storeSettings.storeName}</h1>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{storeSettings.tagline}</p>
                  <p className="text-xs text-slate-600 mt-2">{storeSettings.address}</p>
                  <p className="text-xs text-slate-600">Phone: {storeSettings.phone} | Email: {storeSettings.email}</p>
                  <p className="text-xs text-slate-600 font-semibold">
                    Drug License #: {storeSettings.drugLicenseNumber} | NTN: {storeSettings.ntnNumber}
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Official Tax Invoice
                  </span>
                  <p className="mt-2 text-sm font-bold text-slate-900">{sale.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">Date: {formatDate(sale.timestamp)}</p>
                  <p className="text-xs text-slate-500">Time: {formatDateTime(sale.timestamp).split(', ')[1] || ''}</p>
                  <p className="text-xs text-slate-500 font-semibold">Payment: {sale.paymentMethod}</p>
                </div>
              </div>

              {/* Billed To / Cashier Details */}
              <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Billed To:</h4>
                  <p className="font-bold text-slate-900 text-sm">{sale.customerName}</p>
                  {sale.customerPhone && <p className="text-slate-600">{sale.customerPhone}</p>}
                  <p className="text-slate-500">Walk-in / Counter Account</p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Handled By:</h4>
                  <p className="font-semibold text-slate-800">{sale.cashierName}</p>
                  <p className="text-slate-500">Counter Terminal #1</p>
                </div>
              </div>

              {/* Medicines Table */}
              <div className="py-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Medicine & Generic</th>
                      <th className="py-2.5 px-3">Batch / Expiry</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sale.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900">{item.medicineName}</p>
                          <p className="text-[10px] text-slate-500">{item.genericName}</p>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-600">
                          <span>{item.batchNumber}</span>
                          <span className="block text-[10px] text-slate-400">Exp: {formatDate(item.expiryDate)}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-slate-700">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Calculations */}
              <div className="border-t border-slate-200 pt-4 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(sale.subtotal)}</span>
                  </div>
                  {sale.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount Applied:</span>
                      <span className="font-semibold">- {formatCurrency(sale.discountAmount)}</span>
                    </div>
                  )}
                  {sale.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Tax ({sale.taxPercentage}%):</span>
                      <span className="font-semibold">{formatCurrency(sale.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                    <span>Grand Total:</span>
                    <span className="text-emerald-700">{formatCurrency(sale.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 pt-1">
                    <span>Paid:</span>
                    <span className="font-semibold">{formatCurrency(sale.paidAmount)}</span>
                  </div>
                  {sale.changeAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Change:</span>
                      <span>{formatCurrency(sale.changeAmount)}</span>
                    </div>
                  )}
                  {sale.remainingBalance > 0 && (
                    <div className="flex justify-between font-bold text-rose-600">
                      <span>Outstanding Balance:</span>
                      <span>{formatCurrency(sale.remainingBalance)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Terms */}
              <div className="mt-8 border-t border-slate-200 pt-4 text-center text-[11px] text-slate-500 space-y-1">
                <p className="font-medium text-slate-700">{storeSettings.invoiceFooterNote}</p>
                <p className="font-bold text-slate-900">Thank you for visiting Awan Medical Store!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
