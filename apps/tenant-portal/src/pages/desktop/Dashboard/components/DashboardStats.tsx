import React from "react";

export function DashboardStats() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Doanh thu hôm nay</span>
          <span className="badge badge-success">+12.5%</span>
        </div>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "var(--color-success)" }}>4,850,000đ</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>Thanh toán qua POS & Chuyển khoản</p>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Lịch hẹn hôm nay</span>
          <span className="badge badge-primary">18 Lịch</span>
        </div>
        <h2 style={{ fontSize: "28px", fontWeight: "700" }}>12 / 18</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>12 khách đã hoàn thành dịch vụ</p>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Nhân sự trong ca</span>
          <span className="badge badge-info">Đủ thợ</span>
        </div>
        <h2 style={{ fontSize: "28px", fontWeight: "700" }}>6 / 8</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>6 thợ đang thực hiện dịch vụ</p>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Hết hàng cảnh báo</span>
          <span className="badge badge-danger">Cần nhập</span>
        </div>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "var(--color-danger)" }}>3</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>3 sản phẩm dầu gội sắp hết trong kho</p>
      </div>
    </div>
  );
}
