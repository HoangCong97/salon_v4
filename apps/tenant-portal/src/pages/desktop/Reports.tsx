import React from "react";

export default function Reports() {
  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>Báo cáo doanh thu & Hiệu suất</h1>
        <p style={{ color: "var(--text-secondary)" }}>Phân tích xu hướng tài chính và giám sát hoạt động kinh doanh của chi nhánh.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div className="card">
          <h3 className="card-title">Doanh số theo hình thức thanh toán</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span>Chuyển khoản (Ví điện tử/Ngân hàng)</span>
                <strong>25,400,000đ (52%)</strong>
              </div>
              <div style={{ height: "8px", background: "hsl(210, 40%, 92%)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: "52%", height: "100%", background: "var(--color-primary)" }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span>Quẹt thẻ POS (Credit/Debit)</span>
                <strong>18,500,000đ (38%)</strong>
              </div>
              <div style={{ height: "8px", background: "hsl(210, 40%, 92%)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: "38%", height: "100%", background: "var(--color-info)" }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span>Tiền mặt (Két thu ngân)</span>
                <strong>4,950,000đ (10%)</strong>
              </div>
              <div style={{ height: "8px", background: "hsl(210, 40%, 92%)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: "10%", height: "100%", background: "var(--color-success)" }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Xếp hạng dịch vụ bán chạy nhất</h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên dịch vụ</th>
                  <th>Số lượt thực hiện</th>
                  <th>Tổng doanh thu</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cắt tóc nam Classic</td>
                  <td>142 lượt</td>
                  <td>17,040,000đ</td>
                </tr>
                <tr>
                  <td>Gội đầu dưỡng sinh</td>
                  <td>98 lượt</td>
                  <td>14,700,000đ</td>
                </tr>
                <tr>
                  <td>Uốn tóc xoăn Hàn Quốc</td>
                  <td>35 lượt</td>
                  <td>15,750,000đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
