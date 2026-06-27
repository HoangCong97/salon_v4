import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore, SubscriptionData } from "../../store/useAuthStore";
import { LayoutDashboard, Store, Users, BarChart3, MapPin, Layers, Package, CalendarDays, Receipt, Contact, CalendarClock, Crown, Sparkles, Award } from "lucide-react";
import { Tooltip } from "./Tooltip";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const planConfig = {
  FREE: {
    name: "Gói Basic",
    color: "#d97706", // Bronze / Amber
    icon: Award,
    background: "linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(146, 64, 14, 0.15) 100%)",
    border: "1px solid rgba(217, 119, 6, 0.35)",
    borderColor: "rgba(217, 119, 6, 0.35)",
    glow: "0 0 10px rgba(217, 119, 6, 0.15)",
    glowHover: "0 0 16px rgba(217, 119, 6, 0.3)",
    iconBg: "rgba(217, 119, 6, 0.15)",
    borderHover: "rgba(217, 119, 6, 0.55)",
  },
  PLUS: {
    name: "Gói Plus",
    color: "#94a3b8", // Silver / Slate
    icon: Sparkles,
    background: "linear-gradient(135deg, rgba(148, 163, 184, 0.08) 0%, rgba(100, 116, 139, 0.15) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    borderColor: "rgba(148, 163, 184, 0.35)",
    glow: "0 0 10px rgba(148, 163, 184, 0.15)",
    glowHover: "0 0 16px rgba(148, 163, 184, 0.3)",
    iconBg: "rgba(148, 163, 184, 0.15)",
    borderHover: "rgba(148, 163, 184, 0.55)",
  },
  PREMIUM: {
    name: "Gói Premium",
    color: "#fbbf24", // Gold
    icon: Crown,
    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(180, 83, 9, 0.15) 100%)",
    border: "1px solid rgba(245, 158, 11, 0.4)",
    borderColor: "rgba(245, 158, 11, 0.4)",
    glow: "0 0 12px rgba(245, 158, 11, 0.2)",
    glowHover: "0 0 18px rgba(245, 158, 11, 0.4)",
    iconBg: "rgba(245, 158, 11, 0.18)",
    borderHover: "rgba(245, 158, 11, 0.6)",
  }
};

const getPlanConfig = (code: string | null | undefined) => {
  const normalized = (code || "FREE").toUpperCase();
  if (normalized === "PLUS") return planConfig.PLUS;
  if (normalized === "PREMIUM") return planConfig.PREMIUM;
  return planConfig.FREE;
};

