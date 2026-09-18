import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Check,
  Search,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Printer,
  Users,
  AlertCircle,
  ShoppingCart,
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
  timestamp: number;
}

// Category color presets identical to Desktop POS
const getServiceCategoryColor = (categoryName: string, colorName?: string) => {
  if (colorName) {
    const presets: Record<
      string,
      { bg: string; border: string; text: string }
    > = {
      blue: { bg: "hsl(210, 100%, 96%)", border: "hsl(210, 100%, 82%)", text: "hsl(210, 100%, 40%)" },
      green: { bg: "hsl(142, 70%, 95%)", border: "hsl(142, 70%, 80%)", text: "hsl(142, 72%, 27%)" },
      orange: { bg: "hsl(30, 100%, 95%)", border: "hsl(30, 100%, 80%)", text: "hsl(30, 100%, 35%)" },
      red: { bg: "hsl(0, 100%, 96%)", border: "hsl(0, 100%, 82%)", text: "hsl(0, 100%, 40%)" },
      sky: { bg: "hsl(193, 90%, 95%)", border: "hsl(193, 90%, 80%)", text: "hsl(193, 90%, 30%)" },
      purple: { bg: "hsl(270, 80%, 96%)", border: "hsl(270, 80%, 82%)", text: "hsl(270, 80%, 40%)" },
      pink: { bg: "hsl(330, 80%, 96%)", border: "hsl(330, 80%, 82%)", text: "hsl(330, 80%, 40%)" },
      indigo: { bg: "hsl(235, 80%, 96%)", border: "hsl(235, 80%, 82%)", text: "hsl(235, 80%, 40%)" },
      lime: { bg: "hsl(80, 80%, 94%)", border: "hsl(80, 80%, 75%)", text: "hsl(80, 80%, 25%)" },
      teal: { bg: "hsl(170, 80%, 94%)", border: "hsl(170, 80%, 75%)", text: "hsl(170, 80%, 25%)" },
    };
    const c = colorName.toLowerCase();
    if (presets[c]) return presets[c];
  }

  const name = (categoryName || "").toLowerCase();
  if (name.includes("hair") || name.includes("tóc") || name.includes("cắt")) {
    return { bg: "#f0f7ff", border: "#bae6fd", text: "#0369a1" };
  }
  if (name.includes("spa") || name.includes("gội") || name.includes("massage")) {
    return { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" };
  }
  if (name.includes("nail") || name.includes("móng") || name.includes("art")) {
    return { bg: "#fff5f5", border: "#fed7d7", text: "#c53030" };
  }
  if (name.includes("uốn") || name.includes("nhuộm")) {
    return { bg: "#faf5ff", border: "#e9d5ff", text: "#7e22ce" };
  }
  return { bg: "#f8fafc", border: "#cbd5e1", text: "#334155" };
};

// Employee color presets identical to Desktop POS
export const getEmployeeColor = (id: string, activeStaff?: any[]) => {
  const colors = [
    { color: "#0d9488" }, // Teal 600
    { color: "#0284c7" }, // Sky Blue 600
    { color: "#4f46e5" }, // Indigo 600
    { color: "#7c3aed" }, // Violet 600
    { color: "#e11d48" }, // Rose 600
    { color: "#ea580c" }, // Orange 600
    { color: "#d97706" }, // Amber 600
  ];
  if (activeStaff && activeStaff.length > 0) {
    const idx = activeStaff.findIndex((s) => s.id === id);
    if (idx !== -1) {
      return colors[idx % colors.length];
    }
  }
  let sum = 0;
  const safeId = id || "default";
  for (let i = 0; i < safeId.length; i++) {
    sum += safeId.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

// Remove Vietnamese accents/diacritics for flexible fuzzy search
const removeVietnameseTones = (str: string): string => {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

const matchesSearch = (target: string, query: string): boolean => {
  if (!query || !query.trim()) return true;
  const rawTarget = (target || "").toLowerCase().trim();
  const rawQuery = query.toLowerCase().trim();

  // 1. Exact match with accents
  if (rawTarget.includes(rawQuery)) return true;

  // 2. Accent-stripped match
  const cleanTarget = removeVietnameseTones(rawTarget);
  const cleanQuery = removeVietnameseTones(rawQuery);
  if (cleanTarget.includes(cleanQuery)) return true;

  // 3. Multi-word match: every word in query must appear in target
  const words = cleanQuery.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((w) => cleanTarget.includes(w))) {
    return true;
  }

  return false;
};

interface CatalogCardProps {
  item: {
    id: string;
    name: string;
    price: number;
    type: "SERVICE" | "PRODUCT" | "PACKAGE";
    color: { bg: string; border: string; text: string };
  };
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
  isInCart: boolean;
  cartBadges: React.ReactNode;
}

function CatalogItemCard({
  item,
  onAddToCart,
  onRemoveFromCart,
  isInCart,
  cartBadges,
}: CatalogCardProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const lastLongPressTimeRef = useRef(0);
  const startCoordsRef = useRef<{ x: number; y: number } | null>(null);
  const [isPressing, setIsPressing] = useState(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressing(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isLongPressRef.current = false;
    if (e.touches.length > 0) {
      startCoordsRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
    if (isInCart) {
      setIsPressing(true);
      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        lastLongPressTimeRef.current = Date.now();
        setIsPressing(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate(50);
          } catch {}
        }
        onRemoveFromCart();
      }, 480);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startCoordsRef.current || !e.touches[0]) return;
    const dx = Math.abs(e.touches[0].clientX - startCoordsRef.current.x);
    const dy = Math.abs(e.touches[0].clientY - startCoordsRef.current.y);
    if (dx > 8 || dy > 8) {
      clearTimer();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isLongPressRef.current || Date.now() - lastLongPressTimeRef.current < 800) {
      if (e.cancelable) {
        e.preventDefault();
      }
    }
    clearTimer();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isLongPressRef.current = false;
    startCoordsRef.current = { x: e.clientX, y: e.clientY };
    if (isInCart) {
      setIsPressing(true);
      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        lastLongPressTimeRef.current = Date.now();
        setIsPressing(false);
        onRemoveFromCart();
      }, 480);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isLongPressRef.current || Date.now() - lastLongPressTimeRef.current < 800) {
      e.preventDefault();
    }
    clearTimer();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressRef.current || Date.now() - lastLongPressTimeRef.current < 800) {
      e.preventDefault();
      e.stopPropagation();
      isLongPressRef.current = false;
      return;
    }
    onAddToCart();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInCart) {
      lastLongPressTimeRef.current = Date.now();
      isLongPressRef.current = true;
      onRemoveFromCart();
    }
  };

  return (
    <button
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
      style={{
        background: item.color.bg,
        border: `1.5px solid ${item.color.border}`,
        color: item.color.text,
        borderRadius: "8px",
        padding: "0 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        cursor: "pointer",
        transition: "transform 0.1s ease, box-shadow 0.1s ease",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
        outline: "none",
        position: "relative",
        userSelect: "none",
        WebkitUserSelect: "none",
        transform: isPressing ? "scale(0.94)" : "none",
      }}
    >
      {/* Absolute top-right corner badge */}
      {cartBadges && (
        <div
          style={{
            position: "absolute",
            top: "-5px",
            right: "-4px",
            zIndex: 10,
          }}
        >
          {cartBadges}
        </div>
      )}

      <span
        style={{
          fontSize: "12px",
          fontWeight: "700",
          lineHeight: 1.25,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {item.name}
      </span>
    </button>
  );
}

export default function MobilePOS() {
  const { currentTenantId, currentBranchId, branches, user } = useAuthStore();
  const queryClient = useQueryClient();

  const currentBranchName =
    branches.find((b) => b.id === currentBranchId)?.name || "Chi nhánh chính";

  // 1. TanStack Queries matching Desktop POS
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

  // Filter active items
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

  // Extract distinct service categories from database (same as Desktop POS)
  const serviceCategories = useMemo(() => {
    return Array.from(
      new Set(
        activeServices
          .map((s) => s.category?.name || "")
          .filter(Boolean),
      ),
    );
  }, [activeServices]);

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
      window.dispatchEvent(new Event("pos_cart_updated"));
    } catch {}
  }, [cart]);

  // Customer & Discount
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("c1");
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Cart Expand/Collapse
  const [isCartExpanded, setIsCartExpanded] = useState<boolean>(false);

  // Category & Search Filters in Panel 2 (Referenced from Desktop POS)
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchCatalogQuery, setSearchCatalogQuery] = useState<string>("");
  const [staffAlert, setStaffAlert] = useState<boolean>(false);
  const [quickToast, setQuickToast] = useState<string | null>(null);

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

  // Add Item to cart: Prepend newest to top, or track timestamp
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

    const newItem: CartItem = {
      cartId: uniqueKey,
      itemId: item.id,
      name: item.name,
      price: Number(price),
      quantity: 1,
      itemType: type,
      staffId: selectedStaffId,
      discount: discount,
      timestamp: Date.now(),
    };

    // Prepend to top so newest is first
    setCart((prev) => [newItem, ...prev]);
  };

  // Adjust cart item quantity
  const handleAdjustQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.cartId === cartId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0),
    );
  };

  // Remove single cart item by cartId
  const handleRemoveItem = (cartId: string) => {
    setCart((prev) => prev.filter((c) => c.cartId !== cartId));
  };

  // Quick remove all instances of an item from cart (via long-press on catalog card)
  const handleRemoveFromCart = (itemId: string, itemName: string) => {
    setCart((prev) => {
      const exists = prev.some((c) => c.itemId === itemId);
      if (!exists) return prev;
      setQuickToast(`Đã xóa "${itemName}" khỏi giỏ hàng`);
      setTimeout(() => setQuickToast(null), 1800);
      return prev.filter((c) => c.itemId !== itemId);
    });
  };

  // Helper: Render active cart assignment badges on item card
  const renderItemCartBadges = (itemId: string) => {
    const assignments = cart.filter((c) => c.itemId === itemId);
    if (assignments.length === 0) return null;

    // Group assignments by staffId and sum quantities
    const groupedAssignments: { staffId: string; quantity: number }[] = [];
    assignments.forEach((asg) => {
      const existing = groupedAssignments.find((x) => x.staffId === asg.staffId);
      if (existing) {
        existing.quantity += asg.quantity;
      } else {
        groupedAssignments.push({
          staffId: asg.staffId,
          quantity: asg.quantity,
        });
      }
    });

    return (
      <div style={{ display: "flex", gap: "2px", pointerEvents: "none" }}>
        {groupedAssignments.map((ga) => {
          const empColor = getEmployeeColor(ga.staffId, staffList).color;
          return (
            <span
              key={ga.staffId}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "17px",
                height: "17px",
                padding: "0 3px",
                borderRadius: "9px",
                fontSize: "10px",
                fontWeight: "800",
                backgroundColor: empColor,
                color: "#ffffff",
                border: "1.5px solid #ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            >
              {ga.quantity}
            </span>
          );
        })}
      </div>
    );
  };

  // Change staff for single cart item
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

  const billDiscount = useMemo(() => {
    if (discountPercent > 0) {
      return Math.round((cartSubtotal * discountPercent) / 100);
    }
    return 0;
  }, [cartSubtotal, discountPercent]);

  const finalPayAmount = Math.max(0, cartSubtotal - billDiscount);

  // Filter Catalog Items for Panel 2 (Referenced from Desktop POS)
  const filteredCatalogItems = useMemo(() => {
    let list: Array<{
      id: string;
      name: string;
      price: number;
      type: "SERVICE" | "PRODUCT" | "PACKAGE";
      categoryName: string;
      categoryColor?: string;
      color: { bg: string; border: string; text: string };
    }> = [];

    // 1. Services
    if (selectedCategory === "All" || selectedCategory.startsWith("Service:")) {
      activeServices.forEach((s) => {
        const catName = s.category?.name || "Dịch vụ";
        if (selectedCategory === "All" || selectedCategory === `Service:${catName}`) {
          list.push({
            id: s.id,
            name: s.name,
            price: s.price,
            type: "SERVICE",
            categoryName: catName,
            categoryColor: s.category?.color,
            color: getServiceCategoryColor(catName, s.category?.color),
          });
        }
      });
    }

    // 2. Products
    if (selectedCategory === "All" || selectedCategory === "Product") {
      activeProducts.forEach((p) => {
        list.push({
          id: p.id,
          name: p.name,
          price: p.sellPrice,
          type: "PRODUCT",
          categoryName: "Sản phẩm",
          color: { bg: "#f0fdfa", border: "#99f6e4", text: "#0d9488" }, // Teal
        });
      });
    }

    // 3. Packages
    if (selectedCategory === "All" || selectedCategory === "Package") {
      activePackages.forEach((pkg) => {
        list.push({
          id: pkg.id,
          name: pkg.name,
          price: pkg.price,
          type: "PACKAGE",
          categoryName: "Combo",
          color: { bg: "#faf5ff", border: "#e9d5ff", text: "#7c3aed" }, // Violet
        });
      });
    }

    // Search filter with flexible Vietnamese matching
    if (searchCatalogQuery.trim()) {
      list = list.filter(
        (item) =>
          matchesSearch(item.name, searchCatalogQuery) ||
          matchesSearch(item.categoryName, searchCatalogQuery),
      );
    }

    return list;
  }, [selectedCategory, searchCatalogQuery, activeServices, activeProducts, activePackages]);

  // Handle Checkout
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
      const payloadItems = cart.map((c) => {
        const itemRemaining = c.price * c.quantity;
        const voucherDiscount =
          cartSubtotal > 0
            ? Math.round(itemRemaining * (billDiscount / cartSubtotal))
            : 0;

        return {
          itemId: c.itemId,
          itemType: c.itemType,
          staffId: c.staffId,
          price: c.price,
          quantity: c.quantity,
          discountAmount: voucherDiscount,
        };
      });

      const payload = {
        customerId: selectedCustomerId === "c1" ? undefined : selectedCustomerId,
        cashierId: user?.id,
        items: payloadItems,
        discountAmount: billDiscount,
        paymentMethod,
        paymentStatus: "PAID",
      };

      const invoiceData = await api.post<any>(
        `/tenants/${currentTenantId}/branches/${currentBranchId}/invoices`,
        payload,
      );

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
      setIsCartExpanded(false);

      queryClient.invalidateQueries({
        queryKey: queryKeys.invoices.all(currentTenantId!, currentBranchId!),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.all(currentTenantId!),
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
        background: "#ffffff",
        overflow: "hidden",
        position: "relative",
        margin: 0,
        padding: 0,
      }}
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* Alert toast if user clicked item without staff selected */}
      {staffAlert && (
        <div
          className="animate-fade-in"
          style={{
            position: "absolute",
            top: "8px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            background: "#ef4444",
            color: "#ffffff",
            padding: "6px 14px",
            borderRadius: "30px",
            fontSize: "12px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.35)",
            whiteSpace: "nowrap",
          }}
        >
          <AlertCircle size={15} />
          <span>Vui lòng chọn nhân viên ở phần trên trước!</span>
        </div>
      )}

      {/* Toast alert when item is quick-deleted by long-press */}
      {quickToast && (
        <div
          className="animate-fade-in"
          style={{
            position: "absolute",
            top: "8px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            background: "#1e293b",
            color: "#ffffff",
            padding: "6px 14px",
            borderRadius: "30px",
            fontSize: "12px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
            whiteSpace: "nowrap",
          }}
        >
          <Trash2 size={13} color="#f87171" />
          <span>{quickToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHẦN 1: CHỌN NHÂN VIÊN (20% chiều cao, 2 cột 3 dòng, cuộn dọc nếu > 6)    */}
      {/* ========================================================================= */}
      <div
        style={{
          flex: "0 0 20%",
          maxHeight: "20%",
          minHeight: "115px",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          padding: "6px 8px",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "4px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Users size={16} color="#2563eb" />
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>
              Nhân viên phục vụ
            </span>
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            {staffList.length} thợ
          </span>
        </div>

        {/* 2 Cột x 3 Dòng, Cuộn dọc */}
        <div
          style={{
            flexGrow: 1,
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gridAutoRows: "32px",
            gap: "5px",
          }}
        >
          {staffList.map((staff) => {
            const isSelected = selectedStaffId === staff.id;
            const empColor = getEmployeeColor(staff.id, staffList).color;
            return (
              <button
                key={staff.id}
                onClick={() => handleSelectStaff(staff.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 8px",
                  borderRadius: "6px",
                  border: isSelected ? `2px solid ${empColor}` : `1.5px solid ${empColor}80`,
                  background: isSelected ? empColor : "#ffffff",
                  color: isSelected ? "#ffffff" : empColor,
                  fontWeight: isSelected ? "700" : "600",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textAlign: "left",
                  boxShadow: isSelected ? `0 2px 8px ${empColor}40` : "none",
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
                {isSelected && <Check size={13} color="#ffffff" style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phân cách giữa Panel 1 và Panel 2 */}
      <div
        style={{
          height: "6px",
          background: "#f1f5f9",
          borderTop: "1px solid #e2e8f0",
          borderBottom: "1px solid #e2e8f0",
          flexShrink: 0,
        }}
      />

      {/* ========================================================================= */}
      {/* PHẦN 2: CHỌN DỊCH VỤ, HÀNG HÓA,...                                         */}
      {/* Bộ lọc refer desktop: Tất cả, từng nhóm DV riêng, Sản phẩm, Combo         */}
      {/* Card chỉ hiện TÊN và MÀU NHÓM giống Desktop, không hiện giá/thời gian/SL  */}
      {/* ========================================================================= */}
      <div
        style={{
          flex: "1 1 0%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Filter bar: Search box + Horizontal Category Chips */}
        <div
          style={{
            padding: "8px 10px",
            background: "#ffffff",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            flexDirection: "column",
            gap: "7px",
            flexShrink: 0,
          }}
        >
          {/* Quick Search input */}
          <div style={{ position: "relative", width: "100%" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "11px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Tìm kiếm dịch vụ, sản phẩm nhanh..."
              value={searchCatalogQuery}
              onChange={(e) => setSearchCatalogQuery(e.target.value)}
              style={{
                height: "34px",
                fontSize: "12.5px",
                borderRadius: "var(--radius-full)",
                padding: "0 12px 0 32px",
                width: "100%",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
              }}
            />
          </div>

          {/* Group Category Filters from Desktop POS */}
          <div
            className="no-scrollbar"
            style={{
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              paddingBottom: "2px",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* Tất cả */}
            <button
              onClick={() => setSelectedCategory("All")}
              style={{
                height: "30px",
                padding: "0 12px",
                borderRadius: "var(--radius-full)",
                border: selectedCategory === "All" ? "1px solid #2563eb" : "1px solid #e2e8f0",
                background: selectedCategory === "All" ? "#2563eb" : "#f8fafc",
                color: selectedCategory === "All" ? "#ffffff" : "#475569",
                fontSize: "12px",
                fontWeight: selectedCategory === "All" ? "700" : "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Tất cả
            </button>

            {/* Individual Service Categories from DB */}
            {serviceCategories.map((catName) => {
              const filterVal = `Service:${catName}`;
              const isActive = selectedCategory === filterVal;
              return (
                <button
                  key={catName}
                  onClick={() => setSelectedCategory(filterVal)}
                  style={{
                    height: "30px",
                    padding: "0 12px",
                    borderRadius: "var(--radius-full)",
                    border: isActive ? "1px solid #2563eb" : "1px solid #e2e8f0",
                    background: isActive ? "#2563eb" : "#f8fafc",
                    color: isActive ? "#ffffff" : "#475569",
                    fontSize: "12px",
                    fontWeight: isActive ? "700" : "600",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  {catName}
                </button>
              );
            })}

            {/* Sản phẩm */}
            <button
              onClick={() => setSelectedCategory("Product")}
              style={{
                height: "30px",
                padding: "0 12px",
                borderRadius: "var(--radius-full)",
                border: selectedCategory === "Product" ? "1px solid #0d9488" : "1px solid #e2e8f0",
                background: selectedCategory === "Product" ? "#0d9488" : "#f8fafc",
                color: selectedCategory === "Product" ? "#ffffff" : "#475569",
                fontSize: "12px",
                fontWeight: selectedCategory === "Product" ? "700" : "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Sản phẩm
            </button>

            {/* Combo */}
            <button
              onClick={() => setSelectedCategory("Package")}
              style={{
                height: "30px",
                padding: "0 12px",
                borderRadius: "var(--radius-full)",
                border: selectedCategory === "Package" ? "1px solid #7c3aed" : "1px solid #e2e8f0",
                background: selectedCategory === "Package" ? "#7c3aed" : "#f8fafc",
                color: selectedCategory === "Package" ? "#ffffff" : "#475569",
                fontSize: "12px",
                fontWeight: selectedCategory === "Package" ? "700" : "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Gói combo
            </button>
          </div>
        </div>

        {/* 2 Cột Nhiều Dòng, Cuộn dọc: CHỈ HIỆN TÊN VÀ MÀU NHÓM GIỐNG DESKTOP */}
        <div
          style={{
            flexGrow: 1,
            overflowY: "auto",
            padding: "6px 8px",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gridAutoRows: "46px",
            gap: "6px",
          }}
        >
          {filteredCatalogItems.length === 0 ? (
            <div
              style={{
                gridColumn: "span 2",
                textAlign: "center",
                padding: "30px 10px",
                color: "#94a3b8",
                fontSize: "12px",
              }}
            >
              Không tìm thấy mục nào phù hợp
            </div>
          ) : (
            filteredCatalogItems.map((item) => {
              const isInCart = cart.some((c) => c.itemId === item.id);
              return (
                <CatalogItemCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                  onAddToCart={() => handleAddToCart(item, item.type)}
                  onRemoveFromCart={() => handleRemoveFromCart(item.id, item.name)}
                  isInCart={isInCart}
                  cartBadges={renderItemCartBadges(item.id)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHẦN 3: GIỎ HÀNG (Thu gọn vừa khít nội dung, có nút mở rộng xem & TT)       */}
      {/* ========================================================================= */}
      <div
        style={{
          flexShrink: 0,
          background: "#ffffff",
          borderTop: "none",
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.08), 0 -1px 4px rgba(0, 0, 0, 0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 12px",
          boxSizing: "border-box",
          zIndex: 40,
        }}
      >
        {/* Summary Bar with Expand Button */}
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
            padding: "5px 11px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            color: "#2563eb",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <span>Chi tiết</span>
          <ChevronUp size={14} />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* EXPANDED BOTTOM SHEET: SỬA SỐ LƯỢNG, ĐỔI THỢ, CHIẾT KHẤU, IN HÓA ĐƠN      */}
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
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
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
                padding: "10px 14px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f172a" }}>
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
                      padding: "2px 4px",
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
                  padding: "5px 11px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  color: "#2563eb",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <span>Thu nhỏ</span>
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Customer Selector */}
            <div
              style={{
                padding: "6px 14px",
                borderBottom: "1px solid #e2e8f0",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "600" }}>
                Khách hàng:
              </span>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                style={{
                  padding: "3px 6px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "11.5px",
                  fontWeight: "600",
                  color: "#1e293b",
                  background: "#f8fafc",
                  maxWidth: "65%",
                }}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Itemized List (Newest first) */}
            <div
              style={{
                flexGrow: 1,
                overflowY: "auto",
                padding: "8px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 10px", color: "#94a3b8", fontSize: "12px" }}>
                  Giỏ hàng đang trống
                </div>
              ) : (
                cart.map((item) => {
                  const itemLineTotal = item.price * item.quantity;
                  return (
                    <div
                      key={item.cartId}
                      style={{
                        padding: "8px 10px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#1e293b" }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            {formatShortNumber(item.price)}đ
                          </div>
                        </div>

                        <span style={{ fontSize: "13px", fontWeight: "800", color: "#16a34a" }}>
                          {formatCurrency(itemLineTotal)}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        {/* Select staff for this item */}
                        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <User size={11} color="#2563eb" />
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
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity Stepper */}
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <button
                            onClick={() => handleAdjustQuantity(item.cartId, -1)}
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "4px",
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Minus size={11} />
                          </button>

                          <span style={{ fontSize: "12px", fontWeight: "700", minWidth: "16px", textAlign: "center" }}>
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => handleAdjustQuantity(item.cartId, 1)}
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "4px",
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Plus size={11} />
                          </button>

                          <button
                            onClick={() => handleRemoveItem(item.cartId)}
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "4px",
                              background: "#fee2e2",
                              border: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ef4444",
                              cursor: "pointer",
                              marginLeft: "2px",
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Expanded Footer with Discount & Payment */}
            <div
              style={{
                padding: "10px 14px",
                background: "#ffffff",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              {/* Discount (%) */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11.5px" }}>
                <span style={{ color: "#64748b" }}>Giảm giá (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent || ""}
                  onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                  placeholder="0%"
                  style={{
                    width: "60px",
                    height: "26px",
                    padding: "0 4px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                    textAlign: "right",
                    fontSize: "11.5px",
                    fontWeight: "600",
                  }}
                />
              </div>

              {/* Totals */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "#64748b" }}>
                <span>Tạm tính:</span>
                <span>{formatCurrency(cartSubtotal)}</span>
              </div>

              {billDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "#ef4444" }}>
                  <span>Giảm giá:</span>
                  <span>-{formatCurrency(billDiscount)}</span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "15px",
                  fontWeight: "800",
                  color: "#16a34a",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "4px",
                }}
              >
                <span>THÀNH TIỀN:</span>
                <span>{formatCurrency(finalPayAmount)}</span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                <button
                  disabled={cart.length === 0 || isProcessingPayment}
                  onClick={() => handleCheckout("CASH")}
                  style={{
                    flex: 1.2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    padding: "9px 0",
                    background: cart.length === 0 ? "#e2e8f0" : "#15803d",
                    color: cart.length === 0 ? "#94a3b8" : "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: cart.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  <Banknote size={14} />
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
                    gap: "4px",
                    padding: "9px 0",
                    background: cart.length === 0 ? "#e2e8f0" : "#2563eb",
                    color: cart.length === 0 ? "#94a3b8" : "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: cart.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  <CreditCard size={14} />
                  <span>Tài khoản</span>
                </button>

                <button
                  onClick={() => {
                    const preview = {
                      id: "PREVIEW-" + Date.now().toString().slice(-4),
                      createdAt: new Date().toISOString(),
                      totalPrice: cartSubtotal,
                      discountAmount: billDiscount,
                      finalAmount: finalPayAmount,
                      paymentMethod: "CASH",
                      customer: customers.find((c) => c.id === selectedCustomerId),
                      cashier: { name: user?.name || "Thu ngân" },
                      items: cart.map((c) => ({
                        name: c.name,
                        price: c.price,
                        quantity: c.quantity,
                        discountAmount: 0,
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
                    gap: "3px",
                    padding: "9px 0",
                    background: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "11px",
                    cursor: cart.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  <Printer size={13} />
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
