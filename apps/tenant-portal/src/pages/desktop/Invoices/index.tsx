import React, { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { InvoiceSummary } from "./InvoiceSummary";
import { InvoiceFilter } from "./InvoiceFilter";
import { InvoiceTable } from "./InvoiceTable";
import { InvoiceDetailModal } from "./InvoiceDetailModal";
import { FileText } from "lucide-react";

export default function Invoices() {
  const { currentTenantId, currentBranchId, branches } = useAuthStore();

  // Local state for dropdown/filter choices
  const [activeStaff, setActiveStaff] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Fetch initial filters and resources
  useEffect(() => {
    const fetchResources = async () => {
      if (!currentTenantId || !currentBranchId) return;
      setLoading(true);
      try {
        const [staffRes, customerSaved, invoicesRes, servicesRes, productsRes, packagesRes] = await Promise.all([
          fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/shifts/staff`),
          Promise.resolve(localStorage.getItem("pos_customers")),
          fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/invoices`),
          fetch(`http://localhost:3000/api/tenants/${currentTenantId}/services?branchId=${currentBranchId}`),
          fetch(`http://localhost:3000/api/tenants/${currentTenantId}/inventories?branchId=${currentBranchId}`),
          fetch(`http://localhost:3000/api/tenants/${currentTenantId}/services/packages?branchId=${currentBranchId}`)
        ]);

        let loadedStaff = [];
        if (staffRes.ok) {
          try {
            const resJson = await staffRes.json();
            if (Array.isArray(resJson)) loadedStaff = resJson;
          } catch {}
        }
        setActiveStaff(loadedStaff);

        let loadedCustomers = [];
        if (customerSaved) {
          try {
            const parsed = JSON.parse(customerSaved);
            if (Array.isArray(parsed)) loadedCustomers = parsed;
          } catch {}
        }
        setCustomers(loadedCustomers);

        if (servicesRes.ok) {
          try { setServices(await servicesRes.json()); } catch {}
        }
        if (productsRes.ok) {
          try { setProducts(await productsRes.json()); } catch {}
        }
        if (packagesRes.ok) {
          try { setPackages(await packagesRes.json()); } catch {}
        }

        // Populate invoices
        let loadedInvoices = [];
        if (invoicesRes.ok) {
          try { loadedInvoices = await invoicesRes.json(); } catch {}
        }
        setInvoices(Array.isArray(loadedInvoices) ? loadedInvoices : []);

      } catch (err) {
        console.error("Failed to fetch invoices", err);
        setActiveStaff([]);
        setCustomers([]);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [currentTenantId, currentBranchId]);

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
