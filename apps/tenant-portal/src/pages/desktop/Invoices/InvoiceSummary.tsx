import React from "react";
import { DollarSign, CreditCard, Receipt, TrendingUp } from "lucide-react";
import { formatCurrencyVND } from "@salon/shared-utils";

import styles from "./Invoices.module.css";

interface InvoiceSummaryProps {
  totalRevenue: number;
  cashRevenue: number;
  transferRevenue: number;
  invoiceCount: number;
}

export const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  totalRevenue,
  cashRevenue,
  transferRevenue,
  invoiceCount,
}) => {
  return (
    <div className={styles.summaryGrid}>
      {/* Total Revenue card */}
      <div className={`card ${styles.summaryCard}`}>
        <div className={`${styles.iconWrapper} ${styles.iconRevenue}`}>
          <TrendingUp size={24} />
        </div>
        <div>
          <span className={styles.cardLabel}>TỔNG DOANH THU</span>
          <strong className={`${styles.cardValue} ${styles.valueRevenue}`}>
            {formatCurrencyVND(totalRevenue)}
          </strong>
        </div>
      </div>

      {/* Cash card */}
      <div className={`card ${styles.summaryCard}`}>
        <div className={`${styles.iconWrapper} ${styles.iconCash}`}>
          <DollarSign size={24} />
        </div>
        <div>
          <span className={styles.cardLabel}>TIỀN MẶT (KÉT CÁT)</span>
          <strong className={`${styles.cardValue} ${styles.valueCash}`}>
            {formatCurrencyVND(cashRevenue)}
          </strong>
        </div>
      </div>

      {/* Transfer card */}
      <div className={`card ${styles.summaryCard}`}>
        <div className={`${styles.iconWrapper} ${styles.iconTransfer}`}>
          <CreditCard size={24} />
        </div>
        <div>
          <span className={styles.cardLabel}>CHUYỂN KHOẢN (QR)</span>
          <strong className={`${styles.cardValue} ${styles.valueTransfer}`}>
            {formatCurrencyVND(transferRevenue)}
          </strong>
        </div>
      </div>

      {/* Orders count card */}
      <div className={`card ${styles.summaryCard}`}>
        <div className={`${styles.iconWrapper} ${styles.iconCount}`}>
          <Receipt size={24} />
        </div>
        <div>
          <span className={styles.cardLabel}>SỐ LƯỢNG HÓA ĐƠN</span>
          <strong className={`${styles.cardValue} ${styles.valueCount}`}>
            {invoiceCount} hoá đơn
          </strong>
        </div>
      </div>
    </div>
  );
};

