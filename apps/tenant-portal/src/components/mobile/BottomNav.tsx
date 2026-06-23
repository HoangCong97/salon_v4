import React from "react";
import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const navItems = [
    { path: "/", label: "Lịch hẹn", icon: "📅" },
    { path: "/shifts", label: "Chấm công", icon: "⏰" },
    { path: "/profile", label: "Cá nhân", icon: "👤" },
  ];

  return (
    <div
      className="glass"
      style={{
        height: "64px",
        display: "flex",
        borderTop: "1px solid var(--border-color)",
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        zIndex: 100,
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.03)",
      }}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
            transition: "all 0.15s ease",
            fontWeight: isActive ? "600" : "500",
            fontSize: "11px",
            padding: "8px 0",
          })}
        >
          <span style={{ fontSize: "20px" }}>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
