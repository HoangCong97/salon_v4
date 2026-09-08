import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Check,
  Search,
  ShoppingCart,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Printer,
  Sparkles,
  Package,
  Scissors,
  Layers,
  Users,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";
import { MobilePOSReceiptModal } from "./MobilePOSReceiptModal";

interface StaffMember {
  id: string;
  name: string;
  avatar?: string;
  role?: { name: string } | null;
}

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration?: number | null;
  category?: { name: string; color?: string } | null;
  discountPrice?: number | null;
  discountAmount?: number | null;
  isActive?: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  sellPrice: number;
  quantity: number;
  discountAmount?: number | null;
  isActive?: boolean;
}

interface PackageItem {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  duration?: number | null;
  discountAmount?: number | null;
}

interface CartItem {
  cartId: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  itemType: "SERVICE" | "PRODUCT" | "PACKAGE";
  staffId: string;
  discount: number;
}

export default function MobilePOS() {
  const { currentTenantId, currentBranchId, branches, user } = useAuthStore();
  const queryClient = useQueryClient();

  const currentBranchName =
    branches.find((b) => b.id === currentBranchId)?.name || "Chi nhánh chính";

  // 1. Data queries
  const { data: staffData } = useQuery<StaffMember[]>({
    queryKey: queryKeys.shifts.staff(currentTenantId!, currentBranchId!),
    queryFn: () =>
      api.get(`/tenants/${currentTenantId}/branches/${currentBranchId}/shifts/staff`),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const { data: servicesData } = useQuery<ServiceItem[]>({
    queryKey: queryKeys.services.list(currentTenantId!, currentBranchId),
    queryFn: () =>
      api.get(`/tenants/${currentTenantId}/services?branchId=${currentBranchId}`),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const { data: inventoriesData } = useQuery<ProductItem[]>({
    queryKey: queryKeys.inventories.list(currentTenantId!, currentBranchId),
    queryFn: () =>
      api.get(`/tenants/${currentTenantId}/inventories?branchId=${currentBranchId}`),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const { data: packagesData } = useQuery<PackageItem[]>({
    queryKey: queryKeys.servicePackages.list(currentTenantId!, currentBranchId),
    queryFn: () =>
      api.get(`/tenants/${currentTenantId}/services/packages?branchId=${currentBranchId}`),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const { data: dbCustomers } = useQuery<any[]>({
    queryKey: queryKeys.customers.list(currentTenantId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/customers`),
    enabled: !!currentTenantId,
  });

  // Filter out inactive items
  const staffList = useMemo(() => staffData || [], [staffData]);
  const activeServices = useMemo(
    () => (servicesData || []).filter((s) => s.isActive !== false),
    [servicesData],
  );
  const activeProducts = useMemo(
    () => (inventoriesData || []).filter((p) => p.isActive !== false),
    [inventoriesData],
  );
  const activePackages = useMemo(() => packagesData || [], [packagesData]);

  // Customers list
  const customers = useMemo(() => {
    return [
      { id: "c1", name: "Khách vãng lai", phone: "" },
      ...(dbCustomers || []).map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone || "",
      })),
    ];
  }, [dbCustomers]);

  // Persistent Selected Staff
  const [selectedStaffId, setSelectedStaffId] = useState<string>(() => {
    return localStorage.getItem("pos_mobile_selected_staff") || "";
  });

  // Auto select first staff if none selected
  useEffect(() => {
    if (staffList.length > 0 && !selectedStaffId) {
      setSelectedStaffId(staffList[0].id);
      localStorage.setItem("pos_mobile_selected_staff", staffList[0].id);
    }
  }, [staffList, selectedStaffId]);

  const handleSelectStaff = (id: string) => {
    setSelectedStaffId(id);
    localStorage.setItem("pos_mobile_selected_staff", id);
  };

  // Persistent Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("pos_mobile_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("pos_mobile_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Customer & Discount in Cart
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("c1");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountAmountManual, setDiscountAmountManual] = useState<number>(0);

  // Cart Expand/Collapse Sheet
  const [isCartExpanded, setIsCartExpanded] = useState<boolean>(false);

  // Filter Catalog Category & Search in Part 2
  const [catalogTab, setCatalogTab] = useState<"ALL" | "SERVICE" | "PRODUCT" | "PACKAGE">("ALL");
  const [searchCatalogQuery, setSearchCatalogQuery] = useState<string>("");
  const [staffAlert, setStaffAlert] = useState<boolean>(false);

  // Receipt Modal State
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Helper currency format
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);

  const formatShortNumber = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val || 0);

  // Add Item to cart
  const handleAddToCart = (
    item: { id: string; name: string; price?: number; sellPrice?: number; discountAmount?: number | null },
    type: "SERVICE" | "PRODUCT" | "PACKAGE",
  ) => {
    if (!selectedStaffId) {
      setStaffAlert(true);
      setTimeout(() => setStaffAlert(false), 2000);
      return;
    }

    const price = type === "PRODUCT" ? item.sellPrice || 0 : item.price || 0;
    const discount = Number(item.discountAmount || 0);
    const uniqueKey = `${item.id}-${selectedStaffId}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;

    setCart((prev) => [
      ...prev,
      {
        cartId: uniqueKey,
        itemId: item.id,
        name: item.name,
        price: Number(price),
        quantity: 1,
        itemType: type,
        staffId: selectedStaffId,
        discount: discount,
      },
    ]);
  };

  // Adjust cart item quantity
  const handleAdjustQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.cartId === cartId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0),
    );
  };

  // Remove cart item
  const handleRemoveItem = (cartId: string) => {
    setCart((prev) => prev.filter((c) => c.cartId !== cartId));
  };

  // Change staff for a single item in cart
  const handleChangeItemStaff = (cartId: string, newStaffId: string) => {
    setCart((prev) =>
      prev.map((c) => (c.cartId === cartId ? { ...c, staffId: newStaffId } : c)),
    );
  };

  // Clear cart
  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?")) {
      setCart([]);
      setDiscountPercent(0);
      setDiscountAmountManual(0);
      setSelectedCustomerId("c1");
    }
  };

  // Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const itemDiscountsTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.discount || 0) * item.quantity, 0);
  }, [cart]);

  const billDiscount = useMemo(() => {
    if (discountPercent > 0) {
      return Math.round((cartSubtotal * discountPercent) / 100);
    }
    return discountAmountManual;
  }, [cartSubtotal, discountPercent, discountAmountManual]);

  const totalDiscount = itemDiscountsTotal + billDiscount;
  const finalPayAmount = Math.max(0, cartSubtotal - totalDiscount);

  // Filter Catalog Items for Part 2
  const filteredCatalogItems = useMemo(() => {
    let list: Array<{
      id: string;
      name: string;
      price: number;
      type: "SERVICE" | "PRODUCT" | "PACKAGE";
      categoryName?: string;
      duration?: number | null;
      discountAmount?: number | null;
    }> = [];

    if (catalogTab === "ALL" || catalogTab === "SERVICE") {
      activeServices.forEach((s) => {
        list.push({
          id: s.id,
          name: s.name,
          price: s.price,
          type: "SERVICE",
          categoryName: s.category?.name || "Dịch vụ",
          duration: s.duration,
          discountAmount: s.discountAmount,
        });
      });
    }

    if (catalogTab === "ALL" || catalogTab === "PRODUCT") {
      activeProducts.forEach((p) => {
        list.push({
          id: p.id,
          name: p.name,
          price: p.sellPrice,
          type: "PRODUCT",
          categoryName: "Hàng hóa",
          discountAmount: p.discountAmount,
        });
      });
    }

    if (catalogTab === "ALL" || catalogTab === "PACKAGE") {
      activePackages.forEach((pkg) => {
        list.push({
          id: pkg.id,
          name: pkg.name,
          price: pkg.price,
          type: "PACKAGE",
          categoryName: "Gói combo",
          duration: pkg.duration,
          discountAmount: pkg.discountAmount,
        });
      });
    }

    if (searchCatalogQuery.trim()) {
      const q = searchCatalogQuery.toLowerCase().trim();
      list = list.filter((item) => item.name.toLowerCase().includes(q));
    }

    return list;
  }, [catalogTab, searchCatalogQuery, activeServices, activeProducts, activePackages]);

  // Handle Checkout (Creates invoice matching Desktop POS payload format)
  const handleCheckout = async (paymentMethod: "CASH" | "BANK_TRANSFER") => {
    if (cart.length === 0) {
      alert("Giỏ hàng đang trống! Vui lòng chọn dịch vụ hoặc hàng hóa.");
      return;
    }
    if (!currentTenantId || !currentBranchId) {
      alert("Thiếu thông tin chi nhánh!");
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Map payload items with distributed discounts matching Desktop POS
      const payloadItems = cart.map((c) => {
        const itemDiscount = (c.discount || 0) * c.quantity;
        const itemRemaining = (c.price - (c.discount || 0)) * c.quantity;
        const voucherDiscount =
          cartSubtotal > 0
            ? Math.round(itemRemaining * (billDiscount / cartSubtotal))
            : 0;
        const totalItemDiscount = itemDiscount + voucherDiscount;

        return {
          itemId: c.itemId,
          itemType: c.itemType,
          staffId: c.staffId,
          price: c.price,
          quantity: c.quantity,
          discountAmount: totalItemDiscount,
        };
      });

      const payload = {
        customerId: selectedCustomerId === "c1" ? undefined : selectedCustomerId,
        cashierId: user?.id,
        items: payloadItems,
        discountAmount: totalDiscount,
        paymentMethod,
        paymentStatus: "PAID",
      };

      const invoiceData = await api.post<any>(
        `/tenants/${currentTenantId}/branches/${currentBranchId}/invoices`,
        payload,
      );

      // Enriched invoice for receipt modal
      const enrichedInvoice = {
        ...invoiceData,
        items: invoiceData.items?.map((it: any) => {
          const original = cart.find((c) => c.itemId === it.itemId);
          const staffObj = staffList.find((s) => s.id === it.staffId);
          return {
            ...it,
            name: original?.name || it.name || "Dịch vụ / Hàng hóa",
            stylist: staffObj,
          };
        }),
      };

      setReceiptData(enrichedInvoice);
      setShowReceipt(true);
      setCart([]);
      setDiscountPercent(0);
      setDiscountAmountManual(0);
      setIsCartExpanded(false);

      // Invalidate queries so lists update immediately
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoices.all(currentTenantId!, currentBranchId!),
      });
    } catch (e: any) {
      alert("Lỗi thanh toán: " + (e.message || "Không thể hoàn tất thanh toán"));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background: "#f8fafc",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Alert toast if user clicked item without staff selected */}
      {staffAlert && (
        <div
          className="animate-fade-in"
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            background: "#ef4444",
            color: "#ffffff",
            padding: "8px 16px",
            borderRadius: "30px",
            fontSize: "12.5px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.35)",
          }}
        >
          <AlertCircle size={16} />
          <span>Vui lòng chọn nhân viên ở phần 1 trước!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHẦN 1: CHỌN NHÂN VIÊN (20% chiều cao, 2 cột 3 dòng, cuộn dọc nếu > 6)    */}
      {/* ========================================================================= */}
      <div
        style={{
          flex: "0 0 20%",
          maxHeight: "20%",
          minHeight: "120px",
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          padding: "8px 12px 6px",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "6px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Users size={14} color="#2563eb" />
            <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#1e293b" }}>
              1. Chọn nhân viên phục vụ
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>
            {staffList.length} nhân sự
          </span>
        </div>

        {/* 2 Cột x 3 Dòng, Cuộn dọc */}
        <div
          style={{
            flexGrow: 1,
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gridAutoRows: "36px",
            gap: "6px",
            paddingRight: "2px",
          }}
        >
          {staffList.map((staff) => {
            const isSelected = selectedStaffId === staff.id;
            return (
              <button
                key={staff.id}
                onClick={() => handleSelectStaff(staff.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 10px",
                  borderRadius: "8px",
                  border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                  background: isSelected
                    ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                    : "#f8fafc",
                  color: isSelected ? "#ffffff" : "#1e293b",
                  fontWeight: isSelected ? "700" : "600",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textAlign: "left",
                  boxShadow: isSelected ? "0 2px 8px rgba(37, 99, 235, 0.25)" : "none",
                }}
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "85%",
                  }}
                >
                  {staff.name}
                </span>
                {isSelected && <Check size={14} color="#ffffff" style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHẦN 2: CHỌN DỊCH VỤ, HÀNG HÓA,... (60% chiều cao, 2 cột nhiều dòng, cuộn) */}
      {/* ========================================================================= */}
      <div
        style={{
          flex: "0 0 60%",
          maxHeight: "60%",
          display: "flex",
          flexDirection: "column",
          background: "#f1f5f9",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Category Filter Pills & Search Bar */}
        <div
          style={{
            padding: "8px 12px",
            background: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flexShrink: 0,
          }}
        >
          {/* Quick Search */}
          <div style={{ position: "relative", width: "100%" }}>
            <Search
              size={13}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Tìm dịch vụ, sản phẩm nhanh..."
              value={searchCatalogQuery}
              onChange={(e) => setSearchCatalogQuery(e.target.value)}
              style={{
                height: "30px",
                fontSize: "12px",
                borderRadius: "var(--radius-full)",
                padding: "0 10px 0 28px",
                width: "100%",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
              }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
            {[
              { key: "ALL", label: "Tất cả", icon: Sparkles },
              { key: "SERVICE", label: "Dịch vụ", icon: Scissors },
              { key: "PRODUCT", label: "Sản phẩm", icon: Package },
              { key: "PACKAGE", label: "Combo", icon: Layers },
            ].map((tab) => {
              const isActive = catalogTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setCatalogTab(tab.key as any)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 10px",
                    borderRadius: "var(--radius-full)",
                    border: isActive ? "1px solid #2563eb" : "1px solid #e2e8f0",
                    background: isActive ? "#2563eb" : "#f8fafc",
                    color: isActive ? "#ffffff" : "#475569",
                    fontSize: "11px",
                    fontWeight: isActive ? "700" : "500",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2 Cột Nhiều Dòng, Cuộn dọc */}
        <div
          style={{
            flexGrow: 1,
            overflowY: "auto",
            padding: "8px 10px",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gridAutoRows: "min-content",
            gap: "8px",
          }}
        >
          {filteredCatalogItems.length === 0 ? (
            <div
              style={{
                gridColumn: "span 2",
                textAlign: "center",
                padding: "40px 16px",
                color: "#64748b",
                fontSize: "12.5px",
              }}
            >
              Không tìm thấy dịch vụ hoặc hàng hóa phù hợp
            </div>
          ) : (
            filteredCatalogItems.map((item) => {
              // Count quantity of this item already in cart
              const inCartCount = cart
                .filter((c) => c.itemId === item.id)
                .reduce((sum, c) => sum + c.quantity, 0);

              const isService = item.type === "SERVICE";
              const isPackage = item.type === "PACKAGE";

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleAddToCart(item, item.type)}
                  style={{
                    background: "#ffffff",
                    borderRadius: "10px",
                    padding: "9px 10px",
                    border: inCartCount > 0 ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "72px",
                    cursor: "pointer",
                    position: "relative",
                    transition: "all 0.15s ease",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {/* Item In-Cart Badge */}
                  {inCartCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        background: "#2563eb",
                        color: "#ffffff",
                        fontSize: "10px",
                        fontWeight: "800",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      {inCartCount}
                    </span>
                  )}

                  <div>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        color: isService ? "#2563eb" : isPackage ? "#8b5cf6" : "#059669",
                        letterSpacing: "0.3px",
                      }}
                    >
                      {item.categoryName}
                    </span>
                    <h4
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#0f172a",
                        margin: "2px 0 0",
                        lineHeight: 1.3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.name}
                    </h4>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "6px",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a" }}>
                      {formatShortNumber(item.price)}đ
                    </span>
                    {item.duration && (
                      <span style={{ fontSize: "10px", color: "#64748b" }}>
                        {item.duration}p
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHẦN 3: GIỎ HÀNG (20% chiều cao thu nhỏ, có nút mở rộng xem & thanh toán)  */}
      {/* ========================================================================= */}
      <div
        style={{
          flex: "0 0 20%",
          maxHeight: "20%",
          minHeight: "110px",
          background: "#ffffff",
          borderTop: "2px solid #2563eb",
          boxShadow: "0 -4px 16px rgba(15, 23, 42, 0.08)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "8px 12px 10px",
          boxSizing: "border-box",
          zIndex: 40,
        }}
      >
        {/* Top Summary Bar with Expand Button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563eb",
                position: "relative",
              }}
            >
              <ShoppingCart size={17} />
              {totalItemsCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    background: "#ef4444",
                    color: "#ffffff",
                    fontSize: "9.5px",
                    fontWeight: "800",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {totalItemsCount}
                </span>
              )}
            </div>
            <div>
              <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                Giỏ hàng ({totalItemsCount} món)
              </div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "#16a34a" }}>
                {formatCurrency(finalPayAmount)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCartExpanded(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 12px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "8px",
              color: "#2563eb",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            <span>Chi tiết</span>
            <ChevronUp size={15} />
          </button>
        </div>

        {/* Action Buttons in Collapsed Mode */}
        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
          <button
            disabled={cart.length === 0 || isProcessingPayment}
            onClick={() => handleCheckout("CASH")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "9px 0",
              background: cart.length === 0 ? "#e2e8f0" : "#15803d",
              color: cart.length === 0 ? "#94a3b8" : "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "12.5px",
              cursor: cart.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            <Banknote size={15} />
            <span>Tiền mặt</span>
          </button>

          <button
            disabled={cart.length === 0 || isProcessingPayment}
            onClick={() => handleCheckout("BANK_TRANSFER")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "9px 0",
              background: cart.length === 0 ? "#e2e8f0" : "#2563eb",
              color: cart.length === 0 ? "#94a3b8" : "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "12.5px",
              cursor: cart.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            <CreditCard size={15} />
            <span>Tài khoản</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXPANDED BOTTOM SHEET: TOÀN BỘ GIỎ HÀNG, SỬA MÓN, CHIẾT KHẤU, IN HÓA ĐƠN */}
      {/* ========================================================================= */}
      {isCartExpanded && (
        <div
          className="animate-fade-in"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            zIndex: 90,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
          onClick={() => setIsCartExpanded(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
              maxHeight: "92%",
              height: "92%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                  Giỏ hàng ({totalItemsCount} món)
                </span>
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      fontSize: "11px",
                      cursor: "pointer",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsCartExpanded(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  background: "#e2e8f0",
                  border: "none",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                <span>Thu nhỏ</span>
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Customer Selector Bar */}
            <div
              style={{
                padding: "8px 16px",
                borderBottom: "1px solid #e2e8f0",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                Khách hàng:
              </span>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#1e293b",
                  background: "#f8fafc",
                  maxWidth: "60%",
                }}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Itemized Cart List */}
            <div
              style={{
                flexGrow: 1,
                overflowY: "auto",
                padding: "10px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {cart.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 16px",
                    color: "#94a3b8",
                    fontSize: "13px",
                  }}
                >
                  🛒 Giỏ hàng đang trống. Hãy chọn món ở Phần 2!
                </div>
              ) : (
                cart.map((item) => {
                  const assignedStaff = staffList.find((s) => s.id === item.staffId);
                  const itemLineTotal = item.price * item.quantity;

                  return (
                    <div
                      key={item.cartId}
                      style={{
                        padding: "10px",
                        background: "#f8fafc",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      {/* Row 1: Name & Line Total */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            Đơn giá: {formatShortNumber(item.price)}đ
                          </div>
                        </div>

                        <span style={{ fontSize: "13.5px", fontWeight: "800", color: "#16a34a" }}>
                          {formatCurrency(itemLineTotal)}
                        </span>
                      </div>

                      {/* Row 2: Assigned Staff + Quantity Stepper */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: "2px",
                        }}
                      >
                        {/* Staff select pill */}
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <User size={12} color="#2563eb" />
                          <select
                            value={item.staffId}
                            onChange={(e) => handleChangeItemStaff(item.cartId, e.target.value)}
                            style={{
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "#2563eb",
                              background: "#eff6ff",
                              border: "1px solid #bfdbfe",
                              borderRadius: "4px",
                              padding: "2px 4px",
                            }}
                          >
                            {staffList.map((s) => (
                              <option key={s.id} value={s.id}>
                                Thợ: {s.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => handleAdjustQuantity(item.cartId, -1)}
                            style={{
                              width: "26px",
                              height: "26px",
                              borderRadius: "6px",
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Minus size={13} />
                          </button>

                          <span style={{ fontSize: "13px", fontWeight: "700", minWidth: "16px", textAlign: "center" }}>
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => handleAdjustQuantity(item.cartId, 1)}
                            style={{
                              width: "26px",
                              height: "26px",
                              borderRadius: "6px",
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Plus size={13} />
                          </button>

                          <button
                            onClick={() => handleRemoveItem(item.cartId)}
                            style={{
                              width: "26px",
                              height: "26px",
                              borderRadius: "6px",
                              background: "#fee2e2",
                              border: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ef4444",
                              cursor: "pointer",
                              marginLeft: "4px",
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Summary & Checkout Footer in Expanded Mode */}
            <div
              style={{
                padding: "12px 16px",
                background: "#ffffff",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                flexShrink: 0,
              }}
            >
              {/* Discount inputs */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <span style={{ color: "#64748b" }}>Giảm giá (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent || ""}
                  onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                  placeholder="0%"
                  style={{
                    width: "70px",
                    height: "28px",
                    padding: "0 6px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    textAlign: "right",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                />
              </div>

              {/* Totals Breakdown */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b" }}>
                <span>Tạm tính:</span>
                <span>{formatCurrency(cartSubtotal)}</span>
              </div>

              {totalDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#ef4444" }}>
                  <span>Tổng giảm giá:</span>
                  <span>-{formatCurrency(totalDiscount)}</span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "16px",
                  fontWeight: "800",
                  color: "#16a34a",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "6px",
                }}
              >
                <span>THÀNH TIỀN:</span>
                <span>{formatCurrency(finalPayAmount)}</span>
              </div>

              {/* Buttons in Expanded Mode: Cash, Bank Transfer, Print preview */}
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button
                  disabled={cart.length === 0 || isProcessingPayment}
                  onClick={() => handleCheckout("CASH")}
                  style={{
                    flex: 1.2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "11px 0",
                    background: cart.length === 0 ? "#e2e8f0" : "#15803d",
                    color: cart.length === 0 ? "#94a3b8" : "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: cart.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  <Banknote size={16} />
                  <span>Tiền mặt</span>
                </button>

                <button
                  disabled={cart.length === 0 || isProcessingPayment}
                  onClick={() => handleCheckout("BANK_TRANSFER")}
                  style={{
                    flex: 1.2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "11px 0",
                    background: cart.length === 0 ? "#e2e8f0" : "#2563eb",
                    color: cart.length === 0 ? "#94a3b8" : "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: cart.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  <CreditCard size={16} />
                  <span>Tài khoản</span>
                </button>

                <button
                  onClick={() => {
                    // Preview receipt with current cart
                    const preview = {
                      id: "PREVIEW-" + Date.now().toString().slice(-4),
                      createdAt: new Date().toISOString(),
                      totalPrice: cartSubtotal,
                      discountAmount: totalDiscount,
                      finalAmount: finalPayAmount,
                      paymentMethod: "CASH",
                      customer: customers.find((c) => c.id === selectedCustomerId),
                      cashier: { name: user?.name || "Thu ngân" },
                      items: cart.map((c) => ({
                        name: c.name,
                        price: c.price,
                        quantity: c.quantity,
                        discountAmount: c.discount,
                        stylist: staffList.find((s) => s.id === c.staffId),
                      })),
                    };
                    setReceiptData(preview);
                    setShowReceipt(true);
                  }}
                  disabled={cart.length === 0}
                  style={{
                    flex: 0.8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    padding: "11px 0",
                    background: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "12px",
                    cursor: cart.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  <Printer size={15} />
                  <span>In HĐ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <MobilePOSReceiptModal
        showReceipt={showReceipt}
        onClose={() => setShowReceipt(false)}
        receiptData={receiptData}
        branchName={currentBranchName}
      />
    </div>
  );
}
