import React from "react";
import { Loader2, Crown, Clock, Building2, Users, Sparkles } from "lucide-react";

interface SubscriptionData {
  tenantId: string;
  tenantName: string;
  planId: string | null;
  planName: string;
  planCode: string;
  planPrice: number;
  planStartedAt: string | null;
  planExpiresAt: string | null;
  planStatus: string;
  maxBranches: number;
  maxStaff: number;
  currentBranchesCount: number;
  currentStaffCount: number;
  features: string[];
}

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

  const getCardStyle = () => {
    if (subData?.planCode === "PREMIUM") {
      return {
        background: "#ffffff",
        color: "var(--text-primary)",
        border: "2px solid hsl(35, 92%, 50%)",
        boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.15)"
      };
    }
    if (subData?.planCode === "BASIC") {
      return {
        background: "linear-gradient(135deg, hsl(210, 40%, 98%) 0%, hsl(215, 30%, 94%) 100%)",
        color: "var(--text-primary)",
        border: "1px solid var(--color-primary)",
        boxShadow: "var(--shadow-md)"
      };
    }
    // Trial / FREE
    return {
      background: "linear-gradient(135deg, hsl(210, 20%, 99%) 0%, hsl(210, 15%, 96%) 100%)",
      color: "var(--text-primary)",
      border: "1px solid var(--border-color)",
      boxShadow: "var(--shadow-sm)"
    };
  };

  if (subLoading) {
    return (
      <div className="card" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Đang tải gói thành viên...</span>
        </div>
      </div>
    );
  }

  const isPremium = subData?.planCode === "PREMIUM";

  return (
    <div className="card" style={{ ...getCardStyle(), display: "flex", flexDirection: "column", gap: "16px", transition: "transform 0.2s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", opacity: 0.8, marginBottom: "4px" }}>
            Gói ứng dụng
          </h3>
          <h2 style={{ fontSize: "20px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
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
          <span className="badge badge-success" style={isPremium ? { background: "hsl(35, 92%, 50%)", color: "white", fontWeight: "bold" } : undefined}>
            Hoạt động
          </span>
        )}
      </div>

      {/* Expiry Progress/Status */}
      <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(15, 23, 42, 0.04)", fontSize: "13px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
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
        <div style={{ fontSize: "12px", opacity: 0.7, paddingLeft: "24px" }}>
          Hết hạn ngày: {formatDate(subData?.planExpiresAt)}
        </div>
      </div>

      {/* Resource Quotas */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
        {/* Branches limit */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "500", marginBottom: "4px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", opacity: 0.8 }}>
              <Building2 size={14} /> Chi nhánh
            </span>
            <span>
              {subData?.currentBranchesCount} / {subData?.maxBranches === -1 ? "Vô hạn" : subData?.maxBranches}
            </span>
          </div>
          <div style={{ height: "6px", width: "100%", borderRadius: "3px", background: "rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
            <div 
              style={{ 
                height: "100%", 
                width: subData?.maxBranches === -1 ? "100%" : `${Math.min(100, ((subData?.currentBranchesCount || 0) / (subData?.maxBranches || 1)) * 100)}%`,
                background: isPremium ? "hsl(35, 92%, 50%)" : "var(--color-primary)",
                borderRadius: "3px" 
              }} 
            />
          </div>
        </div>

        {/* Staff limit */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "500", marginBottom: "4px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", opacity: 0.8 }}>
              <Users size={14} /> Nhân viên (Thợ)
            </span>
            <span>
              {subData?.currentStaffCount} / {subData?.maxStaff === -1 ? "Vô hạn" : subData?.maxStaff}
            </span>
          </div>
          <div style={{ height: "6px", width: "100%", borderRadius: "3px", background: "rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
            <div 
              style={{ 
                height: "100%", 
                width: subData?.maxStaff === -1 ? "100%" : `${Math.min(100, ((subData?.currentStaffCount || 0) / (subData?.maxStaff || 1)) * 100)}%`,
                background: isPremium ? "hsl(35, 92%, 50%)" : "var(--color-primary)",
                borderRadius: "3px" 
              }} 
            />
          </div>
        </div>
      </div>

      {/* Upgrade Button */}
      <button
        className="btn"
        style={{
          width: "100%",
          marginTop: "8px",
          background: isPremium ? "hsl(35, 92%, 50%)" : "var(--color-primary)",
          color: isPremium ? "white" : "white",
          border: "none",
          fontWeight: "700",
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
