import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { AlertTriangle, Info, HelpCircle, X } from "lucide-react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
}

type ConfirmFunction = (optionsOrMessage: string | ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFunction | null>(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = (optionsOrMessage: string | ConfirmOptions) => {
    const options: ConfirmOptions =
      typeof optionsOrMessage === "string" ? { message: optionsOrMessage } : optionsOrMessage;

    return new Promise<boolean>((resolve) => {
      setState({
        isOpen: true,
        options,
        resolve,
      });
    });
  };

  const handleClose = (value: boolean) => {
    if (state) {
      state.resolve(value);
      setState(null);
    }
  };

  // Keyboard navigation & locking body scroll
  useEffect(() => {
    if (state?.isOpen) {
      document.body.style.overflow = "hidden";
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleClose(false);
        } else if (e.key === "Enter") {
          // Prevent accidental multiple submissions
          e.preventDefault();
          handleClose(true);
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

  // Auto-focus confirm button for easy keyboard access
  useEffect(() => {
    if (state?.isOpen && confirmBtnRef.current) {
      confirmBtnRef.current.focus();
    }
  }, [state?.isOpen]);

  const { isOpen, options } = state || { isOpen: false, options: {} as ConfirmOptions };
  const {
    title = "Xác nhận",
    message = "",
    confirmText = "Đồng ý",
    cancelText = "Hủy bỏ",
    type = "warning",
  } = options;

  // Visual cues based on dialogue type
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle size={32} color="#ef4444" />;
      case "info":
        return <Info size={32} color="#3b82f6" />;
      case "warning":
      default:
        return <HelpCircle size={32} color="#f59e0b" />;
    }
  };

  const getConfirmButtonStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: "10px 20px",
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
      case "info":
        return {
          ...base,
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        };
      case "warning":
      default:
        return {
          ...base,
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        };
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
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
            @keyframes confirm-backdrop-fade {
              from { opacity: 0; backdrop-filter: blur(0px); }
              to { opacity: 1; backdrop-filter: blur(8px); }
            }
            @keyframes confirm-modal-scale {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>

          {/* Backdrop */}
          <div
            onClick={() => handleClose(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.35)",
              animation: "confirm-backdrop-fade 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
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
              animation: "confirm-modal-scale 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              fontFamily: "var(--font-family, system-ui, sans-serif)",
            }}
          >
            {/* Close icon */}
            <button
              onClick={() => handleClose(false)}
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
                      : type === "info"
                      ? "#dbeafe"
                      : "#fef3c7",
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
                onClick={() => handleClose(false)}
                style={{
                  padding: "10px 20px",
                  background: "transparent",
                  border: "1px solid rgba(15, 23, 42, 0.12)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "rgba(15, 23, 42, 0.7)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.03)";
                  e.currentTarget.style.borderColor = "rgba(15, 23, 42, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(15, 23, 42, 0.12)";
                }}
              >
                {cancelText}
              </button>
              <button
                ref={confirmBtnRef}
                onClick={() => handleClose(true)}
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
    </ConfirmContext.Provider>
  );
};
