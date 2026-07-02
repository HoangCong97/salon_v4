import React from "react";

import { DashboardStats } from "./components/DashboardStats";
import { RecentBookings } from "./components/RecentBookings";
import { DailyTurns } from "./components/DailyTurns";

import styles from "./Dashboard.module.css";

export default function Dashboard() {
  return (
    <div className={`animate-fade-in ${styles.container}`}>
      {/* 4 Stats Cards Grid */}
      <DashboardStats />

      {/* Main content grid */}
      <div className={styles.contentGrid}>
        {/* Left Column: Recent Bookings */}
        <RecentBookings />

        {/* Right Column: Daily Turns */}
        <div className={styles.rightColumn}>
          {/* Daily Turns Card */}
          <DailyTurns />
        </div>
      </div>
    </div>
  );
}

