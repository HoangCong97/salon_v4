import React, { useState } from "react";
import { Bell, Search, LogOut, ShieldCheck, User, Settings, Database } from "lucide-react";

interface TopbarProps {
  activePage: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({ activePage, searchTerm, setSearchTerm }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Determine page title and breadcrumbs
  const getPageTitleInfo = () => {
    switch (activePage) {
      case "dashboard":
        return { title: "Tổng quan Hệ thống", path: ["Hệ thống", "Tổng quan"] };
      case "tenants":
        return { title: "Quản lý Tenant (Salon)", path: ["Hệ thống", "Tenants"] };
      case "subscriptions":
        return { title: "Quản lý Gói dịch vụ & Doanh thu", path: ["Cấu hình", "Gói Dịch Vụ"] };
      case "settings":
        return { title: "Cài đặt & Tích hợp API", path: ["Cài đặt", "Cổng API"] };
      case "logs":
        return { title: "Nhật ký Hoạt động & Bảo mật", path: ["Hệ thống", "Audit Logs"] };
      default:
        return { title: "Trang Quản trị", path: ["Hệ thống"] };
    }
  };

  const pageInfo = getPageTitleInfo();

  const mockNotifications = [
    { id: 1, text: "Salon 'HairStar' đăng ký dùng thử mới.", time: "5 phút trước", unread: true },
    { id: 2, text: "Yêu cầu nâng cấp gói Pro của Salon 'VinaHair' cần duyệt.", time: "1 giờ trước", unread: true },
    { id: 3, text: "Thanh toán gia hạn thành công từ 'BeautySalon'.", time: "5 giờ trước", unread: false }
  ];

  return (
    <header
      style={{
        height: "70px",
        backgroundColor: "var(--bg-topbar)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
        position: "relative",
        zIndex: 10
      }}
    >
      {/* Title & Breadcrumbs */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
          {pageInfo.path.map((segment, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>/</span>}
              <span>{segment}</span>
            </React.Fragment>
          ))}
        </div>
        <h1 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>{pageInfo.title}</h1>
      </div>

      {/* Utilities Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        
        {/* Global Search Input */}
        <div style={{ position: "relative", width: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Tìm nhanh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "8px 12px 8px 32px",
              fontSize: "13px",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-sm)",
              width: "100%",
              backgroundColor: "hsl(210, 40%, 97%)",
              transition: "all 0.15s ease"
            }}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.borderColor = "var(--color-primary)";
              e.currentTarget.style.boxShadow = "0 0 0 3px var(--border-focus)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = "hsl(210, 40%, 97%)";
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Database Status Indicator */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--color-success)", fontWeight: 500 }}
          title="Database Connection Active"
        >
          <Database size={16} />
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-success)",
              display: "inline-block"
            }}
          />
          Live
        </div>

        {/* Notification Bell Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-secondary)",
              position: "relative"
            }}
          >
            <Bell size={20} />
            <div
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                width: "8px",
                height: "8px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--color-danger)"
              }}
            />
          </button>

          {showNotifications && (
            <div
              className="animate-fade-in"
              style={{
                position: "absolute",
                right: 0,
                top: "45px",
                width: "320px",
                backgroundColor: "white",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                padding: "8px 0",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-color)", fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>
                Thông Báo
              </div>
              <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                {mockNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border-color)",
                      backgroundColor: notif.unread ? "var(--color-primary-light)" : "transparent",
                      cursor: "pointer",
                      transition: "background-color 0.15s ease"
                    }}
                  >
                    <p style={{ fontSize: "13px", color: "var(--text-primary)", margin: "0 0 4px 0", lineHeight: 1.4 }}>{notif.text}</p>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{notif.time}</span>
                  </div>
                ))}
              </div>
              <button
                style={{
                  padding: "10px",
                  textAlign: "center",
                  background: "none",
                  border: "none",
                  color: "var(--color-primary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  width: "100%"
                }}
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div style={{ width: "1px", height: "24px", backgroundColor: "var(--border-color)" }} />

        {/* User Account Dropdown Menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--color-primary-light)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "14px"
              }}
            >
              AD
            </div>
            <div style={{ textAlign: "left", display: "block" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Hoàng Admin</div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Super Admin</div>
            </div>
          </button>

          {showProfileMenu && (
            <div
              className="animate-fade-in"
              style={{
                position: "absolute",
                right: 0,
                top: "45px",
                width: "200px",
                backgroundColor: "white",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                padding: "6px 0"
              }}
            >
              <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Đã đăng nhập với</span>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", margin: "2px 0 0 0" }}>hoang@admin.com</p>
              </div>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "10px 16px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "var(--text-primary)"
                }}
              >
                <User size={16} /> Hồ sơ cá nhân
              </button>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "10px 16px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "var(--text-primary)"
                }}
              >
                <ShieldCheck size={16} /> Cấu hình 2FA
              </button>
              <div style={{ height: "1px", backgroundColor: "var(--border-color)", margin: "4px 0" }} />
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "10px 16px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "var(--color-danger)"
                }}
              >
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Topbar;
