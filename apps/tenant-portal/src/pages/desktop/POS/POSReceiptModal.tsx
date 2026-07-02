import React from "react";

import { formatCurrencyVND } from "@salon/shared-utils";

import styles from "./POS.module.css";

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
    <div className={styles.modalOverlay}>
      <div className={`card animate-fade-in ${styles.receiptCard}`}>
        
        {/* Header info */}
        <div className={styles.receiptHeader}>
          <h2 className={styles.receiptTitle}>HAIRSTAR BEAUTY SALON</h2>
          <p className={styles.receiptSub}>
            {branches.find(b => b.id === currentBranchId)?.name || "Chi nhánh HairStar"}
          </p>
          <p className={styles.receiptMeta}>Mã HĐ: {receiptData.id}</p>
          <p className={styles.receiptMeta}>Ngày: {new Date(receiptData.createdAt).toLocaleString("vi-VN")}</p>
        </div>

        {/* General Metadata */}
        <div className={styles.receiptInfo}>
          <div><strong>Thu ngân:</strong> {receiptData.cashier?.name || "Thu ngân"}</div>
          <div><strong>Khách hàng:</strong> {receiptData.customer?.name || "Khách vãng lai"}</div>
        </div>

        {/* List of items */}
        <table className={styles.receiptTable}>
          <thead>
            <tr className={styles.receiptThRow}>
              <th className={`${styles.receiptTh}`} style={{ textAlign: "left" }}>Tên dịch vụ / SP</th>
              <th className={`${styles.receiptTh}`} style={{ textAlign: "center" }}>SL</th>
              <th className={`${styles.receiptTh}`} style={{ textAlign: "right" }}>Đơn giá</th>
              <th className={`${styles.receiptTh}`} style={{ textAlign: "right" }}>T.Tiền</th>
            </tr>
          </thead>
          <tbody>
            {receiptData.items?.map((item: any, idx: number) => (
              <tr key={idx} className={styles.receiptTr}>
                <td className={`${styles.receiptTd} ${styles.receiptTdName}`}>
                  {item.name}
                  {item.stylist && (
                    <span className={styles.receiptStylist}>
                      - Thợ: {item.stylist.name.split("(")[0]}
                    </span>
                  )}
                </td>
                <td className={styles.receiptTd} style={{ textAlign: "center" }}>{item.quantity}</td>
                <td className={styles.receiptTd} style={{ textAlign: "right" }}>{formatCurrencyVND(Number(item.price))}</td>
                <td className={styles.receiptTd} style={{ textAlign: "right" }}>{formatCurrencyVND(Number(item.price) * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Cash/Calculations area */}
        <div className={styles.receiptCalc}>
          <div className={styles.receiptRow}>
            <span>Tổng cộng:</span>
            <span>{formatCurrencyVND(receiptData.totalPrice)}</span>
          </div>
          {Number(receiptData.discountAmount) > 0 && (
            <div className={styles.receiptRow}>
              <span>Chiết khấu/Giảm giá:</span>
              <span>-{formatCurrencyVND(Number(receiptData.discountAmount))}</span>
            </div>
          )}
          <div className={styles.receiptFinalRow}>
            <span>THÀNH TIỀN:</span>
            <span>{formatCurrencyVND(receiptData.finalAmount)}</span>
          </div>
        </div>

        {/* Payment confirmation text */}
        <div className={styles.receiptStatus}>
          <p className={styles.receiptStatusTitle}>TRẠNG THÁI: ĐÃ THANH TOÁN ({receiptData.paymentMethod === "CASH" ? "TIỀN MẶT" : "CHUYỂN KHOẢN"})</p>
          <p className={styles.receiptStatusItalic}>Cảm ơn quý khách và hẹn gặp lại!</p>
        </div>

        {/* Close button */}
        <div className={styles.receiptFooterBtnRow}>
          <button 
            className={`btn btn-secondary ${styles.receiptCloseBtn}`} 
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
    <div className={styles.modalOverlay}>
      <div className={`card animate-fade-in ${styles.custModalCard}`}>
        <h3 className={styles.custModalHeader}>Thêm khách hàng mới</h3>
        <form onSubmit={handleSubmit} className={styles.custModalForm}>
          <div>
            <label className={styles.custModalLabel}>
              Họ và tên <span className={styles.requiredStar}>*</span>
            </label>
            <input
              type="text"
              className={`form-input ${styles.custModalInput}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên..."
              required
            />
          </div>
          <div>
            <label className={styles.custModalLabel}>
              Số điện thoại
            </label>
            <input
              type="text"
              className={`form-input ${styles.custModalInput}`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại..."
            />
          </div>
          <div className={styles.custModalFooter}>
            <button
              type="button"
              className={`btn btn-secondary ${styles.btnPadding}`}
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${styles.btnPadding}`}
            >
              Lưu khách hàng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
