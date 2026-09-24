import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useWebSocketSync } from "../hooks/useWebSocketSync";

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
import Shifts from "../pages/desktop/Shifts";
import Invoices from "../pages/desktop/Invoices";
import Customers from "../pages/desktop/Customers";
import Appointments from "../pages/desktop/Appointments";
import Payroll from "../pages/desktop/Payroll";
import AttendanceCalendar from "../pages/desktop/AttendanceCalendar";

// Mobile Pages
import Schedule from "../pages/mobile/Schedule";
import ShiftTasks from "../pages/mobile/ShiftTasks";
import Profile from "../pages/mobile/Profile";
import MobileInvoicesPage from "../pages/mobile/Invoices";
import MobilePOS from "../pages/mobile/POS";
import MobileRevenuePage from "../pages/mobile/Revenue";

// Custom Screen Size Hook với Media Query và Resize Listener chuẩn xác
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= breakpoint;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const check = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);

    let mql: MediaQueryList | null = null;
    let handleMql: ((e: MediaQueryListEvent) => void) | null = null;

    try {
      mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
      handleMql = (e: MediaQueryListEvent) => {
        setIsMobile(e.matches);
      };

      if (mql.addEventListener) {
        mql.addEventListener("change", handleMql);
      } else if ((mql as any).addListener) {
        (mql as any).addListener(handleMql);
      }
    } catch {}

    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
      if (mql && handleMql) {
        if (mql.removeEventListener) {
          mql.removeEventListener("change", handleMql);
        } else if ((mql as any).removeListener) {
          (mql as any).removeListener(handleMql);
        }
      }
    };
  }, [breakpoint]);

  return isMobile;
}

export default function AdaptiveRouter() {
  const { user, initializeSession, hasPermission } = useAuthStore();
  const isMobileScreen = useIsMobile(768);

  // Kích hoạt đồng bộ hóa dữ liệu qua WebSocket
  useWebSocketSync();

  useEffect(() => {
    initializeSession();
  }, []);

  if (!user) {
    return <Login />;
  }

  return (
    <HashRouter>
      <Routes>
        {isMobileScreen ? (
          /* Giao diện Mobile (Màn hình hẹp <= 768px: MobileLayout) */
          <Route element={<MobileLayout />}>
            <Route path="/" element={<Schedule />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/appointments" element={<Schedule />} />
            <Route path="/invoices" element={<MobileInvoicesPage />} />
            <Route path="/revenue" element={<MobileRevenuePage />} />
            <Route path="/pos" element={<MobilePOS />} />
            <Route path="/shifts" element={<ShiftTasks />} />
            <Route path="/attendance" element={<ShiftTasks />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          /* Giao diện Desktop (Màn hình rộng > 768px: DesktopLayout) */
          <Route element={<DesktopLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/pos"
              element={
                hasPermission("pos.view") ? <POS /> : <Navigate to="/" replace />
              }
            />

            {/* Permission-restricted routes */}
            <Route
              path="/branches"
              element={
                hasPermission("branch.view") ? (
                  <Branches />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/services"
              element={
                hasPermission("service.view") ? (
                  <Services />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/inventories"
              element={
                hasPermission("inventory.view") ? (
                  <Inventories />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/staff"
              element={
                hasPermission("staff.view") ? (
                  <StaffManagement />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/payroll"
              element={
                hasPermission("staff.view") ? (
                  <Payroll />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/shifts"
              element={
                hasPermission("shift.view") ? (
                  <Shifts />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/attendance"
              element={
                hasPermission("shift.view") ? (
                  <AttendanceCalendar />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/reports"
              element={
                hasPermission("report.view") ? (
                  <Reports />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/revenue"
              element={
                hasPermission("report.view") ? (
                  <Reports />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/invoices"
              element={
                hasPermission("invoice.view") ? (
                  <Invoices />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/customers"
              element={
                hasPermission("customer.view") ? (
                  <Customers />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/appointments"
              element={
                hasPermission("booking.view") ? (
                  <Appointments />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </HashRouter>
  );
}
