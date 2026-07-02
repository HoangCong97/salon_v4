import React from "react";
import { Input } from "../../../components/desktop/ui/Input";
import { PaymentMethod, OrderSource, Staff, Customer } from "./types";
import styles from "./Invoices.module.css";

interface InvoiceFilterProps {
  startDate: string;
  setStartDate: (s: string) => void;
  endDate: string;
  setEndDate: (s: string) => void;
  selectedStaffId: string;
  setSelectedStaffId: (s: string) => void;
  selectedCustomerId: string;
  setSelectedCustomerId: (s: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (s: PaymentMethod) => void;
  orderSource: OrderSource;
  setOrderSource: (s: OrderSource) => void;
  activeStaff: Staff[];
  customers: Customer[];
}

export const InvoiceFilter: React.FC<InvoiceFilterProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedStaffId,
  setSelectedStaffId,
  selectedCustomerId,
  setSelectedCustomerId,
  paymentMethod,
  setPaymentMethod,
  orderSource,
  setOrderSource,
  activeStaff,
  customers,
}) => {
  return (
    <div className={`card ${styles.filterCard}`}>
      {/* Date Start */}
      <div>
        <Input
          label="TỪ NGÀY"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      {/* Date End */}
      <div>
        <Input
          label="ĐẾN NGÀY"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      {/* Staff Filter */}
      <div>
        <label className={styles.selectLabel}>NHÂN VIÊN thực hiện</label>
        <select
          className={`form-input ${styles.selectElement}`}
          value={selectedStaffId}
          onChange={(e) => setSelectedStaffId(e.target.value)}
        >
          <option value="ALL">Tất cả nhân sự</option>
          {activeStaff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name.split("(")[0]}
            </option>
          ))}
        </select>
      </div>

      {/* Customer Filter */}
      <div>
        <label className={styles.selectLabel}>KHÁCH HÀNG</label>
        <select
          className={`form-input ${styles.selectElement}`}
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
        >
          <option value="ALL">Tất cả khách hàng</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.phone ? `(${c.phone})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Payment Method Filter */}
      <div>
        <label className={styles.selectLabel}>HÌNH THỨC TT</label>
        <select
          className={`form-input ${styles.selectElement}`}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
        >
          <option value="ALL">Tất cả hình thức</option>
          <option value="CASH">Tiền mặt</option>
          <option value="BANK_TRANSFER">Chuyển khoản (QR)</option>
        </select>
      </div>

      {/* Order Source Filter */}
      <div>
        <label className={styles.selectLabel}>NGUỒN ĐƠN</label>
        <select
          className={`form-input ${styles.selectElement}`}
          value={orderSource}
          onChange={(e) => setOrderSource(e.target.value as OrderSource)}
        >
          <option value="ALL">Tất cả nguồn đơn</option>
          <option value="WALK_IN">Tại quầy (POS)</option>
          <option value="BOOKING">Đặt trước (Booking)</option>
        </select>
      </div>
    </div>
  );
};

