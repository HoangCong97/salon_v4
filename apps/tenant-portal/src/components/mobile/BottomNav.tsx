import React from "react";
import { NavLink } from "react-router-dom";
import { Calendar, Receipt, Clock, User } from "lucide-react";

export default function BottomNav() {
  const navItems = [
    { path: "/", label: "Lịch hẹn", icon: Calendar },
    { path: "/invoices", label: "Hóa đơn", icon: Receipt },
    { path: "/shifts", label: "Chấm công", icon: Clock },
    { path: "/profile", label: "Cá nhân", icon: User },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      onTouchMove={(e) => e.stopPropagation()}
      style={{
        flexShrink: 0,
        height: "calc(60px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
        display: "flex",
        alignItems: "stretch",
        borderTop: "1px solid rgba(255, 255, 255, 0.12)",
        width: "100%",
        zIndex: 100,
        boxShadow: "0 -4px 16px rgba(15, 23, 42, 0.25)",
        boxSizing: "border-box",
        background: "linear-gradient(180deg, #1e3a8a 0%, #172554 100%)",
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              color: isActive ? "#38bdf8" : "rgba(191, 219, 254, 0.7)",
              background: isActive ? "rgba(56, 189, 248, 0.15)" : "transparent",
              borderRadius: "10px",
              margin: "4px 6px",
              transition: "all 0.2s ease",
              fontWeight: isActive ? "600" : "500",
              fontSize: "11px",
              padding: "4px 0",
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={19} strokeWidth={isActive ? 2.3 : 1.8} />
                <span style={{ lineHeight: 1 }}>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
