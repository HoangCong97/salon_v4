import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/desktop/Sidebar";
import Topbar from "../components/desktop/Topbar";

export default function DesktopLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar Navigation */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Panel */}
      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, overflow: "hidden", position: "relative" }}>
        {/* Topbar Controls */}
        <Topbar />

        {/* Scrollable Content Container */}
        <div style={{ flexGrow: 1, overflowY: "auto", padding: "24px", background: "var(--bg-app)" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
