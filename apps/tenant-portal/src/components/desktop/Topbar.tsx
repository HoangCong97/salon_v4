import React from "react";
import { useAuthStore, UserRole } from "../../store/useAuthStore";

export default function Topbar() {
  const { user, branches, currentBranchId, setBranch, setRole, logout } = useAuthStore();

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBranch(e.target.value);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as UserRole);
  };

  if (!user) return null;

  return (
    <div
      className="glass"
      style={{
        height: "70px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: "1px solid var(--border-color)",
        flexShrink: 0,
      }}
    >
      {/* Branch Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "18px" }}>🏢</span>
        <select
          value={currentBranchId || ""}
          onChange={handleBranchChange}
          style={{
            border: "1px solid var(--border-color)",
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            background: "white",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
            color: "var(--text-primary)",
          }}
        >
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Right Controls: Notification, Profile, Role Switcher */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Test Tool: Role Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "hsl(210, 40%, 96%)", padding: "6px 12px", borderRadius: "var(--radius-sm)" }}>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>Test Role:</span>
          <select
            value={user.role}
            onChange={handleRoleChange}
            style={{
              background: "transparent",
              border: "none",
              fontWeight: "bold",
              fontSize: "12px",
              cursor: "pointer",
              color: "var(--color-primary)",
            }}
          >
            <option value="ADMIN">ADMIN (PC)</option>
            <option value="MANAGER">MANAGER (PC)</option>
            <option value="CASHIER">CASHIER (PC)</option>
            <option value="EMPLOYEE">EMPLOYEE (Mobile-first)</option>
          </select>
        </div>

        {/* MOCK notification button */}
        <button style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", position: "relative" }}>
          🔔
          <span style={{ position: "absolute", top: "-2px", right: "-2px", width: "8px", height: "8px", background: "var(--color-danger)", borderRadius: "50%" }}></span>
        </button>

        {/* Divider */}
        <div style={{ width: "1px", height: "24px", background: "var(--border-color)" }}></div>

        {/* User Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src={user.avatar}
            alt={user.name}
            style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: "600", fontSize: "14px" }}>{user.name}</span>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "500" }}>{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
