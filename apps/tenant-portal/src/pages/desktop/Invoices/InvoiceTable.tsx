import React from "react";
import { Eye, DollarSign, CreditCard, Globe, Store, Edit2, Trash2 } from "lucide-react";
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
  onEditInvoice?: (invoice: Invoice) => void;
  onDeleteInvoice?: (invoiceId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  activeStaff,
  customers,
  onViewDetail,
  onEditInvoice,
  onDeleteInvoice,
  canEdit = false,
  canDelete = false,
}) => {

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
    <div className={`data-table-container ${styles.tableContainer}`}>
      <table className="data-table">
        <thead>
          <tr>
            <th className={styles.thTime}>Thời gian</th>
            <th className={styles.thAvatar}>Ảnh nhân viên</th>
            <th className={styles.thStaff}>Nhân viên thực hiện</th>
            <th className={styles.thDetails}>Chi tiết dịch vụ</th>
            <th className={styles.thTotal}>Tổng dịch vụ</th>
            <th className={styles.thDiscount}>Tổng giảm</th>
            <th className={styles.thFinal}>Thanh toán</th>
            <th className={styles.thCustomer}>Khách hàng</th>
            <th className={styles.thTransaction}>Loại giao dịch</th>
            <th className={styles.thAction}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan={10} className={styles.noDataCell}>
                Không tìm thấy hóa đơn phù hợp với bộ lọc.
              </td>
            </tr>
          ) : (
            invoices.map((inv) => {
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
                      <td colSpan={10} className={styles.dateCell}>
                        📅 Ngày {currentDateStr}
                      </td>
                    </tr>
                  )}
                  <tr
                    className={`${styles.tableRow} ${styles.clickableRow}`}
                    onClick={() => onViewDetail(inv)}
                  >
                    <td className={styles.tdTime}>{formatTimeHHMM(inv.createdAt)}</td>
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
                    <td className={styles.tdCustomer}>
                      <Tooltip content={customerName}>
                        <div className={`${styles.textEllipsis} ${styles.widthCustomer}`}>
                          {customerName}
                        </div>
                      </Tooltip>
                    </td>
                    <td className={styles.tdTransaction}>
                      <Tooltip
                        content={`${inv.paymentMethod === "CASH" ? "Tiền mặt" : "Chuyển khoản"}, ${inv.orderSource === "BOOKING" ? "Online" : "Tại quầy"
                          }`}
                      >
                        <div className={styles.transactionIcons}>
                          <span
                            className={`${styles.txnIcon} ${inv.paymentMethod === "CASH" ? styles.txnIconCash : styles.txnIconTransfer
                              }`}
                          >
                            {inv.paymentMethod === "CASH" ? <DollarSign size={15} /> : <CreditCard size={15} />}
                          </span>
                          <span
                            className={`${styles.txnIcon} ${inv.orderSource === "BOOKING" ? styles.txnIconBooking : styles.txnIconWalkin
                              }`}
                          >
                            {inv.orderSource === "BOOKING" ? <Globe size={15} /> : <Store size={15} />}
                          </span>
                        </div>
                      </Tooltip>
                    </td>
                    <td className={styles.actionTd}>
                      <div className={styles.actionButtons}>
                        {canEdit && onEditInvoice && (
                          <Tooltip content="Chỉnh sửa hóa đơn">
                            <button
                              type="button"
                              className={`btn btn-secondary ${styles.actionBtn}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditInvoice(inv);
                              }}
                            >
                              <Edit2 size={12} />
                            </button>
                          </Tooltip>
                        )}
                        {canDelete && onDeleteInvoice && (
                          <Tooltip content="Xóa hóa đơn">
                            <button
                              type="button"
                              className={styles.actionBtnDanger}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteInvoice(inv.id);
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </Tooltip>
                        )}
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
  );
};

