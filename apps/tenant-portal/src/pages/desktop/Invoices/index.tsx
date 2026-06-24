import React, { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { InvoiceSummary } from "./InvoiceSummary";
import { InvoiceFilter } from "./InvoiceFilter";
import { InvoiceTable } from "./InvoiceTable";
import { InvoiceDetailModal } from "./InvoiceDetailModal";
import { FileText } from "lucide-react";

// Mock Fallback Data
const MOCK_STAFF = [
  { id: "s_m1", name: "Thợ A (Stylist)", role: { name: "Employee" } },
  { id: "s_m2", name: "Thợ B (Nail Tech)", role: { name: "Employee" } },
  { id: "s_m3", name: "Thợ C (Thợ phụ)", role: { name: "Employee" } },
  { id: "s_m4", name: "Thợ D (Lễ tân)", role: { name: "Employee" } }
];

const MOCK_CUSTOMERS = [
  { id: "c1", name: "Khách vãng lai", phone: "", rank: "Khách mới" },
  { id: "c2", name: "Nguyễn Văn A", phone: "0901234567", rank: "Vàng" },
  { id: "c3", name: "Trần Thị B", phone: "0918765432", rank: "Bạc" }
];

const generateMockInvoices = (staff: any[], customers: any[]) => {
  const list = [];
  const services = [
    { name: "Cắt tóc nam Classic", price: 120000 },
    { name: "Uốn tóc xoăn Hàn Quốc", price: 450000 },
    { name: "Nhuộm màu thời trang", price: 650000 },
    { name: "Gội đầu dưỡng sinh thảo dược", price: 150000 },
    { name: "Massage cổ vai gáy", price: 200000 },
    { name: "Sơn móng gel cao cấp", price: 180000 },
  ];
  
  const paymentMethods = ["CASH", "BANK_TRANSFER"];
  const orderSources = ["WALK_IN", "BOOKING"];
  const cashiers = [{ name: "Thu ngân Chi nhánh" }, { name: "Lễ tân Quỳnh Anh" }];

  const now = new Date();
  for (let i = 0; i < 20; i++) {
    // Distribute invoices across the last 5 days
    const dateOffset = Math.floor(i / 4);
    const date = new Date(now.getTime() - dateOffset * 24 * 60 * 60 * 1000 - (i % 4) * 3 * 60 * 60 * 1000 - 15 * 60 * 1000);
    
    const method = paymentMethods[i % 2];
    const source = orderSources[i % 3 === 0 ? 1 : 0]; // 1/3 Booking, 2/3 Walk-in
    const cashier = cashiers[i % 2];
    
    // Select customer: 60% walk-in, 40% registered customers
    const useWalkIn = i % 3 !== 0;
    const customer = useWalkIn ? { id: "c1", name: "Khách vãng lai" } : (customers[1 + (i % (customers.length - 1))] || { id: "c1", name: "Khách vãng lai" });
    
    // Random 1-2 services
    const numItems = (i % 2) + 1;
    const items = [];
    let totalPrice = 0;
    
    for (let j = 0; j < numItems; j++) {
      const service = services[(i + j) % services.length];
      const stylist = staff[(i + j) % staff.length] || { id: "s_m1", name: "Thợ A" };
      items.push({
        name: service.name,
        price: service.price,
        quantity: 1,
        staffId: stylist.id,
        stylist: { id: stylist.id, name: stylist.name }
      });
      totalPrice += service.price;
    }
    
    const discount = i % 5 === 0 ? Math.round(totalPrice * 0.1) : 0; 
    const finalAmount = totalPrice - discount;
    
    list.push({
      id: `INV-${10452 + i}`,
      createdAt: date.toISOString(),
      customerId: customer.id,
      customer: { name: customer.name, phone: customer.phone || "" },
      cashier,
      items,
      totalPrice,
      discountAmount: discount,
      finalAmount,
      paymentMethod: method,
      orderSource: source
    });
  }
  return list;
};

export default function Invoices() {
  const { currentTenantId, currentBranchId, branches } = useAuthStore();

  // Local state for dropdown/filter choices
  const [activeStaff, setActiveStaff] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
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
        const [staffRes, customerSaved, invoicesRes] = await Promise.all([
          fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/shifts/staff`),
          Promise.resolve(localStorage.getItem("pos_customers")),
          fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/invoices`)
        ]);

        let loadedStaff = MOCK_STAFF;
        if (staffRes.ok) {
          const resJson = await staffRes.json();
          if (Array.isArray(resJson) && resJson.length > 0) loadedStaff = resJson;
        }
        setActiveStaff(loadedStaff);

        let loadedCustomers = MOCK_CUSTOMERS;
        if (customerSaved) {
          try {
            const parsed = JSON.parse(customerSaved);
            if (Array.isArray(parsed) && parsed.length > 0) loadedCustomers = parsed;
          } catch {}
        }
        setCustomers(loadedCustomers);

        // Populate invoices
        let loadedInvoices = [];
        if (invoicesRes.ok) {
          loadedInvoices = await invoicesRes.json();
        }
        
        // If API is empty/offline, generate high-quality mock invoices for demo
        if (!Array.isArray(loadedInvoices) || loadedInvoices.length === 0) {
          loadedInvoices = generateMockInvoices(loadedStaff, loadedCustomers);
        }
        setInvoices(loadedInvoices);

      } catch (err) {
        console.warn("API Offline, using local mocks", err);
        const savedCustomers = localStorage.getItem("pos_customers");
        let parsedCust = MOCK_CUSTOMERS;
        if (savedCustomers) {
          try { parsedCust = JSON.parse(savedCustomers); } catch {}
        }
        setActiveStaff(MOCK_STAFF);
        setCustomers(parsedCust);
        setInvoices(generateMockInvoices(MOCK_STAFF, parsedCust));
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [currentTenantId, currentBranchId]);

  // Apply filters on the invoices list
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
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
