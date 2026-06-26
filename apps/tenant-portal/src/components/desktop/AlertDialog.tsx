import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { AlertTriangle, Info, CheckCircle2, X } from "lucide-react";

interface AlertOptions {
  title?: string;
  message: string;
  confirmText?: string;
  type?: "warning" | "danger" | "info" | "success";
}

type AlertFunction = (optionsOrMessage: string | AlertOptions) => Promise<void>;

const AlertContext = createContext<AlertFunction | null>(null);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{
    isOpen: boolean;
    options: AlertOptions;
    resolve: () => void;
  } | null>(null);

  const alertQueueRef = useRef<{ options: AlertOptions; resolve: () => void }[]>([]);

  const alert = useCallback((optionsOrMessage: string | AlertOptions) => {
    const options: AlertOptions =
      typeof optionsOrMessage === "string" ? { message: optionsOrMessage } : optionsOrMessage;

    return new Promise<void>((resolve) => {
      setState((currentState) => {
        const newAlert = { options, resolve };
        if (currentState?.isOpen) {
          alertQueueRef.current.push(newAlert);
          return currentState;
        } else {
          return {
            isOpen: true,
            options,
            resolve: () => {
              resolve();
              setTimeout(() => {
                const next = alertQueueRef.current.shift();
                if (next) {
                  setState({
                    isOpen: true,
                    options: next.options,
                    resolve: next.resolve,
                  });
                } else {
                  setState(null);
                }
              }, 50);
            },
          };
        }
      });
    });
  }, []);

  const handleClose = () => {
    if (state) {
      state.resolve();
    }
  };

  // Setup global window.alert override
  const alertRef = useRef(alert);
  useEffect(() => {
    alertRef.current = alert;
  }, [alert]);

  useEffect(() => {
    const originalAlert = window.alert;

    window.alert = (message: any) => {
      const msgStr = String(message);
      let type: "warning" | "danger" | "info" | "success" = "info";
      let title = "Thông báo";

      const lower = msgStr.toLowerCase();
      if (
        lower.includes("lỗi") ||
        lower.includes("thất bại") ||
        lower.includes("sai") ||
        lower.includes("không hợp lệ") ||
        lower.includes("không thể") ||
        lower.includes("error") ||
        lower.includes("failed") ||
        lower.includes("invalid") ||
        lower.includes("cannot")
      ) {
        type = "danger";
        title = "Lỗi";
      } else if (
        lower.includes("thành công") ||
        lower.includes("hoàn thành") ||
        lower.includes("đã áp dụng") ||
        lower.includes("đã gửi") ||
        lower.includes("success") ||
        lower.includes("completed") ||
        lower.includes("applied") ||
        lower.includes("sent")
      ) {
        type = "success";
        title = "Thành công";
      } else if (
        lower.includes("cảnh báo") ||
        lower.includes("vui lòng") ||
        lower.includes("chưa được") ||
        lower.includes("phải giữ lại") ||
        lower.includes("không thể xóa") ||
        lower.includes("warning") ||
        lower.includes("please") ||
        lower.includes("must")
      ) {
        type = "warning";
        title = "Cảnh báo";
      }

      alertRef.current({
        title,
        message: msgStr,
        type,
        confirmText: "Đồng ý",
      });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  // Keyboard navigation & locking body scroll
  useEffect(() => {
    if (state?.isOpen) {
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleClose();
        } else if (e.key === "Enter") {
          // Prevent accidental multiple submissions
          e.preventDefault();
          handleClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [state?.isOpen]);

  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-focus OK button for easy keyboard access
  useEffect(() => {
    if (state?.isOpen && confirmBtnRef.current) {
      confirmBtnRef.current.focus();
    }
  }, [state?.isOpen]);

  const { isOpen, options } = state || { isOpen: false, options: {} as AlertOptions };
  const {
    title = "Thông báo",
    message = "",
    confirmText = "Đồng ý",
    type = "info",
  } = options;

  // Visual cues based on dialogue type
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle size={32} color="#ef4444" />;
      case "success":
        return <CheckCircle2 size={32} color="#22c55e" />;
      case "warning":
        return <AlertTriangle size={32} color="#f59e0b" />;
      case "info":
      default:
        return <Info size={32} color="#3b82f6" />;
    }
  };

  const getConfirmButtonStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: "10px 24px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      border: "none",
      cursor: "pointer",
      color: "white",
      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    };

    switch (type) {
      case "danger":
        return {
          ...base,
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        };
      case "success":
        return {
          ...base,
          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
        };
      case "warning":
        return {
          ...base,
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        };
      case "info":
      default:
        return {
          ...base,
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        };
    }
  };

  return (
    <AlertContext.Provider value={alert}>
      {children}

      {/* Portaled Custom Dialog */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999999,
          }}
        >
          {/* Keyframe stylesheet */}
          <style>{`
            @keyframes alert-backdrop-fade {
              from { opacity: 0; backdrop-filter: blur(0px); }
              to { opacity: 1; backdrop-filter: blur(8px); }
            }
            @keyframes alert-modal-scale {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>

          {/* Backdrop */}
          <div
            onClick={handleClose}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.35)",
              animation: "alert-backdrop-fade 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              zIndex: -1,
            }}
          />

          {/* Modal Container */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.98)",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "420px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              position: "relative",
              animation: "alert-modal-scale 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              fontFamily: "var(--font-family, system-ui, sans-serif)",
            }}
          >
            {/* Close icon */}
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "rgba(15, 23, 42, 0.4)",
                padding: "4px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(15, 23, 42, 0.05)";
                e.currentTarget.style.color = "rgba(15, 23, 42, 0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(15, 23, 42, 0.4)";
              }}
            >
              <X size={18} />
            </button>

            {/* Content Row */}
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginTop: "4px" }}>
              <div
                style={{
                  background:
                    type === "danger"
                      ? "#fee2e2"
                      : type === "success"
                      ? "#dcfce7"
                      : type === "warning"
                      ? "#fef3c7"
                      : "#dbeafe",
                  padding: "10px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {getIcon()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexGrow: 1 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#0f172a",
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14.5px",
                    color: "rgba(15, 23, 42, 0.7)",
                    lineHeight: "1.5",
                  }}
                >
                  {message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
              <button
                ref={confirmBtnRef}
                onClick={handleClose}
                style={getConfirmButtonStyles()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};
