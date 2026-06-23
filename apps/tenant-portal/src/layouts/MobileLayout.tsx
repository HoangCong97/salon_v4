import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/mobile/Header";
import BottomNav from "../components/mobile/BottomNav";

export default function MobileLayout() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--bg-app)",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Header bar */}
      <Header />

      {/* Scrollable page content */}
      <div
        style={{
          flexGrow: 1,
          padding: "16px",
          paddingBottom: "80px", // Margin to prevent content from being covered by the Bottom Nav
          overflowY: "auto",
        }}
      >
        <Outlet />
      </div>

      {/* Fixed bottom navigation */}
      <BottomNav />
    </div>
  );
}
