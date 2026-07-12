import React from "react";

import { DashboardStatsResponse } from "../types";
import styles from "../Dashboard.module.css";

interface DashboardStatsProps {
  stats: DashboardStatsResponse;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const { daily, bookings, staff, inventory } = stats;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const isGrowthPositive = daily.growth >= 0;

  return (
    <div className={`${styles.statsStrip} animate-fade-in`}>
      {/* 1. Today Revenue */}
      <div className={styles.statsStripItem}>
        <div className={styles.statsStripLabelGroup}>
          <span className={styles.statsStripLabel}>Doanh thu hôm nay</span>
          <span
            className={`badge ${isGrowthPositive ? "badge-success" : "badge-danger"}`}
            style={{ fontSize: "9px", padding: "1px 6px" }}
          >
            {isGrowthPositive ? `+` : ""}
            {daily.growth}%
          </span>
        </div>
        <h2
          className={`${styles.statsStripValue} ${isGrowthPositive ? styles.valueSuccess : styles.valueDanger}`}
        >
          {formatVND(daily.revenue)}
        </h2>
      </div>

      {/* 2. Bookings */}
      <div className={styles.statsStripItem}>
        <div className={styles.statsStripLabelGroup}>
          <span className={styles.statsStripLabel}>Lịch hẹn hôm nay</span>
          <span
            className="badge badge-primary"
            style={{ fontSize: "9px", padding: "1px 6px" }}
          >
            {bookings.total} Lịch
          </span>
        </div>
        <h2 className={styles.statsStripValue}>
          {bookings.completed} / {bookings.total}
        </h2>
      </div>

      {/* 3. Staff */}
      <div className={styles.statsStripItem}>
        <div className={styles.statsStripLabelGroup}>
          <span className={styles.statsStripLabel}>Nhân sự hoạt động</span>
          <span
            className="badge badge-info"
            style={{ fontSize: "9px", padding: "1px 6px" }}
          >
            {staff.scheduled > 0 ? "Có ca" : "Không ca"}
          </span>
        </div>
        <h2 className={styles.statsStripValue}>
          {staff.active} / {staff.scheduled}
        </h2>
      </div>

      {/* 4. Stock warning */}
      <div className={styles.statsStripItem}>
        <div className={styles.statsStripLabelGroup}>
          <span className={styles.statsStripLabel}>Hết hàng cảnh báo</span>
          <span
            className={`badge ${inventory.lowStock > 0 ? "badge-danger" : "badge-success"}`}
            style={{ fontSize: "9px", padding: "1px 6px" }}
          >
            {inventory.lowStock > 0 ? "Cần nhập" : "An toàn"}
          </span>
        </div>
        <h2
          className={`${styles.statsStripValue} ${inventory.lowStock > 0 ? styles.valueDanger : ""}`}
        >
          {inventory.lowStock}
        </h2>
      </div>
    </div>
  );
}
