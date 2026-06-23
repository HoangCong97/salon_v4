import React, { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Tenants from "./pages/Tenants";
import Subscriptions from "./pages/Subscriptions";
import Settings from "./pages/Settings";
import Logs from "./pages/Logs";

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<string>("dashboard");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Simple state router to render correct view inside global dashboard layout
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "tenants":
        return <Tenants />;
      case "subscriptions":
        return <Subscriptions />;
      case "settings":
        return <Settings />;
      case "logs":
        return <Logs />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
