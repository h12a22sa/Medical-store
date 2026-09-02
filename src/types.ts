export type UserRole = 'admin' | 'manager' | 'cashier' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  active: boolean;
  avatar?: string;
  createdAt: string;
}

export type MedicineCategory = 
  | 'Tablets' 
  | 'Capsules' 
  | 'Syrups' 
  | 'Injections' 
  | 'Creams & Ointments' 
  | 'Eye/Ear Drops' 
  | 'Inhalers & Respiratory' 
  | 'Antibiotics' 
  | 'Pain Relief' 
  | 'Vitamins & Supplements' 
  | 'Cardiovascular' 
  | 'Gastrointestinal' 
  | 'Medical Devices & First Aid' 
  | 'Other';

export type MedicineForm = 'Tablet' | 'Capsule' | 'Syrup' | 'Suspension' | 'Injection' | 'Cream' | 'Ointment' | 'Drops' | 'Inhaler' | 'Sachet' | 'Gel' | 'Device';

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brandName: string;
  category: MedicineCategory;
  form: MedicineForm;
  strength: string; // e.g. "500mg", "20mg", "5ml/100ml"
  description: string;
  manufacturer: string;
  supplierId: string;
  supplierName: string;
  
  // Identification
  barcode: string;
  sku: string;
  batchNumber: string;
  
  // Inventory
  currentStock: number; // in units (tablets/bottles)
  minimumStock: number;
  unit: string; // 'Tablets', 'Bottles', 'Vials', 'Pcs'
  boxQuantity: number; // number of boxes
  tabletsPerBox: number; // e.g. 100 tablets per box (10 strips of 10)
  reservedStock: number;
  
  // Pricing (in PKR)
  purchasePrice: number; // Cost price per unit
  retailPrice: number; // Sale price per unit
  wholesalePrice: number;
  discountPercentage: number;
  
  // Dates (YYYY-MM-DD)
  mfgDate: string;
  expiryDate: string;
  purchaseDate: string;
  lastUpdated: string;
  
  // Attributes
  prescriptionRequired: boolean;
  storageInstructions: string;
  rackLocation: string; // e.g. "Rack A-3", "Fridge 1"
  image?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  customerType: 'Regular' | 'Walk-in' | 'Doctor/Clinic' | 'Wholesale';
  totalPurchases: number;
  totalPaid: number;
  outstandingBalance: number; // Udhaar / Credit
  creditLimit?: number;
  notes?: string;
  createdAt: string;
}

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  date: string;
  type: 'SALE_INVOICE' | 'PAYMENT_RECEIVED' | 'RETURN_REFUND';
  referenceId: string;
  description: string;
  debit: number; // increase balance (sale)
  credit: number; // decrease balance (payment)
  balance: number;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  taxNumber?: string; // NTN/STRN
  paymentTerms: string;
  totalPurchases: number;
  totalPaid: number;
  outstandingBalance: number;
  notes?: string;
  createdAt: string;
}

