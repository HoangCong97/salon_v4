import React from "react";

export default function Schedule() {
  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Lịch hẹn của tôi</h2>
        <span className="badge badge-primary">Hôm nay</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Booking Card 1 */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: "4px solid var(--color-success)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "700", fontSize: "16px" }}>09:00 AM</span>
            <span className="badge badge-success">Đã hoàn thành</span>
          </div>
          <div>
            <h4 style={{ fontWeight: "600" }}>Cắt tóc nam Classic</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Khách hàng: <strong>Nguyễn Văn Hùng</strong></p>
            <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>Ghi chú: Khách muốn cạo trắng gáy sát.</p>
          </div>
        </div>

        {/* Booking Card 2 */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: "4px solid var(--color-info)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "700", fontSize: "16px" }}>10:30 AM</span>
            <span className="badge badge-info">Đang làm</span>
          </div>
          <div>
            <h4 style={{ fontWeight: "600" }}>Uốn tóc xoăn Hàn Quốc</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Khách hàng: <strong>Lê Hoàng Nam</strong></p>
            <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>Ghi chú: Uốn phồng chân tóc nhẹ nhàng.</p>
          </div>
        </div>

        {/* Booking Card 3 */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: "4px solid var(--color-warning)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "700", fontSize: "16px" }}>02:00 PM</span>
            <span className="badge badge-warning">Chờ thợ</span>
          </div>
          <div>
            <h4 style={{ fontWeight: "600" }}>Nhuộm màu thời trang</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Khách hàng: <strong>Nguyễn Thị Mai</strong></p>
            <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>Ghi chú: Màu nâu hạt dẻ ấm áp.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
