import React from "react";

export default function ShiftTasks() {
  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Chấm công & Xoay tua</h2>

      {/* Check In Widget */}
      <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "24px" }}>
        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--color-primary)", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 0 20px var(--border-focus)", fontWeight: "bold" }}>
          <span>IN / OUT</span>
        </div>
        <div style={{ textAlign: "center" }}>
          <h4 style={{ fontWeight: "600" }}>Ca làm việc: Ca Sáng (08:30 - 14:30)</h4>
          <p style={{ color: "var(--text-success)", fontSize: "13px", fontWeight: "600", marginTop: "4px" }}>✓ Đã Check-in lúc: 08:24 AM</p>
        </div>
      </div>

      {/* Turn Queue Widget */}
      <div className="card">
        <h3 className="card-title">Hàng đợi xoay tua ngày</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "12px", fontSize: "13px" }}>
          Thứ tự nhận khách Walk-in tiếp theo tại chi nhánh.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderRadius: "8px", background: "var(--color-primary-light)", borderLeft: "4px solid var(--color-primary)" }}>
            <span style={{ fontWeight: "600" }}>Bạn (Lượt tiếp theo)</span>
            <span className="badge badge-primary">Số 1</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderRadius: "8px", background: "hsl(210, 40%, 96%)" }}>
            <span>Thợ B (Stylist)</span>
            <span className="badge badge-secondary">Số 2</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderRadius: "8px", background: "hsl(210, 40%, 96%)" }}>
            <span>Thợ C (Nail Tech)</span>
            <span className="badge badge-secondary">Số 3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
