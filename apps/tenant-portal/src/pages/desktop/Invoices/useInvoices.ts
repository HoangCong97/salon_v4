import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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

  // Queries
  const {
    data: staffData,
    isLoading: staffLoading,
    error: staffError,
  } = useQuery<Staff[]>({
    queryKey: queryKeys.shifts.staff(currentTenantId!, currentBranchId!),
    queryFn: () =>
      api.get(
        `/tenants/${currentTenantId}/branches/${currentBranchId}/shifts/staff`
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
      api.get(`/tenants/${currentTenantId}/branches/${currentBranchId}/invoices`),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const {
    data: servicesData,
    isLoading: servicesLoading,
    error: servicesError,
  } = useQuery<SimpleItem[]>({
    queryKey: queryKeys.services.list(currentTenantId!, currentBranchId),
    queryFn: () =>
      api.get(`/tenants/${currentTenantId}/services?branchId=${currentBranchId}`),
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
        `/tenants/${currentTenantId}/inventories?branchId=${currentBranchId}`
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
        `/tenants/${currentTenantId}/services/packages?branchId=${currentBranchId}`
      ),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  // Fallback lists directly derived without useState/useEffect sync
  const activeStaff = useMemo(() => staffData || [], [staffData]);

  const customers = useMemo(() => {
    if (dbCustomers) return dbCustomers;
    const customerSaved = localStorage.getItem("pos_customers");
    if (customerSaved) {
      try {
        const parsed = JSON.parse(customerSaved);
        if (Array.isArray(parsed)) return parsed as Customer[];
      } catch {}
    }
    return [];
  }, [dbCustomers]);

  const services = useMemo(() => servicesData || [], [servicesData]);
  const products = useMemo(() => inventoriesData || [], [inventoriesData]);
  const packages = useMemo(() => packagesData || [], [packagesData]);
  const invoices = useMemo(() => invoicesData || [], [invoicesData]);

  // Derived loading state
  const loading =
    staffLoading ||
    customersLoading ||
    invoicesLoading ||
    servicesLoading ||
    inventoriesLoading ||
    packagesLoading;

  // Composite error message
  const error =
    staffError ||
    customersError ||
    invoicesError ||
    servicesError ||
    inventoriesError ||
    packagesError
      ? "Lỗi tải dữ liệu hóa đơn hoặc thông tin liên quan từ hệ thống."
      : null;

  // Filter conditions
  const getTodayISO = () => new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(getTodayISO);
  const [endDate, setEndDate] = useState(getTodayISO);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("ALL");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("ALL");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ALL");
  const [orderSource, setOrderSource] = useState<OrderSource>("ALL");

  // Selected Detail Invoice Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Resolve item names from DB item ID & Type
  const resolvedInvoices = useMemo((): Invoice[] => {
    return invoices.map((inv) => {
      const resolvedItems = inv.items?.map((item: InvoiceItem): InvoiceItem => {
        if (item.name) return item;

        let name = "Mặt hàng";
        if (item.itemType === "SERVICE") {
          const s = services.find((x) => x.id === item.itemId);
          name = s ? s.name : "Dịch vụ";
        } else if (item.itemType === "PRODUCT") {
          const p = products.find((x) => x.id === item.itemId);
          name = p ? p.name : "Sản phẩm";
        } else if (item.itemType === "PACKAGE") {
          const pkg = packages.find((x) => x.id === item.itemId);
          name = pkg ? pkg.name : "Gói combo";
        }
        return { ...item, name };
      });
      return { ...inv, items: resolvedItems || [] };
    });
  }, [invoices, services, products, packages]);

  // Apply filters on the invoices list
  const filteredInvoices = useMemo(() => {
    return resolvedInvoices.filter((inv) => {
      // 1. Filter by Start Date
      if (startDate) {
        const startSecs = new Date(startDate + "T00:00:00").getTime();
        const invSecs = new Date(inv.createdAt).getTime();
        if (invSecs < startSecs) return false;
      }

      // 2. Filter by End Date
      if (endDate) {
        const endSecs = new Date(endDate + "T23:59:59").getTime();
        const invSecs = new Date(inv.createdAt).getTime();
        if (invSecs > endSecs) return false;
      }

      // 3. Filter by Stylist/Employee
      if (selectedStaffId !== "ALL") {
        const hasStylist = inv.items?.some(
          (item) =>
            item.staffId === selectedStaffId ||
            item.stylist?.id === selectedStaffId
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
    filteredInvoices,
    summaryStats,
  };
}
