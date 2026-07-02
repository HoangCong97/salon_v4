import React from "react";

import styles from "../AttendanceCalendar.module.css";

export const AttendanceLegend: React.FC = () => {
  return (
    <div className={styles.legendContainer}>
      <span className={styles.legendTitle}>Chú giải:</span>
      <div className={styles.legendItem}>
        <span className={styles.legendDot} style={{ backgroundColor: "var(--color-danger)" }} />
        <span>Vắng mặt</span>
      </div>
      <div className={styles.legendItem}>
        <span className={styles.legendDot} style={{ backgroundColor: "var(--color-warning)" }} />
        <span>Đi muộn</span>
      </div>
      <div className={styles.legendItem}>
        <span className={styles.legendDot} style={{ backgroundColor: "hsl(24, 95%, 50%)" }} />
        <span>Về sớm</span>
      </div>
      <div className={styles.legendItem}>
        <span className={styles.legendDot} style={{ backgroundColor: "var(--color-info)" }} />
        <span>Ứng tiền (Chờ duyệt)</span>
      </div>
      <div className={styles.legendItem}>
        <span className={styles.legendDot} style={{ backgroundColor: "hsl(271, 81%, 56%)" }} />
        <span>Ứng tiền (Đã duyệt)</span>
      </div>
    </div>
  );
};

