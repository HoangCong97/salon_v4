import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export default function POSOverlayButton() {
  const navigate = useNavigate();

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
    </button>
  );
}
