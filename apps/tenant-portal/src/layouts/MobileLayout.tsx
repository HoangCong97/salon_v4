import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/mobile/Header";
import BottomNav from "../components/mobile/BottomNav";

export default function MobileLayout() {
  const handleContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInput =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable;
    if (!isInput) {
      e.preventDefault();
    }
  };

  return (
    <div
      className="mobile-layout-root"
      onContextMenu={handleContextMenu}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bg-app)",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Fixed Header bar at top */}
      <Header />

      {/* Scrollable page content */}
      <div
        style={{
          flexGrow: 1,
          marginTop: "calc(64px + env(safe-area-inset-top))",
          padding: "16px",
          paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Outlet />
      </div>

      {/* Fixed bottom navigation with Safe Area Bottom */}
      <BottomNav />
    </div>
  );
}