export interface SupplierLedgerEntry {
  id: string;
  supplierId: string;
  date: string;
  type: 'PURCHASE_BILL' | 'PAYMENT_MADE' | 'PURCHASE_RETURN';
  referenceId: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer' | 'Easypaisa' | 'JazzCash' | 'Credit/Udhaar' | 'Other';

export interface CartItem {
  medicineId: string;
  medicineName: string;
  genericName?: string;
  category?: MedicineCategory | string;
  batchNumber: string;
  expiryDate?: string;
  unit?: string;
  quantity: number;
  unitPrice: number; // Retail price
  costPrice?: number; // For profit calculation
  purchasePrice?: number; // Cost price alias
  discount?: number;
  discountPercent?: number;
  totalPrice: number;
  availableStock?: number;
  profit?: number;
}

export type SaleItem = CartItem;

export interface CustomerPayment {
  id: string;
  customerId: string;
  customerName: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: string;
  timestamp: string;
  notes?: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName: string;
  paymentNumber: string;
  amount: number;
  paymentMethod: string;
  timestamp: string;
  notes?: string;
}


export interface Sale {
  id: string;
  invoiceNumber: string; // e.g. "INV-20260902-001"
  timestamp: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  cashierId: string;
  cashierName: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  changeAmount: number;
  remainingBalance: number; // If credit
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  status: 'COMPLETED' | 'RETURNED' | 'CANCELLED';
  notes?: string;
  totalCost: number;
  grossProfit: number;
}

export interface HeldBill {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerId?: string;
  heldAt: string;
  items: CartItem[];
  discountAmount: number;
  notes?: string;
}

export interface SaleReturn {
  id: string;
  returnNumber: string; // e.g. "RET-001"
  invoiceId: string;
  invoiceNumber: string;
  timestamp: string;
  customerId: string;
  customerName: string;
  items: {
    medicineId: string;
    medicineName: string;
    batchNumber: string;
    quantity: number;
    unitPrice: number;
    refundAmount: number;
    reason: 'Wrong Medicine' | 'Damaged' | 'Customer Request' | 'Expired' | 'Other';
  }[];
  totalRefund: number;
  refundMethod: PaymentMethod;
  notes?: string;
  handledBy: string;
}

export interface PurchaseItem {
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  purchasePrice: number;
  retailPrice: number;
  mfgDate: string;
  expiryDate: string;
  total: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string; // e.g. "PO-2026-0042"
  supplierInvoiceNumber: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  receivedDate: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  paymentMethod: PaymentMethod;
  status: 'RECEIVED' | 'ORDERED' | 'CANCELLED';
  notes?: string;
  handledBy: string;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string;
  purchaseId?: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: {
    medicineId: string;
    medicineName: string;
    batchNumber: string;
    quantity: number;
    purchasePrice: number;
    totalAmount: number;
    reason: string;
  }[];
  totalAmount: number;
  notes?: string;
  status: 'COMPLETED' | 'PENDING';
}

export type ExpenseCategory = 'Rent' | 'Electricity' | 'Staff Salary' | 'Transport & Delivery' | 'Internet & Phone' | 'Maintenance & Repairs' | 'Taxes & Licenses' | 'Packaging & Stationery' | 'Other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  description?: string;
  receiptNumber?: string;
  recordedBy: string;
}

export interface StockAdjustment {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  previousStock: number;
  adjustedStock: number;
  difference: number;
  reason: 'Inventory Audit' | 'Damaged Goods' | 'Expired Discard' | 'Supplier Error' | 'Theft/Loss' | 'Other';
  date: string;
  adjustedBy: string;
  notes?: string;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  type: 'SALE' | 'PURCHASE' | 'SALE_RETURN' | 'PURCHASE_RETURN' | 'ADJUSTMENT';
  quantityChange: number; // positive or negative
  resultingStock: number;
  referenceId: string;
  user: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
  category: 'AUTH' | 'SALE' | 'INVENTORY' | 'PURCHASE' | 'CUSTOMER' | 'SUPPLIER' | 'EXPENSE' | 'SETTINGS';
}

export interface SystemNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'EXPIRED' | 'EXPIRING_SOON' | 'LOW_STOCK' | 'PAYMENT_DUE' | 'SALE' | 'INFO';
  read: boolean;
  linkTab?: string;
  metadata?: Record<string, string | number>;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoUrl?: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  drugLicenseNumber: string;
  ntnNumber: string;
  currency: string;
  currencySymbol: string;
  taxPercentage: number;
  invoicePrefix: string;
  purchasePrefix: string;
  invoiceFooterNote: string;
  lowStockThreshold: number;
  expiryWarningDays: number;
  allowExpiredMedicineSale: boolean;
  enableSoundEffects: boolean;
  theme: 'light' | 'dark' | 'system';
}
