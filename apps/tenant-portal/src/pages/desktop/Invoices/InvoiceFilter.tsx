import React from "react";

interface InvoiceFilterProps {
  startDate: string;
  setStartDate: (s: string) => void;
  endDate: string;
  setEndDate: (s: string) => void;
  selectedStaffId: string;
  setSelectedStaffId: (s: string) => void;
  selectedCustomerId: string;
  setSelectedCustomerId: (s: string) => void;
  paymentMethod: string;
  setPaymentMethod: (s: string) => void;
  orderSource: string;
  setOrderSource: (s: string) => void;
  activeStaff: any[];
  customers: any[];
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
    <div className="card" style={{ padding: "16px", display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", alignItems: "center" }}>
      {/* Date Start */}
      <div>
        <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "4px" }}>
          TỪ NGÀY
        </label>
        <input
          type="date"
          className="form-input"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
        />
      </div>

      {/* Date End */}
      <div>
        <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "4px" }}>
          ĐẾN NGÀY
        </label>
        <input
          type="date"
          className="form-input"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ width: "100%", height: "36px", fontSize: "12.5px" }}
        />
      </div>

      {/* Staff Filter */}
      <div>
        <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "4px" }}>
          NHÂN VIÊN thực hiện
        </label>
        <select
          className="form-input"
          value={selectedStaffId}
          onChange={(e) => setSelectedStaffId(e.target.value)}
          style={{ width: "100%", height: "36px", fontSize: "12.5px", fontWeight: "500", padding: "0 8px" }}
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
        <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "4px" }}>
          KHÁCH HÀNG
        </label>
        <select
          className="form-input"
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          style={{ width: "100%", height: "36px", fontSize: "12.5px", fontWeight: "500", padding: "0 8px" }}
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
        <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "4px" }}>
          HÌNH THỨC TT
        </label>
        <select
          className="form-input"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={{ width: "100%", height: "36px", fontSize: "12.5px", fontWeight: "500", padding: "0 8px" }}
        >
          <option value="ALL">Tất cả hình thức</option>
          <option value="CASH">Tiền mặt</option>
          <option value="BANK_TRANSFER">Chuyển khoản (QR)</option>
        </select>
      </div>

      {/* Order Source Filter */}
      <div>
        <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "4px" }}>
          NGUỒN ĐƠN
        </label>
        <select
          className="form-input"
          value={orderSource}
          onChange={(e) => setOrderSource(e.target.value)}
          style={{ width: "100%", height: "36px", fontSize: "12.5px", fontWeight: "500", padding: "0 8px" }}
        >
          <option value="ALL">Tất cả nguồn đơn</option>
          <option value="WALK_IN">Tại quầy (POS)</option>
          <option value="BOOKING">Đặt trước (Booking)</option>
        </select>
      </div>
    </div>
  );
};
