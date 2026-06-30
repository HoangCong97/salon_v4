import React, { useState, useEffect } from "react";
import { useIsMutating, useIsFetching } from "@tanstack/react-query";
import { useAuthStore, UserRole } from "../../store/useAuthStore";
import { useLocation } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { useConfirm } from "../../components/desktop/ConfirmDialog";

export default function Topbar() {
  const { user, branches, currentBranchId, setBranch, setRole, logout } = useAuthStore();
  const location = useLocation();
  const confirm = useConfirm();

  const storedUserStr = localStorage.getItem("user") || sessionStorage.getItem("user");
  const originalUser = storedUserStr ? JSON.parse(storedUserStr) : null;
  const isOriginalAdmin = originalUser?.role === "ADMIN";

  const handleLogout = async () => {
    const ok = await confirm({
      title: "Đăng xuất tài khoản",
      message: "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?",
      type: "warning",
      confirmText: "Đăng xuất",
      cancelText: "Hủy bỏ"
    });
    if (ok) {
      logout();
    }
  };

  const isMutating = useIsMutating();
  const isFetching = useIsFetching();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  let syncColor = "var(--color-success)";
  let syncGlow = "rgba(16, 185, 129, 0.4)";
  let syncTooltip = "Đồng bộ hoàn toàn";

  if (!isOnline) {
    syncColor = "var(--color-danger)";
    syncGlow = "rgba(239, 68, 68, 0.4)";
    syncTooltip = "Mất kết nối Internet - Đang lưu ngoại tuyến";
  } else if (isMutating > 0) {
    syncColor = "var(--color-warning)";
    syncGlow = "rgba(245, 158, 11, 0.4)";
    syncTooltip = "Đang gửi dữ liệu lên máy chủ...";
  } else if (isFetching > 0) {
    syncColor = "var(--color-warning)";
    syncGlow = "rgba(245, 158, 11, 0.4)";
    syncTooltip = "Đang tải dữ liệu mới...";
  }

  if (!user) return null;

  const getHeaderInfo = (pathname: string) => {
    switch (pathname) {
      case "/":
        return {
          title: "Tổng quan chi nhánh",
          description: "Xem hiệu suất bán hàng, lượt đặt lịch hẹn và hoạt động trong ngày."
        };
      case "/pos":
        return {
          title: "Bán hàng POS",
          description: "Ghi nhận hóa đơn nhanh, thanh toán và tính hoa hồng thợ tại quầy."
        };
      case "/branches":
        return {
          title: "Cơ sở & Chi nhánh",
          description: "Quản lý mạng lưới chi nhánh, cửa hàng trực thuộc chuỗi salon."
        };
      case "/services":
        return {
          title: "Danh mục dịch vụ",
          description: "Thiết lập dịch vụ lẻ, combo đa dịch vụ, định giá và thời gian thực hiện."
        };
      case "/inventories":
        return {
          title: "Quản lý kho hàng",
          description: "Nhập/Xuất kho hàng, quản lý giá vốn, giá bán lẻ và mức cảnh báo sản phẩm sắp hết."
        };
      case "/staff":
        return {
          title: "Quản lý nhân viên chi nhánh",
          description: "Quản lý thông tin, phân quyền chức vụ và điều hành hoạt động của nhân viên."
        };
      case "/reports":
        return {
          title: "Báo cáo doanh thu & Hiệu suất",
          description: "Phân tích xu hướng tài chính và giám sát hoạt động kinh doanh của chi nhánh."
        };
      case "/invoices":
        return {
          title: "Lịch sử hoá đơn",
          description: "Thống kê doanh số theo ca, lọc danh sách hóa đơn theo ngày, thợ gán lượt, khách hàng và nguồn đơn."
        };
      case "/payroll":
        return {
          title: "Bảng lương nhân viên",
          description: "Quản lý chi trả lương, phụ cấp, hoa hồng và khấu trừ tạm ứng hàng tháng."
        };
      case "/shifts":
        return {
          title: "Lịch ca trực tuần nhân viên",
          description: "Xếp ca trực tuần cho nhân sự và điều hành lịch trực chi nhánh."
        };
      case "/attendance":
        return {
          title: "Lịch điểm danh & Ứng tiền",
          description: "Thống kê những ngày làm việc bất thường (vắng, muộn) và các phiếu tạm ứng lương."
        };
      default:
        return {
          title: "Hệ thống Quản lý Salon",
          description: "Bảng cấu hình và điều hành hoạt động salon chuyên nghiệp."
        };
    }
  };

  const headerInfo = getHeaderInfo(location.pathname);

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
      {/* Title and Description */}
      <div style={{ display: "flex", flexDirection: "column", flexShrink: 1, minWidth: 0, paddingRight: "16px" }}>
        <h1 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {headerInfo.title}
        </h1>
        <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0, marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {headerInfo.description}
        </p>
      </div>

      {/* Right Controls: Notification, Profile, Role Switcher, Branch Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Branch Selector */}
        {branches && branches.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "hsl(210, 40%, 96%)", padding: "6px 12px", borderRadius: "var(--radius-sm)" }}>
            <span style={{ fontSize: "14px" }}>🏢 Chi nhánh:</span>
            <select
              value={currentBranchId || ""}
              onChange={(e) => setBranch(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "12px",
                color: "var(--text-primary)",
                outline: "none",
              }}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id} style={{ color: "var(--text-primary)", background: "white" }}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Test Tool: Role Switcher */}
        {isOriginalAdmin && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "hsl(210, 40%, 96%)", padding: "6px 12px", borderRadius: "var(--radius-sm)" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>Test Role:</span>
            <select
              value={user.role}
              onChange={(e) => setRole(e.target.value as any)}
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
        )}

        <style>{`
          .sync-indicator-container {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
          }
          .sync-indicator-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
            transition: all 0.3s ease;
          }
          .sync-tooltip {
            position: absolute;
            top: 24px;
            right: 50%;
            transform: translateX(50%) translateY(0px);
            background: rgba(15, 23, 42, 0.95);
            color: #fff;
            padding: 6px 12px;
            border-radius: var(--radius-sm);
            font-size: 11px;
            font-weight: 500;
            white-space: nowrap;
            visibility: hidden;
            opacity: 0;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 1000;
            box-shadow: var(--shadow-lg);
            border: 1px solid rgba(255, 255, 255, 0.1);
            pointer-events: none;
          }
          .sync-indicator-container:hover .sync-tooltip {
            visibility: visible;
            opacity: 1;
            transform: translateX(50%) translateY(4px);
          }
        `}</style>

        {/* Sync Status Indicator */}
        <div className="sync-indicator-container">
          <span
            className="sync-indicator-dot"
            style={{
              backgroundColor: syncColor,
              boxShadow: `0 0 8px ${syncGlow}`
            }}
          />
          <div className="sync-tooltip">
            {syncTooltip}
          </div>
        </div>

        {/* MOCK notification button */}
        <button style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", position: "relative" }}>
          <Bell size={20} />
          <span style={{ position: "absolute", top: "-2px", right: "-2px", width: "8px", height: "8px", background: "var(--color-danger)", borderRadius: "50%" }}></span>
        </button>

        {/* Divider */}
        <div style={{ width: "1px", height: "24px", background: "var(--border-color)" }}></div>

        {/* User Info & Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              borderRadius: "50%",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
