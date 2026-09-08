import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/useAuthStore";
import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";
import {
  Staff,
  Customer,
  Invoice,
  SimpleItem,
  InvoiceItem,
  PaymentMethod,
  OrderSource,
} from "./types";

export function useInvoices() {
  const { currentTenantId, currentBranchId, branches } = useAuthStore();
  const queryClient = useQueryClient();

  // Queries
  const {
    data: staffData,
    isLoading: staffLoading,
    error: staffError,
  } = useQuery<Staff[]>({
    queryKey: queryKeys.shifts.staff(currentTenantId!, currentBranchId!),
    queryFn: () =>
      api.get(
        `/tenants/${currentTenantId}/branches/${currentBranchId}/shifts/staff`,
      ),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const {
    data: dbCustomers,
    isLoading: customersLoading,
    error: customersError,
  } = useQuery<Customer[]>({
    queryKey: queryKeys.customers.list(currentTenantId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/customers`),
    enabled: !!currentTenantId,
  });

  const {
    data: invoicesData,
    isLoading: invoicesLoading,
    error: invoicesError,
  } = useQuery<Invoice[]>({
    queryKey: queryKeys.invoices.list(currentTenantId!, currentBranchId!),
    queryFn: () =>
      api.get(
        `/tenants/${currentTenantId}/branches/${currentBranchId}/invoices`,
      ),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const {
    data: servicesData,
    isLoading: servicesLoading,
    error: servicesError,
  } = useQuery<SimpleItem[]>({
    queryKey: queryKeys.services.list(currentTenantId!, currentBranchId),
    queryFn: () =>
      api.get(
        `/tenants/${currentTenantId}/services?branchId=${currentBranchId}`,
      ),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const {
    data: inventoriesData,
    isLoading: inventoriesLoading,
    error: inventoriesError,
  } = useQuery<SimpleItem[]>({
    queryKey: queryKeys.inventories.list(currentTenantId!, currentBranchId),
    queryFn: () =>
      api.get(
        `/tenants/${currentTenantId}/inventories?branchId=${currentBranchId}`,
      ),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const {
    data: packagesData,
    isLoading: packagesLoading,
    error: packagesError,
  } = useQuery<SimpleItem[]>({
    queryKey: queryKeys.servicePackages.list(currentTenantId!, currentBranchId),
    queryFn: () =>
      api.get(
        `/tenants/${currentTenantId}/services/packages?branchId=${currentBranchId}`,
      ),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  // Persist fetched lists to localStorage for instant recovery when app resumes
  useEffect(() => {
    if (currentTenantId && currentBranchId) {
      if (invoicesData && invoicesData.length > 0) {
        try {
          localStorage.setItem(
            `cached_invoices_${currentTenantId}_${currentBranchId}`,
            JSON.stringify(invoicesData),
          );
        } catch {}
      }
      if (staffData && staffData.length > 0) {
        try {
          localStorage.setItem(
            `cached_staff_${currentTenantId}_${currentBranchId}`,
            JSON.stringify(staffData),
          );
        } catch {}
      }
      if (servicesData && servicesData.length > 0) {
        try {
          localStorage.setItem(
            `cached_services_${currentTenantId}_${currentBranchId}`,
            JSON.stringify(servicesData),
          );
        } catch {}
      }
      if (inventoriesData && inventoriesData.length > 0) {
        try {
          localStorage.setItem(
            `cached_inventories_${currentTenantId}_${currentBranchId}`,
            JSON.stringify(inventoriesData),
          );
        } catch {}
      }
      if (packagesData && packagesData.length > 0) {
        try {
          localStorage.setItem(
            `cached_packages_${currentTenantId}_${currentBranchId}`,
            JSON.stringify(packagesData),
          );
        } catch {}
      }
    }
  }, [
    currentTenantId,
    currentBranchId,
    invoicesData,
    staffData,
    servicesData,
    inventoriesData,
    packagesData,
  ]);

  // Helper to read cached array from localStorage
  const getCachedArray = <T>(key: string): T[] | null => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T[]) : null;
    } catch {
      return null;
    }
  };

  // Fallback lists with persistent local cache support
  const activeStaff = useMemo(() => {
    if (staffData && staffData.length > 0) return staffData;
    if (currentTenantId && currentBranchId) {
      const cached = getCachedArray<Staff>(
        `cached_staff_${currentTenantId}_${currentBranchId}`,
      );
      if (cached) return cached;
    }
    return staffData || [];
  }, [staffData, currentTenantId, currentBranchId]);

  const customers = useMemo(() => {
    if (dbCustomers && dbCustomers.length > 0) return dbCustomers;
    const customerSaved = localStorage.getItem("pos_customers");
    if (customerSaved) {
      try {
        const parsed = JSON.parse(customerSaved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as Customer[];
      } catch {}
    }
    return dbCustomers || [];
  }, [dbCustomers]);

  const services = useMemo(() => {
    if (servicesData && servicesData.length > 0) return servicesData;
    if (currentTenantId && currentBranchId) {
      const cached = getCachedArray<SimpleItem>(
        `cached_services_${currentTenantId}_${currentBranchId}`,
      );
      if (cached) return cached;
    }
    return servicesData || [];
  }, [servicesData, currentTenantId, currentBranchId]);

  const products = useMemo(() => {
    if (inventoriesData && inventoriesData.length > 0) return inventoriesData;
    if (currentTenantId && currentBranchId) {
      const cached = getCachedArray<SimpleItem>(
        `cached_inventories_${currentTenantId}_${currentBranchId}`,
      );
      if (cached) return cached;
    }
    return inventoriesData || [];
  }, [inventoriesData, currentTenantId, currentBranchId]);

  const packages = useMemo(() => {
    if (packagesData && packagesData.length > 0) return packagesData;
    if (currentTenantId && currentBranchId) {
      const cached = getCachedArray<SimpleItem>(
        `cached_packages_${currentTenantId}_${currentBranchId}`,
      );
      if (cached) return cached;
    }
    return packagesData || [];
  }, [packagesData, currentTenantId, currentBranchId]);

  const invoices = useMemo(() => {
    if (invoicesData && invoicesData.length > 0) return invoicesData;
    if (currentTenantId && currentBranchId) {
      const cached = getCachedArray<Invoice>(
        `cached_invoices_${currentTenantId}_${currentBranchId}`,
      );
      if (cached) return cached;
    }
    return invoicesData || [];
  }, [invoicesData, currentTenantId, currentBranchId]);

  // If cached data already exists, DO NOT show blocking loading UI when refetching in background
  const hasCachedData = invoices.length > 0 || activeStaff.length > 0;
  const loading = !hasCachedData && (invoicesLoading || staffLoading);

  // Composite error message - only show if there is truly no data to present
  const error =
    !hasCachedData &&
    (staffError ||
      customersError ||
      invoicesError ||
      servicesError ||
      inventoriesError ||
      packagesError)
      ? "Lỗi tải dữ liệu hóa đơn hoặc thông tin liên quan từ hệ thống."
      : null;

  // Filter conditions
  const getTodayISO = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getStartOfWeekISO = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, "0");
    const dateVal = String(monday.getDate()).padStart(2, "0");
    return `${year}-${month}-${dateVal}`;
  };

  const getEndOfWeekISO = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7);
    const sunday = new Date(d.setDate(diff));
    const year = sunday.getFullYear();
    const month = String(sunday.getMonth() + 1).padStart(2, "0");
    const dateVal = String(sunday.getDate()).padStart(2, "0");
    return `${year}-${month}-${dateVal}`;
  };

  const getStartOfMonthISO = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-01`;
  };

  const getEndOfMonthISO = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  };

  const [datePreset, setDatePreset] = useState<
    "today" | "week" | "month" | "custom"
  >("today");
  const [startDate, setStartDate] = useState(getTodayISO);
  const [endDate, setEndDate] = useState(getTodayISO);

  const handlePresetChange = (
    preset: "today" | "week" | "month" | "custom",
  ) => {
    setDatePreset(preset);
    if (preset === "today") {
      const today = getTodayISO();
      setStartDate(today);
      setEndDate(today);
    } else if (preset === "week") {
      setStartDate(getStartOfWeekISO());
      setEndDate(getEndOfWeekISO());
    } else if (preset === "month") {
      setStartDate(getStartOfMonthISO());
      setEndDate(getEndOfMonthISO());
    }
  };

  const [selectedStaffId, setSelectedStaffId] = useState<string>("ALL");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("ALL");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ALL");
  const [orderSource, setOrderSource] = useState<OrderSource>("ALL");

  // Selected Detail Invoice Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Resolve item names & staff details from DB item ID & Type
  const resolvedInvoices = useMemo((): Invoice[] => {
    return invoices.map((inv) => {
      const resolvedItems = inv.items?.map((item: InvoiceItem): InvoiceItem => {
        let name = item.name;
        if (!name) {
          if (item.itemType === "SERVICE") {
            const s = services.find((x) => x.id === item.itemId);
            name = s ? s.name : "Dịch vụ";
          } else if (item.itemType === "PRODUCT") {
            const p = products.find((x) => x.id === item.itemId);
            name = p ? p.name : "Sản phẩm";
          } else if (item.itemType === "PACKAGE") {
            const pkg = packages.find((x) => x.id === item.itemId);
            name = pkg ? pkg.name : "Gói combo";
          } else {
            name = "Mặt hàng";
          }
        }

        let stylist = item.stylist;
        if (!stylist && item.staffId) {
          const st = activeStaff.find((s) => s.id === item.staffId);
          if (st) {
            stylist = { id: st.id, name: st.name, avatar: st.avatar };
          }
        }

        return { ...item, name, stylist };
      });
      return { ...inv, items: resolvedItems || [] };
    });
  }, [invoices, services, products, packages, activeStaff]);

  // Apply filters on the invoices list
  const filteredInvoices = useMemo(() => {
    return resolvedInvoices.filter((inv) => {
      // Convert inv.createdAt to local YYYY-MM-DD string
      const dateObj = new Date(inv.createdAt);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const invDateStr = `${year}-${month}-${day}`;

      if (startDate && invDateStr < startDate) return false;
      if (endDate && invDateStr > endDate) return false;

      // 3. Filter by Stylist/Employee
      if (selectedStaffId !== "ALL") {
        const hasStylist = inv.items?.some(
          (item) =>
            item.staffId === selectedStaffId ||
            item.stylist?.id === selectedStaffId,
        );
        if (!hasStylist) return false;
      }

      // 4. Filter by Customer ID
      if (selectedCustomerId !== "ALL") {
        if (inv.customerId !== selectedCustomerId) return false;
      }

      // 5. Filter by Payment Method
      if (paymentMethod !== "ALL") {
        if (inv.paymentMethod !== paymentMethod) return false;
      }

      // 6. Filter by Order Source
      if (orderSource !== "ALL") {
        if (inv.orderSource !== orderSource) return false;
      }

      return true;
    });
  }, [
    resolvedInvoices,
    startDate,
    endDate,
    selectedStaffId,
    selectedCustomerId,
    paymentMethod,
    orderSource,
  ]);

  // Calculate summary stats dynamically from filtered invoices
  const summaryStats = useMemo(() => {
    let totalRevenue = 0;
    let cashRevenue = 0;
    let transferRevenue = 0;

    filteredInvoices.forEach((inv) => {
      const finalVal = Number(inv.finalAmount) || 0;
      totalRevenue += finalVal;
      if (inv.paymentMethod === "CASH") {
        cashRevenue += finalVal;
      } else {
        transferRevenue += finalVal;
      }
    });

    return {
      totalRevenue,
      cashRevenue,
      transferRevenue,
      invoiceCount: filteredInvoices.length,
    };
  }, [filteredInvoices]);

  // Delete invoice handler
  const handleDeleteInvoice = useCallback(
    async (invoiceId: string) => {
      if (!currentTenantId || !currentBranchId) return;
      if (!window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) return;
      try {
        await api.delete(
          `/tenants/${currentTenantId}/branches/${currentBranchId}/invoices/${invoiceId}`,
        );
        await queryClient.invalidateQueries({
          queryKey: queryKeys.invoices.all(currentTenantId, currentBranchId),
        });
        setSelectedInvoice(null);
      } catch (err) {
        alert(`Lỗi xóa hóa đơn: ${(err as any).message}`);
      }
    },
    [currentTenantId, currentBranchId, queryClient],
  );

  return {
    currentBranchId,
    branches,
    loading,
    error,
    activeStaff,
    customers,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    datePreset,
    handlePresetChange,
    selectedStaffId,
    setSelectedStaffId,
    selectedCustomerId,
    setSelectedCustomerId,
    paymentMethod,
    setPaymentMethod,
    orderSource,
    setOrderSource,
    selectedInvoice,
    setSelectedInvoice,
    resolvedInvoices,
    filteredInvoices,
    summaryStats,
    handleDeleteInvoice,
  };
}
