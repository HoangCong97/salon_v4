import React from "react";
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Scissors
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  collapsed,
  setCollapsed
}) => {
  const menuItems = [
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "tenants", label: "Quản lý Tenant", icon: Store },
    { id: "subscriptions", label: "Gói Dịch Vụ", icon: CreditCard },
    { id: "settings", label: "Cấu Hình", icon: Settings },
    { id: "logs", label: "Nhật Ký Hệ Thống", icon: ShieldAlert }
  ];

  return (
    <div
      style={{
        width: collapsed ? "68px" : "260px",
        backgroundColor: "var(--bg-sidebar)",
        color: "var(--text-on-dark)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        height: "100%",
        transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        borderRight: "1px solid rgba(255, 255, 255, 0.05)"
      }}
    >
      {/* Brand Logo Header */}
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
          <Scissors size={20} color="white" />
        </div>
        {!collapsed && (
          <span style={{ fontWeight: 700, fontSize: "16px", letterSpacing: "0.5px" }}>
            SALON<span style={{ color: "var(--color-primary)" }}>SaaS</span>
          </span>
        )}
      </div>

      {/* Navigation List */}
      <nav
        style={{
          flexGrow: 1,
          padding: "16px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px"
        }}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "12px 14px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: isActive ? "var(--color-primary)" : "transparent",
                color: isActive ? "white" : "rgba(255, 255, 255, 0.7)",
                cursor: "pointer",
                border: "none",
                textAlign: "left",
                justifyContent: collapsed ? "center" : "flex-start",
                transition: "all 0.15s ease",
                position: "relative"
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{ fontSize: "14px", fontWeight: isActive ? 600 : 500 }}>
                  {item.label}
                </span>
              )}
              {/* Highlight bar for active button in collapsed mode */}
              {collapsed && isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    width: "4px",
                    height: "20px",
                    backgroundColor: "white",
                    borderRadius: "0 var(--radius-sm) var(--radius-sm) 0"
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer Button */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-end"
        }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "rgba(255, 255, 255, 0.7)",
            transition: "all 0.15s ease"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
