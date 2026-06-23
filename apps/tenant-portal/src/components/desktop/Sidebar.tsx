import React from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { user } = useAuthStore();

  const menuItems = [
    { path: "/", label: "Tổng quan", icon: "📊", roles: ["ADMIN", "MANAGER", "CASHIER"] },
    { path: "/pos", label: "Bán hàng POS", icon: "🛒", roles: ["ADMIN", "MANAGER", "CASHIER"] },
    { path: "/staff", label: "Nhân sự", icon: "👥", roles: ["ADMIN", "MANAGER"] },
    { path: "/reports", label: "Báo cáo", icon: "📈", roles: ["ADMIN", "MANAGER"] },
  ];

  const allowedItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div
      className="dark-glass"
      style={{
        width: collapsed ? "68px" : "260px",
        flexShrink: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          height: "70px",
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0" : "0 20px",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "24px" }}>✂️</span>
            <span style={{ fontWeight: "700", color: "var(--text-on-dark)", fontSize: "16px", letterSpacing: "0.5px" }}>
              SALON PORTAL
            </span>
          </div>
        )}
        {collapsed && <span style={{ fontSize: "24px" }}>✂️</span>}
      </div>

      {/* Navigation Links */}
      <div style={{ flexGrow: 1, padding: "16px 8px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {allowedItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: collapsed ? "0" : "12px",
              justifyContent: collapsed ? "center" : "flex-start",
              padding: "12px",
              borderRadius: "var(--radius-sm)",
              color: isActive ? "white" : "rgba(255, 255, 255, 0.65)",
              background: isActive ? "var(--color-primary)" : "transparent",
              transition: "all 0.15s ease",
              fontWeight: isActive ? "600" : "500",
            })}
          >
            <span style={{ fontSize: "18px" }}>{item.icon}</span>
            {!collapsed && <span style={{ fontSize: "14px" }}>{item.label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          textAlign: "center",
        }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "none",
            color: "white",
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            width: "100%",
            fontSize: "12px",
            fontWeight: "500",
            transition: "all 0.15s ease",
          }}
        >
          {collapsed ? "»" : "« Thu gọn"}
        </button>
      </div>
    </div>
  );
}
