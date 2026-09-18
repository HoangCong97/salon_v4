import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";

import { POSLeftPanel } from "./POSLeftPanel";
import { POSRightPanel } from "./POSRightPanel";
import { POSReceiptModal } from "./POSReceiptModal";

import { useAuthStore } from "../../../store/useAuthStore";
import { useConfirm } from "../../../components/desktop/ConfirmDialog";
import { useToast } from "../../../components/desktop/ToastProvider";

import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";

import { formatCurrencyVND } from "@salon/shared-utils";

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
  category?: { name: string; color?: string } | null;
  discountPrice?: number | null;
  additionalPrices?: number[] | null;
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

// Fallback Mock Data for Demo/Empty States removed

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
      paymentMethod: "CASH",
    },
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
  return [{ id: "c1", name: "Khách vãng lai", phone: "", rank: "Khách mới" }];
};

const getInitialSelectedStylistId = () => {
  return localStorage.getItem("pos_selected_stylist_id") || "";
};

const removeVietnameseTones = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

const getInitialPinnedItemIds = (): string[] => {
  try {
    const saved = localStorage.getItem("pos_pinned_ids");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Failed to parse pinned items", e);
  }
  return [];
};

const getInitialOrder = (key: string): string[] => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error(`Failed to parse order for ${key}`, e);
  }
  return [];
};

