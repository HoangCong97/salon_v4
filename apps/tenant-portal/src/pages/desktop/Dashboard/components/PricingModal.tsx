import React, { useState } from "react";
import {
  X,
  Loader2,
  Building2,
  Users,
  Check,
  CreditCard,
  Copy,
  CheckCircle2,
} from "lucide-react";

import { Tooltip } from "../../../../components/desktop/ui/Tooltip";
import { SaasPlan, SubscriptionData, CheckoutInvoice } from "../types";
import { formatNumber, formatVND } from "../utils";

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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col relative overflow-y-auto border border-slate-200 select-none">
        {/* Close Button */}
        <button
          type="button"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Header modal */}
        {!checkoutInvoice ? (
          <>
            <div className="text-center mb-6">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                Bảng giá ứng dụng
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2.5 mb-1">
                Nâng cấp Gói thành viên Salon của bạn
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto m-0">
                Lựa chọn gói cước phù hợp để mở rộng chi nhánh và số lượng nhân
                sự trực ca.
              </p>
            </div>

            {plansLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <span className="text-xs font-bold text-slate-500">
                  Đang tải bảng giá dịch vụ...
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch mt-4">
                {plans.map((plan) => {
                  const isCurrentPlan = subData?.planCode === plan.code;
                  const isPremiumPlan = plan.code === "PREMIUM";
                  const ui = getPlanUiConfig(plan.code);

                  return (
                    <div
                      key={plan.id}
                      className="rounded-2xl p-5 flex flex-col justify-between relative bg-white transition-all shadow-xs"
                      style={{
                        border: isCurrentPlan
                          ? `2.5px solid ${ui.color}`
                          : "1px solid #e2e8f0",
                        boxShadow: isCurrentPlan
                          ? `0 10px 30px -10px ${ui.color}40`
                          : undefined,
                      }}
                    >
                      {/* Popular / Recommended / Current Ribbon badge */}
                      {isCurrentPlan ? (
                        <span
                          className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-xs uppercase tracking-wide"
                          style={{ background: ui.color }}
                        >
                          Gói hiện tại
                        </span>
                      ) : isPremiumPlan ? (
                        <span
                          className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-xs uppercase tracking-wide"
                          style={{ background: ui.color }}
                        >
                          Khuyên dùng
                        </span>
                      ) : null}

                      <div>
                        {/* Plan Name & Price */}
                        <div className="mb-4">
                          <h3
                            className="text-sm font-extrabold uppercase m-0"
                            style={{ color: ui.color }}
                          >
                            {plan.name}
                          </h3>
                          <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900">
                              {plan.price === 0
                                ? "0đ"
                                : `${formatNumber(plan.price)}đ`}
                            </span>
                            {plan.price > 0 && (
                              <span className="text-xs text-slate-500 font-semibold">
                                / tháng
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quota Limits Preview */}
                        <div className="flex flex-col gap-2 text-xs text-slate-700 py-3.5 border-y border-slate-100 mb-4">
                          <div className="flex items-center gap-2">
                            <Building2 size={15} style={{ color: ui.color }} />
                            <span>
                              Chi nhánh tối đa:{" "}
                              <strong className="text-slate-900">
                                {plan.maxBranches === -1
                                  ? "Không giới hạn"
                                  : `${plan.maxBranches} chi nhánh`}
                              </strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={15} style={{ color: ui.color }} />
                            <span>
                              Nhân sự tối đa:{" "}
                              <strong className="text-slate-900">
                                {plan.maxStaff === -1
                                  ? "Không giới hạn"
                                  : `${plan.maxStaff} nhân viên`}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Features Checklist */}
                        <div className="flex flex-col gap-2 mb-6">
                          {plan.features.map((feature, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 text-xs text-slate-600"
                            >
                              <Check
                                size={15}
                                style={{ color: ui.color }}
                                className="flex-shrink-0 mt-0.5"
                              />
                              <span className="leading-tight">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Plan CTA Button */}
                      <div>
                        {isCurrentPlan ? (
                          <button
                            type="button"
                            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 cursor-default"
                            disabled
                          >
                            Gói đang sử dụng
                          </button>
                        ) : plan.code === "FREE" ? (
                          <button
                            type="button"
                            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 cursor-default"
                            disabled
                          >
                            Chỉ dùng thử 1 lần
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] cursor-pointer"
                            style={{
                              background: ui.color,
                              cursor: isBuying ? "not-allowed" : "pointer",
                            }}
                            disabled={isBuying}
                            onClick={() => onBuyPlan(plan.code)}
                          >
                            {isBuying ? (
                              <Loader2 className="animate-spin" size={15} />
                            ) : (
                              "Đăng ký đặt mua"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* CHECKOUT INVOICE DETAILS AND PAYMENT INFO */
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 mx-auto mb-3">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 m-0">
                Khởi tạo hóa đơn đặt mua thành công!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
                Vui lòng hoàn tất thanh toán chuyển khoản ngân hàng dưới đây để
                hệ thống tự động kích hoạt.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              {/* Bank Transfer Specs */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col gap-3.5 text-xs">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 m-0">
                  <CreditCard size={16} className="text-blue-600" />
                  Thông tin tài khoản nhận
                </h3>

                <div className="flex flex-col gap-3 pt-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500">
                      Ngân hàng nhận:
                    </span>
                    <div className="font-bold text-slate-900 mt-0.5">
                      Ngân hàng Công thương Việt Nam (VietinBank)
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500">
                      Số tài khoản:
                    </span>
                    <div className="flex items-center gap-2 font-mono font-black text-sm text-blue-900 bg-white p-2 rounded-lg border border-slate-200 mt-0.5">
                      <span>1023456789</span>
                      <Tooltip content="Sao chép số tài khoản">
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard("1023456789", "account")
                          }
                          className="ml-auto w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          {copiedField === "account" ? (
                            <CheckCircle2 size={14} className="text-emerald-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500">
                      Chủ tài khoản:
                    </span>
                    <div className="font-bold text-slate-900 mt-0.5">
                      CONG TY CO PHAN TECH SALON
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-2.5">
                    <span className="text-[11px] font-bold text-slate-500">
                      Số tiền chuyển khoản:
                    </span>
                    <div className="text-lg font-black text-emerald-700 mt-0.5">
                      {formatVND(checkoutInvoice.amount)}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500">
                      Nội dung chuyển khoản (bắt buộc ghi đúng):
                    </span>
                    <div className="flex items-center gap-2 font-mono font-black text-sm text-rose-800 bg-rose-50 p-2 rounded-lg border border-rose-200 mt-0.5">
                      <span>{checkoutInvoice.invoiceNumber}</span>
                      <Tooltip content="Sao chép nội dung chuyển khoản">
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              checkoutInvoice.invoiceNumber,
                              "code",
                            )
                          }
                          className="ml-auto w-6 h-6 rounded flex items-center justify-center text-rose-600 hover:text-rose-900 hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          {copiedField === "code" ? (
                            <CheckCircle2 size={14} className="text-emerald-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic VietQR display */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-2xs">
                <div className="text-xs font-extrabold text-slate-900 mb-3">
                  Quét mã QR để thanh toán nhanh
                </div>
                <img
                  src={`https://img.vietqr.io/image/vietinbank-1023456789-compact2.png?amount=${checkoutInvoice.amount}&addInfo=${checkoutInvoice.invoiceNumber}&accountName=CONG%20TY%20CO%20PHAN%20TECH%20SALON`}
                  alt="VietQR Chuyển khoản"
                  className="max-w-[210px] w-full rounded-xl border border-slate-200 shadow-xs"
                />
                <div className="text-[11px] text-slate-500 mt-3 font-medium">
                  Hỗ trợ tất cả ứng dụng ngân hàng và ví điện tử
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 w-full pt-4 border-t border-slate-100">
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                onClick={onCheckoutSuccess}
              >
                Bỏ qua
              </button>
              <button
                type="button"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                onClick={() => {
                  onCheckoutSuccess();
                  alert(
                    "Cảm ơn bạn! Yêu cầu đang được hệ thống xử lý. Gói dịch vụ của bạn sẽ được kích hoạt sau khi chúng tôi nhận được thanh toán.",
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
