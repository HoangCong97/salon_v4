import React from "react";

export const AttendanceLegend: React.FC = () => {
  return (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", justifyContent: "flex-start" }}>
      <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Chú giải:</span>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "500" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-danger)" }}></span>
        <span>Vắng mặt</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "500" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-warning)" }}></span>
        <span>Đi muộn</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "500" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "hsl(24, 95%, 50%)" }}></span>
        <span>Về sớm</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "500" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-info)" }}></span>
        <span>Ứng tiền (Chờ duyệt)</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "500" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "hsl(271, 81%, 56%)" }}></span>
        <span>Ứng tiền (Đã duyệt)</span>
      </div>
    </div>
  );
};