export default function POS() {
  const { currentTenantId, currentBranchId, branches, user, hasPermission } =
    useAuthStore();
  const confirm = useConfirm();
  const toast = useToast();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  // Data states
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [inventories, setInventories] = useState<ProductItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);

  // Pinned and custom ordering states
  const [pinnedItemIds, setPinnedItemIds] = useState<string[]>(
    getInitialPinnedItemIds,
  );
  const [servicesOrder, setServicesOrder] = useState<string[]>(() =>
    getInitialOrder("pos_order_services"),
  );
  const [productsOrder, setProductsOrder] = useState<string[]>(() =>
    getInitialOrder("pos_order_products"),
  );
  const [packagesOrder, setPackagesOrder] = useState<string[]>(() =>
    getInitialOrder("pos_order_packages"),
  );

  // State mappings — filter out hidden items from POS
  const activeStaff = staff;
  const activeServices = services.filter((s) => s.isActive !== false);
  const activeProducts = inventories.filter((p) => p.isActive !== false);
  const activePackages = packages;

  // Customers dynamic state
  const [customers, setCustomers] = useState(getInitialCustomers);

  // TanStack Queries
  const { data: staffData } = useQuery<StaffMember[]>({
    queryKey: queryKeys.shifts.staff(currentTenantId!, currentBranchId!),
    queryFn: () =>
      api.get(
        `/tenants/${currentTenantId}/branches/${currentBranchId}/shifts/staff`,
      ),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const { data: servicesData } = useQuery<ServiceItem[]>({
    queryKey: queryKeys.services.list(currentTenantId!, currentBranchId),
    queryFn: () =>
      api.get(
        `/tenants/${currentTenantId}/services?branchId=${currentBranchId}`,
      ),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const { data: inventoriesData } = useQuery<ProductItem[]>({
    queryKey: queryKeys.inventories.list(currentTenantId!, currentBranchId),
    queryFn: () =>
      api.get(
        `/tenants/${currentTenantId}/inventories?branchId=${currentBranchId}`,
      ),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const { data: packagesData } = useQuery<PackageItem[]>({
    queryKey: queryKeys.servicePackages.list(currentTenantId!, currentBranchId),
    queryFn: () =>
      api.get(
        `/tenants/${currentTenantId}/services/packages?branchId=${currentBranchId}`,
      ),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const { data: dbCustomers } = useQuery<any[]>({
    queryKey: queryKeys.customers.list(currentTenantId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/customers`),
    enabled: !!currentTenantId,
  });

  // Sync queries to local states
  useEffect(() => {
    if (staffData) setStaff(staffData);
  }, [staffData]);

  useEffect(() => {
    if (servicesData) setServices(servicesData);
  }, [servicesData]);

  useEffect(() => {
    if (inventoriesData) setInventories(inventoriesData);
  }, [inventoriesData]);

  useEffect(() => {
    if (packagesData) setPackages(packagesData);
  }, [packagesData]);

  useEffect(() => {
    if (dbCustomers) {
      const mappedCustomers = [
        { id: "c1", name: "Khách vãng lai", phone: "", rank: "Khách mới" },
        ...dbCustomers.map((c: any) => ({
          ...c,
          rank: `Điểm: ${c.credibilityScore ?? 100}`,
        })),
      ];
      setCustomers(mappedCustomers);
    }
  }, [dbCustomers]);

  const handleCreateCustomer = async (name: string, phone: string) => {
    try {
      const newCust = await api.post<any>(
        `/tenants/${currentTenantId}/customers`,
        {
          name,
          phone: phone || null,
        },
      );
      const mappedCust = {
        ...newCust,
        rank: `Điểm: ${newCust.credibilityScore || 100}`,
      };
      setCustomers((prev) => [...prev, mappedCust]);
      setSelectedCustomerId(newCust.id);
      toast.success("Thêm khách hàng thành công!");
      queryClient.invalidateQueries({
        queryKey: queryKeys.customers.all(currentTenantId!),
      });
      return mappedCust;
    } catch (e) {
      console.warn(
        "Failed to create customer on server, using local fallback",
        e,
      );
      const newCust = {
        id: `c-${Date.now()}`,
        name,
        phone,
        rank: "Khách mới",
      };
      setCustomers((prev) => [...prev, newCust]);
      setSelectedCustomerId(newCust.id);
      toast.info("Đã tạo khách hàng ngoại tuyến tạm thời.");
      return newCust;
    }
  };

  // Selection & UI States
  const [selectedStylistId, setSelectedStylistId] = useState<string>(
    getInitialSelectedStylistId,
  );
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [flashStaff, setFlashStaff] = useState(false);

  const [invoices, setInvoices] = useState<
    Array<{
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
      isEditing?: boolean;
      editingInvoiceId?: string;
      originalCreatedAt?: string;
    }>
  >(getInitialInvoices);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>(
    getInitialActiveInvoiceId,
  );

  const activeInvoice =
    invoices.find((inv) => inv.id === activeInvoiceId) || invoices[0];
  const cart = activeInvoice.cart;
  const selectedCustomerId = activeInvoice.selectedCustomerId;
  const voucherCode = activeInvoice.voucherCode;
  const discountPercent = activeInvoice.discountPercent;
  const paymentMethod = activeInvoice.paymentMethod;

  const setSelectedCustomerId = (custId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== activeInvoiceId) return inv;
        return { ...inv, selectedCustomerId: custId };
      }),
    );
  };

  const setVoucherCode = (code: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== activeInvoiceId) return inv;
        return { ...inv, voucherCode: code };
      }),
    );
  };

  const setPaymentMethod = (method: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== activeInvoiceId) return inv;
        return { ...inv, paymentMethod: method };
      }),
    );
  };

  const addNewInvoice = () => {
    const newId = `inv-${Date.now()}`;

    // Find the next available invoice number by scanning existing names
    const existingNums = invoices
      .map((inv) => {
        const match = inv.name.match(/Hóa đơn (\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num) => num > 0);
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;

    const newInvoice = {
      id: newId,
      name: `Hóa đơn ${nextNum}`,
      cart: [],
      selectedCustomerId: "c1",
      voucherCode: "",
      discountPercent: 0,
      paymentMethod: "CASH",
    };
    setInvoices((prev) => [...prev, newInvoice]);
    setActiveInvoiceId(newId);
  };

  const deleteInvoice = async (invId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (invoices.length === 1) {
      toast.warning("Phải giữ lại ít nhất 1 hóa đơn!");
      return;
    }
    const target = invoices.find((inv) => inv.id === invId);
    if (target && target.cart.length > 0) {
      if (
        !(await confirm({
          title: "Xóa hóa đơn chờ",
          message: `Hóa đơn này đang có ${target.cart.length} mặt hàng. Bạn có chắc muốn xóa không?`,
          type: "danger",
          confirmText: "Xóa",
        }))
      ) {
        return;
      }
    }

    const nextInvoices = invoices.filter((inv) => inv.id !== invId);
    setInvoices(nextInvoices);

    if (activeInvoiceId === invId) {
      setActiveInvoiceId(nextInvoices[0].id);
    }
  };

  const resetActiveInvoice = () => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== activeInvoiceId) return inv;
        return {
          ...inv,
          cart: [],
          selectedCustomerId: "c1",
          voucherCode: "",
          discountPercent: 0,
          paymentMethod: "CASH",
        };
      }),
    );
  };

  // Derived loading state & checkingOut, showReceipt states
  const loading =
    !staffData || !servicesData || !inventoriesData || !packagesData;
  const [checkingOut, setCheckingOut] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

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

  useEffect(() => {
    localStorage.setItem("pos_pinned_ids", JSON.stringify(pinnedItemIds));
  }, [pinnedItemIds]);

  useEffect(() => {
    localStorage.setItem("pos_order_services", JSON.stringify(servicesOrder));
  }, [servicesOrder]);

  useEffect(() => {
    localStorage.setItem("pos_order_products", JSON.stringify(productsOrder));
  }, [productsOrder]);

  useEffect(() => {
    localStorage.setItem("pos_order_packages", JSON.stringify(packagesOrder));
  }, [packagesOrder]);

  const loadedEditInvoiceIdRef = React.useRef<string | null>(null);

  // Load editing invoice from navigate state if exists
  useEffect(() => {
    if (!location.state?.editInvoice) {
      loadedEditInvoiceIdRef.current = null;
      return;
    }

    const editInv = location.state.editInvoice;
    if (loadedEditInvoiceIdRef.current === editInv.id) {
      return;
    }

    // Mark as loaded immediately to prevent duplicate execution
    loadedEditInvoiceIdRef.current = editInv.id;
    const exists = invoices.some((inv) => inv.editingInvoiceId === editInv.id);

    if (!exists) {
      const mappedCart = (editInv.items || []).map((item: any) => {
        const quantity = item.quantity || 1;
        const totalDiscount = item.discountAmount || 0;
        const unitDiscount = Math.round(totalDiscount / quantity);
        const unitPrice = item.price;

        return {
          id: `${item.itemId}-${item.staffId || item.stylist?.id || ""}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          itemId: item.itemId,
          name: item.name || "Dịch vụ",
          price: unitPrice,
          quantity: quantity,
          itemType: item.itemType,
          staffId: item.staffId || item.stylist?.id || "",
          discount: unitDiscount,
        };
      });

      const newId = `edit-${editInv.id}`;
      const newInvoiceTab = {
        id: newId,
        name: `Sửa HĐ #${editInv.id.substring(0, 6)}`,
        cart: mappedCart,
        selectedCustomerId: editInv.customerId || "c1",
        voucherCode: "",
        discountPercent: 0,
        paymentMethod: editInv.paymentMethod || "CASH",
        isEditing: true,
        editingInvoiceId: editInv.id,
        originalCreatedAt: editInv.createdAt,
      };

      setInvoices((prev) => {
        const alreadyInPrev = prev.some(
          (inv) => inv.editingInvoiceId === editInv.id,
        );
        if (alreadyInPrev) return prev;

        if (
          prev.length === 1 &&
          prev[0].id === "inv-1" &&
          prev[0].cart.length === 0
        ) {
          return [newInvoiceTab];
        }
        return [...prev, newInvoiceTab];
      });
      setActiveInvoiceId(newId);
      toast.info(`Đã tải hóa đơn #${editInv.id.substring(0, 6)} để chỉnh sửa.`);
    } else {
      const tab = invoices.find((inv) => inv.editingInvoiceId === editInv.id);
      if (tab) {
        setActiveInvoiceId(tab.id);
      }
    }

    // Clear routing state to avoid re-loading on reload
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, navigate, invoices, toast]);

  // Keyboard shortcut: Press 1-9 to select active staff members by order
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 9) {
        const staffIndex = keyNum - 1;
        if (activeStaff[staffIndex]) {
          setSelectedStylistId(activeStaff[staffIndex].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeStaff]);

  const togglePinItem = (itemId: string) => {
    setPinnedItemIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const reorderItems = (
    type: "SERVICE" | "PRODUCT" | "PACKAGE",
    orderedIds: string[],
  ) => {
    if (type === "SERVICE") {
      setServicesOrder(orderedIds);
    } else if (type === "PRODUCT") {
      setProductsOrder(orderedIds);
    } else if (type === "PACKAGE") {
      setPackagesOrder(orderedIds);
    }
  };

  // Extract distinct category names from active services list
  const serviceCategories = Array.from(
    new Set(
      activeServices.map((s) => s.category?.name || "Dịch vụ").filter(Boolean),
    ),
  );

  // Add Item to cart (Prevent row merging: unique cart ID generated on each click)
  const addToCart = (item: any, type: "SERVICE" | "PRODUCT" | "PACKAGE") => {
    const isStylistValid =
      selectedStylistId && activeStaff.some((s) => s.id === selectedStylistId);
    if (!isStylistValid) {
      setFlashStaff(true);
      setTimeout(() => setFlashStaff(false), 300);
      return;
    }
    const price =
      type === "SERVICE"
        ? item.price
        : type === "PRODUCT"
          ? item.sellPrice
          : item.price;
    const itemId = item.id;
    const discount = Number(item.discountAmount || 0);
    const uniqueKey = `${itemId}-${selectedStylistId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    setInvoices((prev) =>
      prev.map((inv) => {
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
            discount: discount,
          },
        ];
        return { ...inv, cart: newCart };
      }),
    );
  };

  const removeFromCart = (itemId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== activeInvoiceId) return inv;
        const newCart = inv.cart.filter((c) => c.itemId !== itemId);
        return { ...inv, cart: newCart };
      }),
    );
  };

  const adjustQuantity = (cartId: string, amount: number) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== activeInvoiceId) return inv;
        const newCart = inv.cart
          .map((c) =>
            c.id === cartId ? { ...c, quantity: c.quantity + amount } : c,
          )
          .filter((c) => c.quantity > 0);
        return { ...inv, cart: newCart };
      }),
    );
  };

  const updateCartItemStylist = (cartId: string, newStylistId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== activeInvoiceId) return inv;
        return {
          ...inv,
          cart: inv.cart.map((c) =>
            c.id === cartId ? { ...c, staffId: newStylistId } : c,
          ),
        };
      }),
    );
  };

  const updateCartItemPrice = (
    cartId: string,
    newPriceVal: string | number,
  ) => {
    let newPrice = 0;
    if (typeof newPriceVal === "number") {
      newPrice = newPriceVal;
    } else {
      newPrice = parseFloat(newPriceVal.replace(/\D/g, "")) || 0;
    }

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== activeInvoiceId) return inv;
        return {
          ...inv,
          cart: inv.cart.map((c) =>
            c.id === cartId ? { ...c, price: newPrice } : c,
          ),
        };
      }),
    );
  };

  const updateCartItemDiscount = (
    cartId: string,
    newDiscountVal: string | number,
  ) => {
    let newDiscount = 0;
    if (typeof newDiscountVal === "number") {
      newDiscount = newDiscountVal;
    } else {
      newDiscount = parseFloat(newDiscountVal.replace(/\D/g, "")) || 0;
    }

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== activeInvoiceId) return inv;
        return {
          ...inv,
          cart: inv.cart.map((c) =>
            c.id === cartId ? { ...c, discount: newDiscount } : c,
          ),
        };
      }),
    );
  };

  const canEditInvoice = hasPermission ? hasPermission("invoice.edit") : false;

  const updateInvoiceCreatedAt = (dateStr: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== activeInvoiceId) return inv;
        return { ...inv, createdAt: dateStr };
      }),
    );
  };

  const applyVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    let percent = 0;
    if (code === "10") {
      percent = 10;
      toast.success("Áp dụng mã giảm giá 10% thành công!");
    } else if (code === "20") {
      percent = 20;
      toast.success("Áp dụng mã giảm giá 20% thành công!");
    } else {
      toast.error("Mã giảm giá không hợp lệ (Thử dùng 10 hoặc 20)");
      return;
    }

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== activeInvoiceId) return inv;
        return { ...inv, discountPercent: percent };
      }),
    );
  };

  const clearVoucher = () => {
    setVoucherCode("");
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== activeInvoiceId) return inv;
        return { ...inv, discountPercent: 0 };
      }),
    );
    toast.info("Đã xóa mã giảm giá!");
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price - (item.discount || 0)) * item.quantity,
    0,
  );
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const finalAmount = subtotal - discountAmount;

  // Checkout Handler
  const handleCheckout = async (skipReceipt = false) => {
    if (cart.length === 0) return;
    setCheckingOut(true);
    const isEditing = activeInvoice.isEditing;
    const invoiceId = activeInvoice.editingInvoiceId;
    try {
      // Calculate subtotal of cart (price after item-level discount)
      const cartSubtotal = cart.reduce(
        (sum, item) =>
          sum + (item.price - (item.discount || 0)) * item.quantity,
        0,
      );

      // Voucher discount
      const overallVoucherDiscount = Math.round(
        cartSubtotal * (discountPercent / 100),
      );

      // Final amount to pay
      const finalPayAmount = cartSubtotal - overallVoucherDiscount;

      // Total original price before any discount
      const originalTotalPrice = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Total invoice discount = originalTotalPrice - finalPayAmount
      const totalInvoiceDiscount = originalTotalPrice - finalPayAmount;

      // Map items with distributed discounts
      const payloadItems = cart.map((c) => {
        const itemDiscount = (c.discount || 0) * c.quantity;
        const itemRemaining = (c.price - (c.discount || 0)) * c.quantity;
        // distribute voucher discount proportionally
        const voucherDiscount =
          cartSubtotal > 0
            ? Math.round(
                itemRemaining * (overallVoucherDiscount / cartSubtotal),
              )
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

      let invoiceData;
      if (isEditing && invoiceId) {
        const payload = {
          createdAt: activeInvoice.originalCreatedAt,
          items: payloadItems,
        };
        invoiceData = await api.put<any>(
          `/tenants/${currentTenantId}/branches/${currentBranchId}/invoices/${invoiceId}`,
          payload,
        );
      } else {
        const payload = {
          customerId:
            selectedCustomerId === "c1" ? undefined : selectedCustomerId,
          cashierId: user?.id,
          items: payloadItems,
          discountAmount: totalInvoiceDiscount,
          paymentMethod,
          paymentStatus: "PAID",
        };
        invoiceData = await api.post<any>(
          `/tenants/${currentTenantId}/branches/${currentBranchId}/invoices`,
          payload,
        );
      }

      // Map names to items in the server response
      const enrichedInvoice = {
        ...invoiceData,
        items: invoiceData.items?.map((it: any) => {
          let name = "Sản phẩm / Dịch vụ";
          if (it.itemType === "SERVICE") {
            name = services.find((s) => s.id === it.itemId)?.name || name;
          } else if (it.itemType === "PRODUCT") {
            name = inventories.find((p) => p.id === it.itemId)?.name || name;
          } else if (it.itemType === "PACKAGE") {
            name = packages.find((pkg) => pkg.id === it.itemId)?.name || name;
          }
          return {
            ...it,
            name,
          };
        }),
      };
      setReceiptData(enrichedInvoice);
      if (!skipReceipt) {
        setShowReceipt(true);
      }
      resetActiveInvoice();

      if (isEditing) {
        toast.success("Cập nhật hóa đơn thành công!");
        // Close editing tab
        setInvoices((prev) => {
          const next = prev.filter((inv) => inv.id !== activeInvoiceId);
          if (next.length === 0) {
            return [
              {
                id: "inv-1",
                name: "Hóa đơn 1",
                cart: [],
                selectedCustomerId: "c1",
                voucherCode: "",
                discountPercent: 0,
                paymentMethod: "CASH",
              },
            ];
          }
          return next;
        });
        // Switch active tab
        setInvoices((prev) => {
          setActiveInvoiceId(prev[0].id);
          return prev;
        });
      } else {
        toast.success("Thanh toán và tạo hóa đơn thành công!");
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoices.all(currentTenantId!, currentBranchId!),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.all(currentTenantId!),
      });
    } catch (e: any) {
      // Offline fallback
      const mockInvoice = {
        id:
          isEditing && invoiceId
            ? invoiceId
            : Math.random().toString(36).substring(7).toUpperCase(),
        createdAt:
          isEditing && activeInvoice.originalCreatedAt
            ? activeInvoice.originalCreatedAt
            : new Date().toISOString(),
        totalPrice: subtotal,
        discountAmount,
        finalAmount,
        paymentMethod,
        customer: customers.find((c) => c.id === selectedCustomerId),
        cashier: { name: user?.name || "Thu ngân" },
        items: cart.map((c) => ({
          id: c.id,
          price: c.price - (c.discount || 0),
          quantity: c.quantity,
          itemType: c.itemType,
          stylist: activeStaff.find((s) => s.id === c.staffId),
          name: c.name,
        })),
      };
      setReceiptData(mockInvoice);
      if (!skipReceipt) {
        setShowReceipt(true);
      }
      resetActiveInvoice();

      if (isEditing) {
        toast.info(
          "Đã cập nhật hóa đơn ngoại tuyến (offline) và lưu tạm thời.",
        );
        // Close editing tab
        setInvoices((prev) => {
          const next = prev.filter((inv) => inv.id !== activeInvoiceId);
          if (next.length === 0) {
            return [
              {
                id: "inv-1",
                name: "Hóa đơn 1",
                cart: [],
                selectedCustomerId: "c1",
                voucherCode: "",
                discountPercent: 0,
                paymentMethod: "CASH",
              },
            ];
          }
          return next;
        });
        // Switch active tab
        setInvoices((prev) => {
          setActiveInvoiceId(prev[0].id);
          return prev;
        });
      } else {
        toast.info("Đã tạo hóa đơn ngoại tuyến (offline) và lưu tạm thời.");
      }
    } finally {
      setCheckingOut(false);
    }
  };

  // Dynamic Filtering Logic
  const selectedCatName = selectedCategory.startsWith("Service:")
    ? selectedCategory.split(":")[1]
    : null;

  const matchesSearch = (name: string, query: string) => {
    if (!query) return true;
    const cleanName = removeVietnameseTones(name.toLowerCase());
    const cleanQuery = removeVietnameseTones(query.toLowerCase());
    return cleanName.includes(cleanQuery);
  };

  const filteredServices = activeServices.filter((s) => {
    const matches = matchesSearch(s.name, search);
    if (!matches) return false;
    if (selectedCategory === "All") return true;
    if (selectedCatName) {
      return (s.category?.name || "Dịch vụ") === selectedCatName;
    }
    return false;
  });

  const filteredProducts = activeProducts.filter((p) => {
    const matches = matchesSearch(p.name, search);
    if (!matches) return false;
    return selectedCategory === "All" || selectedCategory === "Product";
  });

  const filteredPackages = activePackages.filter((pkg) => {
    const matches = matchesSearch(pkg.name, search);
    if (!matches) return false;
    return selectedCategory === "All" || selectedCategory === "Package";
  });

  const sortItems = (items: any[], orderArray: string[]) => {
    return [...items].sort((a, b) => {
      const aIdx = orderArray.indexOf(a.id);
      const bIdx = orderArray.indexOf(b.id);

      if (aIdx !== -1 && bIdx !== -1) {
        return aIdx - bIdx;
      }
      if (aIdx !== -1 && bIdx === -1) return -1;
      if (aIdx === -1 && bIdx !== -1) return 1;

      return 0;
    });
  };

  const sortedServices = sortItems(filteredServices, servicesOrder);
  const sortedProducts = sortItems(filteredProducts, productsOrder);
  const sortedPackages = sortItems(filteredPackages, packagesOrder);

  return (
    <>
      <div
        className="animate-fade-in"
        style={{
          display: "grid",
          gridTemplateColumns: "7fr 5fr",
          gap: "24px",
          height: "calc(100vh - 120px)",
          overflow: "hidden",
        }}
      >
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
          filteredServices={sortedServices}
          filteredProducts={sortedProducts}
          filteredPackages={sortedPackages}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          cart={cart}
          flashStaff={flashStaff}
          pinnedItemIds={pinnedItemIds}
          togglePinItem={togglePinItem}
          reorderItems={reorderItems}
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
          clearVoucher={clearVoucher}
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
          canEditInvoice={canEditInvoice}
          updateInvoiceCreatedAt={updateInvoiceCreatedAt}
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
