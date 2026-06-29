import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

let toastListener: ((toast: Toast) => void) | null = null;

/**
 * Triggers a real-time toast alert in the application.
 * 
 * @param message The alert message
 * @param type The alert type: 'success' | 'info' | 'warning' | 'error'
 */
export const showToast = (message: string, type: Toast["type"] = "info") => {
  if (toastListener) {
    toastListener({
      id: Math.random().toString(36).substring(2, 9),
      message,
      type
    });
  }
};

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListener = (newToast) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        removeToast(newToast.id);
      }, 5000);
    };

    return () => {
      toastListener = null;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        maxWidth: "380px",
        width: "100%"
      }}
    >
      {toasts.map((toast) => {
        const Icon = toast.type === "success"
          ? CheckCircle
          : toast.type === "error"
          ? AlertCircle
          : Info;

        const colorMap = {
          success: {
            bg: "rgba(220, 252, 231, 0.95)",
            border: "1px solid rgba(74, 222, 128, 0.4)",
            text: "rgb(21, 128, 61)",
            icon: "rgb(34, 197, 94)"
          },
          error: {
            bg: "rgba(254, 226, 226, 0.95)",
            border: "1px solid rgba(248, 113, 113, 0.4)",
            text: "rgb(185, 28, 28)",
            icon: "rgb(239, 68, 68)"
          },
          warning: {
            bg: "rgba(254, 243, 199, 0.95)",
            border: "1px solid rgba(251, 191, 36, 0.4)",
            text: "rgb(180, 83, 9)",
            icon: "rgb(245, 158, 11)"
          },
          info: {
            bg: "rgba(219, 234, 254, 0.95)",
            border: "1px solid rgba(96, 165, 250, 0.4)",
            text: "rgb(29, 78, 216)",
            icon: "rgb(59, 130, 246)"
          }
        };

        const style = colorMap[toast.type];

        return (
          <div
            key={toast.id}
            className="toast-slide-in"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: style.bg,
              border: style.border,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(8px)",
              color: style.text,
              fontSize: "14px",
              fontWeight: 500,
              position: "relative"
            }}
          >
            <Icon size={20} color={style.icon} style={{ flexShrink: 0 }} />
            <div style={{ flexGrow: 1, marginRight: "12px", lineHeight: 1.4 }}>{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                color: style.text,
                opacity: 0.7,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.7";
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
