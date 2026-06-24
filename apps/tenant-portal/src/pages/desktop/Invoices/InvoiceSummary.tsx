import React from "react";
import { formatCurrencyVND } from "@salon/shared-utils";
import { DollarSign, CreditCard, Receipt, TrendingUp } from "lucide-react";

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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", width: "100%" }}>
      {/* Total Revenue card */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "50%", background: "var(--color-primary-light)", color: "var(--color-primary)", flexShrink: 0 }}>
          <TrendingUp size={24} />
        </div>
        <div>
          <span style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>TỔNG DOANH THU</span>
          <strong style={{ fontSize: "20px", fontWeight: "800", color: "var(--color-primary)", display: "block", marginTop: "4px" }}>
            {formatCurrencyVND(totalRevenue)}
          </strong>
        </div>
      </div>

      {/* Cash card */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "50%", background: "#ecfdf5", color: "#10b981", flexShrink: 0 }}>
          <DollarSign size={24} />
        </div>
        <div>
          <span style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>TIỀN MẶT (KÉT CÁT)</span>
          <strong style={{ fontSize: "20px", fontWeight: "800", color: "#10b981", display: "block", marginTop: "4px" }}>
            {formatCurrencyVND(cashRevenue)}
          </strong>
        </div>
      </div>

      {/* Transfer card */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "50%", background: "#eff6ff", color: "#3b82f6", flexShrink: 0 }}>
          <CreditCard size={24} />
        </div>
        <div>
          <span style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>CHUYỂN KHOẢN (QR)</span>
          <strong style={{ fontSize: "20px", fontWeight: "800", color: "#3b82f6", display: "block", marginTop: "4px" }}>
            {formatCurrencyVND(transferRevenue)}
          </strong>
        </div>
      </div>

      {/* Orders count card */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "50%", background: "#faf5ff", color: "#8b5cf6", flexShrink: 0 }}>
          <Receipt size={24} />
        </div>
        <div>
          <span style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>SỐ LƯỢNG HÓA ĐƠN</span>
          <strong style={{ fontSize: "20px", fontWeight: "800", color: "#8b5cf6", display: "block", marginTop: "4px" }}>
            {invoiceCount} hoá đơn
          </strong>
        </div>
      </div>
    </div>
  );
};
