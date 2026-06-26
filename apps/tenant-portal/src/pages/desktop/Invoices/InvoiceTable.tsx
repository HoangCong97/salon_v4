import React, { useState } from "react";
import { formatCurrencyVND } from "@salon/shared-utils";
import { Eye } from "lucide-react";
import { Tooltip } from "../../../components/desktop/Tooltip";
import { getEmployeeColor } from "../POS/POSLeftPanel";

interface InvoiceTableProps {
  invoices: any[];
  activeStaff: any[];
  customers: any[];
  onViewDetail: (invoice: any) => void;
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

  const renderStaffAvatars = (items: any[]) => {
    const staffIds = Array.from(
      new Set(items?.map((item: any) => item.staffId || item.stylist?.id).filter(Boolean))
    );
    if (staffIds.length === 0) {
      return <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>-</span>;
    }

    const maxAvatars = 3;
    const displayIds = staffIds.slice(0, maxAvatars);
    const extraCount = staffIds.length - maxAvatars;

    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        {displayIds.map((sId: any, idx) => {
          const sObj = activeStaff.find((s) => s.id === sId);
          const empColor = getEmployeeColor(String(sId), activeStaff);
          const initials = sObj
            ? sObj.name.split(" ").pop()?.substring(0, 2).toUpperCase()
            : "?";

          return (
            <Tooltip key={String(sId)} content={sObj ? sObj.name : "Nhân viên"}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: empColor.color,
                  border: "1.5px solid white",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "800",
                  marginLeft: idx > 0 ? "-12px" : "0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  flexShrink: 0,
                  zIndex: 10 - idx,
                }}
              >
                {initials}
              </div>
            </Tooltip>
          );
        })}
        {extraCount > 0 && (
          <Tooltip content={`Và ${extraCount} nhân viên thực hiện khác`}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "#e2e8f0",
                border: "1.5px solid white",
                color: "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "800",
                marginLeft: "-12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                flexShrink: 0,
                zIndex: 5,
              }}
            >
              +{extraCount}
            </div>
          </Tooltip>
        )}
      </div>
    );
  };

  let lastDate = "";

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", flexGrow: 1, overflow: "hidden" }}>
      <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-secondary)" }}>
        DANH SÁCH HOÁ ĐƠN ĐÃ THANH TOÁN ({invoices.length})
      </h3>

      <div className="data-table-container" style={{ flexGrow: 1, overflowY: "auto", minHeight: "250px" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, width: "90px", minWidth: "90px", maxWidth: "90px", textAlign: "center", padding: "12px 8px" }}>Ảnh nhân viên</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, width: "280px", minWidth: "280px", maxWidth: "280px", padding: "12px 12px" }}>Nhân viên thực hiện</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, width: "70px", minWidth: "70px", maxWidth: "70px", textAlign: "center", padding: "12px 8px" }}>Thời gian</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, width: "auto", minWidth: "220px", padding: "12px 12px" }}>Chi tiết dịch vụ</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, width: "100px", minWidth: "100px", maxWidth: "100px", textAlign: "right", padding: "12px 8px" }}>Tổng dịch vụ</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, width: "80px", minWidth: "80px", maxWidth: "80px", textAlign: "right", padding: "12px 8px" }}>Tổng giảm</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, width: "100px", minWidth: "100px", maxWidth: "100px", textAlign: "right", padding: "12px 8px" }}>Thanh toán</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, width: "115px", minWidth: "115px", maxWidth: "115px", textAlign: "center", padding: "12px 6px" }}>Hình thức</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, width: "120px", minWidth: "120px", maxWidth: "120px", padding: "12px 12px" }}>Khách hàng</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, width: "85px", minWidth: "85px", maxWidth: "85px", textAlign: "center", padding: "12px 8px" }}>Nguồn</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, width: "60px", minWidth: "60px", maxWidth: "60px", textAlign: "center", padding: "12px 6px" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInvoices.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontWeight: "500" }}>
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
                      ?.map((item: any) => {
                        const sId = item.staffId || item.stylist?.id;
                        const sObj = activeStaff.find((s) => s.id === sId);
                        return sObj ? sObj.name.split("(")[0].trim() : null;
                      })
                      .filter(Boolean)
                  )
                ).join(", ") || "Không gán";

                const serviceDetailsStr = inv.items
                  ?.map((item: any) => `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ""}`)
                  .join(", ") || "-";

                const totalServicePrice = inv.items?.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0) || inv.totalPrice || inv.finalAmount;
                const discountAmount = inv.discountAmount || 0;

                const currentDateStr = formatDateDMY(inv.createdAt);
                const showDateSeparator = currentDateStr !== lastDate;
                lastDate = currentDateStr;

                return (
                  <React.Fragment key={inv.id}>
                    {showDateSeparator && (
                      <tr style={{ background: "var(--color-primary-light)", borderBottom: "1.5px solid var(--border-color)" }}>
                        <td colSpan={11} style={{ padding: "10px 16px", fontWeight: "700", color: "var(--color-primary)", fontSize: "12.5px", textAlign: "left" }}>
                          📅 Ngày {currentDateStr}
                        </td>
                      </tr>
                    )}
                    <tr style={{ transition: "background 0.15s" }}>
                      <td style={{ textAlign: "center", verticalAlign: "middle", padding: "4px 8px", width: "90px", minWidth: "90px", maxWidth: "90px" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          {renderStaffAvatars(inv.items)}
                        </div>
                      </td>
                      <td style={{ fontWeight: "500", padding: "10px 12px", width: "280px", minWidth: "280px", maxWidth: "280px" }}>
                        <Tooltip content={uniqueStaffNames}>
                          <div
                            style={{
                              maxWidth: "240px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              cursor: "default",
                            }}
                          >
                            {uniqueStaffNames}
                          </div>
                        </Tooltip>
                      </td>
                      <td style={{ textAlign: "center", padding: "10px 8px", width: "70px", minWidth: "70px", maxWidth: "70px" }}>{formatTimeHHMM(inv.createdAt)}</td>
                      <td style={{ padding: "10px 12px", width: "auto", minWidth: "220px" }}>
                        <Tooltip content={serviceDetailsStr}>
                          <div
                            style={{
                              maxWidth: "350px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              cursor: "default",
                            }}
                          >
                            {serviceDetailsStr}
                          </div>
                        </Tooltip>
                      </td>
                      <td style={{ textAlign: "right", padding: "10px 8px", width: "100px", minWidth: "100px", maxWidth: "100px" }}>{formatCurrencyVND(totalServicePrice)}</td>
                      <td style={{ textAlign: "right", padding: "10px 8px", width: "80px", minWidth: "80px", maxWidth: "80px", color: discountAmount > 0 ? "var(--color-danger)" : "var(--text-secondary)", fontWeight: discountAmount > 0 ? "700" : "400" }}>
                        {discountAmount > 0 ? `-${formatCurrencyVND(discountAmount)}` : "0đ"}
                      </td>
                      <td style={{ fontWeight: "800", textAlign: "right", padding: "10px 8px", color: "var(--color-primary)", width: "100px", minWidth: "100px", maxWidth: "100px" }}>{formatCurrencyVND(inv.finalAmount)}</td>
                      <td style={{ textAlign: "center", padding: "10px 6px", width: "115px", minWidth: "115px", maxWidth: "115px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11.5px",
                            fontWeight: "700",
                            background: inv.paymentMethod === "CASH" ? "#ecfdf5" : "#eff6ff",
                            color: inv.paymentMethod === "CASH" ? "#10b981" : "#3b82f6",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {inv.paymentMethod === "CASH" ? "Tiền mặt" : "Chuyển khoản"}
                        </span>
                      </td>
                      <td style={{ fontWeight: "600", padding: "10px 12px", width: "120px", minWidth: "120px", maxWidth: "120px" }}>
                        <Tooltip content={customerName}>
                          <div
                            style={{
                              maxWidth: "96px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              cursor: "default",
                            }}
                          >
                            {customerName}
                          </div>
                        </Tooltip>
                      </td>
                      <td style={{ textAlign: "center", padding: "10px 8px", width: "85px", minWidth: "85px", maxWidth: "85px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "700",
                            background: inv.orderSource === "BOOKING" ? "#faf5ff" : "#f1f5f9",
                            color: inv.orderSource === "BOOKING" ? "#8b5cf6" : "#475569",
                          }}
                        >
                          {inv.orderSource === "BOOKING" ? "Lịch hẹn" : "Tại quầy"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", padding: "10px 6px", width: "60px", minWidth: "60px", maxWidth: "60px" }}>
                        <Tooltip content="Xem chi tiết hóa đơn">
                          <button
                            type="button"
                            onClick={() => onViewDetail(inv)}
                            style={{
                              padding: "6px",
                              fontSize: "12px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "var(--color-primary-light)",
                              border: "none",
                              color: "var(--color-primary)",
                              borderRadius: "var(--radius-sm)",
                              cursor: "pointer",
                              transition: "all 0.15s"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "var(--color-primary)";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "var(--color-primary-light)";
                              e.currentTarget.style.color = "var(--color-primary)";
                            }}
                          >
                            <Eye size={14} />
                          </button>
                        </Tooltip>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
          <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
            Trang <strong>{currentPage}</strong> / {totalPages} (Tổng số {invoices.length} hoá đơn)
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn btn-secondary"
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(p - 1, 1));
              }}
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              Trước
            </button>
            <button
              className="btn btn-secondary"
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(p + 1, totalPages));
              }}
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
