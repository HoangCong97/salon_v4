import React, { useState } from "react";
import { formatCurrencyVND } from "@salon/shared-utils";
import { Eye } from "lucide-react";
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
          const empColor = getEmployeeColor(String(sId));
          const initials = sObj
            ? sObj.name.split(" ").pop()?.substring(0, 2).toUpperCase()
            : "?";

          return (
            <div
              key={String(sId)}
              title={sObj ? sObj.name : "Nhân viên"}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: empColor.bg,
                border: "1.5px solid white",
                color: empColor.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: "800",
                marginLeft: idx > 0 ? "-8px" : "0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                flexShrink: 0,
                zIndex: 10 - idx,
              }}
            >
              {initials}
            </div>
          );
        })}
        {extraCount > 0 && (
          <div
            title={`Và ${extraCount} nhân viên thực hiện khác`}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "#e2e8f0",
              border: "1.5px solid white",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "800",
              marginLeft: "-8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              flexShrink: 0,
              zIndex: 5,
            }}
          >
            +{extraCount}
          </div>
        )}
      </div>
    );
  };



  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", flexGrow: 1, overflow: "hidden" }}>
      <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-secondary)" }}>
        DANH SÁCH HOÁ ĐƠN ĐÃ THANH TOÁN ({invoices.length})
      </h3>

      <div className="data-table-container" style={{ flexGrow: 1, overflowY: "auto", minHeight: "250px" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, textAlign: "center" }}>Ảnh nhân viên</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10 }}>Nhân viên thực hiện</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, textAlign: "center" }}>Thời gian</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10 }}>Chi tiết dịch vụ</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10 }}>Khách hàng</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, textAlign: "right" }}>Tổng tiền dịch vụ</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, textAlign: "right" }}>Tổng giảm giá</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, textAlign: "right" }}>Tổng thanh toán</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, textAlign: "center" }}>Hình thức</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, textAlign: "center" }}>Nguồn</th>
              <th style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, textAlign: "center" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInvoices.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontWeight: "500" }}>
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

                return (
                  <tr key={inv.id} style={{ transition: "background 0.15s" }}>
                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        {renderStaffAvatars(inv.items)}
                      </div>
                    </td>
                    <td style={{ fontWeight: "500" }}>
                      <div
                        title={uniqueStaffNames}
                        style={{
                          maxWidth: "140px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {uniqueStaffNames}
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>{formatTimeHHMM(inv.createdAt)}</td>
                    <td>
                      <div
                        title={serviceDetailsStr}
                        style={{
                          maxWidth: "200px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {serviceDetailsStr}
                      </div>
                    </td>
                    <td>{customerName}</td>
                    <td style={{ textAlign: "right" }}>{formatCurrencyVND(totalServicePrice)}</td>
                    <td style={{ textAlign: "right", color: discountAmount > 0 ? "var(--color-danger)" : "var(--text-secondary)", fontWeight: discountAmount > 0 ? "700" : "400" }}>
                      {discountAmount > 0 ? `-${formatCurrencyVND(discountAmount)}` : "0đ"}
                    </td>
                    <td style={{ fontWeight: "800", textAlign: "right", color: "var(--color-primary)" }}>{formatCurrencyVND(inv.finalAmount)}</td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "700",
                          background: inv.paymentMethod === "CASH" ? "#ecfdf5" : "#eff6ff",
                          color: inv.paymentMethod === "CASH" ? "#10b981" : "#3b82f6",
                        }}
                      >
                        {inv.paymentMethod === "CASH" ? "Tiền mặt" : "Chuyển khoản"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
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
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => onViewDetail(inv)}
                        title="Xem chi tiết hóa đơn"
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
                    </td>
                  </tr>
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

