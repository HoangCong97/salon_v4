import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { 
  ShieldCheck, 
  Calendar, 
  Building2, 
  Users, 
  Loader2, 
  X, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  TrendingUp, 
  CalendarDays, 
  Clock, 
  CreditCard,
  Crown,
  Copy,
  CheckCircle2
} from "lucide-react";

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

interface SaasPlan {
  id: string;
  name: string;
  code: string;
  price: number;
  maxBranches: number;
  maxStaff: number;
  features: string[];
}

export default function Dashboard() {
  const { currentTenantId } = useAuthStore();
  
  // Subscription states
  const [subData, setSubData] = useState<SubscriptionData | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  
  // Buying states
  const [checkoutInvoice, setCheckoutInvoice] = useState<any>(null);
  const [isBuying, setIsBuying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!currentTenantId) return;
    setSubLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/subscription`);
      if (res.ok) {
        const data = await res.json();
        setSubData(data);
      }
    } catch (e) {
      console.error("Failed to fetch subscription status:", e);
    } finally {
      setSubLoading(false);
    }
  };

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/tenants/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (e) {
      console.error("Failed to fetch plans list:", e);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [currentTenantId]);

  useEffect(() => {
    if (isPricingModalOpen && plans.length === 0) {
      fetchPlans();
    }
  }, [isPricingModalOpen]);

  const handleBuyPlan = async (planCode: string) => {
    if (!currentTenantId) return;
    setIsBuying(true);
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/buy-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode })
      });
      if (res.ok) {
        const data = await res.json();
        setCheckoutInvoice(data);
      } else {
        const err = await res.json();
        alert(err.message || "Không thể khởi tạo yêu cầu mua gói");
      }
    } catch (e: any) {
      alert("Đã xảy ra lỗi: " + e.message);
    } finally {
      setIsBuying(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

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

  // Dynamic style for Gói thành viên card
  const getCardStyle = () => {
    if (subData?.planCode === "PREMIUM") {
      return {
        background: "linear-gradient(135deg, hsl(230, 45%, 15%) 0%, hsl(260, 45%, 10%) 100%)",
        color: "#ffffff",
        border: "1px solid rgba(245, 158, 11, 0.4)",
        boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.3)"
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

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 4 Stats Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Doanh thu hôm nay</span>
            <span className="badge badge-success">+12.5%</span>
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "var(--color-success)" }}>4,850,000đ</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>Thanh toán qua POS & Chuyển khoản</p>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Lịch hẹn hôm nay</span>
            <span className="badge badge-primary">18 Lịch</span>
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: "700" }}>12 / 18</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>12 khách đã hoàn thành dịch vụ</p>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Nhân sự trong ca</span>
            <span className="badge badge-info">Đủ thợ</span>
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: "700" }}>6 / 8</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>6 thợ đang thực hiện dịch vụ</p>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Hết hàng cảnh báo</span>
            <span className="badge badge-danger">Cần nhập</span>
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "var(--color-danger)" }}>3</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>3 sản phẩm dầu gội sắp hết trong kho</p>
        </div>
      </div>

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginTop: "12px" }}>
        
        {/* Left Column: Recent Bookings */}
        <div className="card" style={{ minHeight: "300px" }}>
          <h3 className="card-title">Hoạt động đặt lịch gần đây</h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Dịch vụ</th>
                  <th>Kỹ thuật viên</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Nguyễn Văn Hùng</strong></td>
                  <td>Cắt tóc nam styling</td>
                  <td>Thợ A (Stylist)</td>
                  <td>09:00 AM</td>
                  <td><span className="badge badge-success">Đã hoàn thành</span></td>
                </tr>
                <tr>
                  <td><strong>Trần Thị Lan</strong></td>
                  <td>Nail Art & Gel</td>
                  <td>Thợ C (Nail Tech)</td>
                  <td>09:30 AM</td>
                  <td><span className="badge badge-info">Đang làm</span></td>
                </tr>
                <tr>
                  <td><strong>Lê Hoàng Nam</strong></td>
                  <td>Uốn Hàn Quốc</td>
                  <td>Thợ B (Stylist)</td>
                  <td>10:30 AM</td>
                  <td><span className="badge badge-warning">Chờ xác nhận</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Subscription & Daily Turns */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* GÓI THÀNH VIÊN CARD */}
          {subLoading ? (
            <div className="card" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Đang tải gói thành viên...</span>
              </div>
            </div>
          ) : (
            <div className="card" style={{ ...getCardStyle(), display: "flex", flexDirection: "column", gap: "16px", transition: "transform 0.2s ease" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", opacity: 0.8, marginBottom: "4px" }}>
                    Gói ứng dụng
                  </h3>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                    {subData?.planCode === "PREMIUM" && <Crown size={20} style={{ color: "hsl(35, 92%, 50%)" }} />}
                    {subData?.planName.replace("Gói ", "").replace(" (Free Trial)", "").replace(" (Basic)", "").replace(" (Premium)", "")}
                  </h2>
                </div>
                
                {/* Plan Badge */}
                {subData?.planStatus === "EXPIRED" ? (
                  <span className="badge badge-danger">Hết hạn</span>
                ) : subData?.planStatus === "TRIAL" ? (
                  <span className="badge badge-warning">Dùng thử</span>
                ) : (
                  <span className="badge badge-success" style={subData?.planCode === "PREMIUM" ? { background: "hsl(35, 92%, 50%)", color: "hsl(230, 45%, 15%)", fontWeight: "bold" } : undefined}>
                    Hoạt động
                  </span>
                )}
              </div>

              {/* Expiry Progress/Status */}
              <div style={{ padding: "10px 12px", borderRadius: "8px", background: subData?.planCode === "PREMIUM" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.04)", fontSize: "13px" }}>
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
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: subData?.planCode === "PREMIUM" ? "1px solid rgba(255,255,255,0.1)" : "1px solid var(--border-color)", paddingTop: "14px" }}>
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
                  <div style={{ height: "6px", width: "100%", borderRadius: "3px", background: subData?.planCode === "PREMIUM" ? "rgba(255,255,255,0.15)" : "rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
                    <div 
                      style={{ 
                        height: "100%", 
                        width: subData?.maxBranches === -1 ? "100%" : `${Math.min(100, ((subData?.currentBranchesCount || 0) / (subData?.maxBranches || 1)) * 100)}%`,
                        background: subData?.planCode === "PREMIUM" ? "hsl(35, 92%, 50%)" : "var(--color-primary)",
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
                  <div style={{ height: "6px", width: "100%", borderRadius: "3px", background: subData?.planCode === "PREMIUM" ? "rgba(255,255,255,0.15)" : "rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
                    <div 
                      style={{ 
                        height: "100%", 
                        width: subData?.maxStaff === -1 ? "100%" : `${Math.min(100, ((subData?.currentStaffCount || 0) / (subData?.maxStaff || 1)) * 100)}%`,
                        background: subData?.planCode === "PREMIUM" ? "hsl(35, 92%, 50%)" : "var(--color-primary)",
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
                  background: subData?.planCode === "PREMIUM" ? "hsl(35, 92%, 50%)" : "var(--color-primary)",
                  color: subData?.planCode === "PREMIUM" ? "hsl(230, 45%, 15%)" : "white",
                  border: "none",
                  fontWeight: "700",
                  boxShadow: subData?.planCode === "PREMIUM" ? "0 4px 12px rgba(245, 158, 11, 0.3)" : undefined
                }}
                onClick={() => setIsPricingModalOpen(true)}
              >
                <Sparkles size={16} />
                {subData?.planStatus === "EXPIRED" ? "Gia hạn gói ngay" : "Nâng cấp / Gia hạn gói"}
              </button>
            </div>
          )}

          {/* Daily Turns Card */}
          <div className="card">
            <h3 className="card-title">Hàng đợi xoay tua thợ (Daily Turns)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "8px", background: "hsl(210, 40%, 96%)" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--color-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>1</div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: "600" }}>Thợ B (Stylist)</div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Đã phục vụ: 2 lượt</div>
                </div>
                <span className="badge badge-success">Sẵn sàng</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "8px", background: "hsl(210, 40%, 96%)" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "hsl(215, 10%, 65%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>2</div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: "600" }}>Thợ A (Stylist)</div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Đã phục vụ: 3 lượt</div>
                </div>
                <span className="badge badge-info">Đang làm</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "8px", background: "hsl(210, 40%, 96%)" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "hsl(215, 10%, 65%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>3</div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: "600" }}>Thợ C (Nail)</div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Đã phục vụ: 1 lượt</div>
                </div>
                <span className="badge badge-info">Đang làm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRICING PLANS COMPARISON MODAL */}
      {isPricingModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
            overflowY: "auto"
          }}
        >
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "960px", position: "relative", padding: "32px", maxHeight: "90vh", overflowY: "auto" }}>
            {/* Close Button */}
            <button
              style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
              onClick={() => {
                setIsPricingModalOpen(false);
                setCheckoutInvoice(null);
              }}
            >
              <X size={22} />
            </button>

            {/* Header modal */}
            {!checkoutInvoice ? (
              <>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                  <span style={{ background: "var(--color-primary-light)", color: "var(--color-primary)", padding: "6px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>
                    Bảng giá ứng dụng
                  </span>
                  <h2 style={{ fontSize: "24px", fontWeight: "800", marginTop: "12px" }}>
                    Nâng cấp Gói thành viên Salon của bạn
                  </h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "6px" }}>
                    Lựa chọn gói cước phù hợp để mở rộng chi nhánh và số lượng nhân sự trực ca.
                  </p>
                </div>

                {plansLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "10px" }}>
                    <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
                    <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Đang tải bảng giá dịch vụ...</span>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", alignItems: "stretch" }}>
                    {plans.map((plan) => {
                      const isCurrentPlan = subData?.planCode === plan.code;
                      const isPremiumPlan = plan.code === "PREMIUM";
                      const isBasicPlan = plan.code === "BASIC";
                      
                      return (
                        <div
                          key={plan.id}
                          className="card"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            padding: "24px",
                            borderRadius: "16px",
                            border: isPremiumPlan 
                              ? "2px solid hsl(35, 92%, 50%)" 
                              : isCurrentPlan 
                                ? "2px solid var(--color-primary)" 
                                : "1px solid var(--border-color)",
                            background: isPremiumPlan 
                              ? "linear-gradient(135deg, hsl(230, 45%, 12%) 0%, hsl(260, 45%, 8%) 100%)" 
                              : "var(--bg-card)",
                            color: isPremiumPlan ? "#ffffff" : "var(--text-primary)",
                            position: "relative",
                            boxShadow: isPremiumPlan ? "0 10px 30px -10px rgba(124, 58, 237, 0.4)" : "var(--shadow-sm)"
                          }}
                        >
                          {/* Popular / Premium Ribbon badge */}
                          {isPremiumPlan && (
                            <span 
                              style={{ 
                                position: "absolute", 
                                top: "-12px", 
                                left: "50%", 
                                transform: "translateX(-50%)", 
                                background: "hsl(35, 92%, 50%)", 
                                color: "hsl(230, 45%, 15%)", 
                                fontSize: "11px", 
                                fontWeight: "800", 
                                padding: "4px 12px", 
                                borderRadius: "100px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                              }}
                            >
                              Khuyên dùng
                            </span>
                          )}

                          {isCurrentPlan && !isPremiumPlan && (
                            <span 
                              style={{ 
                                position: "absolute", 
                                top: "-12px", 
                                left: "50%", 
                                transform: "translateX(-50%)", 
                                background: "var(--color-primary)", 
                                color: "white", 
                                fontSize: "11px", 
                                fontWeight: "700", 
                                padding: "4px 12px", 
                                borderRadius: "100px"
                              }}
                            >
                              Gói hiện tại
                            </span>
                          )}

                          {/* Plan Name & Price */}
                          <div style={{ marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "700", textTransform: "uppercase", color: isPremiumPlan ? "hsl(35, 92%, 50%)" : "var(--text-secondary)" }}>
                              {plan.name.replace(" (Free Trial)", "").replace(" (Basic)", "").replace(" (Premium)", "")}
                            </h3>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "12px" }}>
                              <span style={{ fontSize: "28px", fontWeight: "800" }}>
                                {plan.price === 0 ? "0đ" : plan.price.toLocaleString("vi-VN") + "đ"}
                              </span>
                              {plan.price > 0 && <span style={{ fontSize: "13px", opacity: 0.7 }}>/ tháng</span>}
                            </div>
                          </div>

                          {/* Quota Limits Preview */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", paddingBottom: "16px", borderBottom: isPremiumPlan ? "1px solid rgba(255,255,255,0.1)" : "1px solid var(--border-color)", marginBottom: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <Building2 size={16} style={{ color: isPremiumPlan ? "hsl(35, 92%, 50%)" : "var(--color-primary)" }} />
                              <span>Chi nhánh tối đa: <strong>{plan.maxBranches === -1 ? "Không giới hạn" : `${plan.maxBranches} chi nhánh`}</strong></span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <Users size={16} style={{ color: isPremiumPlan ? "hsl(35, 92%, 50%)" : "var(--color-primary)" }} />
                              <span>Nhân sự tối đa: <strong>{plan.maxStaff === -1 ? "Không giới hạn" : `${plan.maxStaff} nhân viên`}</strong></span>
                            </div>
                          </div>

                          {/* Features Checklist */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flexGrow: 1, marginBottom: "24px" }}>
                            {plan.features.map((feature, idx) => (
                              <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "13px" }}>
                                <Check size={16} style={{ color: isPremiumPlan ? "hsl(35, 92%, 50%)" : "var(--color-success)", flexShrink: 0, marginTop: "2px" }} />
                                <span style={{ opacity: 0.9 }}>{feature}</span>
                              </div>
                            ))}
                          </div>

                          {/* Plan CTA Button */}
                          {isCurrentPlan ? (
                            <button
                              className="btn btn-secondary"
                              disabled
                              style={{ width: "100%", background: isPremiumPlan ? "rgba(255,255,255,0.1)" : "hsl(210, 40%, 94%)", border: "none", cursor: "default", color: isPremiumPlan ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }}
                            >
                              Gói đang sử dụng
                            </button>
                          ) : plan.code === "FREE" ? (
                            <button
                              className="btn btn-secondary"
                              disabled
                              style={{ width: "100%", background: "hsl(210, 40%, 94%)", border: "none", cursor: "default", color: "var(--text-muted)" }}
                            >
                              Chỉ dùng thử 1 lần
                            </button>
                          ) : (
                            <button
                              className="btn"
                              style={{
                                width: "100%",
                                background: isPremiumPlan ? "hsl(35, 92%, 50%)" : "var(--color-primary)",
                                color: isPremiumPlan ? "hsl(230, 45%, 15%)" : "white",
                                border: "none",
                                fontWeight: "700",
                                cursor: isBuying ? "not-allowed" : "pointer"
                              }}
                              disabled={isBuying}
                              onClick={() => handleBuyPlan(plan.code)}
                            >
                              {isBuying ? (
                                <Loader2 className="animate-spin" size={16} />
                              ) : (
                                "Đăng ký đặt mua"
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              /* CHECKOUT INVOICE DETAILS AND PAYMENT INFO */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", animation: "animate-fade-in 0.3s ease" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--color-success-light)", color: "var(--color-success)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 style={{ fontSize: "22px", fontWeight: "800" }}>Khởi tạo hóa đơn đặt mua thành công!</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "6px" }}>
                    Vui lòng hoàn tất thanh toán chuyển khoản ngân hàng dưới đây để hệ thống tự động kích hoạt.
                  </p>
                </div>

                <div 
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "24px", 
                    width: "100%", 
                    background: "hsl(210, 40%, 96%)", 
                    padding: "24px", 
                    borderRadius: "16px",
                    alignItems: "center"
                  }}
                >
                  {/* Bank Transfer Specs */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <CreditCard size={18} style={{ color: "var(--color-primary)" }} /> Thông tin tài khoản nhận
                    </h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Ngân hàng nhận:</span>
                        <div style={{ fontWeight: "700", marginTop: "2px" }}>Ngân hàng Công thương Việt Nam (VietinBank)</div>
                      </div>
                      
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Số tài khoản:</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "800", fontSize: "16px", color: "var(--color-primary)", marginTop: "2px" }}>
                          1023456789
                          <button 
                            onClick={() => copyToClipboard("1023456789", "account")}
                            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
                            title="Sao chép số tài khoản"
                          >
                            {copiedField === "account" ? <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Chủ tài khoản:</span>
                        <div style={{ fontWeight: "700", marginTop: "2px" }}>CONG TY CO PHAN TECH SALON</div>
                      </div>

                      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "10px" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Số tiền chuyển khoản:</span>
                        <div style={{ fontWeight: "800", fontSize: "18px", color: "var(--color-success)", marginTop: "2px" }}>
                          {checkoutInvoice.amount.toLocaleString("vi-VN")}đ
                        </div>
                      </div>

                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Nội dung chuyển khoản (bắt buộc ghi đúng):</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "800", fontSize: "15px", color: "hsl(35, 92%, 45%)", marginTop: "2px", background: "white", padding: "6px 10px", borderRadius: "6px", border: "1px dashed hsl(35, 92%, 50%)" }}>
                          {checkoutInvoice.invoiceNumber}
                          <button 
                            onClick={() => copyToClipboard(checkoutInvoice.invoiceNumber, "code")}
                            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", marginLeft: "auto" }}
                            title="Sao chép nội dung chuyển khoản"
                          >
                            {copiedField === "code" ? <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic VietQR display */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quét mã QR để thanh toán</div>
                    <img 
                      src={`https://img.vietqr.io/image/vietinbank-1023456789-compact2.png?amount=${checkoutInvoice.amount}&addInfo=${checkoutInvoice.invoiceNumber}&accountName=CONG%20TY%20CO%20PHAN%20TECH%20SALON`}
                      alt="VietQR Chuyển khoản"
                      style={{ width: "200px", height: "200px", objectFit: "contain" }}
                    />
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>Hỗ trợ tất cả ứng dụng ngân hàng và ví điện tử</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", width: "100%", justifyContent: "flex-end", marginTop: "8px" }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setIsPricingModalOpen(false);
                      setCheckoutInvoice(null);
                      fetchSubscription();
                    }}
                  >
                    Bỏ qua
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ background: "var(--color-success)" }}
                    onClick={() => {
                      setIsPricingModalOpen(false);
                      setCheckoutInvoice(null);
                      fetchSubscription();
                      alert("Cảm ơn bạn! Yêu cầu đang được hệ thống xử lý. Gói dịch vụ của bạn sẽ được kích hoạt sau khi chúng tôi nhận được thanh toán.");
                    }}
                  >
                    Tôi đã chuyển khoản thành công
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
