import React from "react";

export function DailyTurns() {
  return (
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
  );
}
