import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/useAuthStore";
import { InvoiceSummary } from "./InvoiceSummary";
import { InvoiceFilter } from "./InvoiceFilter";
import { InvoiceTable } from "./InvoiceTable";
import { InvoiceDetailModal } from "./InvoiceDetailModal";
import { FileText } from "lucide-react";
import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";

export default function Invoices() {
  const { currentTenantId, currentBranchId, branches } = useAuthStore();

  // Local state for dropdown/filter choices
  const [activeStaff, setActiveStaff] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

  // Queries
  const { data: staffData } = useQuery<any[]>({
    queryKey: queryKeys.shifts.staff(currentTenantId!, currentBranchId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/branches/${currentBranchId}/shifts/staff`),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const { data: dbCustomers } = useQuery<any[]>({
    queryKey: queryKeys.customers.list(currentTenantId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/customers`),
    enabled: !!currentTenantId,
  });

  const { data: invoicesData } = useQuery<any[]>({
    queryKey: queryKeys.invoices.list(currentTenantId!, currentBranchId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/branches/${currentBranchId}/invoices`),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const { data: servicesData } = useQuery<any[]>({
    queryKey: queryKeys.services.list(currentTenantId!, currentBranchId),
    queryFn: () => api.get(`/tenants/${currentTenantId}/services?branchId=${currentBranchId}`),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const { data: inventoriesData } = useQuery<any[]>({
    queryKey: queryKeys.inventories.list(currentTenantId!, currentBranchId),
    queryFn: () => api.get(`/tenants/${currentTenantId}/inventories?branchId=${currentBranchId}`),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const { data: packagesData } = useQuery<any[]>({
    queryKey: queryKeys.servicePackages.list(currentTenantId!, currentBranchId),
    queryFn: () => api.get(`/tenants/${currentTenantId}/services/packages?branchId=${currentBranchId}`),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  // Sync queries to local states
  useEffect(() => {
    if (staffData) setActiveStaff(staffData);
  }, [staffData]);

  useEffect(() => {
    if (dbCustomers) {
      setCustomers(dbCustomers);
    } else {
      const customerSaved = localStorage.getItem("pos_customers");
      if (customerSaved) {
        try {
          const parsed = JSON.parse(customerSaved);
          if (Array.isArray(parsed)) setCustomers(parsed);
        } catch {}
      }
    }
  }, [dbCustomers]);

  useEffect(() => {
    if (servicesData) setServices(servicesData);
  }, [servicesData]);

  useEffect(() => {
    if (inventoriesData) setProducts(inventoriesData);
  }, [inventoriesData]);

  useEffect(() => {
    if (packagesData) setPackages(packagesData);
  }, [packagesData]);

  useEffect(() => {
    if (invoicesData) setInvoices(invoicesData);
  }, [invoicesData]);

  // Derived loading state
  const loading = !staffData || !invoicesData || !servicesData || !inventoriesData || !packagesData;

  // Filter conditions
  const getTodayISO = () => new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(getTodayISO);
  const [endDate, setEndDate] = useState(getTodayISO);
  const [selectedStaffId, setSelectedStaffId] = useState("ALL");
  const [selectedCustomerId, setSelectedCustomerId] = useState("ALL");
  const [paymentMethod, setPaymentMethod] = useState("ALL");
  const [orderSource, setOrderSource] = useState("ALL");

  // Selected Detail Invoice Modal
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Resolve item names from DB item ID & Type
  const resolvedInvoices = useMemo(() => {
    return invoices.map((inv) => {
      const resolvedItems = inv.items?.map((item: any) => {
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
      return { ...inv, items: resolvedItems };
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
          (item: any) =>
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
  }, [invoices, startDate, endDate, selectedStaffId, selectedCustomerId, paymentMethod, orderSource]);

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
      invoiceCount: filteredInvoices.length
    };
  }, [filteredInvoices]);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px", height: "calc(100vh - 120px)", overflow: "hidden" }}>
      
      {/* Dynamic Summary Cards */}
      <div style={{ flexShrink: 0 }}>
        <InvoiceSummary
          totalRevenue={summaryStats.totalRevenue}
          cashRevenue={summaryStats.cashRevenue}
          transferRevenue={summaryStats.transferRevenue}
          invoiceCount={summaryStats.invoiceCount}
        />
      </div>

      {/* Filters Bar */}
      <div style={{ flexShrink: 0 }}>
        <InvoiceFilter
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          selectedStaffId={selectedStaffId}
          setSelectedStaffId={setSelectedStaffId}
          selectedCustomerId={selectedCustomerId}
          setSelectedCustomerId={setSelectedCustomerId}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          orderSource={orderSource}
          setOrderSource={setOrderSource}
          activeStaff={activeStaff}
          customers={customers}
        />
      </div>

      {/* Main Listing Table */}
      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
        <InvoiceTable
          invoices={filteredInvoices}
          activeStaff={activeStaff}
          customers={customers}
          onViewDetail={setSelectedInvoice}
        />
      </div>

      {/* Detailed View Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          activeStaff={activeStaff}
          customers={customers}
          branches={branches}
          currentBranchId={currentBranchId}
        />
      )}
    </div>
  );
}
