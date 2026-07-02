import React, { useState } from "react";
import { Eye } from "lucide-react";
import { formatCurrencyVND } from "@salon/shared-utils";

import { Tooltip } from "../../../components/desktop/ui/Tooltip";
import { Button } from "../../../components/desktop/ui/Button";
import { getEmployeeColor } from "../POS/POSLeftPanel";

import { Invoice, Staff, Customer } from "./types";

import styles from "./Invoices.module.css";

interface InvoiceTableProps {
  invoices: Invoice[];
  activeStaff: Staff[];
  customers: Customer[];
  onViewDetail: (invoice: Invoice) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  activeStaff,
  customers,
  onViewDetail,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(invoices.length / itemsPerPage);

  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatTimeHHMM = (dateStr: string) => {
    const date = new Date(dateStr);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDateDMY = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderStaffAvatars = (items: Invoice["items"]) => {
    const staffIds = Array.from(
      new Set(items?.map((item) => item.staffId || item.stylist?.id).filter(Boolean))
    );
    if (staffIds.length === 0) {
      return <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>-</span>;
    }

    const maxAvatars = 3;
    const displayIds = staffIds.slice(0, maxAvatars);
    const extraCount = staffIds.length - maxAvatars;

    return (
      <div className={styles.avatarList}>
        {displayIds.map((sId, idx) => {
          const sObj = activeStaff.find((s) => s.id === sId);
          const empColor = getEmployeeColor(String(sId), activeStaff);
          const initials = sObj
            ? sObj.name.split(" ").pop()?.substring(0, 2).toUpperCase()
            : "?";

          return (
            <Tooltip key={String(sId)} content={sObj ? sObj.name : "Nhân viên"}>
              {sObj && sObj.avatar ? (
                <img
                  src={sObj.avatar}
                  alt={sObj.name}
                  className={styles.avatarImg}
                  style={{
                    marginLeft: idx > 0 ? "-12px" : "0",
                    zIndex: 10 - idx,
                  }}
                />
              ) : (
                <div
                  className={styles.avatarPlaceholder}
                  style={{
                    background: empColor.color,
                    marginLeft: idx > 0 ? "-12px" : "0",
                    zIndex: 10 - idx,
                  }}
                >
                  {initials}
                </div>
              )}
            </Tooltip>
          );
        })}
        {extraCount > 0 && (
          <Tooltip content={`Và ${extraCount} nhân viên thực hiện khác`}>
            <div className={styles.avatarExtra}>
              +{extraCount}
            </div>
          </Tooltip>
        )}
      </div>
    );
  };

  let lastDate = "";

  return (
    <div className={`card ${styles.tableCard}`}>
      <h3 className={styles.tableTitle}>
        DANH SÁCH HOÁ ĐƠN ĐÃ THANH TOÁN ({invoices.length})
      </h3>

      <div className={`data-table-container ${styles.tableContainer}`}>
        <table className="data-table">
          <thead>
            <tr>
              <th className={styles.thAvatar}>Ảnh nhân viên</th>
              <th className={styles.thStaff}>Nhân viên thực hiện</th>
              <th className={styles.thTime}>Thời gian</th>
              <th className={styles.thDetails}>Chi tiết dịch vụ</th>
              <th className={styles.thTotal}>Tổng dịch vụ</th>
              <th className={styles.thDiscount}>Tổng giảm</th>
              <th className={styles.thFinal}>Thanh toán</th>
              <th className={styles.thPayment}>Hình thức</th>
              <th className={styles.thCustomer}>Khách hàng</th>
              <th className={styles.thSource}>Nguồn</th>
              <th className={styles.thAction}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInvoices.length === 0 ? (
              <tr>
                <td colSpan={11} className={styles.noDataCell}>
                  Không tìm thấy hóa đơn phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((inv) => {
                const customerObj = customers.find((c) => c.id === inv.customerId);
                const customerName = customerObj ? customerObj.name : (inv.customer?.name || "Khách vãng lai");

                const uniqueStaffNames = Array.from(
                  new Set(
                    inv.items
                      ?.map((item) => {
                        const sId = item.staffId || item.stylist?.id;
                        const sObj = activeStaff.find((s) => s.id === sId);
                        return sObj ? sObj.name.split("(")[0].trim() : null;
                      })
                      .filter(Boolean)
                  )
                ).join(", ") || "Không gán";

                const serviceDetailsStr = inv.items
                  ?.map((item) => `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ""}`)
                  .join(", ") || "-";

                const totalServicePrice = inv.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || inv.totalPrice || inv.finalAmount;
                const discountAmount = inv.discountAmount || 0;

                const currentDateStr = formatDateDMY(inv.createdAt);
                const showDateSeparator = currentDateStr !== lastDate;
                lastDate = currentDateStr;

                return (
                  <React.Fragment key={inv.id}>
                    {showDateSeparator && (
                      <tr className={styles.dateRow}>
                        <td colSpan={11} className={styles.dateCell}>
                          📅 Ngày {currentDateStr}
                        </td>
                      </tr>
                    )}
                    <tr className={styles.tableRow}>
                      <td className={styles.tdCentered}>
                        <div className={styles.avatarContainer}>
                          {renderStaffAvatars(inv.items)}
                        </div>
                      </td>
                      <td className={styles.tdStaff}>
                        <Tooltip content={uniqueStaffNames}>
                          <div className={`${styles.textEllipsis} ${styles.widthStaff}`}>
                            {uniqueStaffNames}
                          </div>
                        </Tooltip>
                      </td>
                      <td className={styles.tdTime}>{formatTimeHHMM(inv.createdAt)}</td>
                      <td className={styles.tdDetails}>
                        <Tooltip content={serviceDetailsStr}>
                          <div className={`${styles.textEllipsis} ${styles.widthDetails}`}>
                            {serviceDetailsStr}
                          </div>
                        </Tooltip>
                      </td>
                      <td className={styles.tdTotal}>{formatCurrencyVND(totalServicePrice)}</td>
                      <td className={`${styles.tdDiscount} ${discountAmount > 0 ? "var(--color-danger)" : ""}`} style={{ fontWeight: discountAmount > 0 ? "700" : "400" }}>
                        {discountAmount > 0 ? `-${formatCurrencyVND(discountAmount)}` : "0đ"}
                      </td>
                      <td className={styles.tdFinal}>{formatCurrencyVND(inv.finalAmount)}</td>
                      <td className={styles.tdPayment}>
                        <span className={inv.paymentMethod === "CASH" ? styles.badgeCash : styles.badgeTransfer}>
                          {inv.paymentMethod === "CASH" ? "Tiền mặt" : "Chuyển khoản"}
                        </span>
                      </td>
                      <td className={styles.tdCustomer}>
                        <Tooltip content={customerName}>
                          <div className={`${styles.textEllipsis} ${styles.widthCustomer}`}>
                            {customerName}
                          </div>
                        </Tooltip>
                      </td>
                      <td className={styles.tdSource}>
                        <span className={inv.orderSource === "BOOKING" ? styles.badgeBooking : styles.badgeWalkin}>
                          {inv.orderSource === "BOOKING" ? "Lịch hẹn" : "Tại quầy"}
                        </span>
                      </td>
                      <td className={styles.actionTd}>
                        <div className={styles.actionButtons}>
                          <Tooltip content="Xem chi tiết hóa đơn">
                            <button
                              type="button"
                              className={`btn btn-secondary ${styles.actionBtn}`}
                              onClick={() => onViewDetail(inv)}
                            >
                              <Eye size={12} />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className={styles.paginationRow}>
          <span className={styles.paginationInfo}>
            Trang <strong>{currentPage}</strong> / {totalPages} (Tổng số {invoices.length} hoá đơn)
          </span>
          <div className={styles.paginationButtons}>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(p - 1, 1));
              }}
            >
              Trước
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(p + 1, totalPages));
              }}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

