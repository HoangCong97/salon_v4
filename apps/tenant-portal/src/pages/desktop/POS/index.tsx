import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { formatCurrencyVND } from "@salon/shared-utils";
import { POSLeftPanel } from "./POSLeftPanel";
import { POSRightPanel } from "./POSRightPanel";
import { POSReceiptModal } from "./POSReceiptModal";

interface StaffMember {
  id: string;
  name: string;
  role?: { name: string } | null;
}

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration?: number | null;
  category?: { name: string } | null;
  discountPrice?: number | null;
  additionalPrices?: number[] | null;
}

interface ProductItem {
  id: string;
  name: string;
  sellPrice: number;
  quantity: number;
}

interface PackageItem {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  duration?: number | null;
}

// Fallback Mock Data for Demo/Empty States
const MOCK_STAFF: StaffMember[] = [
  { id: "s_m1", name: "Thợ A (Stylist)", role: { name: "Employee" } },
  { id: "s_m2", name: "Thợ B (Nail Tech)", role: { name: "Employee" } },
  { id: "s_m3", name: "Thợ C (Thợ phụ)", role: { name: "Employee" } },
  { id: "s_m4", name: "Thợ D (Lễ tân)", role: { name: "Employee" } }
];

const MOCK_SERVICES: ServiceItem[] = [
  { id: "s1", name: "Cắt tóc nam Classic", price: 120000, duration: 30, category: { name: "Tóc" }, discountPrice: 100000, additionalPrices: [150000, 180000] },
  { id: "s2", name: "Uốn tóc xoăn Hàn Quốc", price: 450000, duration: 90, category: { name: "Tóc" }, additionalPrices: [500000, 550000] },
  { id: "s3", name: "Nhuộm màu thời trang", price: 650000, duration: 120, category: { name: "Tóc" } },
  { id: "s4", name: "Gội đầu dưỡng sinh thảo dược", price: 150000, duration: 45, category: { name: "Spa" }, additionalPrices: [120000, 180000] },
  { id: "s5", name: "Massage cổ vai gáy", price: 200000, duration: 45, category: { name: "Spa" } },
  { id: "s6", name: "Sơn móng gel cao cấp", price: 180000, duration: 60, category: { name: "Móng" } },
];

const MOCK_PRODUCTS: ProductItem[] = [
  { id: "p1", name: "Dầu gội bưởi phục hồi tóc", sellPrice: 180000, quantity: 15 },
  { id: "p2", name: "Sáp vuốt tóc Clay Pomade", sellPrice: 220000, quantity: 24 },
  { id: "p3", name: "Gôm xịt tóc Silhouette", sellPrice: 150000, quantity: 30 }
];

const MOCK_PACKAGES: PackageItem[] = [
  { id: "pkg1", name: "Combo Cắt Gội Massage Thư Giãn", price: 220000, description: "Cắt tóc nam + Gội dưỡng sinh + Massage vai gáy", duration: 75 },
  { id: "pkg2", name: "Combo Làm Móng & Chăm Sóc Da", price: 350000, description: "Sơn gel + Tẩy da chết + Massage tay chân", duration: 90 }
];

const MOCK_CUSTOMERS = [
  { id: "c1", name: "Khách vãng lai", phone: "", rank: "Khách mới" },
  { id: "c2", name: "Nguyễn Văn A", phone: "0901234567", rank: "Vàng (Tích lũy 5%)" },
  { id: "c3", name: "Trần Thị B", phone: "0918765432", rank: "Bạc (Tích lũy 3%)" }
];

const getInitialInvoices = () => {
  try {
    const saved = localStorage.getItem("pos_invoices");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to parse saved invoices", e);
  }
  return [
    {
      id: "inv-1",
      name: "Hóa đơn 1",
      cart: [],
      selectedCustomerId: "c1",
      voucherCode: "",
      discountPercent: 0,
      paymentMethod: "CASH"
    }
  ];
};

const getInitialActiveInvoiceId = () => {
  return localStorage.getItem("pos_active_invoice_id") || "inv-1";
};

const getInitialCustomers = () => {
  try {
    const saved = localStorage.getItem("pos_customers");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to parse saved customers", e);
  }
  return MOCK_CUSTOMERS;
};

const getInitialSelectedStylistId = () => {
  return localStorage.getItem("pos_selected_stylist_id") || "";
};

