import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export default function POSOverlayButton() {
  const navigate = useNavigate();
  const [badgeCount, setBadgeCount] = useState<number>(0);

  const updateCount = useCallback(() => {
    try {
      // 1. Kiểm tra giỏ hàng POS Mobile
      const mobileSaved = localStorage.getItem("pos_mobile_cart");
      if (mobileSaved) {
        const parsed = JSON.parse(mobileSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const total = parsed.reduce(
            (sum: number, it: any) => sum + (Number(it.quantity) || 1),
            0,
          );
          setBadgeCount(total);
          return;
        }
      }

      // 2. Dự phòng: Kiểm tra hóa đơn tab POS Desktop nếu có
      const desktopSaved = localStorage.getItem("pos_invoices");
      if (desktopSaved) {
        const parsed = JSON.parse(desktopSaved);
        if (Array.isArray(parsed)) {
          const activeInvoices = parsed.filter(
            (inv: any) => Array.isArray(inv.cart) && inv.cart.length > 0,
          );
          if (activeInvoices.length > 0) {
            const total = activeInvoices.reduce(
              (sum: number, inv: any) =>
                sum +
                inv.cart.reduce(
                  (cSum: number, it: any) => cSum + (Number(it.quantity) || 1),
                  0,
                ),
              0,
            );
            setBadgeCount(total);
            return;
          }
        }
      }
    } catch {}

    setBadgeCount(0);
  }, []);

  useEffect(() => {
    updateCount();
    window.addEventListener("pos_cart_updated", updateCount);
    window.addEventListener("storage", updateCount);
    window.addEventListener("focus", updateCount);

    return () => {
      window.removeEventListener("pos_cart_updated", updateCount);
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("focus", updateCount);
    };
  }, [updateCount]);

  return (
    <button
      onClick={() => navigate("/pos")}
      style={{
        position: "absolute",
        bottom: "16px",
        right: "16px",
        zIndex: 99,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 18px",
        background: "linear-gradient(135deg, var(--color-primary), #4f46e5)",
        color: "#ffffff",
        border: "none",
        borderRadius: "30px",
        boxShadow: "0 8px 24px rgba(79, 70, 229, 0.4), 0 2px 8px rgba(0, 0, 0, 0.12)",
        fontWeight: "600",
        fontSize: "14px",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        backdropFilter: "blur(8px)",
      }}
      className="animate-fade-in"
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(0.95)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.transform = "scale(0.95)";
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <ShoppingCart size={18} />
      <span>POS Bán hàng</span>

      {/* Huy hiệu số lượng khi có hoá đơn đang nhập */}
      {badgeCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-6px",
            right: "-6px",
            minWidth: "22px",
            height: "22px",
            borderRadius: "11px",
            background: "#ef4444",
            color: "#ffffff",
            fontSize: "11.5px",
            fontWeight: "800",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 5px",
            border: "2px solid #ffffff",
            boxShadow: "0 2px 8px rgba(239, 68, 68, 0.5)",
            lineHeight: 1,
            pointerEvents: "none",
            boxSizing: "border-box",
          }}
          title={`${badgeCount} món đang nhập`}
        >
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}
    </button>
  );
}
