import React from "react";
import { Invoice } from "../../desktop/Invoices/types";

interface MobileInvoiceDetailModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onDelete?: (invoiceId: string) => void;
}

export default function MobileInvoiceDetailModal({
  invoice,
  onClose,
  onDelete,
}: MobileInvoiceDetailModalProps) {
  if (!invoice) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const formattedDate = new Date(invoice.createdAt).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-end", // Bottom sheet effect on mobile
        justifyContent: "center",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          maxHeight: "85vh",
          backgroundColor: "var(--bg-card)",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          padding: "20px",
          paddingBottom: "calc(20px + env(safe-area-inset-bottom))",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          overflowY: "auto",
          boxShadow: "0 -10px 25px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Handle Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: "12px",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Chi tiết hóa đơn
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "var(--text-primary)",
              }}
            >
              #{invoice.id.substring(0, 8).toUpperCase()}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "hsl(210, 40%, 96%)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Customer & General Info */}
        <div
          style={{
            background: "hsl(210, 40%, 98%)",
            borderRadius: "var(--radius-sm)",
            padding: "12px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            fontSize: "13px",
          }}
        >
          <div>
            <span style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
              Khách hàng
            </span>
            <div style={{ fontWeight: "600" }}>
              {invoice.customer?.name || "Khách vãng lai"}
            </div>
            {invoice.customer?.phone && (
              <div
                style={{ fontSize: "11px", color: "var(--text-secondary)" }}
              >
                {invoice.customer.phone}
              </div>
            )}
          </div>

          <div>
            <span style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
              Thời gian
            </span>
            <div style={{ fontWeight: "500" }}>{formattedDate}</div>
          </div>

          <div>
            <span style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
              Thanh toán
            </span>
            <div>
              <span
                className={`badge ${
                  invoice.paymentMethod === "CASH"
                    ? "badge-success"
                    : "badge-info"
                }`}
                style={{ fontSize: "11px" }}
              >
                {invoice.paymentMethod === "CASH"
                  ? "💵 Tiền mặt"
                  : "💳 Chuyển khoản"}
              </span>
            </div>
          </div>

          <div>
            <span style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
              Thu ngân
            </span>
            <div style={{ fontWeight: "500" }}>
              {invoice.cashier?.name || "N/A"}
            </div>
          </div>
        </div>

        {/* Invoice items list */}
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "8px",
              color: "var(--text-primary)",
            }}
          >
            Danh sách dịch vụ / sản phẩm ({invoice.items?.length || 0})
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    background: "white",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "13px" }}>
                      {item.name || "Dịch vụ/Sản phẩm"}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text-secondary)",
                        marginTop: "2px",
                      }}
                    >
                      {item.stylist?.name ? `NV: ${item.stylist.name} • ` : ""}
                      {formatCurrency(item.price)} x {item.quantity}
                    </div>
                  </div>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "13px",
                      color: "var(--text-primary)",
                    }}
                  >
                    {formatCurrency(
                      item.finalAmount ??
                        item.price * item.quantity - (item.discountAmount || 0),
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  padding: "12px",
                }}
              >
                Không có chi tiết mặt hàng
              </div>
            )}
          </div>
        </div>

        {/* Pricing Summary */}
        <div
          style={{
            borderTop: "1px solid var(--border-color)",
            paddingTop: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            fontSize: "13px",
          }}
        >
          {invoice.discountAmount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--color-danger)",
              }}
            >
              <span>Giảm giá:</span>
              <span>-{formatCurrency(invoice.discountAmount)}</span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "16px",
              fontWeight: "700",
              color: "var(--color-primary)",
              marginTop: "4px",
            }}
          >
            <span>Tổng thanh toán:</span>
            <span>{formatCurrency(invoice.finalAmount)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "8px",
          }}
        >
          {onDelete && (
            <button
              className="btn btn-danger-light"
              onClick={() => onDelete(invoice.id)}
              style={{ flex: 1, padding: "10px" }}
            >
              🗑️ Xóa hóa đơn
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={onClose}
            style={{ flex: 1, padding: "10px" }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
