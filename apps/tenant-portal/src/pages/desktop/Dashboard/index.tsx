import React from "react";
import { DashboardStats } from "./components/DashboardStats";
import { RecentBookings } from "./components/RecentBookings";
import { DailyTurns } from "./components/DailyTurns";

export default function Dashboard() {
  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 4 Stats Cards Grid */}
      <DashboardStats />

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginTop: "12px" }}>
        
        {/* Left Column: Recent Bookings */}
        <RecentBookings />

        {/* Right Column: Daily Turns */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Daily Turns Card */}
          <DailyTurns />
        </div>
      </div>
    </div>
  );
}
