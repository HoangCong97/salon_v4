import React from "react";
import { formatCurrencyVND } from "@salon/shared-utils";

interface POSReceiptModalProps {
  showReceipt: boolean;
  setShowReceipt: (show: boolean) => void;
  receiptData: any;
  branches: any[];
  currentBranchId: string | null;
}

export const POSReceiptModal: React.FC<POSReceiptModalProps> = ({
  showReceipt,
  setShowReceipt,
  receiptData,
  branches,
  currentBranchId,
}) => {
  if (!showReceipt || !receiptData) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(15, 23, 42, 0.4)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "400px", padding: "24px", maxHeight: "90vh", overflowY: "auto", background: "white", color: "black", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", fontFamily: "Courier New, monospace" }}>
        
        {/* Header info */}
        <div style={{ textAlign: "center", borderBottom: "2px dashed #000", paddingBottom: "16px", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "1px" }}>HAIRSTAR BEAUTY SALON</h2>
          <p style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>
            {branches.find(b => b.id === currentBranchId)?.name || "Chi nhánh HairStar"}
          </p>
          <p style={{ fontSize: "10px", color: "#777" }}>Mã HĐ: {receiptData.id}</p>
          <p style={{ fontSize: "10px", color: "#777" }}>Ngày: {new Date(receiptData.createdAt).toLocaleString("vi-VN")}</p>
        </div>

        {/* General Metadata */}
        <div style={{ fontSize: "11px", marginBottom: "14px", display: "flex", flexDirection: "column", gap: "3px" }}>
          <div><strong>Thu ngân:</strong> {receiptData.cashier?.name || "Thu ngân"}</div>
          <div><strong>Khách hàng:</strong> {receiptData.customer?.name || "Khách vãng lai"}</div>
        </div>

        {/* List of items */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", marginBottom: "16px" }}>
          <thead>
            <tr style={{ borderBottom: "1px dashed #000" }}>
              <th style={{ textAlign: "left", paddingBottom: "4px" }}>Tên dịch vụ / SP</th>
              <th style={{ textAlign: "center", paddingBottom: "4px" }}>SL</th>
              <th style={{ textAlign: "right", paddingBottom: "4px" }}>Đơn giá</th>
              <th style={{ textAlign: "right", paddingBottom: "4px" }}>T.Tiền</th>
            </tr>
          </thead>
          <tbody>
            {receiptData.items?.map((item: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: "1px dotted #ccc" }}>
                <td style={{ padding: "6px 0", maxWidth: "160px" }}>
                  {item.name}
                  {item.stylist && (
                    <span style={{ display: "block", fontSize: "9px", color: "#555" }}>
                      - Thợ: {item.stylist.name.split("(")[0]}
                    </span>
                  )}
                </td>
                <td style={{ textAlign: "center", padding: "6px 0" }}>{item.quantity}</td>
                <td style={{ textAlign: "right", padding: "6px 0" }}>{formatCurrencyVND(Number(item.price))}</td>
                <td style={{ textAlign: "right", padding: "6px 0" }}>{formatCurrencyVND(Number(item.price) * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Cash/Calculations area */}
        <div style={{ borderTop: "1px dashed #000", paddingTop: "12px", fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Tổng cộng:</span>
            <span>{formatCurrencyVND(receiptData.totalPrice)}</span>
          </div>
          {Number(receiptData.discountAmount) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Chiết khấu/Giảm giá:</span>
              <span>-{formatCurrencyVND(Number(receiptData.discountAmount))}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "800", fontSize: "14px", borderTop: "2px dashed #000", paddingTop: "8px" }}>
            <span>THÀNH TIỀN:</span>
            <span>{formatCurrencyVND(receiptData.finalAmount)}</span>
          </div>
        </div>

        {/* Payment confirmation text */}
        <div style={{ margin: "24px 0 12px 0", textAlign: "center", fontSize: "11px", borderTop: "1px dashed #000", paddingTop: "12px" }}>
          <p style={{ fontWeight: "700" }}>TRẠNG THÁI: ĐÃ THANH TOÁN ({receiptData.paymentMethod === "CASH" ? "TIỀN MẶT" : "CHUYỂN KHOẢN"})</p>
          <p style={{ fontStyle: "italic", marginTop: "12px" }}>Cảm ơn quý khách và hẹn gặp lại!</p>
        </div>

        {/* Close button */}
        <div style={{ display: "flex", marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "12px", justifyContent: "center" }}>
          <button 
            className="btn btn-secondary" 
            style={{ fontFamily: "Courier New", width: "100%", padding: "10px", fontWeight: "700" }} 
            onClick={() => setShowReceipt(false)}
          >
            ĐÓNG HOÁ ĐƠN
          </button>
        </div>

      </div>
    </div>
  );
};

interface POSCreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, phone: string) => void;
  prefillName: string;
  prefillPhone: string;
}

export const POSCreateCustomerModal: React.FC<POSCreateCustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  prefillName,
  prefillPhone,
}) => {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setName(prefillName);
      setPhone(prefillPhone);
    }
  }, [isOpen, prefillName, prefillPhone]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Vui lòng nhập họ và tên khách hàng!");
      return;
    }
    onSave(name.trim(), phone.trim());
    onClose();
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(15, 23, 42, 0.4)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "400px", padding: "24px", background: "white", color: "var(--text-primary)", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Thêm khách hàng mới</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
              Họ và tên <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên..."
              required
              style={{ width: "100%", height: "36px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
              Số điện thoại
            </label>
            <input
              type="text"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại..."
              style={{ width: "100%", height: "36px" }}
            />
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ padding: "8px 16px" }}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: "8px 16px" }}
            >
              Lưu khách hàng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
