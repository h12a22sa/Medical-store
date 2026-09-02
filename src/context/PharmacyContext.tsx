import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Medicine,
  Customer,
  Supplier,
  Sale,
  Purchase,
  Expense,
  ActivityLog,
  SystemNotification,
  StoreSettings,
  User,
  HeldBill,
  SaleReturn,
  PurchaseReturn,
  StockAdjustment,
  StockMovement,
  CartItem,
  PaymentMethod,
  MedicineCategory,
} from '../types';
import {
  initialMedicines,
  initialCustomers,
  initialSuppliers,
  initialSales,
  initialPurchases,
  initialExpenses,
  initialActivityLogs,
  initialNotifications,
  initialStoreSettings,
  initialUsers,
} from '../data/mockData';
import { playBeep } from '../utils/helpers';

interface PharmacyContextType {
  // Master data
  medicines: Medicine[];
  categories: MedicineCategory[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  saleReturns: SaleReturn[];
  purchaseReturns: PurchaseReturn[];
  expenses: Expense[];
  activityLogs: ActivityLog[];
  notifications: SystemNotification[];
  storeSettings: StoreSettings;
  users: User[];
  currentUser: User;
  heldBills: HeldBill[];
  stockAdjustments: StockAdjustment[];
  stockMovements: StockMovement[];

  // Navigation & UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
  selectedMedicineId: string | null;
  setSelectedMedicineId: (id: string | null) => void;
  selectedInvoiceId: string | null;
  setSelectedInvoiceId: (id: string | null) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  selectedSupplierId: string | null;
  setSelectedSupplierId: (id: string | null) => void;
  selectedPurchaseId: string | null;
  setSelectedPurchaseId: (id: string | null) => void;
  isInvoiceModalOpen: boolean;
  setIsInvoiceModalOpen: (open: boolean) => void;
  activeInvoiceToPrint: Sale | null;
  setActiveInvoiceToPrint: (sale: Sale | null) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  isBarcodeModalOpen: boolean;
  setIsBarcodeModalOpen: (open: boolean) => void;

  // Actions - Medicines
  addMedicine: (med: Omit<Medicine, 'id' | 'lastUpdated'>) => Medicine;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  adjustStock: (medicineId: string, newStock: number, reason: StockAdjustment['reason'], notes?: string) => void;

  // Actions - Sales / POS
  completeSale: (saleData: {
    customerId: string;
    customerName: string;
    customerPhone?: string;
    items: CartItem[];
    subtotal: number;
    discountAmount: number;
    taxPercentage: number;
    taxAmount: number;
    grandTotal: number;
    paidAmount: number;
    changeAmount: number;
    remainingBalance: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => Sale;
  holdBill: (held: Omit<HeldBill, 'id' | 'heldAt'>) => void;
  resumeHeldBill: (id: string) => HeldBill | undefined;
  deleteHeldBill: (id: string) => void;
  processSaleReturn: (data: Omit<SaleReturn, 'id' | 'returnNumber' | 'timestamp' | 'handledBy'>) => void;

  // Actions - Purchases
  addPurchase: (purchaseData: {
    supplierInvoiceNumber: string;
    supplierId: string;
    supplierName: string;
    purchaseDate: string;
    receivedDate: string;
    items: {
      medicineId: string;
      medicineName: string;
      batchNumber: string;
      quantity: number;
      purchasePrice: number;
      retailPrice: number;
      mfgDate: string;
      expiryDate: string;
    }[];
    totalAmount: number;
    paidAmount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => Purchase;
  processPurchaseReturn: (data: Omit<PurchaseReturn, 'id' | 'returnNumber'>) => void;

  // Actions - Customers & Suppliers
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'totalPaid' | 'outstandingBalance'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addCustomerPayment: (customerId: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => void;

  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'totalPurchases' | 'totalPaid' | 'outstandingBalance'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addSupplierPayment: (supplierId: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => void;

  // Actions - Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'recordedBy'>) => void;
  deleteExpense: (id: string) => void;

  // Actions - Categories
  addCategory: (cat: MedicineCategory) => void;
  deleteCategory: (cat: MedicineCategory) => void;

  // Actions - Users & Auth
  setCurrentUser: (user: User) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;

  // Actions - Notifications & Settings & Data
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  resetToDemoData: () => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonStr: string) => boolean;

  // Quick stats helpers
  stats: {
    todaySales: number;
    todayProfit: number;
    todaySalesCount: number;
    totalMedicinesCount: number;
    totalStockValue: number;
    lowStockCount: number;
    expiredCount: number;
    expiringSoonCount: number;
    totalCustomersCount: number;
    totalSuppliersCount: number;
    totalPendingUdhaar: number;
    totalSupplierPayables: number;
  };
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

const STORAGE_PREFIX = 'awan_pharmacy_';

const initialCategoriesList: MedicineCategory[] = [
  'Tablets',
  'Capsules',
  'Syrups',
  'Injections',
  'Creams & Ointments',
  'Eye/Ear Drops',
  'Inhalers & Respiratory',
  'Antibiotics',
  'Pain Relief',
  'Vitamins & Supplements',
  'Cardiovascular',
  'Gastrointestinal',
  'Medical Devices & First Aid',
  'Other',
];

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or fallback to realistic initial data
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}medicines`);
    return saved ? JSON.parse(saved) : initialMedicines;
  });

  const [categories, setCategories] = useState<MedicineCategory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}categories`);
    return saved ? JSON.parse(saved) : initialCategoriesList;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}customers`);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}suppliers`);
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}sales`);
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}purchases`);
    return saved ? JSON.parse(saved) : initialPurchases;
  });

  const [saleReturns, setSaleReturns] = useState<SaleReturn[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}saleReturns`);
    return saved ? JSON.parse(saved) : [];
  });

  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}purchaseReturns`);
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}expenses`);
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}activityLogs`);
    return saved ? JSON.parse(saved) : initialActivityLogs;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}settings`);
    return saved ? JSON.parse(saved) : initialStoreSettings;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}users`);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    return initialUsers[0]; // Admin by default
  });

  const [heldBills, setHeldBills] = useState<HeldBill[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}heldBills`);
    return saved ? JSON.parse(saved) : [];
  });

  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}stockAdjustments`);
    return saved ? JSON.parse(saved) : [];
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}stockMovements`);
    return saved ? JSON.parse(saved) : [];
  });

  // UI States
  const [activeTab, setActiveTabState] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Selected item modal / detail states
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [activeInvoiceToPrint, setActiveInvoiceToPrint] = useState<Sale | null>(null);

  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}medicines`, JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}categories`, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}customers`, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}suppliers`, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}sales`, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}purchases`, JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}saleReturns`, JSON.stringify(saleReturns));
  }, [saleReturns]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}purchaseReturns`, JSON.stringify(purchaseReturns));
  }, [purchaseReturns]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}activityLogs`, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}settings`, JSON.stringify(storeSettings));
    if (storeSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [storeSettings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}heldBills`, JSON.stringify(heldBills));
  }, [heldBills]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}stockAdjustments`, JSON.stringify(stockAdjustments));
  }, [stockAdjustments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}stockMovements`, JSON.stringify(stockMovements));
  }, [stockMovements]);

  const logActivity = (action: string, details: string, category: ActivityLog['category']) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      role: currentUser.role,
      action,
      details,
      category,
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  const addNotification = (title: string, message: string, type: SystemNotification['type'], linkTab?: string) => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title,
      message,
      type,
      read: false,
      linkTab,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    setIsMobileDrawerOpen(false);
  };

  // Medicine operations
  const addMedicine = (medData: Omit<Medicine, 'id' | 'lastUpdated'>): Medicine => {
    const id = `med-${Date.now()}`;
    const newMed: Medicine = {
      ...medData,
      id,
      lastUpdated: new Date().toISOString(),
    };
    setMedicines(prev => [newMed, ...prev]);
    logActivity(`Added Medicine: ${newMed.name}`, `SKU: ${newMed.sku}, Stock: ${newMed.currentStock}`, 'INVENTORY');
    if (storeSettings.enableSoundEffects) playBeep('success');
    return newMed;
  };

  const updateMedicine = (id: string, updates: Partial<Medicine>) => {
    setMedicines(prev =>
      prev.map(m => (m.id === id ? { ...m, ...updates, lastUpdated: new Date().toISOString() } : m))
    );
    logActivity(`Updated Medicine (${id})`, JSON.stringify(updates), 'INVENTORY');
  };

  const deleteMedicine = (id: string) => {
    const med = medicines.find(m => m.id === id);
    setMedicines(prev => prev.filter(m => m.id !== id));
    if (med) {
      logActivity(`Deleted Medicine: ${med.name}`, `Batch: ${med.batchNumber}`, 'INVENTORY');
    }
  };

  const adjustStock = (medicineId: string, newStock: number, reason: StockAdjustment['reason'], notes?: string) => {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;
    const diff = newStock - med.currentStock;

    const adjustmentRecord: StockAdjustment = {
      id: `adj-${Date.now()}`,
      medicineId,
      medicineName: med.name,
      batchNumber: med.batchNumber,
      previousStock: med.currentStock,
      adjustedStock: newStock,
      difference: diff,
      reason,
      date: new Date().toISOString(),
      adjustedBy: currentUser.name,
      notes,
    };

    setStockAdjustments(prev => [adjustmentRecord, ...prev]);

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toISOString(),
      medicineId,
      medicineName: med.name,
      batchNumber: med.batchNumber,
      type: 'ADJUSTMENT',
      quantityChange: diff,
      resultingStock: newStock,
      referenceId: adjustmentRecord.id,
      user: currentUser.name,
    };
    setStockMovements(prev => [movement, ...prev]);

    updateMedicine(medicineId, { currentStock: newStock });
    logActivity(`Stock Adjustment for ${med.name}`, `Changed from ${med.currentStock} to ${newStock} (${reason})`, 'INVENTORY');
  };

  // Complete POS Sale
  const completeSale = (saleData: {
    customerId: string;
    customerName: string;
    customerPhone?: string;
    items: CartItem[];
    subtotal: number;
    discountAmount: number;
    taxPercentage: number;
    taxAmount: number;
    grandTotal: number;
    paidAmount: number;
    changeAmount: number;
    remainingBalance: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Sale => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const invoiceNumber = `${storeSettings.invoicePrefix}${dateStr}-${randomSuffix}`;

    const totalCost = saleData.items.reduce((acc, item) => acc + item.costPrice * item.quantity, 0);
    const grossProfit = saleData.grandTotal - totalCost;

    let paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' = 'PAID';
    if (saleData.remainingBalance > 0 && saleData.paidAmount > 0) {
      paymentStatus = 'PARTIAL';
    } else if (saleData.remainingBalance > 0 && saleData.paidAmount <= 0) {
      paymentStatus = 'UNPAID';
    }

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNumber,
      timestamp: new Date().toISOString(),
      customerId: saleData.customerId,
      customerName: saleData.customerName,
      customerPhone: saleData.customerPhone,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      items: saleData.items,
      subtotal: saleData.subtotal,
      discountAmount: saleData.discountAmount,
      taxPercentage: saleData.taxPercentage,
      taxAmount: saleData.taxAmount,
      grandTotal: saleData.grandTotal,
      paidAmount: saleData.paidAmount,
      changeAmount: saleData.changeAmount,
      remainingBalance: saleData.remainingBalance,
      paymentMethod: saleData.paymentMethod,
      paymentStatus,
      status: 'COMPLETED',
      notes: saleData.notes,
      totalCost,
      grossProfit,
    };

    // 1. Save sale
    setSales(prev => [newSale, ...prev]);

    // 2. Reduce medicine inventory
    setMedicines(prevMeds =>
      prevMeds.map(m => {
        const soldItem = saleData.items.find(i => i.medicineId === m.id);
        if (soldItem) {
          const newQty = Math.max(0, m.currentStock - soldItem.quantity);
          return {
            ...m,
            currentStock: newQty,
            lastUpdated: new Date().toISOString(),
          };
        }
        return m;
      })
    );

    // 3. Log stock movements
    saleData.items.forEach(item => {
      const med = medicines.find(m => m.id === item.medicineId);
      const remaining = med ? Math.max(0, med.currentStock - item.quantity) : 0;
      const movement: StockMovement = {
        id: `mov-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        batchNumber: item.batchNumber,
        type: 'SALE',
        quantityChange: -item.quantity,
        resultingStock: remaining,
        referenceId: invoiceNumber,
        user: currentUser.name,
      };
      setStockMovements(prev => [movement, ...prev]);
    });

    // 4. Update customer purchase balance if credit / registered customer
    if (saleData.customerId && saleData.customerId !== 'cust-walkin') {
      setCustomers(prevCusts =>
        prevCusts.map(c => {
          if (c.id === saleData.customerId) {
            return {
              ...c,
              totalPurchases: c.totalPurchases + saleData.grandTotal,
              totalPaid: c.totalPaid + saleData.paidAmount,
              outstandingBalance: c.outstandingBalance + saleData.remainingBalance,
            };
          }
          return c;
        })
      );
    }

    logActivity(`Created Sale ${invoiceNumber}`, `Grand Total: Rs. ${saleData.grandTotal.toFixed(2)} (${saleData.paymentMethod})`, 'SALE');

    if (storeSettings.enableSoundEffects) playBeep('success');

    return newSale;
  };

  // Held Bills
  const holdBill = (heldData: Omit<HeldBill, 'id' | 'heldAt'>) => {
    const newHeld: HeldBill = {
      ...heldData,
      id: `held-${Date.now()}`,
      heldAt: new Date().toISOString(),
    };
    setHeldBills(prev => [newHeld, ...prev]);
    logActivity(`Held Bill for ${newHeld.customerName}`, `${newHeld.items.length} items on hold`, 'SALE');
  };

  const resumeHeldBill = (id: string): HeldBill | undefined => {
    const bill = heldBills.find(b => b.id === id);
    if (bill) {
      setHeldBills(prev => prev.filter(b => b.id !== id));
      return bill;
    }
    return undefined;
  };

  const deleteHeldBill = (id: string) => {
    setHeldBills(prev => prev.filter(b => b.id !== id));
  };

  // Process Sale Return
  const processSaleReturn = (data: Omit<SaleReturn, 'id' | 'returnNumber' | 'timestamp' | 'handledBy'>) => {
    const returnNumber = `RET-${Date.now().toString().slice(-6)}`;
    const newReturn: SaleReturn = {
      ...data,
      id: `ret-${Date.now()}`,
      returnNumber,
      timestamp: new Date().toISOString(),
      handledBy: currentUser.name,
    };

    setSaleReturns(prev => [newReturn, ...prev]);

    // Restock returned medicines
    data.items.forEach(retItem => {
      setMedicines(prev =>
        prev.map(m => {
          if (m.id === retItem.medicineId) {
            return {
              ...m,
              currentStock: m.currentStock + retItem.quantity,
              lastUpdated: new Date().toISOString(),
            };
          }
          return m;
        })
      );

      const movement: StockMovement = {
        id: `mov-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        medicineId: retItem.medicineId,
        medicineName: retItem.medicineName,
        batchNumber: retItem.batchNumber,
        type: 'SALE_RETURN',
        quantityChange: retItem.quantity,
        resultingStock: 0,
        referenceId: returnNumber,
        user: currentUser.name,
      };
      setStockMovements(prev => [movement, ...prev]);
    });

    logActivity(`Processed Sale Return ${returnNumber}`, `Refund Rs. ${data.totalRefund} for Invoice ${data.invoiceNumber}`, 'SALE');
    addNotification(`Sale Return Processed`, `Return ${returnNumber} processed for invoice ${data.invoiceNumber} (Rs. ${data.totalRefund})`, 'SALE', 'sales/returns');
  };

  // Purchases
  const addPurchase = (purchaseData: {
    supplierInvoiceNumber: string;
    supplierId: string;
    supplierName: string;
    purchaseDate: string;
    receivedDate: string;
    items: {
      medicineId: string;
      medicineName: string;
      batchNumber: string;
      quantity: number;
      purchasePrice: number;
      retailPrice: number;
      mfgDate: string;
      expiryDate: string;
    }[];
    totalAmount: number;
    paidAmount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Purchase => {
    const purchaseNumber = `${storeSettings.purchasePrefix}${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const remainingAmount = Math.max(0, purchaseData.totalAmount - purchaseData.paidAmount);
    const paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' = remainingAmount === 0 ? 'PAID' : (purchaseData.paidAmount > 0 ? 'PARTIAL' : 'UNPAID');

    const purchaseItems = purchaseData.items.map(item => ({
      ...item,
      total: item.quantity * item.purchasePrice,
    }));

    const newPurchase: Purchase = {
      id: `pur-${Date.now()}`,
      purchaseNumber,
      supplierInvoiceNumber: purchaseData.supplierInvoiceNumber,
      supplierId: purchaseData.supplierId,
      supplierName: purchaseData.supplierName,
      purchaseDate: purchaseData.purchaseDate,
      receivedDate: purchaseData.receivedDate,
      items: purchaseItems,
      totalAmount: purchaseData.totalAmount,
      paidAmount: purchaseData.paidAmount,
      remainingAmount,
      paymentStatus,
      paymentMethod: purchaseData.paymentMethod,
      status: 'RECEIVED',
      notes: purchaseData.notes,
      handledBy: currentUser.name,
    };

    setPurchases(prev => [newPurchase, ...prev]);

    // Increase stock for all purchase items
    purchaseData.items.forEach(pItem => {
      setMedicines(prev =>
        prev.map(m => {
          if (m.id === pItem.medicineId) {
            return {
              ...m,
              currentStock: m.currentStock + pItem.quantity,
              purchasePrice: pItem.purchasePrice,
              retailPrice: pItem.retailPrice || m.retailPrice,
              batchNumber: pItem.batchNumber || m.batchNumber,
              expiryDate: pItem.expiryDate || m.expiryDate,
              mfgDate: pItem.mfgDate || m.mfgDate,
              lastUpdated: new Date().toISOString(),
            };
          }
          return m;
        })
      );

      const movement: StockMovement = {
        id: `mov-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        medicineId: pItem.medicineId,
        medicineName: pItem.medicineName,
        batchNumber: pItem.batchNumber,
        type: 'PURCHASE',
        quantityChange: pItem.quantity,
        resultingStock: 0,
        referenceId: purchaseNumber,
        user: currentUser.name,
      };
      setStockMovements(prev => [movement, ...prev]);
    });

    // Update supplier ledger & payable
    setSuppliers(prev =>
      prev.map(s => {
        if (s.id === purchaseData.supplierId) {
          return {
            ...s,
            totalPurchases: s.totalPurchases + purchaseData.totalAmount,
            totalPaid: s.totalPaid + purchaseData.paidAmount,
            outstandingBalance: s.outstandingBalance + remainingAmount,
          };
        }
        return s;
      })
    );

    logActivity(`Added Purchase ${purchaseNumber}`, `Total: Rs. ${purchaseData.totalAmount} from ${purchaseData.supplierName}`, 'PURCHASE');
    if (storeSettings.enableSoundEffects) playBeep('success');
    return newPurchase;
  };

  const processPurchaseReturn = (data: Omit<PurchaseReturn, 'id' | 'returnNumber'>) => {
    const returnNumber = `PR-${Date.now().toString().slice(-6)}`;
    const newReturn: PurchaseReturn = {
      ...data,
      id: `pret-${Date.now()}`,
      returnNumber,
    };
    setPurchaseReturns(prev => [newReturn, ...prev]);

    // Decrease inventory
    data.items.forEach(item => {
      setMedicines(prev =>
        prev.map(m => {
          if (m.id === item.medicineId) {
            return {
              ...m,
              currentStock: Math.max(0, m.currentStock - item.quantity),
              lastUpdated: new Date().toISOString(),
            };
          }
          return m;
        })
      );
    });

    // Reduce supplier payable
    setSuppliers(prev =>
      prev.map(s => {
        if (s.id === data.supplierId) {
          return {
            ...s,
            outstandingBalance: Math.max(0, s.outstandingBalance - data.totalAmount),
          };
        }
        return s;
      })
    );

    logActivity(`Purchase Return ${returnNumber}`, `Returned Rs. ${data.totalAmount} to ${data.supplierName}`, 'PURCHASE');
  };

  // Customers & Suppliers
  const addCustomer = (custData: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'totalPaid' | 'outstandingBalance'>): Customer => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      totalPurchases: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers(prev => [newCust, ...prev]);
    logActivity(`Added Customer: ${newCust.name}`, `Phone: ${newCust.phone}`, 'CUSTOMER');
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    logActivity(`Updated Customer (${id})`, JSON.stringify(updates), 'CUSTOMER');
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const addCustomerPayment = (customerId: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => {
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          const newBal = Math.max(0, c.outstandingBalance - amount);
          return {
            ...c,
            totalPaid: c.totalPaid + amount,
            outstandingBalance: newBal,
          };
        }
        return c;
      })
    );
    const cust = customers.find(c => c.id === customerId);
    logActivity(`Payment Received from ${cust?.name || customerId}`, `Amount: Rs. ${amount.toFixed(2)} (${paymentMethod}) - ${notes || ''}`, 'CUSTOMER');
    if (storeSettings.enableSoundEffects) playBeep('success');
  };

  const addSupplier = (supData: Omit<Supplier, 'id' | 'createdAt' | 'totalPurchases' | 'totalPaid' | 'outstandingBalance'>): Supplier => {
    const newSup: Supplier = {
      ...supData,
      id: `sup-${Date.now()}`,
      totalPurchases: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
    };
    setSuppliers(prev => [newSup, ...prev]);
    logActivity(`Added Supplier: ${newSup.name}`, `Company: ${newSup.companyName}`, 'SUPPLIER');
    return newSup;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    logActivity(`Updated Supplier (${id})`, JSON.stringify(updates), 'SUPPLIER');
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const addSupplierPayment = (supplierId: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => {
    setSuppliers(prev =>
      prev.map(s => {
        if (s.id === supplierId) {
          return {
            ...s,
            totalPaid: s.totalPaid + amount,
            outstandingBalance: Math.max(0, s.outstandingBalance - amount),
          };
        }
        return s;
      })
    );
    const sup = suppliers.find(s => s.id === supplierId);
    logActivity(`Payment to Supplier ${sup?.name || supplierId}`, `Amount: Rs. ${amount.toFixed(2)} (${paymentMethod}) - ${notes || ''}`, 'SUPPLIER');
  };

  // Expenses
  const addExpense = (expData: Omit<Expense, 'id' | 'recordedBy'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      recordedBy: currentUser.name,
    };
    setExpenses(prev => [newExp, ...prev]);
    logActivity(`Expense Added: ${newExp.title}`, `Amount: Rs. ${newExp.amount} (${newExp.category})`, 'EXPENSE');
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Categories
  const addCategory = (cat: MedicineCategory) => {
    if (!categories.includes(cat)) {
      setCategories(prev => [...prev, cat]);
    }
  };

  const deleteCategory = (cat: MedicineCategory) => {
    setCategories(prev => prev.filter(c => c !== cat));
  };

  // Users
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    logActivity(`Added Staff User: ${newUser.name}`, `Role: ${newUser.role}`, 'AUTH');
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    if (currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
  };

  // Notifications & Settings
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    setStoreSettings(prev => ({ ...prev, ...newSettings }));
    logActivity('Updated Store Settings', JSON.stringify(newSettings), 'SETTINGS');
  };

  const resetToDemoData = () => {
    setMedicines(initialMedicines);
    setCategories(initialCategoriesList);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setSales(initialSales);
    setPurchases(initialPurchases);
    setSaleReturns([]);
    setPurchaseReturns([]);
    setExpenses(initialExpenses);
    setActivityLogs(initialActivityLogs);
    setNotifications(initialNotifications);
    setStoreSettings(initialStoreSettings);
    setUsers(initialUsers);
    setCurrentUser(initialUsers[0]);
    setHeldBills([]);
    setStockAdjustments([]);
    setStockMovements([]);
    localStorage.clear();
  };

  const exportDatabaseJSON = () => {
    const backupData = {
      medicines,
      categories,
      customers,
      suppliers,
      sales,
      purchases,
      saleReturns,
      purchaseReturns,
      expenses,
      activityLogs,
      notifications,
      storeSettings,
      users,
      heldBills,
      stockAdjustments,
      stockMovements,
      exportTimestamp: new Date().toISOString(),
      version: '1.0.0',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `awan_medical_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.medicines && data.sales && data.storeSettings) {
        if (data.medicines) setMedicines(data.medicines);
        if (data.categories) setCategories(data.categories);
        if (data.customers) setCustomers(data.customers);
        if (data.suppliers) setSuppliers(data.suppliers);
        if (data.sales) setSales(data.sales);
        if (data.purchases) setPurchases(data.purchases);
        if (data.saleReturns) setSaleReturns(data.saleReturns);
        if (data.purchaseReturns) setPurchaseReturns(data.purchaseReturns);
        if (data.expenses) setExpenses(data.expenses);
        if (data.activityLogs) setActivityLogs(data.activityLogs);
        if (data.notifications) setNotifications(data.notifications);
        if (data.storeSettings) setStoreSettings(data.storeSettings);
        if (data.users) setUsers(data.users);
        if (data.heldBills) setHeldBills(data.heldBills);
        if (data.stockAdjustments) setStockAdjustments(data.stockAdjustments);
        if (data.stockMovements) setStockMovements(data.stockMovements);
        logActivity('Database Restored from JSON', 'Full system state imported', 'SETTINGS');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Dynamic calculations for dashboard and alert cards
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySalesList = sales.filter(s => s.timestamp.startsWith(todayStr) && s.status === 'COMPLETED');
  const todaySales = todaySalesList.reduce((acc, s) => acc + s.grandTotal, 0);
  const todayProfit = todaySalesList.reduce((acc, s) => acc + s.grossProfit, 0);

  const totalMedicinesCount = medicines.length;
  const totalStockValue = medicines.reduce((acc, m) => acc + m.currentStock * m.purchasePrice, 0);

  const lowStockCount = medicines.filter(m => m.currentStock <= m.minimumStock && m.currentStock > 0).length;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let expiredCount = 0;
  let expiringSoonCount = 0;

  medicines.forEach(m => {
    if (!m.expiryDate) return;
    const exp = new Date(m.expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      expiredCount++;
    } else if (diffDays <= storeSettings.expiryWarningDays) {
      expiringSoonCount++;
    }
  });

  const totalPendingUdhaar = customers.reduce((acc, c) => acc + c.outstandingBalance, 0);
  const totalSupplierPayables = suppliers.reduce((acc, s) => acc + s.outstandingBalance, 0);

  const stats = {
    todaySales,
    todayProfit,
    todaySalesCount: todaySalesList.length,
    totalMedicinesCount,
    totalStockValue,
    lowStockCount,
    expiredCount,
    expiringSoonCount,
    totalCustomersCount: customers.length,
    totalSuppliersCount: suppliers.length,
    totalPendingUdhaar,
    totalSupplierPayables,
  };

  return (
    <PharmacyContext.Provider
      value={{
        medicines,
        categories,
        customers,
        suppliers,
        sales,
        purchases,
        saleReturns,
        purchaseReturns,
        expenses,
        activityLogs,
        notifications,
        storeSettings,
        users,
        currentUser,
        heldBills,
        stockAdjustments,
        stockMovements,
        activeTab,
        setActiveTab,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        selectedMedicineId,
        setSelectedMedicineId,
        selectedInvoiceId,
        setSelectedInvoiceId,
        selectedCustomerId,
        setSelectedCustomerId,
        selectedSupplierId,
        setSelectedSupplierId,
        selectedPurchaseId,
        setSelectedPurchaseId,
        isInvoiceModalOpen,
        setIsInvoiceModalOpen,
        activeInvoiceToPrint,
        setActiveInvoiceToPrint,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        isBarcodeModalOpen,
        setIsBarcodeModalOpen,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        adjustStock,
        completeSale,
        holdBill,
        resumeHeldBill,
        deleteHeldBill,
        processSaleReturn,
        addPurchase,
        processPurchaseReturn,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addCustomerPayment,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addSupplierPayment,
        addExpense,
        deleteExpense,
        addCategory,
        deleteCategory,
        setCurrentUser,
        addUser,
        updateUser,
        markNotificationRead,
        clearAllNotifications,
        updateStoreSettings,
        resetToDemoData,
        exportDatabaseJSON,
        importDatabaseJSON,
        stats,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};
