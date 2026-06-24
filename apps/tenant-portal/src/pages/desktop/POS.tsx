import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { 
  Search, Users, Check, Loader2, Trash2, Plus, Minus, Tag, 
  CreditCard, Printer, QrCode, Award, User, Info, FileText, X
} from "lucide-react";
import { formatCurrencyVND } from "@salon/shared-utils";
import { ExcelSelect } from "../../components/desktop/TableComponents";

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
  { id: "s1", name: "Cắt tóc nam Classic", price: 120000, duration: 30, category: { name: "Tóc" } },
  { id: "s2", name: "Uốn tóc xoăn Hàn Quốc", price: 450000, duration: 90, category: { name: "Tóc" } },
  { id: "s3", name: "Nhuộm màu thời trang", price: 650000, duration: 120, category: { name: "Tóc" } },
  { id: "s4", name: "Gội đầu dưỡng sinh thảo dược", price: 150000, duration: 45, category: { name: "Spa" } },
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

// Helper: Stable deterministic employee colors
const getEmployeeColor = (id: string) => {
  const colors = [
    { bg: "#fee2e2", border: "#fca5a5", text: "#991b1b" }, // Light Red
    { bg: "#fef3c7", border: "#fcd34d", text: "#92400e" }, // Amber/Yellow
    { bg: "#dcfce7", border: "#86efac", text: "#166534" }, // Light Green
    { bg: "#e0f2fe", border: "#7dd3fc", text: "#0369a1" }, // Sky Blue
    { bg: "#fae8ff", border: "#f5d0fe", text: "#86198f" }, // Purple
    { bg: "#e0e7ff", border: "#a5b4fc", text: "#3730a3" }, // Indigo
    { bg: "#ffedd5", border: "#fdbb2d", text: "#9a3412" }  // Orange
  ];
  let sum = 0;
  const safeId = id || "default";
  for (let i = 0; i < safeId.length; i++) {
    sum += safeId.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

// Helper: Custom background colors based on service category name
const getServiceCategoryColor = (categoryName: string) => {
  const name = (categoryName || "").toLowerCase();
  if (name.includes("hair") || name.includes("tóc")) {
    return { bg: "#f0f7ff", border: "#bae6fd", text: "#0369a1", labelBg: "#e0f2fe" }; // Light Blue
  }
  if (name.includes("spa") || name.includes("gội") || name.includes("massage")) {
    return { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", labelBg: "#dcfce7" }; // Light Green
  }
  if (name.includes("nail") || name.includes("móng") || name.includes("art")) {
    return { bg: "#fff5f5", border: "#fed7d7", text: "#c53030", labelBg: "#fff5f5" }; // Light Rose
  }
  // General/Default Category
  return { bg: "#fafaf9", border: "#e7e5e4", text: "#57534e", labelBg: "#f5f5f4" };
};

export default function POS() {
  const { currentTenantId, currentBranchId, branches, user } = useAuthStore();

  // Data states
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [inventories, setInventories] = useState<ProductItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);

  // Selection & UI States
  const [selectedStylistId, setSelectedStylistId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
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
    }>;
    selectedCustomerId: string;
    voucherCode: string;
    discountPercent: number;
    paymentMethod: string;
  }>>([
    {
      id: "inv-1",
      name: "Hóa đơn 1",
      cart: [],
      selectedCustomerId: "c1",
      voucherCode: "",
      discountPercent: 0,
      paymentMethod: "CASH"
    }
  ]);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>("inv-1");

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

  // Fallbacks
  const activeStaff = staff.length > 0 ? staff : MOCK_STAFF;
  const activeServices = services.length > 0 ? services : MOCK_SERVICES;
  const activeProducts = inventories.length > 0 ? inventories : MOCK_PRODUCTS;
  const activePackages = packages.length > 0 ? packages : MOCK_PACKAGES;

  // Initialize selected default stylist
  useEffect(() => {
    if (activeStaff.length > 0 && !selectedStylistId) {
      setSelectedStylistId(activeStaff[0].id);
    }
  }, [activeStaff, selectedStylistId]);

  // Extract distinct category names from active services list
  const serviceCategories = Array.from(
    new Set(activeServices.map((s) => s.category?.name || "Dịch vụ").filter(Boolean))
  );

  // Add Item to cart
  const addToCart = (item: any, type: "SERVICE" | "PRODUCT" | "PACKAGE") => {
    const price = type === "SERVICE" ? item.price : (type === "PRODUCT" ? item.sellPrice : item.price);
    const itemId = item.id;
    const key = `${itemId}-${selectedStylistId}`;

    setInvoices((prev) => prev.map((inv) => {
      if (inv.id !== activeInvoiceId) return inv;
      const existing = inv.cart.find((c) => c.id === key);
      let newCart;
      if (existing) {
        newCart = inv.cart.map((c) =>
          c.id === key ? { ...c, quantity: c.quantity + 1 } : c
        );
      } else {
        newCart = [
          ...inv.cart,
          {
            id: key,
            itemId,
            name: item.name,
            price: Number(price),
            quantity: 1,
            itemType: type,
            staffId: selectedStylistId
          }
        ];
      }
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
      const target = inv.cart.find((c) => c.id === cartId);
      if (!target) return inv;

      const newKey = `${target.itemId}-${newStylistId}`;
      const existing = inv.cart.find((c) => c.id === newKey && c.id !== cartId);

      let newCart;
      if (existing) {
        newCart = inv.cart
          .map((c) =>
            c.id === newKey ? { ...c, quantity: c.quantity + target.quantity } : c
          )
          .filter((c) => c.id !== cartId);
      } else {
        newCart = inv.cart.map((c) =>
          c.id === cartId ? { ...c, id: newKey, staffId: newStylistId } : c
        );
      }
      return { ...inv, cart: newCart };
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

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
          price: c.price,
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
        customer: MOCK_CUSTOMERS.find(c => c.id === selectedCustomerId),
        cashier: { name: user?.name || "Thu ngân" },
        items: cart.map(c => ({
          id: c.id,
          price: c.price,
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

  // Helper UI: Render active cart assignment badges on item card (absolute positioned at top right)
  const renderItemCartBadges = (itemId: string) => {
    const assignments = cart.filter(c => c.itemId === itemId);
    if (assignments.length === 0) return null;

    return (
      <div style={{ display: "flex", gap: "4px" }}>
        {assignments.map((asg) => {
          const staffMember = activeStaff.find(s => s.id === asg.staffId);
          const empColor = getEmployeeColor(asg.staffId);
          const staffName = staffMember ? staffMember.name.split("(")[0].trim() : "Nhân viên";
          return (
            <span 
              key={asg.id}
              title={`${staffName}: ${asg.quantity}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "20px",
                height: "20px",
                fontSize: "11px",
                fontWeight: "800",
                borderRadius: "50%",
                background: empColor.bg,
                border: `1.5px solid ${empColor.border}`,
                color: empColor.text,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
              }}
            >
              {asg.quantity}
            </span>
          );
        })}
      </div>
    );
  };

  // Helper: Format commission descriptions
  const getCommissionText = (type: "SERVICE" | "PRODUCT" | "PACKAGE", price: number) => {
    if (type === "SERVICE") {
      return `Lương cứng + 15% Hoa hồng (~${formatCurrencyVND(Math.round(price * 0.15))})`;
    }
    if (type === "PACKAGE") {
      return `10% Hoa hồng (~${formatCurrencyVND(Math.round(price * 0.10))})`;
    }
    return `+10.000đ Hoa hồng tư vấn`;
  };

  return (
    <>
      <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: "24px", height: "calc(100vh - 120px)" }}>
        
        {/* LEFT COLUMN: Service Selection */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", paddingRight: "8px" }}>
          
          {/* Top Panel: Active Staff Members with unique random/stable colors */}
          <div className="card" style={{ padding: "16px" }}>
            <h4 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Users size={16} /> NHÂN VIÊN CHI NHÁNH (Chọn để gán lượt)
            </h4>
            <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px" }}>
              {activeStaff.map((s) => {
                const isSelected = selectedStylistId === s.id;
                const empColor = getEmployeeColor(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStylistId(s.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      borderRadius: "var(--radius-sm)",
                      border: isSelected ? `2px solid ${empColor.text}` : `1.5px solid ${empColor.border}`,
                      background: isSelected ? empColor.bg : "white",
                      color: empColor.text,
                      fontWeight: isSelected ? "700" : "500",
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: isSelected ? `0 2px 8px ${empColor.border}` : "none"
                    }}
                  >
                    <div style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: empColor.text,
                    }}></div>
                    {s.name.split("(")[0]}
                    {isSelected && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Middle Panel: Shrunk search box + all category options on the SAME ROW */}
          <div className="card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", width: "100%", justifyContent: "space-between", flexWrap: "nowrap" }}>
              
              {/* Shrunk Search Box */}
              <div style={{ position: "relative", width: "180px", flexShrink: 0 }}>
                <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tìm kiếm nhanh..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: "30px", width: "100%", height: "36px", fontSize: "12.5px" }}
                />
              </div>
              
              {/* Category Buttons including ALL service categories */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end", flexGrow: 1 }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("All")}
                  style={{
                    padding: "0 12px",
                    height: "36px",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    borderRadius: "var(--radius-sm)",
                    border: selectedCategory === "All" ? "1px solid var(--color-primary)" : "1px solid var(--border-color)",
                    background: selectedCategory === "All" ? "var(--color-primary)" : "white",
                    color: selectedCategory === "All" ? "white" : "var(--text-primary)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap"
                  }}
                >
                  Tất cả
                </button>

                {/* Display every individual Service Category */}
                {serviceCategories.map((catName) => {
                  const filterValue = `Service:${catName}`;
                  const isActive = selectedCategory === filterValue;
                  return (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => setSelectedCategory(filterValue)}
                      style={{
                        padding: "0 12px",
                        height: "36px",
                        fontSize: "12.5px",
                        fontWeight: "600",
                        borderRadius: "var(--radius-sm)",
                        border: isActive ? "1px solid var(--color-primary)" : "1px solid var(--border-color)",
                        background: isActive ? "var(--color-primary)" : "white",
                        color: isActive ? "white" : "var(--text-primary)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {catName}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setSelectedCategory("Product")}
                  style={{
                    padding: "0 12px",
                    height: "36px",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    borderRadius: "var(--radius-sm)",
                    border: selectedCategory === "Product" ? "1px solid var(--color-primary)" : "1px solid var(--border-color)",
                    background: selectedCategory === "Product" ? "var(--color-primary)" : "white",
                    color: selectedCategory === "Product" ? "white" : "var(--text-primary)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap"
                  }}
                >
                  Sản phẩm
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory("Package")}
                  style={{
                    padding: "0 12px",
                    height: "36px",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    borderRadius: "var(--radius-sm)",
                    border: selectedCategory === "Package" ? "1px solid var(--color-primary)" : "1px solid var(--border-color)",
                    background: selectedCategory === "Package" ? "var(--color-primary)" : "white",
                    color: selectedCategory === "Package" ? "white" : "var(--text-primary)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap"
                  }}
                >
                  Gói/Combo
                </button>
              </div>

            </div>
          </div>

          {/* Bottom Panel: Dynamic Color Categories, Clickable Cards with Stylist Assignment & Quantity badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* 1. SERVICES SECTION (Color based on service category) */}
            {(selectedCategory === "All" || selectedCategory.startsWith("Service:")) && filteredServices.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "var(--color-primary)", padding: "4px 10px", borderRadius: "6px", background: "var(--color-primary-light)" }}>
                    Dịch vụ
                  </span>
                  <div style={{ flexGrow: 1, height: "1px", background: "linear-gradient(to right, var(--color-primary-light), transparent)" }}></div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                  {filteredServices.map((item) => {
                    const catName = item.category?.name || "Tóc";
                    const catColor = getServiceCategoryColor(catName);

                    return (
                      <div 
                        key={item.id} 
                        className="card" 
                        onClick={() => addToCart(item, "SERVICE")}
                        style={{ 
                          position: "relative",
                          padding: "12px 14px", 
                          background: catColor.bg, 
                          border: `1.5px solid ${catColor.border}`, 
                          display: "flex", 
                          flexDirection: "column", 
                          justifyContent: "space-between",
                          minHeight: "90px",
                          cursor: "pointer",
                          transition: "transform 0.15s, box-shadow 0.15s",
                          overflow: "hidden"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "var(--shadow-md)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "none";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {/* Absolute Top-Right Badge Corner */}
                        <div style={{ position: "absolute", top: "4px", right: "4px", display: "flex", gap: "4px", zIndex: 10 }}>
                          {renderItemCartBadges(item.id)}
                        </div>

                        <div>
                          <h4 
                            title={item.name}
                            style={{ 
                              fontWeight: "700", 
                              fontSize: "13.5px", 
                              color: catColor.text,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              width: "100%",
                              paddingRight: "28px",
                              marginBottom: "4px"
                            }}
                          >
                            {item.name}
                          </h4>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                          <span style={{ fontWeight: "800", fontSize: "14px", color: catColor.text }}>
                            {formatCurrencyVND(item.price)}
                          </span>
                          {item.duration && (
                            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                              ⏱️ {item.duration}p
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. PRODUCTS SECTION (Wood brown layout) */}
            {(selectedCategory === "All" || selectedCategory === "Product") && filteredProducts.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#8a5a22", padding: "4px 10px", borderRadius: "6px", background: "#fcf8f2" }}>
                    Sản phẩm (Màu Nâu Gỗ)
                  </span>
                  <div style={{ flexGrow: 1, height: "1px", background: "linear-gradient(to right, #ebdcc5, transparent)" }}></div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                  {filteredProducts.map((item) => (
                    <div 
                      key={item.id} 
                      className="card" 
                      onClick={() => addToCart(item, "PRODUCT")}
                      style={{ 
                        position: "relative",
                        padding: "12px 14px", 
                        background: "#faf6f0", 
                        border: "1.5px solid #ebdcc5", 
                        display: "flex", 
                        flexDirection: "column", 
                        justifyContent: "space-between",
                        minHeight: "90px",
                        cursor: "pointer",
                        transition: "transform 0.15s, box-shadow 0.15s",
                        overflow: "hidden"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "var(--shadow-md)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {/* Absolute Top-Right Badge Corner */}
                      <div style={{ position: "absolute", top: "4px", right: "4px", display: "flex", gap: "4px", zIndex: 10 }}>
                        {renderItemCartBadges(item.id)}
                      </div>

                      <div>
                        <h4 
                          title={item.name}
                          style={{ 
                            fontWeight: "700", 
                            fontSize: "13.5px", 
                            color: "#8a5a22",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "100%",
                            paddingRight: "28px",
                            marginBottom: "4px"
                          }}
                        >
                          {item.name}
                        </h4>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                        <span style={{ fontWeight: "800", fontSize: "14px", color: "#8a5a22" }}>
                          {formatCurrencyVND(item.sellPrice)}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                          Kho: {item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. PACKAGES SECTION (Purple layout) */}
            {(selectedCategory === "All" || selectedCategory === "Package") && filteredPackages.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#7e22ce", padding: "4px 10px", borderRadius: "6px", background: "#faf0fc" }}>
                    Gói combo (Màu Tím)
                  </span>
                  <div style={{ flexGrow: 1, height: "1px", background: "linear-gradient(to right, #eed0fc, transparent)" }}></div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                  {filteredPackages.map((item) => (
                    <div 
                      key={item.id} 
                      className="card" 
                      onClick={() => addToCart(item, "PACKAGE")}
                      style={{ 
                        position: "relative",
                        padding: "12px 14px", 
                        background: "#faf5ff", 
                        border: "1.5px solid #eed0fc", 
                        display: "flex", 
                        flexDirection: "column", 
                        justifyContent: "space-between",
                        minHeight: "90px",
                        cursor: "pointer",
                        transition: "transform 0.15s, box-shadow 0.15s",
                        overflow: "hidden"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "var(--shadow-md)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {/* Absolute Top-Right Badge Corner */}
                      <div style={{ position: "absolute", top: "4px", right: "4px", display: "flex", gap: "4px", zIndex: 10 }}>
                        {renderItemCartBadges(item.id)}
                      </div>

                      <div>
                        <h4 
                          title={item.name}
                          style={{ 
                            fontWeight: "700", 
                            fontSize: "13.5px", 
                            color: "#6b21a8",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "100%",
                            paddingRight: "28px",
                            marginBottom: "4px"
                          }}
                        >
                          {item.name}
                        </h4>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                        <span style={{ fontWeight: "800", fontSize: "14px", color: "#6b21a8" }}>
                          {formatCurrencyVND(item.price)}
                        </span>
                        {item.duration && (
                          <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                            ⏱️ {item.duration}p
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: Cart & Billing Info */}
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "20px", position: "relative" }}>
          
          {/* Invoice Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "12px", overflowX: "auto" }}>
            {invoices.map((inv) => {
              const isActive = inv.id === activeInvoiceId;
              return (
                <div
                  key={inv.id}
                  onClick={() => setActiveInvoiceId(inv.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: isActive ? "2px solid var(--color-primary)" : "1px solid var(--border-color)",
                    background: isActive ? "var(--color-primary-light)" : "white",
                    color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                    fontWeight: "600",
                    fontSize: "12.5px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                    position: "relative"
                  }}
                >
                  <span>{inv.name} {inv.cart.length > 0 && `(${inv.cart.length})`}</span>
                  {invoices.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => deleteInvoice(inv.id, e)}
                      style={{
                        background: "none",
                        border: "none",
                        color: isActive ? "var(--color-primary)" : "var(--text-muted)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addNewInvoice}
              style={{
                padding: "4px 8px",
                height: "28px",
                fontSize: "12px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                borderRadius: "var(--radius-sm)",
                flexShrink: 0
              }}
            >
              <Plus size={12} /> HĐ mới
            </button>
          </div>

          {/* Customer Selection */}
          <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Users size={18} style={{ color: "var(--color-primary)" }} /> KHÁCH HÀNG
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "10px" }}>
              <select
                className="form-input"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                {MOCK_CUSTOMERS.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--color-primary-light)",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                fontWeight: "700",
                color: "var(--color-primary)",
                border: "1px solid var(--border-focus)",
                textAlign: "center"
              }}>
                Hạng: {MOCK_CUSTOMERS.find(c => c.id === selectedCustomerId)?.rank}
              </div>
            </div>
          </div>

          {/* Cart items area */}
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "8px" }}>
            MẶT HÀNG THANH TOÁN ({cart.length})
          </h3>

          <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "4px", minHeight: "150px" }}>
            {cart.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", opacity: 0.7, padding: "40px 0" }}>
                <FileText size={36} />
                <p style={{ marginTop: "8px", fontSize: "13px" }}>Giỏ hàng đang trống.</p>
              </div>
            ) : (
              <div className="data-table-container" style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", background: "white", overflow: "visible" }}>
                <table className="data-table" style={{ width: "100%", fontSize: "12.5px" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "8px 10px", fontSize: "12px" }}>Mặt hàng</th>
                      <th style={{ padding: "8px 10px", fontSize: "12px", width: "110px" }}>Thợ</th>
                      <th style={{ padding: "8px 10px", fontSize: "12px", textAlign: "center", width: "70px" }}>SL</th>
                      <th style={{ padding: "8px 10px", fontSize: "12px", textAlign: "right", width: "110px" }}>T.Tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((cItem) => {
                      const empColor = getEmployeeColor(cItem.staffId);
                      return (
                        <tr key={cItem.id}>
                          {/* Item name and type badge */}
                          <td style={{ padding: "8px 10px", verticalAlign: "middle" }}>
                            <div style={{ fontWeight: "700", whiteSpace: "normal", wordBreak: "break-word" }}>{cItem.name}</div>
                            <span 
                              className="badge" 
                              style={{ 
                                fontSize: "9px", 
                                padding: "1px 6px", 
                                marginTop: "4px",
                                display: "inline-block",
                                background: cItem.itemType === "SERVICE" ? "#e0f2fe" : (cItem.itemType === "PRODUCT" ? "#fcf8f2" : "#faf0fc"), 
                                color: cItem.itemType === "SERVICE" ? "#0284c7" : (cItem.itemType === "PRODUCT" ? "#8a5a22" : "#7e22ce") 
                              }}
                            >
                              {cItem.itemType === "SERVICE" ? "Dịch vụ" : (cItem.itemType === "PRODUCT" ? "Sản phẩm" : "Gói")}
                            </span>
                            
                            {/* Commission Info */}
                            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontStyle: "italic", marginTop: "4px" }}>
                              ⭐ {getCommissionText(cItem.itemType, cItem.price * cItem.quantity)}
                            </div>
                          </td>

                          {/* Stylist Selector */}
                          <td style={{ padding: "4px 6px", verticalAlign: "middle" }}>
                            <ExcelSelect
                              value={cItem.staffId}
                              onChange={(val) => updateCartItemStylist(cItem.id, val)}
                              options={activeStaff.map(st => ({ value: st.id, label: st.name.split("(")[0] }))}
                              colorStyle={{
                                background: empColor.bg,
                                color: empColor.text,
                                border: `1.5px solid ${empColor.border}`,
                                height: "26px",
                                padding: "0 4px",
                                fontSize: "11px",
                                fontWeight: "600",
                                width: "100%"
                              }}
                            />
                          </td>

                          {/* Quantity selector */}
                          <td style={{ padding: "8px 4px", verticalAlign: "middle", textAlign: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                              <button 
                                type="button" 
                                onClick={() => adjustQuantity(cItem.id, -1)}
                                style={{ width: "20px", height: "20px", borderRadius: "3px", border: "1px solid var(--border-color)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", padding: 0, justifyContent: "center" }}
                              >
                                <Minus size={10} />
                              </button>
                              <span style={{ fontSize: "12px", fontWeight: "700", minWidth: "14px" }}>{cItem.quantity}</span>
                              <button 
                                type="button" 
                                onClick={() => adjustQuantity(cItem.id, 1)}
                                style={{ width: "20px", height: "20px", borderRadius: "3px", border: "1px solid var(--border-color)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", padding: 0, justifyContent: "center" }}
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </td>

                          {/* Price & Trash Delete */}
                          <td style={{ padding: "8px 10px", verticalAlign: "middle", textAlign: "right" }}>
                            <div style={{ fontWeight: "700" }}>
                              {formatCurrencyVND(cItem.price * cItem.quantity)}
                            </div>
                            <button
                              type="button"
                              onClick={() => adjustQuantity(cItem.id, -cItem.quantity)}
                              style={{ 
                                background: "none", 
                                border: "none", 
                                color: "var(--color-danger)", 
                                cursor: "pointer",
                                padding: "4px 0 0 0",
                                display: "inline-flex",
                                alignItems: "center"
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Method & QR Code Display */}
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "16px" }}>
            
            {/* Voucher input */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <div style={{ position: "relative", flexGrow: 1 }}>
                <Tag size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Mã giảm giá (ví dụ VOUCHER10%)..."
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  style={{ paddingLeft: "30px", height: "34px", fontSize: "12.5px" }}
                />
              </div>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={applyVoucher}
                style={{ padding: "0 12px", height: "34px", fontSize: "12.5px" }}
              >
                Áp dụng
              </button>
            </div>

            {/* Payment Selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>Phương thức thanh toán:</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "8px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    border: paymentMethod === "CASH" ? "2px solid var(--color-primary)" : "1px solid var(--border-color)",
                    background: paymentMethod === "CASH" ? "var(--color-primary-light)" : "white",
                    color: paymentMethod === "CASH" ? "var(--color-primary)" : "var(--text-primary)",
                    cursor: "pointer"
                  }}
                >
                  <CreditCard size={14} /> Tiền mặt
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("BANK_TRANSFER")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "8px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    border: paymentMethod === "BANK_TRANSFER" ? "2px solid var(--color-primary)" : "1px solid var(--border-color)",
                    background: paymentMethod === "BANK_TRANSFER" ? "var(--color-primary-light)" : "white",
                    color: paymentMethod === "BANK_TRANSFER" ? "var(--color-primary)" : "var(--text-primary)",
                    cursor: "pointer"
                  }}
                >
                  <QrCode size={14} /> Chuyển khoản (QR)
                </button>
              </div>
            </div>

            {/* Simulated Bank QR Code box */}
            {paymentMethod === "BANK_TRANSFER" && finalAmount > 0 && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                background: "#faf5ff",
                padding: "12px",
                border: "1px solid #ebd5fc",
                borderRadius: "var(--radius-sm)",
                marginBottom: "12px",
                textAlign: "center"
              }}>
                <QrCode size={100} style={{ color: "#7e22ce" }} />
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "700", display: "block", color: "#6b21a8" }}>QUÉT QR ĐỐI SOÁT VNPAY/PayOS</span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Số tiền: <strong style={{ color: "var(--color-primary)" }}>{formatCurrencyVND(finalAmount)}</strong></span>
                </div>
              </div>
            )}

            {/* Final calculations section */}
            <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Tạm tính:</span>
                <span style={{ fontWeight: "600" }}>{formatCurrencyVND(subtotal)}</span>
              </div>
              {discountPercent > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                  <span style={{ color: "var(--color-danger)" }}>Giảm giá ({discountPercent}%):</span>
                  <span style={{ fontWeight: "600", color: "var(--color-danger)" }}>-{formatCurrencyVND(discountAmount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontWeight: "700", fontSize: "14px" }}>Thành tiền:</span>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "var(--color-primary)" }}>{formatCurrencyVND(finalAmount)}</span>
              </div>
            </div>

            {/* Print & checkout button */}
            <button 
              className="btn btn-primary" 
              style={{ width: "100%", padding: "12px", fontSize: "14px", fontWeight: "700" }} 
              disabled={cart.length === 0 || checkingOut}
              onClick={handleCheckout}
            >
              {checkingOut ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Đang xử lý...
                </>
              ) : (
                <>
                  <Printer size={16} /> IN HOÁ ĐƠN & THANH TOÁN
                </>
              )}
            </button>

          </div>

        </div>

      </div>

      {/* RETAIL RECEIPT MODAL */}
      {showReceipt && receiptData && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "400px", padding: "24px", maxHeight: "90vh", overflowY: "auto", background: "white", color: "black", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", fontFamily: "Courier New, monospace" }}>
            
            {/* Header info */}
            <div style={{ textAlign: "center", borderBottom: "2px dashed #000", paddingBottom: "16px", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "1px" }}>HAIRSTAR BEAUTY SALON</h2>
              <p style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>
                {branches.find(b => b.id === currentBranchId)?.name || "Chi nhánh HairStar"}
              </p>
              <p style={{ fontSize: "10px", color: "#777" }}>Mã HĐ: {receiptData.id}</p>
              <p style={{ fontSize: "10px", color: "#777" }}>Ngày: {new Date(receiptData.createdAt).toLocaleString("vi-VN")}</p>
            </div>

            {/* General Metadata */}
            <div style={{ fontSize: "11px", marginBottom: "14px", display: "flex", flexDirection: "column", gap: "3px" }}>
              <div><strong>Thu ngân:</strong> {receiptData.cashier?.name || "Thu ngân"}</div>
              <div><strong>Khách hàng:</strong> {receiptData.customer?.name || "Khách vãng lai"}</div>
            </div>

            {/* List of items */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", marginBottom: "16px" }}>
              <thead>
                <tr style={{ borderBottom: "1px dashed #000" }}>
                  <th style={{ textAlign: "left", paddingBottom: "4px" }}>Tên dịch vụ / SP</th>
                  <th style={{ textAlign: "center", paddingBottom: "4px" }}>SL</th>
                  <th style={{ textAlign: "right", paddingBottom: "4px" }}>Đơn giá</th>
                  <th style={{ textAlign: "right", paddingBottom: "4px" }}>T.Tiền</th>
                </tr>
              </thead>
              <tbody>
                {receiptData.items?.map((item: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: "1px dotted #ccc" }}>
                    <td style={{ padding: "6px 0", maxWidth: "160px" }}>
                      {item.name}
                      {item.stylist && (
                        <span style={{ display: "block", fontSize: "9px", color: "#555" }}>
                          - Thợ: {item.stylist.name.split("(")[0]}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "center", padding: "6px 0" }}>{item.quantity}</td>
                    <td style={{ textAlign: "right", padding: "6px 0" }}>{formatCurrencyVND(Number(item.price))}</td>
                    <td style={{ textAlign: "right", padding: "6px 0" }}>{formatCurrencyVND(Number(item.price) * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cash/Calculations area */}
            <div style={{ borderTop: "1px dashed #000", paddingTop: "12px", fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Tổng cộng:</span>
                <span>{formatCurrencyVND(receiptData.totalPrice)}</span>
              </div>
              {Number(receiptData.discountAmount) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Chiết khấu/Giảm giá:</span>
                  <span>-{formatCurrencyVND(Number(receiptData.discountAmount))}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "800", fontSize: "14px", borderTop: "2px dashed #000", paddingTop: "8px" }}>
                <span>THÀNH TIỀN:</span>
                <span>{formatCurrencyVND(receiptData.finalAmount)}</span>
              </div>
            </div>

            {/* Payment confirmation text */}
            <div style={{ margin: "24px 0 12px 0", textAlign: "center", fontSize: "11px", borderTop: "1px dashed #000", paddingTop: "12px" }}>
              <p style={{ fontWeight: "700" }}>TRẠNG THÁI: ĐÃ THANH TOÁN ({receiptData.paymentMethod === "CASH" ? "TIỀN MẶT" : "CHUYỂN KHOẢN"})</p>
              <p style={{ fontStyle: "italic", marginTop: "12px" }}>Cảm ơn quý khách và hẹn gặp lại!</p>
            </div>

            {/* Close button */}
            <div style={{ display: "flex", marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "12px", justifyContent: "center" }}>
              <button 
                className="btn btn-secondary" 
                style={{ fontFamily: "Courier New", width: "100%", padding: "10px", fontWeight: "700" }} 
                onClick={() => setShowReceipt(false)}
              >
                ĐÓNG HOÁ ĐƠN
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
