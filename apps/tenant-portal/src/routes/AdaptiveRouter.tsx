import React, { useState, useEffect } from "react";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

// Layouts
import DesktopLayout from "../layouts/DesktopLayout";
import MobileLayout from "../layouts/MobileLayout";

// Auth Login
import Login from "../pages/Login";

// Desktop Pages
import Dashboard from "../pages/desktop/Dashboard";
import POS from "../pages/desktop/POS";
import StaffManagement from "../pages/desktop/StaffManagement";
import Reports from "../pages/desktop/Reports";
import Branches from "../pages/desktop/Branches";
import Services from "../pages/desktop/Services";
import Inventories from "../pages/desktop/Inventories";

// Mobile Pages
import Schedule from "../pages/mobile/Schedule";
import ShiftTasks from "../pages/mobile/ShiftTasks";
import Profile from "../pages/mobile/Profile";

// Custom Screen Size Hook
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

export default function AdaptiveRouter() {
  const { user, setRole, initializeSession } = useAuthStore();
  const width = useWindowWidth();
  const isMobileScreen = width <= 768;

  useEffect(() => {
    initializeSession();
  }, []);

  if (!user) {
    return <Login />;
  }

  const isEmployee = user.role === "EMPLOYEE";

  // Case 1: Employee role -> strictly uses MobileLayout & Mobile pages
  if (isEmployee) {
    return (
      <HashRouter>
        <Routes>
          <Route element={<MobileLayout />}>
            <Route path="/" element={<Schedule />} />
            <Route path="/shifts" element={<ShiftTasks />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    );
  }

  // Case 2: Admin/Manager/Cashier roles on MOBILE screens
  if (isMobileScreen) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "24px",
          textAlign: "center",
          background: "var(--bg-app)",
          fontFamily: "var(--font-family)",
        }}
      >
        <div className="card" style={{ maxWidth: "400px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <span style={{ fontSize: "48px" }}>🖥️📱</span>
          <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Giao diện Quản trị & POS</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
            Trang bán hàng POS và Cấu hình chi nhánh được thiết kế tối ưu cho màn hình máy tính (PC/Laptop/Tablet). 
            Vui lòng sử dụng thiết bị có màn hình lớn hơn để tiếp tục thao tác.
          </p>
          <div style={{ height: "1px", background: "var(--border-color)" }}></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "left" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>
              Hoặc trải nghiệm giao diện nhân viên (Mobile Web):
            </span>
            <button
              className="btn btn-primary"
              onClick={() => setRole("EMPLOYEE")}
              style={{ width: "100%", padding: "10px" }}
            >
              Chuyển sang vai trò Nhân viên
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Admin/Manager/Cashier roles on DESKTOP screens
  const isManagerOrAdmin = user.role === "ADMIN" || user.role === "MANAGER";

  return (
    <HashRouter>
      <Routes>
        <Route element={<DesktopLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          
          {/* Permission-restricted routes */}
          <Route 
            path="/branches" 
            element={isManagerOrAdmin ? <Branches /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/services" 
            element={isManagerOrAdmin ? <Services /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/inventories" 
            element={isManagerOrAdmin ? <Inventories /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/staff" 
            element={isManagerOrAdmin ? <StaffManagement /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/reports" 
            element={isManagerOrAdmin ? <Reports /> : <Navigate to="/" replace />} 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
