import React from "react";

import styles from "../Dashboard.module.css";

export function DashboardStats() {
  return (
    <div className={styles.statsGrid}>
      <div className="card">
        <div className={styles.statsCardHeader}>
          <span className={styles.statsLabel}>Doanh thu hôm nay</span>
          <span className="badge badge-success">+12.5%</span>
        </div>
        <h2 className={`${styles.statsValue} ${styles.valueSuccess}`}>4,850,000đ</h2>
        <p className={styles.statsSub}>Thanh toán qua POS & Chuyển khoản</p>
      </div>

      <div className="card">
        <div className={styles.statsCardHeader}>
          <span className={styles.statsLabel}>Lịch hẹn hôm nay</span>
          <span className="badge badge-primary">18 Lịch</span>
        </div>
        <h2 className={styles.statsValue}>12 / 18</h2>
        <p className={styles.statsSub}>12 khách đã hoàn thành dịch vụ</p>
      </div>

      <div className="card">
        <div className={styles.statsCardHeader}>
          <span className={styles.statsLabel}>Nhân sự trong ca</span>
          <span className="badge badge-info">Đủ thợ</span>
        </div>
        <h2 className={styles.statsValue}>6 / 8</h2>
        <p className={styles.statsSub}>6 thợ đang thực hiện dịch vụ</p>
      </div>

      <div className="card">
        <div className={styles.statsCardHeader}>
          <span className={styles.statsLabel}>Hết hàng cảnh báo</span>
          <span className="badge badge-danger">Cần nhập</span>
        </div>
        <h2 className={`${styles.statsValue} ${styles.valueDanger}`}>3</h2>
        <p className={styles.statsSub}>3 sản phẩm dầu gội sắp hết trong kho</p>
      </div>
    </div>
  );
}

