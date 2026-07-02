import React, { useState } from "react";
import { X, Loader2, Building2, Users, Check, CreditCard, Copy, CheckCircle2 } from "lucide-react";

import { Tooltip } from "../../../../components/desktop/ui/Tooltip";

import { SaasPlan, SubscriptionData, CheckoutInvoice } from "../types";

import styles from "../Dashboard.module.css";

const getPlanUiConfig = (code: string) => {
  const norm = code.toUpperCase();
  if (norm === "PLUS") {
    return {
      name: "Gói Plus",
      color: "#64748b", // Silver
      iconBgColor: "#f1f5f9",
      accentBg: "#64748b",
      borderColor: "rgba(148, 163, 184, 0.4)",
    };
  }
  if (norm === "PREMIUM") {
    return {
      name: "Gói Premium",
      color: "#d97706", // Gold
      iconBgColor: "#fef3c7",
      accentBg: "#d97706",
      borderColor: "rgba(245, 158, 11, 0.4)",
    };
  }
  // FREE / BASIC / Default
  return {
    name: "Gói Basic",
    color: "#b45309", // Bronze
    iconBgColor: "#ffedd5",
    accentBg: "#b45309",
    borderColor: "rgba(217, 119, 6, 0.35)",
  };
};

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  subData: SubscriptionData | null;
  plans: SaasPlan[];
  plansLoading: boolean;
  checkoutInvoice: CheckoutInvoice | null;
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
  onCheckoutSuccess,
}: PricingModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={`card animate-fade-in ${styles.modalCard}`}>
        {/* Close Button */}
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={22} />
        </button>

        {/* Header modal */}
        {!checkoutInvoice ? (
          <>
            <div className={styles.pricingHeader}>
              <span className={styles.pricingSubtitle}>Bảng giá ứng dụng</span>
              <h2 className={styles.pricingTitle}>
                Nâng cấp Gói thành viên Salon của bạn
              </h2>
              <p className={styles.pricingDesc}>
                Lựa chọn gói cước phù hợp để mở rộng chi nhánh và số lượng nhân sự trực ca.
              </p>
            </div>

            {plansLoading ? (
              <div className={styles.loadingWrapper}>
                <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
                <span className={styles.pricingDesc}>Đang tải bảng giá dịch vụ...</span>
              </div>
            ) : (
              <div className={styles.plansGrid}>
                {plans.map((plan) => {
                  const isCurrentPlan = subData?.planCode === plan.code;
                  const isPremiumPlan = plan.code === "PREMIUM";
                  const ui = getPlanUiConfig(plan.code);

                  return (
                    <div
                      key={plan.id}
                      className={`card ${styles.planCard}`}
                      style={{
                        border: isCurrentPlan
                          ? `2.5px solid ${ui.color}`
                          : "1px solid var(--border-color)",
                        boxShadow: isCurrentPlan
                          ? `0 10px 30px -10px ${ui.color}40`
                          : "var(--shadow-sm)",
                      }}
                    >
                      {/* Popular / Recommended / Current Ribbon badge */}
                      {isCurrentPlan ? (
                        <span
                          className={`${styles.planRibbon} ${styles.planRibbonCurrent}`}
                          style={{ background: ui.color }}
                        >
                          Gói hiện tại
                        </span>
                      ) : isPremiumPlan ? (
                        <span
                          className={`${styles.planRibbon} ${styles.planRibbonRecommended}`}
                          style={{ background: ui.color }}
                        >
                          Khuyên dùng
                        </span>
                      ) : null}

                      {/* Plan Name & Price */}
                      <div className={styles.planHeader}>
                        <h3 className={styles.planName} style={{ color: ui.color }}>
                          {plan.name}
                        </h3>
                        <div className={styles.planPriceContainer}>
                          <span className={styles.planPrice}>
                            {plan.price === 0 ? "0đ" : plan.price.toLocaleString("vi-VN") + "đ"}
                          </span>
                          {plan.price > 0 && (
                            <span className={styles.planPricePeriod}>/ tháng</span>
                          )}
                        </div>
                      </div>

                      {/* Quota Limits Preview */}
                      <div className={styles.planQuotas}>
                        <div className={styles.planQuotaItem}>
                          <Building2 size={16} style={{ color: ui.color }} />
                          <span>
                            Chi nhánh tối đa:{" "}
                            <strong>
                              {plan.maxBranches === -1
                                ? "Không giới hạn"
                                : `${plan.maxBranches} chi nhánh`}
                            </strong>
                          </span>
                        </div>
                        <div className={styles.planQuotaItem}>
                          <Users size={16} style={{ color: ui.color }} />
                          <span>
                            Nhân sự tối đa:{" "}
                            <strong>
                              {plan.maxStaff === -1
                                ? "Không giới hạn"
                                : `${plan.maxStaff} nhân viên`}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Features Checklist */}
                      <div className={styles.planFeatures}>
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className={styles.planFeatureRow}>
                            <Check
                              size={16}
                              style={{ color: ui.color }}
                              className={styles.planFeatureIcon}
                            />
                            <span className={styles.planFeatureText}>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Plan CTA Button */}
                      {isCurrentPlan ? (
                        <button
                          className={`btn btn-secondary ${styles.planBtnCurrent}`}
                          disabled
                        >
                          Gói đang sử dụng
                        </button>
                      ) : plan.code === "FREE" ? (
                        <button
                          className={`btn btn-secondary ${styles.planBtnTrial}`}
                          disabled
                        >
                          Chỉ dùng thử 1 lần
                        </button>
                      ) : (
                        <button
                          className={`btn ${styles.planBtnAction}`}
                          style={{
                            background: ui.color,
                            cursor: isBuying ? "not-allowed" : "pointer",
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
          <div className={styles.checkoutWrapper}>
            <div className={styles.checkoutHeader}>
              <div className={styles.checkoutIconBg}>
                <CheckCircle2 size={32} />
              </div>
              <h2 className={styles.checkoutTitle}>Khởi tạo hóa đơn đặt mua thành công!</h2>
              <p className={styles.checkoutDesc}>
                Vui lòng hoàn tất thanh toán chuyển khoản ngân hàng dưới đây để hệ thống tự động kích hoạt.
              </p>
            </div>

            <div className={styles.checkoutGrid}>
              {/* Bank Transfer Specs */}
              <div className={styles.checkoutBankInfo}>
                <h3 className={styles.checkoutBankTitle}>
                  <CreditCard size={18} style={{ color: "var(--color-primary)" }} /> Thông tin tài khoản nhận
                </h3>

                <div className={styles.checkoutBankSpecs}>
                  <div>
                    <span className={styles.checkoutSpecsLabel}>Ngân hàng nhận:</span>
                    <div className={styles.checkoutSpecsValue}>Ngân hàng Công thương Việt Nam (VietinBank)</div>
                  </div>

                  <div>
                    <span className={styles.checkoutSpecsLabel}>Số tài khoản:</span>
                    <div className={styles.checkoutAccountNumber}>
                      1023456789
                      <Tooltip content="Sao chép số tài khoản">
                        <button
                          onClick={() => copyToClipboard("1023456789", "account")}
                          className={styles.checkoutCopyBtn}
                        >
                          {copiedField === "account" ? (
                            <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  <div>
                    <span className={styles.checkoutSpecsLabel}>Chủ tài khoản:</span>
                    <div className={styles.checkoutSpecsValue}>CONG TY CO PHAN TECH SALON</div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "10px" }}>
                    <span className={styles.checkoutSpecsLabel}>Số tiền chuyển khoản:</span>
                    <div className={styles.checkoutAmount}>
                      {checkoutInvoice.amount.toLocaleString("vi-VN")}đ
                    </div>
                  </div>

                  <div>
                    <span className={styles.checkoutSpecsLabel}>Nội dung chuyển khoản (bắt buộc ghi đúng):</span>
                    <div className={styles.checkoutContentField}>
                      {checkoutInvoice.invoiceNumber}
                      <Tooltip content="Sao chép nội dung chuyển khoản">
                        <button
                          onClick={() => copyToClipboard(checkoutInvoice.invoiceNumber, "code")}
                          className={styles.checkoutCopyBtn}
                          style={{ marginLeft: "auto" }}
                        >
                          {copiedField === "code" ? (
                            <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic VietQR display */}
              <div className={styles.checkoutQRCard}>
                <div className={styles.checkoutQRLabel}>Quét mã QR để thanh toán</div>
                <img
                  src={`https://img.vietqr.io/image/vietinbank-1023456789-compact2.png?amount=${checkoutInvoice.amount}&addInfo=${checkoutInvoice.invoiceNumber}&accountName=CONG%20TY%20CO%20PHAN%20TECH%20SALON`}
                  alt="VietQR Chuyển khoản"
                  className={styles.checkoutQRImage}
                />
                <div className={styles.checkoutQRSub}>Hỗ trợ tất cả ứng dụng ngân hàng và ví điện tử</div>
              </div>
            </div>

            <div className={styles.checkoutFooter}>
              <button className="btn btn-secondary" onClick={onCheckoutSuccess}>
                Bỏ qua
              </button>
              <button
                className={`btn btn-primary ${styles.checkoutDoneBtn}`}
                onClick={() => {
                  onCheckoutSuccess();
                  alert(
                    "Cảm ơn bạn! Yêu cầu đang được hệ thống xử lý. Gói dịch vụ của bạn sẽ được kích hoạt sau khi chúng tôi nhận được thanh toán."
                  );
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