const SubscriptionTooltip = ({ subData }: { subData: SubscriptionData }) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const getDaysRemaining = (expiresAtStr: string | null) => {
    if (!expiresAtStr) return 0;
    const diff = new Date(expiresAtStr).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysRemaining = getDaysRemaining(subData.planExpiresAt);
  const isExpired = subData.planStatus === "EXPIRED";
  const config = getPlanConfig(subData.planCode);

  return (
    <div style={{
      whiteSpace: "normal",
      width: "220px",
      padding: "6px 4px",
      fontFamily: "Inter, sans-serif",
      color: "#0f172a"
    }}>
      <style>{`
        .tooltip-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .tooltip-label {
          color: #64748b;
        }
        .tooltip-val {
          font-weight: 600;
        }
      `}</style>
      <div style={{
        fontWeight: "bold",
        fontSize: "13px",
        marginBottom: "8px",
        borderBottom: "1px solid rgba(15, 23, 42, 0.1)",
        paddingBottom: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <span style={{ color: config.color, fontWeight: "700" }}>{config.name}</span>
        <span style={{
          fontSize: "10px",
          padding: "2px 6px",
          borderRadius: "100px",
          background: isExpired ? "#fee2e2" : "#dcfce7",
          color: isExpired ? "#991b1b" : "#166534",
          fontWeight: "600"
        }}>
          {isExpired ? "Hết hạn" : "Hoạt động"}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "11.5px" }}>
        <div className="tooltip-row">
          <span className="tooltip-label">Thời hạn còn lại:</span>
          <span className="tooltip-val">{daysRemaining} ngày</span>
        </div>
        <div className="tooltip-row">
          <span className="tooltip-label">Ngày hết hạn:</span>
          <span className="tooltip-val">{formatDate(subData.planExpiresAt)}</span>
        </div>
        <div className="tooltip-row">
          <span className="tooltip-label">Số chi nhánh:</span>
          <span className="tooltip-val">
            {subData.currentBranchesCount} / {subData.maxBranches === -1 ? "Không giới hạn" : subData.maxBranches}
          </span>
        </div>
        <div className="tooltip-row">
          <span className="tooltip-label">Số nhân viên:</span>
          <span className="tooltip-val">
            {subData.currentStaffCount} / {subData.maxStaff === -1 ? "Không giới hạn" : subData.maxStaff}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { 
    user, 
    brandName, 
    logoUrl, 
    hasPermission, 
    currentTenantId, 
    subscription, 
    subscriptionLoading, 
    fetchSubscription, 
    setIsPricingModalOpen 
  } = useAuthStore();

  useEffect(() => {
    if (!subscription && !subscriptionLoading && currentTenantId) {
      fetchSubscription();
    }
  }, [subscription, subscriptionLoading, currentTenantId]);

  const menuItems = [
    { path: "/", label: "Tổng quan", icon: LayoutDashboard, permission: "booking.view" },
    { path: "/appointments",  label: "Lịch hẹn",            icon: CalendarClock, permission: "booking.view" },
    { path: "/pos", label: "Bán hàng POS", icon: Store, permission: "pos.view" },
    { path: "/invoices", label: "Lịch sử hóa đơn", icon: Receipt, permission: "invoice.view" },
    { path: "/customers",     label: "Khách hàng",          icon: Contact,       permission: "customer.view" },
    { path: "/services", label: "Danh mục dịch vụ", icon: Layers, permission: "service.view" },
    { path: "/inventories", label: "Quản lý kho hàng", icon: Package, permission: "inventory.view" },
    { path: "/staff", label: "Nhân sự", icon: Users, permission: "staff.view" },
    { path: "/shifts", label: "Lịch trực ca", icon: CalendarDays, permission: "shift.view" },
    { path: "/reports", label: "Báo cáo", icon: BarChart3, permission: "report.view" },
    { path: "/branches", label: "Cơ sở & Chi nhánh", icon: MapPin, permission: "branch.view" },
  ];

  const allowedItems = menuItems.filter(item =>
    user && (!item.permission || hasPermission(item.permission))
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

        {/* Spacer to push everything below to the bottom */}
        <div style={{ flexGrow: 1 }} />

        {/* Subscription loading skeleton */}
        {subscriptionLoading && !subscription && (
          <>
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 0.3; }
              }
            `}</style>
            <div style={{ 
              margin: collapsed ? "8px auto" : "8px 8px", 
              width: collapsed ? "44px" : "auto", 
              height: collapsed ? "44px" : "56px",
              borderRadius: collapsed ? "10px" : "12px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              animation: "pulse 1.5s infinite ease-in-out"
            }} />
          </>
        )}

        {/* Subscription Info Card */}
        {subscription && (
          <Tooltip 
            content={<SubscriptionTooltip subData={subscription} />} 
            position={collapsed ? "right" : "top"}
          >
            {collapsed ? (
              <div
                onClick={() => setIsPricingModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  background: getPlanConfig(subscription.planCode).background,
                  border: getPlanConfig(subscription.planCode).border,
                  boxShadow: getPlanConfig(subscription.planCode).glow,
                  transition: "all 0.2s ease-in-out",
                  margin: "8px auto",
                  color: getPlanConfig(subscription.planCode).color
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.08)";
                  e.currentTarget.style.boxShadow = getPlanConfig(subscription.planCode).glowHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = getPlanConfig(subscription.planCode).glow;
                }}
              >
                {React.createElement(getPlanConfig(subscription.planCode).icon, { size: 20 })}
              </div>
            ) : (
              <div
                onClick={() => setIsPricingModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  background: getPlanConfig(subscription.planCode).background,
                  border: getPlanConfig(subscription.planCode).border,
                  boxShadow: getPlanConfig(subscription.planCode).glow,
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  margin: "8px 8px",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = getPlanConfig(subscription.planCode).glowHover;
                  e.currentTarget.style.borderColor = getPlanConfig(subscription.planCode).borderHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = getPlanConfig(subscription.planCode).glow;
                  e.currentTarget.style.borderColor = getPlanConfig(subscription.planCode).borderColor;
                }}
              >
                {/* Glowing reflection/shine effect */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: "-50%",
                  width: "200%",
                  height: "100%",
                  background: "linear-gradient(to right, transparent, rgba(255,255,255,0.03), transparent)",
                  transform: "skewX(-30deg)",
                  pointerEvents: "none",
                }} />
                
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: getPlanConfig(subscription.planCode).iconBg,
                  color: getPlanConfig(subscription.planCode).color,
                  flexShrink: 0
                }}>
                  {React.createElement(getPlanConfig(subscription.planCode).icon, { size: 18 })}
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flexGrow: 1 }}>
                  <span style={{ 
                    fontSize: "13px", 
                    fontWeight: "700", 
                    color: "white", 
                    whiteSpace: "nowrap", 
                    overflow: "hidden", 
                    textOverflow: "ellipsis" 
                  }}>
                    {subscription.planName}
                  </span>
                  <span style={{ 
                    fontSize: "11px", 
                    color: "rgba(255, 255, 255, 0.4)", 
                    fontWeight: "500", 
                    marginTop: "2px" 
                  }}>
                    {subscription.planStatus === "EXPIRED" ? "Đã hết hạn" : `Còn lại: ${Math.max(0, Math.ceil((new Date(subscription.planExpiresAt || "").getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} ngày`}
                  </span>
                </div>
                
                {/* Small indicator arrow */}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </Tooltip>
        )}
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
