import React from "react";
import { Loader2, Crown, Clock, Building2, Users, Sparkles } from "lucide-react";

import { SubscriptionData } from "../types";

import styles from "../Dashboard.module.css";

interface SubscriptionCardProps {
  subData: SubscriptionData | null;
  subLoading: boolean;
  onUpgradeClick: () => void;
}

export function SubscriptionCard({ subData, subLoading, onUpgradeClick }: SubscriptionCardProps) {
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const getDaysRemaining = (expiresAtStr: string | null | undefined) => {
    if (!expiresAtStr) return 0;
    const diff = new Date(expiresAtStr).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getCardStyleClass = () => {
    if (subData?.planCode === "PREMIUM") {
      return styles.subCardPremium;
    }
    if (subData?.planCode === "BASIC") {
      return styles.subCardBasic;
    }
    return styles.subCardTrial;
  };

  if (subLoading) {
    return (
      <div className={`card ${styles.subLoadingWrapper}`}>
        <div className={styles.subLoadingInner}>
          <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
          <span className={styles.subLoadingText}>Đang tải gói thành viên...</span>
        </div>
      </div>
    );
  }

  const isPremium = subData?.planCode === "PREMIUM";

  return (
    <div className={`card ${styles.subCard} ${getCardStyleClass()}`}>
      {/* Header */}
      <div className={styles.subCardHeader}>
        <div>
          <h3 className={styles.subTitle}>
            Gói ứng dụng
          </h3>
          <h2 className={styles.subName}>
            {isPremium && <Crown size={20} style={{ color: "hsl(35, 92%, 50%)" }} />}
            {subData?.planName.replace("Gói ", "").replace(" (Free Trial)", "").replace(" (Basic)", "").replace(" (Premium)", "")}
          </h2>
        </div>
        
        {/* Plan Badge */}
        {subData?.planStatus === "EXPIRED" ? (
          <span className="badge badge-danger">Hết hạn</span>
        ) : subData?.planStatus === "TRIAL" ? (
          <span className="badge badge-warning">Dùng thử</span>
        ) : (
          <span className={`badge badge-success ${isPremium ? styles.badgePremium : ""}`}>
            Hoạt động
          </span>
        )}
      </div>

      {/* Expiry Progress/Status */}
      <div className={styles.subExpiryInfo}>
        <div className={styles.expiryTimer}>
          <Clock size={16} />
          <span>
            {subData?.planStatus === "EXPIRED" ? (
              <strong style={{ color: "var(--color-danger)" }}>Đã hết hạn vào {formatDate(subData?.planExpiresAt)}</strong>
            ) : subData?.planStatus === "TRIAL" ? (
              <>Dùng thử: <strong>Còn {getDaysRemaining(subData?.planExpiresAt)} ngày</strong></>
            ) : (
              <>Thời hạn: <strong>Còn {getDaysRemaining(subData?.planExpiresAt)} ngày</strong></>
            )}
          </span>
        </div>
        <div className={styles.expirySub}>
          Hết hạn ngày: {formatDate(subData?.planExpiresAt)}
        </div>
      </div>

      {/* Resource Quotas */}
      <div className={styles.subQuotas}>
        {/* Branches limit */}
        <div>
          <div className={styles.quotaRow}>
            <span className={styles.quotaLabel}>
              <Building2 size={14} /> Chi nhánh
            </span>
            <span>
              {subData?.currentBranchesCount} / {subData?.maxBranches === -1 ? "Vô hạn" : subData?.maxBranches}
            </span>
          </div>
          <div className={styles.quotaProgressTrack}>
            <div 
              className={styles.quotaProgressBar}
              style={{ 
                width: subData?.maxBranches === -1 ? "100%" : `${Math.min(100, ((subData?.currentBranchesCount || 0) / (subData?.maxBranches || 1)) * 100)}%`,
                background: isPremium ? "hsl(35, 92%, 50%)" : "var(--color-primary)"
              }} 
            />
          </div>
        </div>

        {/* Staff limit */}
        <div>
          <div className={styles.quotaRow}>
            <span className={styles.quotaLabel}>
              <Users size={14} /> Nhân viên (Thợ)
            </span>
            <span>
              {subData?.currentStaffCount} / {subData?.maxStaff === -1 ? "Vô hạn" : subData?.maxStaff}
            </span>
          </div>
          <div className={styles.quotaProgressTrack}>
            <div 
              className={styles.quotaProgressBar}
              style={{ 
                width: subData?.maxStaff === -1 ? "100%" : `${Math.min(100, ((subData?.currentStaffCount || 0) / (subData?.maxStaff || 1)) * 100)}%`,
                background: isPremium ? "hsl(35, 92%, 50%)" : "var(--color-primary)"
              }} 
            />
          </div>
        </div>
      </div>

      {/* Upgrade Button */}
      <button
        className={`btn ${styles.upgradeButton}`}
        style={{
          background: isPremium ? "hsl(35, 92%, 50%)" : "var(--color-primary)",
          boxShadow: isPremium ? "0 4px 12px rgba(245, 158, 11, 0.3)" : undefined
        }}
        onClick={onUpgradeClick}
      >
        <Sparkles size={16} />
        {subData?.planStatus === "EXPIRED" ? "Gia hạn gói ngay" : "Nâng cấp / Gia hạn gói"}
      </button>
    </div>
  );
}

