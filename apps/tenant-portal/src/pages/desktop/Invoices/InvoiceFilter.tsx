import React, { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import { PaymentMethod, OrderSource, Staff, Customer } from "./types";
import styles from "./Invoices.module.css";

interface SegmentDateInputProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  disabled?: boolean;
}

const SegmentDateInput: React.FC<SegmentDateInputProps> = ({ value, onChange, disabled }) => {
  const [localDay, setLocalDay] = useState("");
  const [localMonth, setLocalMonth] = useState("");
  const [localYear, setLocalYear] = useState("");

  useEffect(() => {
    if (value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        setLocalYear(parts[0]);
        setLocalMonth(parts[1]);
        setLocalDay(parts[2]);
      }
    } else {
      setLocalYear("");
      setLocalMonth("");
      setLocalDay("");
    }
  }, [value]);

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    setLocalDay(val);
    if (val.length === 2 && val !== "00") {
      const next = e.target.nextElementSibling?.nextElementSibling as HTMLInputElement;
      if (next) next.focus();
    }
    triggerChange(val, localMonth, localYear);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    setLocalMonth(val);
    if (val.length === 2 && val !== "00") {
      const next = e.target.nextElementSibling?.nextElementSibling as HTMLInputElement;
      if (next) next.focus();
    }
    triggerChange(localDay, val, localYear);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setLocalYear(val);
    triggerChange(localDay, localMonth, val);
  };

  const triggerChange = (d: string, m: string, y: string) => {
    if (d.length === 2 && m.length === 2 && y.length === 4) {
      const dateStr = `${y}-${m}-${d}`;
      const timestamp = Date.parse(dateStr);
      if (!isNaN(timestamp)) {
        onChange(dateStr);
      }
    }
  };

  return (
    <div className={styles.segmentDateInput}>
      <input
        type="text"
        placeholder="DD"
        value={localDay}
        disabled={disabled}
        onChange={handleDayChange}
        className={styles.segmentUnit}
        onClick={(e) => (e.target as HTMLInputElement).select()}
      />
      <span className={styles.segmentDivider}>-</span>
      <input
        type="text"
        placeholder="MM"
        value={localMonth}
        disabled={disabled}
        onChange={handleMonthChange}
        className={styles.segmentUnit}
        onClick={(e) => (e.target as HTMLInputElement).select()}
      />
      <span className={styles.segmentDivider}>-</span>
      <input
        type="text"
        placeholder="YYYY"
        value={localYear}
        disabled={disabled}
        onChange={handleYearChange}
        className={styles.segmentUnitYear}
        onClick={(e) => (e.target as HTMLInputElement).select()}
      />
    </div>
  );
};

interface InvoiceFilterProps {
  startDate: string;
  setStartDate: (s: string) => void;
  endDate: string;
  setEndDate: (s: string) => void;
  datePreset: "today" | "week" | "month" | "custom";
  setDatePreset: (preset: "today" | "week" | "month" | "custom") => void;
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
  datePreset,
  setDatePreset,
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
    <div className={styles.filterCard}>
      {/* Date Range Merged Group */}
      <div className={styles.dateRangeGroup}>
        <div className={styles.presetSelectWrapper}>
          <label className={styles.selectLabel}>THỜI GIAN</label>
          <select
            className={`form-input ${styles.selectElement}`}
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value as any)}
          >
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="custom">Tùy chỉnh</option>
          </select>
        </div>

        <div className={styles.singleRangeContainer}>
          <label className={styles.selectLabel}>KHOẢNG THỜI GIAN</label>
          <div className={`${styles.singleRangeInputWrapper} ${datePreset !== "custom" ? styles.disabled : ""}`}>
            <CalendarDays size={14} className={styles.calendarIcon} />
            <SegmentDateInput
              value={startDate}
              disabled={datePreset !== "custom"}
              onChange={setStartDate}
            />
            <span className={styles.rangeDivider}>-</span>
            <SegmentDateInput
              value={endDate}
              disabled={datePreset !== "custom"}
              onChange={setEndDate}
            />
          </div>
        </div>
      </div>

      {/* Staff Filter */}
      <div>
        <label className={styles.selectLabel}>NHÂN VIÊN THỰC HIỆN</label>
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

