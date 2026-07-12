import React, { useState } from "react";

import { DashboardChart } from "./components/DashboardChart";
import { DailyTurns } from "./components/DailyTurns";
import { DashboardStats } from "./components/DashboardStats";
import { RecentBookings } from "./components/RecentBookings";
import { StaffAndServiceStats } from "./components/StaffAndServiceStats";
import { useDashboardStats } from "./useDashboardStats";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const { stats, loading, error, refetch } = useDashboardStats(selectedMonth);

  if (loading && !stats) {
    return (
      <div className={`${styles.container} animate-fade-in`}>
        {/* Skeleton for Stats Grid */}
        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="card"
              style={{
                height: "135px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div
                  style={{
                    width: "100px",
                    height: "16px",
                    background: "rgba(15,23,42,0.08)",
                    borderRadius: "4px",
                    animation: "pulse 1.5s infinite",
                  }}
                ></div>
                <div
                  style={{
                    width: "50px",
                    height: "16px",
                    background: "rgba(15,23,42,0.08)",
                    borderRadius: "4px",
                    animation: "pulse 1.5s infinite",
                  }}
                ></div>
              </div>
              <div
                style={{
                  width: "140px",
                  height: "32px",
                  background: "rgba(15,23,42,0.08)",
                  borderRadius: "4px",
                  animation: "pulse 1.5s infinite",
                }}
              ></div>
              <div
                style={{
                  width: "180px",
                  height: "12px",
                  background: "rgba(15,23,42,0.08)",
                  borderRadius: "4px",
                  animation: "pulse 1.5s infinite",
                }}
              ></div>
            </div>
          ))}
        </div>

        {/* Skeleton for Chart */}
        <div
          className="card"
          style={{
            height: "450px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "20px",
              background: "rgba(15,23,42,0.08)",
              borderRadius: "4px",
              animation: "pulse 1.5s infinite",
            }}
          ></div>
          <div
            style={{
              width: "90%",
              height: "320px",
              background: "rgba(15,23,42,0.08)",
              borderRadius: "8px",
              animation: "pulse 1.5s infinite",
            }}
          ></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div
        className={`${styles.container} animate-fade-in`}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: "450px",
            textAlign: "center",
            padding: "30px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "48px" }}>⚠️</span>
          <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
            Không thể tải dữ liệu tổng quan
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            {error || "Đã xảy ra lỗi không xác định khi kết nối với máy chủ."}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => refetch()}
            style={{ padding: "8px 24px", marginTop: "8px" }}
          >
            Thử tải lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      {/* Container chứa toàn bộ các biểu đồ chính gộp chung thành 1 Panel lớn thống nhất */}
      <div className={`card ${styles.widgetsLayoutWrapper}`}>
        {/* Thanh chỉ số hôm nay nhỏ gọn ghim ở trên cùng của panel */}
        <DashboardStats stats={stats} />

        {/* Biểu đồ gộp xếp chồng 12 tháng (trái) và Bảng chi tiết Excel cuộn dưới ghim tổng (phải) */}
        <DashboardChart
          charts={stats.charts}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
        />

        {/* Bảng Nhân viên, Dịch vụ & Biểu đồ tròn Doanh thu nhân viên */}
        <StaffAndServiceStats charts={stats.charts} />
      </div>

      {/* Main content grid */}
      <div className={styles.contentGrid}>
        {/* Left Column: Recent Bookings */}
        <RecentBookings bookings={stats.recentBookings} />

        {/* Right Column: Daily Turns */}
        <div className={styles.rightColumn}>
          {/* Daily Turns Card */}
          <DailyTurns turns={stats.dailyTurns} />
        </div>
      </div>
    </div>
  );
}
