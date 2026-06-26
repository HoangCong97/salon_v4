import React from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { LayoutDashboard, Store, Users, BarChart3, MapPin, Layers, Package, CalendarDays, Receipt, Contact } from "lucide-react";
import { Tooltip } from "./Tooltip";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { user, brandName, logoUrl } = useAuthStore();

  const menuItems = [
    { path: "/", label: "Tổng quan", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "CASHIER"] },
    { path: "/pos", label: "Bán hàng POS", icon: Store, roles: ["ADMIN", "MANAGER", "CASHIER"] },
    { path: "/invoices", label: "Lịch sử hóa đơn", icon: Receipt, roles: ["ADMIN", "MANAGER", "CASHIER"] },
    { path: "/customers", label: "Khách hàng", icon: Contact, roles: ["ADMIN", "MANAGER", "CASHIER"] },
    { path: "/branches", label: "Cơ sở & Chi nhánh", icon: MapPin, roles: ["ADMIN", "MANAGER"] },
    { path: "/services", label: "Danh mục dịch vụ", icon: Layers, roles: ["ADMIN", "MANAGER"] },
    { path: "/inventories", label: "Quản lý kho hàng", icon: Package, roles: ["ADMIN", "MANAGER"] },
    { path: "/staff", label: "Nhân sự", icon: Users, roles: ["ADMIN", "MANAGER"] },
    { path: "/shifts", label: "Lịch trực ca", icon: CalendarDays, roles: ["ADMIN", "MANAGER"] },
    { path: "/reports", label: "Báo cáo", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
  ];

  const allowedItems = menuItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  return (
    <div
      style={{
        width: collapsed ? "68px" : "260px",
        backgroundColor: "var(--bg-sidebar)",
        color: "var(--text-on-dark)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        height: "100vh",
        transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        zIndex: 50,
        borderRight: "1px solid rgba(255, 255, 255, 0.05)"
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          height: "70px",
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0" : "0 20px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          gap: "10px",
          overflow: "hidden",
          whiteSpace: "nowrap"
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-sm)",
              objectFit: "cover",
              flexShrink: 0
            }}
          />
        ) : (
          <div
            style={{
              backgroundColor: "var(--color-primary)",
              borderRadius: "var(--radius-sm)",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: "rotate(90deg)" }}
            >
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
          </div>
        )}
        {!collapsed && (
          <span
            title={brandName || "SALON Portal"}
            style={{
              fontWeight: 700,
              fontSize: "14px",
              letterSpacing: "0.5px",
              color: "var(--text-on-dark)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {brandName ? brandName.toUpperCase() : (
              <>
                SALON<span style={{ color: "var(--color-primary)" }}>Portal</span>
              </>
            )}
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <div style={{ flexGrow: 1, padding: "16px 8px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {allowedItems.map((item) => {
          const Icon = item.icon;
          const navLink = (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                borderRadius: "var(--radius-sm)",
                color: isActive ? "white" : "rgba(255, 255, 255, 0.7)",
                background: isActive ? "var(--color-primary)" : "transparent",
                transition: "all 0.15s ease",
                fontWeight: isActive ? "600" : "500",
                justifyContent: collapsed ? "center" : "flex-start",
                height: "44px",
                padding: "0 14px",
                position: "relative",
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} style={{ flexShrink: 0 }} />
                  {!collapsed && <span style={{ fontSize: "14px", whiteSpace: "nowrap" }}>{item.label}</span>}
                  {collapsed && isActive && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        width: "4px",
                        height: "20px",
                        backgroundColor: "white",
                        borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                      }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );

          return collapsed ? (
            <Tooltip key={item.path} content={item.label} position="right">
              {navLink}
            </Tooltip>
          ) : (
            navLink
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          textAlign: "center",
        }}
      >
        {collapsed ? (
          <Tooltip content="Mở rộng" position="right">
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "none",
                color: "white",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                width: "100%",
                fontSize: "12px",
                fontWeight: "500",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")}
            >
              »
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "none",
              color: "white",
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              width: "100%",
              fontSize: "12px",
              fontWeight: "500",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")}
          >
            « Thu gọn
          </button>
        )}
      </div>
    </div>
  );
}
