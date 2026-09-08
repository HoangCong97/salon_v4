import React from "react";
import { Printer, X, CheckCircle2, CreditCard, Banknote } from "lucide-react";

interface MobilePOSReceiptModalProps {
  showReceipt: boolean;
  onClose: () => void;
  receiptData: any;
  branchName: string;
}

export const MobilePOSReceiptModal: React.FC<MobilePOSReceiptModalProps> = ({
  showReceipt,
  onClose,
  receiptData,
  branchName,
}) => {
  if (!showReceipt || !receiptData) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);

  const handlePrint = () => {
    window.print();
  };

  const isCash = receiptData.paymentMethod === "CASH";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          background: "#ffffff",
          width: "100%",
          maxWidth: "380px",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            padding: "14px 18px",
            background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={20} color="#34d399" />
            <span style={{ fontWeight: "700", fontSize: "15px" }}>
              Thanh toán thành công
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "#ffffff",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Printable Receipt Paper Body */}
        <div
          id="mobile-pos-receipt-print"
          style={{
            padding: "20px",
            overflowY: "auto",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            background: "#fafafa",
            fontFamily: "monospace, system-ui, sans-serif",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "1px dashed #cbd5e1", paddingBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
              HAIRSTAR SALON
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#64748b" }}>
              {branchName || "Chi nhánh chính"}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#94a3b8" }}>
              Mã HĐ: {receiptData.id ? String(receiptData.id).substring(0, 8).toUpperCase() : "N/A"}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>
              {receiptData.createdAt
                ? new Date(receiptData.createdAt).toLocaleString("vi-VN")
                : new Date().toLocaleString("vi-VN")}
            </p>
          </div>

          {/* Info Rows */}
          <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px", color: "#334155" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Thu ngân:</span>
              <strong>{receiptData.cashier?.name || "Thu ngân"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Khách hàng:</span>
              <strong>{receiptData.customer?.name || "Khách vãng lai"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Hình thức:</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: "700",
                  color: isCash ? "#15803d" : "#2563eb",
                }}
              >
                {isCash ? (
                  <>
                    <Banknote size={13} />
                    Tiền mặt
                  </>
                ) : (
                  <>
                    <CreditCard size={13} />
                    Chuyển khoản
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "10px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: "8px",
                fontSize: "11px",
                fontWeight: "700",
                color: "#64748b",
                marginBottom: "6px",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "4px",
              }}
            >
              <span>DỊCH VỤ / SP</span>
              <span style={{ textAlign: "center" }}>SL</span>
              <span style={{ textAlign: "right" }}>THÀNH TIỀN</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {receiptData.items?.map((it: any, idx: number) => {
                const itemTotal = (it.price || 0) * (it.quantity || 1) - (it.discountAmount || 0);
                const stylistName = it.stylist?.name || it.staff?.name || "";
                return (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto auto",
                      gap: "8px",
                      fontSize: "12px",
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", color: "#1e293b" }}>{it.name}</div>
                      {stylistName && (
                        <div style={{ fontSize: "10.5px", color: "#2563eb" }}>
                          Thợ: {stylistName}
                        </div>
                      )}
                    </div>
                    <span style={{ textAlign: "center", color: "#475569" }}>x{it.quantity || 1}</span>
                    <span style={{ textAlign: "right", fontWeight: "600", color: "#1e293b" }}>
                      {formatCurrency(itemTotal)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div
            style={{
              borderTop: "1px dashed #cbd5e1",
              paddingTop: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              fontSize: "12px",
            }}
          >
            {receiptData.discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "#ef4444" }}>
                <span>Giảm giá:</span>
                <span>-{formatCurrency(receiptData.discountAmount)}</span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "15px",
                fontWeight: "800",
                color: "#16a34a",
                borderTop: "1px solid #e2e8f0",
                paddingTop: "6px",
              }}
            >
              <span>TỔNG CỘNG:</span>
              <span>
                {formatCurrency(
                  receiptData.finalAmount !== undefined
                    ? receiptData.finalAmount
                    : receiptData.totalPrice || 0,
                )}
              </span>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", margin: "8px 0 0" }}>
            Cảm ơn quý khách & Hẹn gặp lại!
          </p>
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: "12px 16px",
            background: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px",
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              color: "#334155",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <Printer size={16} />
            <span>In hóa đơn</span>
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1.2,
              padding: "10px",
              background: "#2563eb",
              border: "none",
              borderRadius: "10px",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};
