import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/mobile/Header";
import BottomNav from "../components/mobile/BottomNav";

export default function MobileLayout() {
  const location = useLocation();
  const isFullBleed = location.pathname === "/invoices" || location.pathname === "/pos";

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
    <div className="mobile-layout-root" onContextMenu={handleContextMenu}>
      {/* Fixed top Header (Flex item, flex-shrink: 0, covers Safe Area Top) */}
      <Header />

      {/* Main App Content Area (Flex: 1, scrollable, trapped momentum scroll) */}
      <main
        className="mobile-content-area"
        style={{
          overflowY: isFullBleed ? "hidden" : "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorY: "contain",
          padding: isFullBleed ? "0" : "16px",
        }}
      >
        <Outlet />
      </main>

      {/* Fixed bottom Navigation (Flex item, flex-shrink: 0, covers Safe Area Bottom) */}
      <BottomNav />
    </div>
  );
}

