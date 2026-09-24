import React, { useState, useRef, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore, SubscriptionData } from "../../store/useAuthStore";
import {
  LayoutDashboard,
  Store,
  Users,
  BarChart3,
  MapPin,
  Layers,
  Package,
  CalendarDays,
  Receipt,
  Contact,
  CalendarClock,
  Crown,
  Sparkles,
  Award,
  Coins,
  Pin,
  PinOff,
} from "lucide-react";
import { Tooltip } from "./ui/Tooltip";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../utils/apiClient";
import { queryKeys } from "../../utils/queryKeys";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const planConfig = {
  FREE: {
    name: "Gói Basic",
    color: "#d97706", // Bronze / Amber
    icon: Award,
    background:
      "linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(146, 64, 14, 0.15) 100%)",
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
    background:
      "linear-gradient(135deg, rgba(148, 163, 184, 0.08) 0%, rgba(100, 116, 139, 0.15) 100%)",
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
    background:
      "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(180, 83, 9, 0.15) 100%)",
    border: "1px solid rgba(245, 158, 11, 0.4)",
    borderColor: "rgba(245, 158, 11, 0.4)",
    glow: "0 0 12px rgba(245, 158, 11, 0.2)",
    glowHover: "0 0 18px rgba(245, 158, 11, 0.4)",
    iconBg: "rgba(245, 158, 11, 0.18)",
    borderHover: "rgba(245, 158, 11, 0.6)",
  },
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
    <div className="w-[220px] p-1 font-sans text-slate-900 whitespace-normal">
      <div className="font-bold text-[13px] mb-2 pb-1.5 border-b border-slate-900/10 flex items-center justify-between">
        <span style={{ color: config.color }} className="font-bold">
          {config.name}
        </span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
            isExpired
              ? "bg-red-100 text-red-800"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {isExpired ? "Hết hạn" : "Hoạt động"}
        </span>
      </div>

      <div className="flex flex-col gap-1 text-[11.5px]">
        <div className="flex justify-between items-center text-slate-500">
          <span>Thời hạn còn lại:</span>
          <span className="font-semibold text-slate-900">
            {daysRemaining} ngày
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-500">
          <span>Ngày hết hạn:</span>
          <span className="font-semibold text-slate-900">
            {formatDate(subData.planExpiresAt)}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-500">
          <span>Số chi nhánh:</span>
          <span className="font-semibold text-slate-900">
            {subData.currentBranchesCount} /{" "}
            {subData.maxBranches === -1
              ? "Không giới hạn"
              : subData.maxBranches}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-500">
          <span>Số nhân viên:</span>
          <span className="font-semibold text-slate-900">
            {subData.currentStaffCount} /{" "}
            {subData.maxStaff === -1 ? "Không giới hạn" : subData.maxStaff}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
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

  const {
    user,
    brandName,
    logoUrl,
    hasPermission,
    currentTenantId,
    currentBranchId,
    subscription,
    subscriptionLoading,
    fetchSubscription,
    setIsPricingModalOpen,
  } = useAuthStore();

  useEffect(() => {
    if (!subscription && !subscriptionLoading && currentTenantId) {
      fetchSubscription();
    }
  }, [subscription, subscriptionLoading, currentTenantId]);

  // Lắng nghe sự kiện WebSocket để cập nhật thông tin gói cước real-time khi Admin phê duyệt
  useWebSocket((event, data) => {
    const isOurTenant =
      (event === "invoice.approved" && data.tenantId === currentTenantId) ||
      (event === "tenant.plan-changed" && data.id === currentTenantId) ||
      (event === "tenant.status-updated" && data.id === currentTenantId);

    if (isOurTenant) {
      fetchSubscription();
    }
  });

  // Fetch invoices to count today's invoices
  const { data: invoices } = useQuery<any[]>({
    queryKey: queryKeys.invoices.list(currentTenantId!, currentBranchId!),
    queryFn: () =>
      api.get(
        `/tenants/${currentTenantId}/branches/${currentBranchId}/invoices`,
      ),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const todayInvoiceCount = useMemo(() => {
    if (!invoices) return 0;
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return invoices.filter((inv) => {
      const dateObj = new Date(inv.createdAt);
      const invDateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
      return invDateStr === todayStr;
    }).length;
  }, [invoices]);

  const menuItems = [
    {
      path: "/",
      label: "Tổng quan",
      icon: LayoutDashboard,
      permission: "booking.view",
    },
    {
      path: "/appointments",
      label: "Lịch hẹn",
      icon: CalendarClock,
      permission: "booking.view",
    },
    {
      path: "/pos",
      label: "Bán hàng POS",
      icon: Store,
      permission: "pos.view",
    },
    {
      path: "/invoices",
      label: "Lịch sử hóa đơn",
      icon: Receipt,
      permission: "invoice.view",
    },
    {
      path: "/customers",
      label: "Khách hàng",
      icon: Contact,
      permission: "customer.view",
    },
    {
      path: "/services",
      label: "Danh mục dịch vụ",
      icon: Layers,
      permission: "service.view",
    },
    {
      path: "/inventories",
      label: "Quản lý kho hàng",
      icon: Package,
      permission: "inventory.view",
    },
    { path: "/staff", label: "Nhân sự", icon: Users, permission: "staff.view" },
    {
      path: "/payroll",
      label: "Bảng lương",
      icon: Coins,
      permission: "staff.view",
    },
    {
      path: "/shifts",
      label: "Lịch trực ca",
      icon: CalendarDays,
      permission: "shift.view",
    },
    {
      path: "/attendance",
      label: "Lịch điểm danh & Ứng tiền",
      icon: CalendarDays,
      permission: "shift.view",
    },
    {
      path: "/reports",
      label: "Báo cáo",
      icon: BarChart3,
      permission: "report.view",
    },
    {
      path: "/branches",
      label: "Cơ sở & Chi nhánh",
      icon: MapPin,
      permission: "branch.view",
    },
  ];

  const allowedItems = menuItems.filter(
    (item) => user && (!item.permission || hasPermission(item.permission)),
  );

  return (
    <div
      className={`h-screen shrink-0 relative z-50 transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        collapsed ? "w-[68px]" : "w-[260px]"
      }`}
    >
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`absolute top-0 left-0 h-screen flex flex-col overflow-hidden bg-[var(--bg-sidebar)] text-[var(--text-on-dark)] border-r border-white/5 transition-[width,box-shadow] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isExpanded ? "w-[260px]" : "w-[68px]"
        } ${
          collapsed && isHovered
            ? "shadow-[4px_0_24px_rgba(0,0,0,0.45)]"
            : "shadow-none"
        }`}
      >
        {/* Sidebar Header */}
        <div
          className={`h-[70px] flex items-center border-b border-white/5 gap-2.5 overflow-hidden whitespace-nowrap ${
            isExpanded ? "px-5 justify-start" : "px-0 justify-center"
          }`}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="w-9 h-9 rounded-[var(--radius-sm)] object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--color-primary)] flex items-center justify-center shrink-0">
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
                className="rotate-90"
              >
                <circle cx="6" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <line x1="20" y1="4" x2="8.12" y2="15.88" />
                <line x1="14.47" y1="14.48" x2="20" y2="20" />
                <line x1="8.12" y1="8.12" x2="12" y2="12" />
              </svg>
            </div>
          )}
          {isExpanded && (
            <span
              title={brandName || "SALON Portal"}
              className="font-bold text-sm tracking-[0.5px] text-[var(--text-on-dark)] whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {brandName ? (
                brandName.toUpperCase()
              ) : (
                <>
                  SALON
                  <span className="text-[var(--color-primary)]">Portal</span>
                </>
              )}
            </span>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 h-11 px-3.5 rounded-[var(--radius-sm)] select-none cursor-pointer transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isExpanded ? "justify-start" : "justify-center"
                  } ${
                    isActive
                      ? "bg-[var(--color-primary)] text-white font-semibold shadow-md shadow-black/25 hover:brightness-110"
                      : "text-white/70 font-medium hover:bg-white/[0.08] hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} className="shrink-0" />
                    {isExpanded && (
                      <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.label}
                      </span>
                    )}

                    {item.path === "/invoices" && todayInvoiceCount > 0 && (
                      <span
                        className={`bg-red-500 text-white text-[10.5px] font-bold rounded-full px-1.5 leading-none min-w-[18px] text-center ${
                          isExpanded
                            ? "static ml-auto"
                            : "absolute top-1 right-1 ml-0"
                        }`}
                      >
                        {todayInvoiceCount}
                      </span>
                    )}

                    {!isExpanded && isActive && (
                      <div className="absolute left-0 w-1 h-5 bg-white rounded-r-[var(--radius-sm)]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Spacer to push everything below to the bottom */}
          <div className="flex-1" />

          {/* Subscription loading skeleton */}
          {subscriptionLoading && !subscription && (
            <div
              className={`animate-pulse bg-white/5 border border-white/[0.08] ${
                isExpanded
                  ? "mx-2 my-2 h-14 rounded-xl"
                  : "mx-auto my-2 w-11 h-11 rounded-[10px]"
              }`}
            />
          )}

          {/* Subscription Info Card */}
          {subscription && (
            <Tooltip
              content={<SubscriptionTooltip subData={subscription} />}
              position={isExpanded ? "top" : "right"}
            >
              {!isExpanded ? (
                <div
                  onClick={() => setIsPricingModalOpen(true)}
                  className="w-11 h-11 rounded-[10px] flex items-center justify-center cursor-pointer my-2 mx-auto transition-all duration-200 hover:scale-105"
                  style={{
                    background: getPlanConfig(subscription.planCode).background,
                    border: getPlanConfig(subscription.planCode).border,
                    boxShadow: getPlanConfig(subscription.planCode).glow,
                    color: getPlanConfig(subscription.planCode).color,
                  }}
                >
                  {React.createElement(
                    getPlanConfig(subscription.planCode).icon,
                    { size: 20 },
                  )}
                </div>
              ) : (
                <div
                  onClick={() => setIsPricingModalOpen(true)}
                  className="relative overflow-hidden flex items-center gap-3 p-3 rounded-xl cursor-pointer my-2 mx-2 transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5"
                  style={{
                    background: getPlanConfig(subscription.planCode).background,
                    border: getPlanConfig(subscription.planCode).border,
                    boxShadow: getPlanConfig(subscription.planCode).glow,
                  }}
                >
                  {/* Glowing reflection/shine effect */}
                  <div className="absolute top-0 -left-1/2 w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -skew-x-[30deg] pointer-events-none" />

                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: getPlanConfig(subscription.planCode).iconBg,
                      color: getPlanConfig(subscription.planCode).color,
                    }}
                  >
                    {React.createElement(
                      getPlanConfig(subscription.planCode).icon,
                      { size: 18 },
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[13px] font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                      {subscription.planName}
                    </span>
                    <span className="text-[11px] text-white/40 font-medium mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                      {subscription.planStatus === "EXPIRED"
                        ? "Đã hết hạn"
                        : `Còn lại: ${Math.max(0, Math.ceil((new Date(subscription.planExpiresAt || "").getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} ngày`}
                    </span>
                  </div>

                  {/* Small indicator arrow */}
                  <svg
                    className="w-3 h-3 stroke-white/30 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </Tooltip>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/5 flex items-center">
          <button
            onClick={() => {
              setCollapsed(!collapsed);
            }}
            className={`w-full h-10 flex items-center gap-2.5 rounded-[var(--radius-sm)] text-[12.5px] font-medium transition-all duration-150 whitespace-nowrap overflow-hidden cursor-pointer border ${
              isExpanded ? "px-3.5 justify-start" : "px-0 justify-center"
            } ${
              !collapsed
                ? "bg-white/[0.07] text-white border-white/15 hover:bg-white/[0.14] hover:border-white/25"
                : "bg-white/[0.04] text-white/70 border-white/[0.08] hover:bg-white/10 hover:text-white hover:border-white/20"
            }`}
          >
            {collapsed ? (
              <>
                <Pin size={16} className="shrink-0 rotate-45" />
                {isExpanded && <span>Cố định thanh điều hướng</span>}
              </>
            ) : (
              <>
                <PinOff
                  size={16}
                  className="shrink-0 text-[var(--color-primary)]"
                />
                {isExpanded && <span>Bỏ cố định thanh điều hướng</span>}
              </>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
}
