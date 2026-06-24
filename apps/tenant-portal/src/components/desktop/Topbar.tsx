import React from "react";
import { useAuthStore, UserRole } from "../../store/useAuthStore";
import { useLocation } from "react-router-dom";

export default function Topbar() {
  const { user, branches, currentBranchId, setBranch, setRole } = useAuthStore();
  const location = useLocation();

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
            <span style={{ fontSize: "14px" }}>🏢</span>
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

        {/* MOCK notification button */}
        <button style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", position: "relative" }}>
          🔔
          <span style={{ position: "absolute", top: "-2px", right: "-2px", width: "8px", height: "8px", background: "var(--color-danger)", borderRadius: "50%" }}></span>
        </button>

        {/* Divider */}
        <div style={{ width: "1px", height: "24px", background: "var(--border-color)" }}></div>

        {/* User Info */}
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
      </div>
    </div>
  );
}
