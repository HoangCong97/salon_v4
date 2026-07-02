import React from "react";

import styles from "../Dashboard.module.css";

export function DailyTurns() {
  return (
    <div className="card">
      <h3 className="card-title">Hàng đợi xoay tua thợ (Daily Turns)</h3>
      <div className={styles.turnsList}>
        <div className={styles.turnItem}>
          <div className={`${styles.turnRank} ${styles.turnRankActive}`}>1</div>
          <div className={styles.turnInfo}>
            <div className={styles.turnName}>Thợ B (Stylist)</div>
            <div className={styles.turnServed}>Đã phục vụ: 2 lượt</div>
          </div>
          <span className="badge badge-success">Sẵn sàng</span>
        </div>
        <div className={styles.turnItem}>
          <div className={`${styles.turnRank} ${styles.turnRankInactive}`}>2</div>
          <div className={styles.turnInfo}>
            <div className={styles.turnName}>Thợ A (Stylist)</div>
            <div className={styles.turnServed}>Đã phục vụ: 3 lượt</div>
          </div>
          <span className="badge badge-info">Đang làm</span>
        </div>
        <div className={styles.turnItem}>
          <div className={`${styles.turnRank} ${styles.turnRankInactive}`}>3</div>
          <div className={styles.turnInfo}>
            <div className={styles.turnName}>Thợ C (Nail)</div>
            <div className={styles.turnServed}>Đã phục vụ: 1 lượt</div>
          </div>
          <span className="badge badge-info">Đang làm</span>
        </div>
      </div>
    </div>
  );
}

