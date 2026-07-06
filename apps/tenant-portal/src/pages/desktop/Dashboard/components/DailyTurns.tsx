import React from "react";

import { DailyTurnItem } from "../types";
import styles from "../Dashboard.module.css";

interface DailyTurnsProps {
  turns: DailyTurnItem[];
}

export function DailyTurns({ turns }: DailyTurnsProps) {
  return (
    <div className="card">
      <h3 className="card-title">Xếp hạng lượt phục vụ hôm nay</h3>
      <div className={styles.turnsList}>
        {turns.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px 0" }}>
            Không có ca trực nào được ghi nhận hôm nay.
          </div>
        ) : (
          turns.map((t) => (
            <div key={t.rank} className={styles.turnItem}>
              <div className={`${styles.turnRank} ${t.rank === 1 ? styles.turnRankActive : styles.turnRankInactive}`}>
                {t.rank}
              </div>
              
              {t.avatar && (
                <img 
                  src={t.avatar} 
                  alt={t.name} 
                  style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} 
                />
              )}

              <div className={styles.turnInfo}>
                <div className={styles.turnName}>{t.name}</div>
                <div className={styles.turnServed}>Đã phục vụ: {t.served} khách</div>
              </div>
              <span className={`badge ${t.served > 0 ? "badge-success" : "badge-info"}`}>
                {t.served > 0 ? "Hoạt động" : "Sẵn sàng"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


