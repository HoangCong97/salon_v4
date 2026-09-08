import React from "react";
import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const navItems = [
    { path: "/", label: "Lịch hẹn", icon: "📅" },
    { path: "/invoices", label: "Hóa đơn", icon: "🧾" },
    { path: "/shifts", label: "Chấm công", icon: "⏰" },
    { path: "/profile", label: "Cá nhân", icon: "👤" },
  ];

  return (
    <nav
      className="glass mobile-bottom-nav"
      onTouchMove={(e) => e.stopPropagation()}
      style={{
        flexShrink: 0,
        height: "calc(60px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
        display: "flex",
        alignItems: "stretch",
        borderTop: "1px solid var(--border-color)",
        width: "100%",
        zIndex: 100,
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.03)",
        boxSizing: "border-box",
        background: "rgba(255, 255, 255, 0.94)",
      }}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
            transition: "all 0.15s ease",
            fontWeight: isActive ? "600" : "500",
            fontSize: "11px",
            padding: "6px 0",
          })}
        >
          <span style={{ fontSize: "20px", lineHeight: 1 }}>{item.icon}</span>
          <span style={{ lineHeight: 1 }}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
