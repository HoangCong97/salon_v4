import React, { useState } from "react";
import { Printer } from "lucide-react";
import { formatCurrencyVND } from "@salon/shared-utils";

import { Modal } from "../../../components/desktop/ui/Modal";
import { Button } from "../../../components/desktop/ui/Button";
import { POSReceiptModal } from "../POS/POSReceiptModal";

import { Invoice, Staff, Customer, Branch } from "./types";

import styles from "./Invoices.module.css";

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  activeStaff: Staff[];
  customers: Customer[];
  branches: Branch[];
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
  const receiptItems = invoice.items?.map((item) => {
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
        <div className={styles.modalBody}>
          {/* Metadata Grid */}
          <div className={styles.metaGrid}>
            <div>
              <span className={styles.metaLabel}>KHÁCH HÀNG</span>
              <strong className={styles.metaValueBold}>{customerName}</strong>
              {customerPhone && <span className={styles.metaValueMuted}>SĐT: {customerPhone}</span>}
            </div>
            <div>
              <span className={styles.metaLabel}>THU NGÂN</span>
              <strong className={styles.metaValueBold}>{invoice.cashier?.name || "Thu ngân"}</strong>
            </div>
            <div>
              <span className={styles.metaLabel}>THỜI GIAN THANH TOÁN</span>
              <span className={styles.metaValueNormal}>{new Date(invoice.createdAt).toLocaleString("vi-VN")}</span>
            </div>
            <div>
              <span className={styles.metaLabel}>HÌNH THỨC THANH TOÁN</span>
              <span className={invoice.paymentMethod === "CASH" ? styles.metaValuePaymentCash : styles.metaValuePaymentTransfer}>
                {invoice.paymentMethod === "CASH" ? "Tiền mặt (CASH)" : "Chuyển khoản (BANK_TRANSFER)"}
              </span>
            </div>
          </div>

          {/* Items table */}
          <div>
            <span className={styles.sectionTitle}>
              DANH SÁCH MẶT HÀNG
            </span>
            <div className={`data-table-container ${styles.itemsTableContainer}`}>
              <table className={`data-table ${styles.itemsTable}`}>
                <thead>
                  <tr>
                    <th>Tên dịch vụ/sản phẩm</th>
                    <th className={styles.itemsThCenter}>Số lượng</th>
                    <th>Thợ gán lượt</th>
                    <th className={styles.itemsThRight}>Đơn giá</th>
                    <th className={styles.itemsThRight}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, idx) => {
                    const sId = item.staffId || item.stylist?.id;
                    const staffMember = activeStaff.find((s) => s.id === sId);
                    return (
                      <tr key={idx}>
                        <td className={styles.itemsTdBold}>{item.name}</td>
                        <td className={styles.itemsTdCenter}>{item.quantity}</td>
                        <td>{staffMember ? staffMember.name.split("(")[0] : "Không gán"}</td>
                        <td className={styles.itemsTdRight}>{formatCurrencyVND(item.price)}</td>
                        <td className={styles.itemsTdRightBold}>{formatCurrencyVND(item.price * item.quantity)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculations Summary */}
          <div className={styles.calcSummary}>
            <div className={styles.calcRow}>
              <span className={styles.calcLabel}>Tổng cộng:</span>
              <span className={styles.calcVal}>{formatCurrencyVND(invoice.totalPrice || invoice.finalAmount + (invoice.discountAmount || 0))}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className={styles.calcDiscount}>
                <span>Giảm giá:</span>
                <span className={styles.calcVal}>-{formatCurrencyVND(invoice.discountAmount)}</span>
              </div>
            )}
            <div className={styles.calcTotal}>
              <span className={styles.calcTotalLabel}>THÀNH TIỀN:</span>
              <span className={styles.calcTotalVal}>{formatCurrencyVND(invoice.finalAmount)}</span>
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
