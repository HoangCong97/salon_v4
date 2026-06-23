import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

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