export default function POS() {
  const { currentTenantId, currentBranchId, branches, user } = useAuthStore();

  // Data states
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [inventories, setInventories] = useState<ProductItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);

  // Customers dynamic state
  const [customers, setCustomers] = useState(getInitialCustomers);

  const handleCreateCustomer = (name: string, phone: string) => {
    const newCust = {
      id: `c-${Date.now()}`,
      name,
      phone,
      rank: "Khách mới"
    };
    setCustomers(prev => [...prev, newCust]);
    setSelectedCustomerId(newCust.id);
    return newCust;
  };

  // Selection & UI States
  const [selectedStylistId, setSelectedStylistId] = useState<string>(getInitialSelectedStylistId);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [flashStaff, setFlashStaff] = useState(false);

  // Multi-invoice Tab State
  const [invoices, setInvoices] = useState<Array<{
    id: string;
    name: string;
    cart: Array<{
      id: string;
      itemId: string;
      name: string;
      price: number;
      quantity: number;
      itemType: "SERVICE" | "PRODUCT" | "PACKAGE";
      staffId: string;
      discount?: number;
    }>;
    selectedCustomerId: string;
    voucherCode: string;
    discountPercent: number;
    paymentMethod: string;
  }>>(getInitialInvoices);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>(getInitialActiveInvoiceId);

  const activeInvoice = invoices.find(inv => inv.id === activeInvoiceId) || invoices[0];
  const cart = activeInvoice.cart;
  const selectedCustomerId = activeInvoice.selectedCustomerId;
  const voucherCode = activeInvoice.voucherCode;
  const discountPercent = activeInvoice.discountPercent;
  const paymentMethod = activeInvoice.paymentMethod;

  const setSelectedCustomerId = (custId: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== activeInvoiceId) return inv;
      return { ...inv, selectedCustomerId: custId };
    }));
  };

  const setVoucherCode = (code: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== activeInvoiceId) return inv;
      return { ...inv, voucherCode: code };
    }));
  };

  const setPaymentMethod = (method: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== activeInvoiceId) return inv;
      return { ...inv, paymentMethod: method };
    }));
  };

  const addNewInvoice = () => {
    const newId = `inv-${Date.now()}`;
    const nextNum = invoices.length + 1;
    const newInvoice = {
      id: newId,
      name: `Hóa đơn ${nextNum}`,
      cart: [],
      selectedCustomerId: "c1",
      voucherCode: "",
      discountPercent: 0,
      paymentMethod: "CASH"
    };
    setInvoices(prev => [...prev, newInvoice]);
    setActiveInvoiceId(newId);
  };

  const deleteInvoice = (invId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (invoices.length === 1) {
      alert("Phải giữ lại ít nhất 1 hóa đơn!");
      return;
    }
    const target = invoices.find(inv => inv.id === invId);
    if (target && target.cart.length > 0) {
      if (!confirm(`Hóa đơn này đang có ${target.cart.length} mặt hàng. Bạn có chắc muốn xóa không?`)) {
        return;
      }
    }
    
    const nextInvoices = invoices.filter(inv => inv.id !== invId);
    setInvoices(nextInvoices);
    
    if (activeInvoiceId === invId) {
      setActiveInvoiceId(nextInvoices[0].id);
    }
  };

  const resetActiveInvoice = () => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== activeInvoiceId) return inv;
      return {
        ...inv,
        cart: [],
        selectedCustomerId: "c1",
        voucherCode: "",
        discountPercent: 0,
        paymentMethod: "CASH"
      };
    }));
  };

  // Loading & receipt states
  const [loading, setLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Fetch POS dynamic data
  useEffect(() => {
    const fetchPOSData = async () => {
      if (!currentTenantId || !currentBranchId) return;
      setLoading(true);
      try {
        const [staffRes, servicesRes, inventoriesRes, packagesRes] = await Promise.all([
          fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/shifts/staff`),
          fetch(`http://localhost:3000/api/tenants/${currentTenantId}/services?branchId=${currentBranchId}`),
          fetch(`http://localhost:3000/api/tenants/${currentTenantId}/inventories?branchId=${currentBranchId}`),
          fetch(`http://localhost:3000/api/tenants/${currentTenantId}/services/packages?branchId=${currentBranchId}`)
        ]);

        if (staffRes.ok) setStaff(await staffRes.json());
        if (servicesRes.ok) setServices(await servicesRes.json());
        if (inventoriesRes.ok) setInventories(await inventoriesRes.json());
        if (packagesRes.ok) setPackages(await packagesRes.json());
      } catch (err: any) {
        console.warn("Failed fetching POS data, using mock values", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPOSData();
  }, [currentTenantId, currentBranchId]);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem("pos_invoices", JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem("pos_active_invoice_id", activeInvoiceId);
  }, [activeInvoiceId]);

  useEffect(() => {
    localStorage.setItem("pos_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("pos_selected_stylist_id", selectedStylistId);
  }, [selectedStylistId]);

  // Fallbacks
  const activeStaff = staff.length > 0 ? staff : MOCK_STAFF;
  const activeServices = services.length > 0 ? services : MOCK_SERVICES;
  const activeProducts = inventories.length > 0 ? inventories : MOCK_PRODUCTS;
  const activePackages = packages.length > 0 ? packages : MOCK_PACKAGES;

  // Extract distinct category names from active services list
  const serviceCategories = Array.from(
    new Set(activeServices.map((s) => s.category?.name || "Dịch vụ").filter(Boolean))
  );

  // Add Item to cart (Prevent row merging: unique cart ID generated on each click)
  const addToCart = (item: any, type: "SERVICE" | "PRODUCT" | "PACKAGE") => {
    if (!selectedStylistId) {
      setFlashStaff(true);
      setTimeout(() => setFlashStaff(false), 1500);
      return;
    }
    const price = type === "SERVICE" ? item.price : (type === "PRODUCT" ? item.sellPrice : item.price);
    const itemId = item.id;
    const uniqueKey = `${itemId}-${selectedStylistId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    setInvoices((prev) => prev.map((inv) => {
      if (inv.id !== activeInvoiceId) return inv;
      const newCart = [
        ...inv.cart,
        {
          id: uniqueKey,
          itemId,
          name: item.name,
          price: Number(price),
          quantity: 1,
          itemType: type,
          staffId: selectedStylistId,
          discount: 0
        }
      ];
      return { ...inv, cart: newCart };
    }));
  };

  const adjustQuantity = (cartId: string, amount: number) => {
    setInvoices((prev) => prev.map((inv) => {
      if (inv.id !== activeInvoiceId) return inv;
      const newCart = inv.cart
        .map((c) => (c.id === cartId ? { ...c, quantity: c.quantity + amount } : c))
        .filter((c) => c.quantity > 0);
      return { ...inv, cart: newCart };
    }));
  };

  const updateCartItemStylist = (cartId: string, newStylistId: string) => {
    setInvoices((prev) => prev.map((inv) => {
      if (inv.id !== activeInvoiceId) return inv;
      return {
        ...inv,
        cart: inv.cart.map((c) =>
          c.id === cartId ? { ...c, staffId: newStylistId } : c
        )
      };
    }));
  };

  const updateCartItemPrice = (cartId: string, newPriceVal: string | number) => {
    let newPrice = 0;
    if (typeof newPriceVal === "number") {
      newPrice = newPriceVal;
    } else {
      newPrice = parseFloat(newPriceVal.replace(/\D/g, "")) || 0;
    }
    
    setInvoices((prev) => prev.map((inv) => {
      if (inv.id !== activeInvoiceId) return inv;
      return {
        ...inv,
        cart: inv.cart.map((c) =>
          c.id === cartId ? { ...c, price: newPrice } : c
        )
      };
    }));
  };

  const updateCartItemDiscount = (cartId: string, newDiscountVal: string | number) => {
    let newDiscount = 0;
    if (typeof newDiscountVal === "number") {
      newDiscount = newDiscountVal;
    } else {
      newDiscount = parseFloat(newDiscountVal.replace(/\D/g, "")) || 0;
    }
    
    setInvoices((prev) => prev.map((inv) => {
      if (inv.id !== activeInvoiceId) return inv;
      return {
        ...inv,
        cart: inv.cart.map((c) =>
          c.id === cartId ? { ...c, discount: newDiscount } : c
        )
      };
    }));
  };

  const applyVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    let percent = 0;
    if (code === "VOUCHER10%") {
      percent = 10;
      alert("Áp dụng mã giảm giá 10% thành công!");
    } else if (code === "VOUCHER20%") {
      percent = 20;
      alert("Áp dụng mã giảm giá 20% thành công!");
    } else {
      alert("Mã giảm giá không hợp lệ (Thử dùng VOUCHER10% hoặc VOUCHER20%)");
      return;
    }

    setInvoices((prev) => prev.map((inv) => {
      if (inv.id !== activeInvoiceId) return inv;
      return { ...inv, discountPercent: percent };
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price - (item.discount || 0)) * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const finalAmount = subtotal - discountAmount;

  // Checkout Handler
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckingOut(true);
    try {
      const payload = {
        customerId: selectedCustomerId === "c1" ? undefined : selectedCustomerId,
        cashierId: user?.id,
        items: cart.map((c) => ({
          itemId: c.itemId,
          itemType: c.itemType,
          staffId: c.staffId,
          price: c.price - (c.discount || 0),
          quantity: c.quantity
        })),
        discountAmount,
        paymentMethod,
        paymentStatus: "PAID"
      };

      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("API Offline");
      }

      const invoiceData = await res.json();
      setReceiptData(invoiceData);
      setShowReceipt(true);
      resetActiveInvoice();
    } catch (e: any) {
      // Offline fallback
      const mockInvoice = {
        id: Math.random().toString(36).substring(7).toUpperCase(),
        createdAt: new Date().toISOString(),
        totalPrice: subtotal,
        discountAmount,
        finalAmount,
        paymentMethod,
        customer: customers.find(c => c.id === selectedCustomerId),
        cashier: { name: user?.name || "Thu ngân" },
        items: cart.map(c => ({
          id: c.id,
          price: c.price - (c.discount || 0),
          quantity: c.quantity,
          itemType: c.itemType,
          stylist: activeStaff.find(s => s.id === c.staffId),
          name: c.name
        }))
      };
      setReceiptData(mockInvoice);
      setShowReceipt(true);
      resetActiveInvoice();
    } finally {
      setCheckingOut(false);
    }
  };

  // Dynamic Filtering Logic
  const selectedCatName = selectedCategory.startsWith("Service:") ? selectedCategory.split(":")[1] : null;

  const filteredServices = activeServices.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategory === "All") return true;
    if (selectedCatName) {
      return (s.category?.name || "Dịch vụ") === selectedCatName;
    }
    return false;
  });

  const filteredProducts = activeProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    return selectedCategory === "All" || selectedCategory === "Product";
  });

  const filteredPackages = activePackages.filter((pkg) => {
    const matchesSearch = pkg.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    return selectedCategory === "All" || selectedCategory === "Package";
  });

  return (
    <>
      <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: "24px", height: "calc(100vh - 120px)", overflow: "hidden" }}>
        
        {/* LEFT COLUMN: Service/Product/Package Selection */}
        <POSLeftPanel
          activeStaff={activeStaff}
          selectedStylistId={selectedStylistId}
          setSelectedStylistId={setSelectedStylistId}
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          serviceCategories={serviceCategories}
          filteredServices={filteredServices}
          filteredProducts={filteredProducts}
          filteredPackages={filteredPackages}
          addToCart={addToCart}
          cart={cart}
          flashStaff={flashStaff}
        />

        {/* RIGHT COLUMN: Cart & Billing Info */}
        <POSRightPanel
          invoices={invoices}
          activeInvoiceId={activeInvoiceId}
          setActiveInvoiceId={setActiveInvoiceId}
          addNewInvoice={addNewInvoice}
          deleteInvoice={deleteInvoice}
          selectedCustomerId={selectedCustomerId}
          setSelectedCustomerId={setSelectedCustomerId}
          cart={cart}
          voucherCode={voucherCode}
          setVoucherCode={setVoucherCode}
          applyVoucher={applyVoucher}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          subtotal={subtotal}
          discountPercent={discountPercent}
          discountAmount={discountAmount}
          finalAmount={finalAmount}
          checkingOut={checkingOut}
          handleCheckout={handleCheckout}
          activeStaff={activeStaff}
          activeServices={activeServices}
          updateCartItemStylist={updateCartItemStylist}
          updateCartItemPrice={updateCartItemPrice}
          updateCartItemDiscount={updateCartItemDiscount}
          adjustQuantity={adjustQuantity}
          customers={customers}
          onCreateCustomer={handleCreateCustomer}
        />

      </div>

      {/* RETAIL RECEIPT MODAL */}
      <POSReceiptModal
        showReceipt={showReceipt}
        setShowReceipt={setShowReceipt}
        receiptData={receiptData}
        branches={branches}
        currentBranchId={currentBranchId}
      />
    </>
  );
}
