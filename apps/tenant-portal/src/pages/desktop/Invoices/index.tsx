import React from "react";

import { InvoiceSummary } from "./InvoiceSummary";
import { InvoiceFilter } from "./InvoiceFilter";
import { InvoiceTable } from "./InvoiceTable";
import { InvoiceDetailModal } from "./InvoiceDetailModal";
import { LoadingState } from "../../../components/desktop/ui/LoadingState";
import { ErrorState } from "../../../components/desktop/ui/ErrorState";

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
    return <LoadingState text="Đang tải lịch sử hóa đơn..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
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

