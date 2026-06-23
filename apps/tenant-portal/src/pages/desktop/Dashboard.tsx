import React from "react";

export default function Dashboard() {
  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginTop: "12px" }}>
        <div className="card" style={{ minHeight: "300px" }}>
          <h3 className="card-title">Hoạt động đặt lịch gần đây</h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Dịch vụ</th>
                  <th>Kỹ thuật viên</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Nguyễn Văn Hùng</strong></td>
                  <td>Cắt tóc nam styling</td>
                  <td>Thợ A (Stylist)</td>
                  <td>09:00 AM</td>
                  <td><span className="badge badge-success">Đã hoàn thành</span></td>
                </tr>
                <tr>
                  <td><strong>Trần Thị Lan</strong></td>
                  <td>Nail Art & Gel</td>
                  <td>Thợ C (Nail Tech)</td>
                  <td>09:30 AM</td>
                  <td><span className="badge badge-info">Đang làm</span></td>
                </tr>
                <tr>
                  <td><strong>Lê Hoàng Nam</strong></td>
                  <td>Uốn Hàn Quốc</td>
                  <td>Thợ B (Stylist)</td>
                  <td>10:30 AM</td>
                  <td><span className="badge badge-warning">Chờ xác nhận</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Hàng đợi xoay tua thợ (Daily Turns)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "8px", background: "hsl(210, 40%, 96%)" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--color-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>1</div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontWeight: "600" }}>Thợ B (Stylist)</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Đã phục vụ: 2 lượt</div>
              </div>
              <span className="badge badge-success">Sẵn sàng</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "8px", background: "hsl(210, 40%, 96%)" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "hsl(215, 10%, 65%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>2</div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontWeight: "600" }}>Thợ A (Stylist)</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Đã phục vụ: 3 lượt</div>
              </div>
              <span className="badge badge-info">Đang làm</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "8px", background: "hsl(210, 40%, 96%)" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "hsl(215, 10%, 65%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>3</div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontWeight: "600" }}>Thợ C (Nail)</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Đã phục vụ: 1 lượt</div>
              </div>
              <span className="badge badge-info">Đang làm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
