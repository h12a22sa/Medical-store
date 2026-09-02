import { Medicine } from '../types';

export const formatCurrency = (amount: number, symbol = 'Rs. '): string => {
  return `${symbol}${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

export const calculateDaysRemaining = (expiryDateStr: string): number => {
  if (!expiryDateStr) return 9999;
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  // Strip time for pure day difference
  expiry.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export type ExpiryStatusType = 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'UPCOMING' | 'GOOD';

export const getExpiryStatus = (expiryDateStr: string): {
  status: ExpiryStatusType;
  daysRemaining: number;
  label: string;
  badgeClass: string;
} => {
  const days = calculateDaysRemaining(expiryDateStr);
  if (days < 0) {
    return {
      status: 'EXPIRED',
      daysRemaining: days,
      label: `Expired (${Math.abs(days)}d ago)`,
      badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-900',
    };
  } else if (days <= 7) {
    return {
      status: 'CRITICAL',
      daysRemaining: days,
      label: `Critical (${days}d left)`,
      badgeClass: 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border-red-200 dark:border-red-900 animate-pulse',
    };
  } else if (days <= 30) {
    return {
      status: 'WARNING',
      daysRemaining: days,
      label: `Expiring Soon (${days}d)`,
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    };
  } else if (days <= 90) {
    return {
      status: 'UPCOMING',
      daysRemaining: days,
      label: `Expiring in ${Math.round(days / 30)} mos`,
      badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/80 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900',
    };
  } else {
    return {
      status: 'GOOD',
      daysRemaining: days,
      label: `Valid (${Math.round(days / 30)} mos)`,
      badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    };
  }
};

export const getStockStatus = (medicine: Medicine): {
  status: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'ADEQUATE';
  label: string;
  badgeClass: string;
} => {
  if (medicine.currentStock <= 0) {
    return {
      status: 'OUT_OF_STOCK',
      label: 'Out of Stock',
      badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-900',
    };
  } else if (medicine.currentStock <= medicine.minimumStock) {
    return {
      status: 'LOW_STOCK',
      label: `Low Stock (${medicine.currentStock} left)`,
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    };
  } else {
    return {
      status: 'ADEQUATE',
      label: `In Stock (${medicine.currentStock})`,
      badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    };
  }
};

// Play short acoustic beep for POS barcode scan or checkout
export const playBeep = (type: 'beep' | 'success' | 'error' = 'beep') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'beep') {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // AudioContext failed or blocked by policy
  }
};

export const DOSAGE_FORMS = [
  'TABLET',
  'CAPSULE',
  'SYRUP',
  'INJECTION',
  'DROPS',
  'OINTMENT',
  'CREAM',
  'INHALER',
  'SUSPENSION',
  'SACHET',
  'LOTION',
  'POWDER',
  'GEL',
  'SUPPOSITORY',
] as const;

export const MEDICINE_CATEGORIES = [
  'Antibiotics',
  'Painkillers & Analgesics',
  'Cardiovascular & Hypertension',
  'Antidiabetic & Insulin',
  'Gastrointestinal & Antacids',
  'Respiratory & Antiallergic',
  'Vitamins & Supplements',
  'Dermatological & Skin',
  'Neurological & Psychiatric',
  'Ophthalmic & Eye Care',
  'Pediatric Formulations',
  'First Aid & Surgical',
  'General Consumer Health',
] as const;

export const EXPENSE_CATEGORIES = [
  'Electricity & Utility Bills',
  'Pharmacy Shop Rent',
  'Staff Salaries & Commissions',
  'Packaging & Thermal Rolls',
  'Store Cleaning & Maintenance',
  'Marketing & Signboards',
  'License & Regulatory Fees',
  'Miscellaneous Operational',
] as const;

export const exportToCSV = (filename: string, rows: (string | number)[][]) => {
  const processRow = (row: (string | number)[]) => {
    return row.map(val => {
      const strVal = String(val ?? '');
      if (strVal.search(/("|,|\n)/g) >= 0) {
        return `"${strVal.replace(/"/g, '""')}"`;
      }
      return strVal;
    }).join(',');
  };

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(processRow).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const playCashSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    // Audio context may be restricted
  }
};

export const playAlertSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(330, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    // Audio context may be restricted
  }
};

export const calculateItemProfit = (
  priceOrRevenue: number,
  costOrPurchasePrice: number,
  quantity: number = 1,
  discountPercentage: number = 0
): number => {
  const revenue = quantity === 1 && discountPercentage === 0
    ? priceOrRevenue
    : (priceOrRevenue * (1 - discountPercentage / 100)) * quantity;
  const cost = quantity === 1 ? costOrPurchasePrice : costOrPurchasePrice * quantity;
  return Math.max(0, revenue - cost);
};


