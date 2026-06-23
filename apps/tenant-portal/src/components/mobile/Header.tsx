import React from "react";
import { useAuthStore } from "../../store/useAuthStore";

export default function Header() {
  const { user, branches, currentBranchId } = useAuthStore();

  const currentBranch = branches.find((b) => b.id === currentBranchId);
  const todayStr = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="glass"
      style={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        borderBottom: "1px solid var(--border-color)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>
          {currentBranch ? currentBranch.name : "Salon App"}
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
          {todayStr}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: "600", fontSize: "13px" }}>Chào, {user?.name.split(" ").pop()}</div>
          <div style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: "500" }}>{user?.role}</div>
        </div>
        <img
          src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
          alt={user?.name}
          style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
        />
      </div>
    </div>
  );
}
