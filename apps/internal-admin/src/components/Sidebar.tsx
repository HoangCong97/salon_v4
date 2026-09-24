import React, { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Pin,
  PinOff,
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
  setCollapsed,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isExpanded = !collapsed || isHovered;

  useEffect(() => {
    if (!collapsed) {
      setIsHovered(false);
    }
  }, [collapsed]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (collapsed) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 120);
  };

  const menuItems = [
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "tenants", label: "Quản lý Tenant", icon: Store },
    { id: "subscriptions", label: "Gói Dịch Vụ", icon: CreditCard },
    { id: "settings", label: "Cấu Hình", icon: Settings },
    { id: "logs", label: "Nhật Ký Hệ Thống", icon: ShieldAlert },
  ];

  return (
    <div
      style={{
        width: collapsed ? "68px" : "260px",
        flexShrink: 0,
        height: "100%",
        position: "relative",
        zIndex: 50,
        transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: isExpanded ? "260px" : "68px",
          height: "100%",
          backgroundColor: "var(--bg-sidebar)",
          color: "var(--text-on-dark)",
          display: "flex",
          flexDirection: "column",
          transition:
            "width 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease",
          overflow: "hidden",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow:
            collapsed && isHovered ? "4px 0 24px rgba(0, 0, 0, 0.45)" : "none",
        }}
      >
        <style>{`
          .admin-sidebar-nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 12px 14px;
            border-radius: var(--radius-sm, 8px);
            background-color: transparent;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            border: none;
            text-align: left;
            transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            user-select: none;
          }
          .admin-sidebar-nav-item:hover {
            background-color: rgba(255, 255, 255, 0.08);
            color: #ffffff;
          }
          .admin-sidebar-nav-item.active {
            background-color: var(--color-primary);
            color: #ffffff;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          }
          .admin-sidebar-nav-item.active:hover {
            background-color: var(--color-primary);
            filter: brightness(1.08);
          }
          .admin-sidebar-pin-btn {
            background-color: rgba(255, 255, 255, 0.04);
            color: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
          }
          .admin-sidebar-pin-btn:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.2);
          }
          .admin-sidebar-pin-btn.pinned {
            background-color: rgba(255, 255, 255, 0.07);
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.15);
          }
          .admin-sidebar-pin-btn.pinned:hover {
            background-color: rgba(255, 255, 255, 0.14);
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.25);
          }
        `}</style>

        {/* Brand Logo Header */}
        <div
          style={{
            height: "70px",
            display: "flex",
            alignItems: "center",
            padding: isExpanded ? "0 20px" : "0",
            justifyContent: isExpanded ? "flex-start" : "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            gap: "10px",
            overflow: "hidden",
            whiteSpace: "nowrap",
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
              flexShrink: 0,
            }}
          >
            <Scissors size={20} color="white" />
          </div>
          {isExpanded && (
            <span
              style={{
                fontWeight: 700,
                fontSize: "16px",
                letterSpacing: "0.5px",
              }}
            >
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
            gap: "4px",
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`admin-sidebar-nav-item ${isActive ? "active" : ""}`}
                style={{
                  justifyContent: isExpanded ? "flex-start" : "center",
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                {isExpanded && (
                  <span
                    style={{ fontSize: "14px", fontWeight: isActive ? 600 : 500 }}
                  >
                    {item.label}
                  </span>
                )}
                {/* Highlight bar for active button in compact mode */}
                {!isExpanded && isActive && (
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
              </button>
            );
          })}
        </nav>

        {/* Collapse Toggle Footer Button */}
        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => {
              setCollapsed(!collapsed);
            }}
            className={`admin-sidebar-pin-btn ${!collapsed ? "pinned" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              justifyContent: isExpanded ? "flex-start" : "center",
              width: "100%",
              height: "40px",
              padding: isExpanded ? "0 14px" : "0",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "12.5px",
              fontWeight: "500",
              whiteSpace: "nowrap",
              overflow: "hidden",
              transition: "all 0.15s ease",
            }}
          >
            {collapsed ? (
              <>
                <Pin
                  size={16}
                  style={{ flexShrink: 0, transform: "rotate(45deg)" }}
                />
                {isExpanded && <span>Cố định thanh điều hướng</span>}
              </>
            ) : (
              <>
                <PinOff size={16} style={{ flexShrink: 0 }} />
                {isExpanded && <span>Bỏ cố định thanh điều hướng</span>}
              </>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
