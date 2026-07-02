import React from "react";
import { Loader2, Info } from "lucide-react";

import { InvoiceSummary } from "./InvoiceSummary";
import { InvoiceFilter } from "./InvoiceFilter";
import { InvoiceTable } from "./InvoiceTable";
import { InvoiceDetailModal } from "./InvoiceDetailModal";

import { useInvoices } from "./useInvoices";

import styles from "./Invoices.module.css";

export default function Invoices() {
  const {
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
  } = useInvoices();

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <Loader2 className="animate-spin" size={36} style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card ${styles.errorCard}`}>
        <h3 className={styles.errorTitle}>
          <Info size={16} /> Lỗi nạp dữ liệu
        </h3>
        <p className={styles.errorDesc}>{error}</p>
      </div>
    );
  }

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      {/* Dynamic Summary Cards */}
      <div className={styles.flexShrink0}>
        <InvoiceSummary
          totalRevenue={summaryStats.totalRevenue}
          cashRevenue={summaryStats.cashRevenue}
          transferRevenue={summaryStats.transferRevenue}
          invoiceCount={summaryStats.invoiceCount}
        />
      </div>

      {/* Filters Bar */}
      <div className={styles.flexShrink0}>
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
      <div className={styles.tableWrapper}>
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

