import React, { useState } from "react";
import { X, Loader2, Building2, Users, Check, CreditCard, Copy, CheckCircle2 } from "lucide-react";
import { Tooltip } from "../../../../components/desktop/Tooltip";

const getPlanUiConfig = (code: string) => {
  const norm = code.toUpperCase();
  if (norm === "PLUS") {
    return {
      name: "Gói Plus",
      color: "#64748b", // Silver
      iconBgColor: "#f1f5f9",
      accentBg: "#64748b",
      borderColor: "rgba(148, 163, 184, 0.4)"
    };
  }
  if (norm === "PREMIUM") {
    return {
      name: "Gói Premium",
      color: "#d97706", // Gold
      iconBgColor: "#fef3c7",
      accentBg: "#d97706",
      borderColor: "rgba(245, 158, 11, 0.4)"
    };
  }
  // FREE / BASIC / Default
  return {
    name: "Gói Basic",
    color: "#b45309", // Bronze
    iconBgColor: "#ffedd5",
    accentBg: "#b45309",
    borderColor: "rgba(217, 119, 6, 0.35)"
  };
};

interface SaasPlan {
  id: string;
  name: string;
  code: string;
  price: number;
  maxBranches: number;
  maxStaff: number;
  features: string[];
}

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

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  subData: SubscriptionData | null;
  plans: SaasPlan[];
  plansLoading: boolean;
  checkoutInvoice: any;
  isBuying: boolean;
  onBuyPlan: (planCode: string) => Promise<void>;
  onCheckoutSuccess: () => void;
}

export function PricingModal({
  isOpen,
  onClose,
  subData,
  plans,
  plansLoading,
  checkoutInvoice,
  isBuying,
  onBuyPlan,
  onCheckoutSuccess
}: PricingModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
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
          onClick={onClose}
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
                  const ui = getPlanUiConfig(plan.code);
                  
                  return (
                    <div
                      key={plan.id}
                      className="card"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "24px",
                        borderRadius: "16px",
                        border: isCurrentPlan 
                          ? `2.5px solid ${ui.color}` 
                          : "1px solid var(--border-color)",
                        background: "var(--bg-card)",
                        color: "var(--text-primary)",
                        position: "relative",
                        boxShadow: isCurrentPlan 
                          ? `0 10px 30px -10px ${ui.color}40` 
                          : "var(--shadow-sm)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {/* Popular / Recommended / Current Ribbon badge */}
                      {isCurrentPlan ? (
                        <span 
                          style={{ 
                            position: "absolute", 
                            top: "-12px", 
                            left: "50%", 
                            transform: "translateX(-50%)", 
                            background: ui.color, 
                            color: "white", 
                            fontSize: "11px", 
                            fontWeight: "700", 
                            padding: "4px 12px", 
                            borderRadius: "100px"
                          }}
                        >
                          Gói hiện tại
                        </span>
                      ) : isPremiumPlan ? (
                        <span 
                          style={{ 
                            position: "absolute", 
                            top: "-12px", 
                            left: "50%", 
                            transform: "translateX(-50%)", 
                            background: ui.color, 
                            color: "white", 
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
                      ) : null}

                      {/* Plan Name & Price */}
                      <div style={{ marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", textTransform: "uppercase", color: ui.color }}>
                          {plan.name}
                        </h3>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "12px" }}>
                          <span style={{ fontSize: "28px", fontWeight: "800" }}>
                            {plan.price === 0 ? "0đ" : plan.price.toLocaleString("vi-VN") + "đ"}
                          </span>
                          {plan.price > 0 && <span style={{ fontSize: "13px", opacity: 0.7 }}>/ tháng</span>}
                        </div>
                      </div>

                      {/* Quota Limits Preview */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", paddingBottom: "16px", borderBottom: "1px solid var(--border-color)", marginBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Building2 size={16} style={{ color: ui.color }} />
                          <span>Chi nhánh tối đa: <strong>{plan.maxBranches === -1 ? "Không giới hạn" : `${plan.maxBranches} chi nhánh`}</strong></span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Users size={16} style={{ color: ui.color }} />
                          <span>Nhân sự tối đa: <strong>{plan.maxStaff === -1 ? "Không giới hạn" : `${plan.maxStaff} nhân viên`}</strong></span>
                        </div>
                      </div>

                      {/* Features Checklist */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", flexGrow: 1, marginBottom: "24px" }}>
                        {plan.features.map((feature, idx) => (
                          <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "13px" }}>
                            <Check size={16} style={{ color: ui.color, flexShrink: 0, marginTop: "2px" }} />
                            <span style={{ opacity: 0.9 }}>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Plan CTA Button */}
                      {isCurrentPlan ? (
                        <button
                          className="btn btn-secondary"
                          disabled
                          style={{ 
                            width: "100%", 
                            background: "hsl(210, 40%, 94%)", 
                            border: "none", 
                            cursor: "default", 
                            color: "var(--text-muted)",
                            fontWeight: "600"
                          }}
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
                            background: ui.color,
                            color: "white",
                            border: "none",
                            fontWeight: "700",
                            cursor: isBuying ? "not-allowed" : "pointer"
                          }}
                          disabled={isBuying}
                          onClick={() => onBuyPlan(plan.code)}
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
                      <Tooltip content="Sao chép số tài khoản">
                        <button 
                          onClick={() => copyToClipboard("1023456789", "account")}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                          {copiedField === "account" ? <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} /> : <Copy size={16} />}
                        </button>
                      </Tooltip>
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
                      <Tooltip content="Sao chép nội dung chuyển khoản">
                        <button 
                          onClick={() => copyToClipboard(checkoutInvoice.invoiceNumber, "code")}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", marginLeft: "auto" }}
                        >
                          {copiedField === "code" ? <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} /> : <Copy size={16} />}
                        </button>
                      </Tooltip>
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
                onClick={onCheckoutSuccess}
              >
                Bỏ qua
              </button>
              <button 
                className="btn btn-primary" 
                style={{ background: "var(--color-success)" }}
                onClick={() => {
                  onCheckoutSuccess();
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
  );
}
