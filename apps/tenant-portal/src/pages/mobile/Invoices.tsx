import React from "react";
import { useInvoices } from "../desktop/Invoices/useInvoices";
import StaffDailyRevenueCard from "./components/StaffDailyRevenueCard";
import MobileInvoiceList from "./components/MobileInvoiceList";
import MobileInvoiceDetailModal from "./components/MobileInvoiceDetailModal";
import POSOverlayButton from "./components/POSOverlayButton";

export default function MobileInvoicesPage() {
  const {
    loading,
    error,
    activeStaff,
    resolvedInvoices,
    selectedInvoice,
    setSelectedInvoice,
    handleDeleteInvoice,
  } = useInvoices();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        gap: 0,
        position: "relative",
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      {error && (
        <div
          style={{
            padding: "8px 12px",
            background: "var(--color-danger-light)",
            color: "var(--color-danger)",
            fontSize: "12px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* TOP SECTION: 40% height ratio - Staff Revenue Table */}
      <div style={{ flex: 4, minHeight: 0 }}>
        <StaffDailyRevenueCard
          staffList={activeStaff}
          todayInvoices={resolvedInvoices}
          isLoading={loading}
        />
      </div>

      {/* Visual Separator Bar */}
      <div
        style={{
          height: "8px",
          background: "#f1f5f9",
          borderTop: "1px solid #e2e8f0",
          borderBottom: "1px solid #e2e8f0",
          flexShrink: 0,
        }}
      />

      {/* BOTTOM SECTION: 60% height ratio - Invoice List */}
      <div style={{ flex: 6, minHeight: 0 }}>
        <MobileInvoiceList
          invoices={resolvedInvoices}
          isLoading={loading}
          onSelectInvoice={(inv) => setSelectedInvoice(inv)}
        />
      </div>

      {/* Floating Overlay Button to navigate to POS */}
      <POSOverlayButton />

      {/* Selected Invoice Detail Modal */}
      <MobileInvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onDelete={handleDeleteInvoice}
      />
    </div>
  );
}
