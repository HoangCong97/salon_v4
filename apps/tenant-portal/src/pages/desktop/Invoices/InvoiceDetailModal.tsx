import React, { useState } from "react";
import { formatCurrencyVND } from "@salon/shared-utils";
import { Printer } from "lucide-react";
import { POSReceiptModal } from "../POS/POSReceiptModal";
import { Button } from "../../../components/desktop/ui/Button";
import { Modal } from "../../../components/desktop/ui/Modal";

interface InvoiceDetailModalProps {
  invoice: any | null;
  onClose: () => void;
  activeStaff: any[];
  customers: any[];
  branches: any[];
  currentBranchId: string | null;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  onClose,
  activeStaff,
  customers,
  branches,
  currentBranchId,
}) => {
  const [showPrintModal, setShowPrintModal] = useState(false);

  if (!invoice) return null;

  const customerObj = customers.find((c) => c.id === invoice.customerId);
  const customerName = customerObj ? customerObj.name : (invoice.customer?.name || "Khách vãng lai");
  const customerPhone = customerObj ? customerObj.phone : (invoice.customer?.phone || "");

  // Normalize items for printing receipt
  const receiptItems = invoice.items?.map((item: any) => {
    const sId = item.staffId || item.stylist?.id;
    const staffMember = activeStaff.find((s) => s.id === sId);
    return {
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      stylist: staffMember ? { name: staffMember.name } : null,
    };
  });

  const receiptData = {
    id: invoice.id,
    createdAt: invoice.createdAt,
    cashier: invoice.cashier || { name: "Thu ngân" },
    customer: { name: customerName, phone: customerPhone },
    items: receiptItems,
    totalPrice: invoice.totalPrice || invoice.finalAmount + (invoice.discountAmount || 0),
    discountAmount: invoice.discountAmount || 0,
    finalAmount: invoice.finalAmount,
    paymentMethod: invoice.paymentMethod,
  };

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose}>
        Đóng
      </Button>
      <Button
        variant="primary"
        onClick={() => setShowPrintModal(true)}
        icon={<Printer size={14} />}
      >
        In hoá đơn (HĐ nhiệt)
      </Button>
    </>
  );

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        title={`Chi tiết hoá đơn #${invoice.id}`}
        size="md"
        footer={modalFooter}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Metadata Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <span style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>KHÁCH HÀNG</span>
              <strong style={{ fontSize: "13.5px" }}>{customerName}</strong>
              {customerPhone && <span style={{ display: "block", fontSize: "12px", color: "var(--text-muted)" }}>SĐT: {customerPhone}</span>}
            </div>
            <div>
              <span style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>THU NGÂN</span>
              <strong style={{ fontSize: "13.5px" }}>{invoice.cashier?.name || "Thu ngân"}</strong>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>THỜI GIAN THANH TOÁN</span>
              <span style={{ fontSize: "12.5px" }}>{new Date(invoice.createdAt).toLocaleString("vi-VN")}</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)" }}>HÌNH THỨC THANH TOÁN</span>
              <span style={{ fontSize: "12.5px", fontWeight: "600", color: invoice.paymentMethod === "CASH" ? "#10b981" : "#3b82f6" }}>
                {invoice.paymentMethod === "CASH" ? "Tiền mặt (CASH)" : "Chuyển khoản (BANK_TRANSFER)"}
              </span>
            </div>
          </div>

          {/* Items table */}
          <div>
            <span style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "8px" }}>
              DANH SÁCH MẶT HÀNG
            </span>
            <div className="data-table-container" style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}>
              <table className="data-table" style={{ width: "100%", fontSize: "12px" }}>
                <thead>
                  <tr>
                    <th>Tên dịch vụ/sản phẩm</th>
                    <th style={{ textAlign: "center" }}>Số lượng</th>
                    <th>Thợ gán lượt</th>
                    <th style={{ textAlign: "right" }}>Đơn giá</th>
                    <th style={{ textAlign: "right" }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item: any, idx: number) => {
                    const sId = item.staffId || item.stylist?.id;
                    const staffMember = activeStaff.find((s) => s.id === sId);
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: "700" }}>{item.name}</td>
                        <td style={{ textAlign: "center" }}>{item.quantity}</td>
                        <td>{staffMember ? staffMember.name.split("(")[0] : "Không gán"}</td>
                        <td style={{ textAlign: "right" }}>{formatCurrencyVND(item.price)}</td>
                        <td style={{ textAlign: "right", fontWeight: "600" }}>{formatCurrencyVND(item.price * item.quantity)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculations Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "16px", width: "100%", alignItems: "flex-end" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "240px", fontSize: "12.5px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Tổng cộng:</span>
              <span style={{ fontWeight: "600" }}>{formatCurrencyVND(invoice.totalPrice || invoice.finalAmount + (invoice.discountAmount || 0))}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", width: "240px", fontSize: "12.5px", color: "var(--color-danger)" }}>
                <span>Giảm giá:</span>
                <span style={{ fontWeight: "600" }}>-{formatCurrencyVND(invoice.discountAmount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", width: "240px", fontSize: "14px", fontWeight: "800", borderTop: "1px dashed var(--border-color)", paddingTop: "8px" }}>
              <span style={{ color: "var(--color-primary)" }}>THÀNH TIỀN:</span>
              <span style={{ color: "var(--color-primary)" }}>{formatCurrencyVND(invoice.finalAmount)}</span>
            </div>
          </div>
        </div>
      </Modal>

      {showPrintModal && (
        <POSReceiptModal
          showReceipt={showPrintModal}
          setShowReceipt={setShowPrintModal}
          receiptData={receiptData}
          branches={branches}
          currentBranchId={currentBranchId}
        />
      )}
    </>
  );
};
