import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ToastContainer, { showToast } from "./ToastContainer";
import { useWebSocket } from "../hooks/useWebSocket";

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activePage,
  setActivePage,
  searchTerm,
  setSearchTerm
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Lắng nghe các sự kiện WebSocket để hiển thị thông báo popup Toast toàn màn hình
  useWebSocket((event, data) => {
    switch (event) {
      case "tenant.buy-plan":
        showToast(
          `🛒 Salon "${data.tenantName}" đăng ký mua gói dịch vụ ${data.planName}. Vui lòng kiểm duyệt thanh toán!`,
          "info"
        );
        break;
      case "invoice.approved":
        showToast(
          `✅ Đã duyệt thanh toán thành công hóa đơn ${data.id} cho Salon "${data.salonName}".`,
          "success"
        );
        break;
      case "tenant.created":
        showToast(
          `🏢 Đã khởi tạo mới Salon "${data.name}" (Gói ${data.planCode}).`,
          "success"
        );
        break;
      case "tenant.status-updated":
        showToast(
          `ℹ️ Salon "${data.name}" chuyển sang trạng thái: ${data.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}`,
          data.status === "ACTIVE" ? "success" : "warning"
        );
        break;
      case "tenant.plan-changed":
        showToast(
          `⚡ Đã chuyển đổi trực tiếp Salon "${data.name}" sang gói ${data.planCode}.`,
          "success"
        );
        break;
      default:
        break;
    }
  });

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "var(--bg-app)"
      }}
    >
      <ToastContainer />
      {/* Sidebar - Collapsible Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main View Container (Topbar + Content Box) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          height: "100%",
          overflow: "hidden"
        }}
      >
        {/* Topbar Utility Navigation */}
        <Topbar
          activePage={activePage}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Dynamic Page Content View (Scrollable area) */}
        <main
          style={{
            flexGrow: 1,
            overflowY: "auto",
            padding: "24px",
            position: "relative"
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
