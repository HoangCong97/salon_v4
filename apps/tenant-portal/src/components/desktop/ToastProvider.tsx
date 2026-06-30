/**
 * Toast Notification System
 * ---
 * Hệ thống thông báo dạng Toast tự build (không dùng thư viện bên ngoài).
 * Sử dụng CSS variables từ theme.css để đảm bảo đồng bộ design system.
 * 
 * Features:
 * - 4 loại: success, error, warning, info
 * - Auto-dismiss (success: 4s, error: 6s, warning: 5s, info: 4s)
 * - Slide-in animation từ góc trên phải
 * - Stack nhiều toast cùng lúc (max 5)
 * - Progress bar countdown
 * - Nút X để đóng sớm
 * - Pause on hover
 * 
 * Usage:
 *   const toast = useToast();
 *   toast.success("Thao tác thành công!");
 *   toast.error("Có lỗi xảy ra!");
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ==================== Types ====================

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration: number;
  createdAt: number;
}

interface ToastContextValue {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

// ==================== Context ====================

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// ==================== Constants ====================

const DURATION_MAP: Record<ToastType, number> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
};

const MAX_VISIBLE_TOASTS = 5;

const ICON_MAP: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={20} />,
  error: <XCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
};

const TITLE_MAP: Record<ToastType, string> = {
  success: "Thành công",
  error: "Lỗi",
  warning: "Cảnh báo",
  info: "Thông báo",
};

// ==================== Single Toast Item ====================

const ToastItem: React.FC<{
  toast: Toast;
  onClose: (id: string) => void;
}> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(Date.now());
  const remainingRef = useRef(toast.duration);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onClose(toast.id), 280);
  }, [onClose, toast.id]);

  // Auto-dismiss timer with pause-on-hover support (no-re-render optimization)
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();

    timerRef.current = setTimeout(() => {
      handleClose();
    }, remainingRef.current);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      // Save remaining time when pausing
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    };
  }, [isPaused, handleClose]);

  return (
    <div
      className={`toast-item toast-${toast.type} ${isExiting ? "toast-exit" : "toast-enter"}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-icon">{ICON_MAP[toast.type]}</div>
      <div className="toast-content">
        <div className="toast-title">{toast.title || TITLE_MAP[toast.type]}</div>
        <div className="toast-message">{toast.message}</div>
      </div>
      <button
        className="toast-close"
        onClick={handleClose}
        aria-label="Đóng thông báo"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// ==================== Toast Container & Provider ====================

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string) => {
      const id = crypto.randomUUID();
      const duration = DURATION_MAP[type];

      setToasts((prev) => {
        const next = [...prev, { id, type, message, title, duration, createdAt: Date.now() }];
        // Giữ max 5 toast, xóa cũ nhất nếu vượt quá
        if (next.length > MAX_VISIBLE_TOASTS) {
          return next.slice(next.length - MAX_VISIBLE_TOASTS);
        }
        return next;
      });
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue = useCallback(
    () => ({
      success: (message: string, title?: string) => addToast("success", message, title),
      error: (message: string, title?: string) => addToast("error", message, title),
      warning: (message: string, title?: string) => addToast("warning", message, title),
      info: (message: string, title?: string) => addToast("info", message, title),
    }),
    [addToast]
  );

  // Memoize context value to prevent unnecessary re-renders
  const value = useRef(contextValue());
  useEffect(() => {
    value.current = contextValue();
  }, [contextValue]);

  return (
    <ToastContext.Provider value={value.current}>
      {children}
      {/* Toast Container - Rendered via Portal concept at top-right corner */}
      {toasts.length > 0 && (
        <div className="toast-container" aria-label="Thông báo">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      )}
      {/* Inline Styles - Scoped to toast system */}
      <style>{`
        .toast-container {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          pointer-events: none;
          max-width: 420px;
          width: 100%;
        }

        .toast-item {
          pointer-events: auto;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border-radius: var(--radius-md, 12px);
          background: hsl(0, 0%, 100%);
          border: 1px solid var(--border-color, hsl(215, 15%, 90%));
          box-shadow:
            0 8px 30px rgba(0, 0, 0, 0.08),
            0 2px 8px rgba(0, 0, 0, 0.04);
          position: relative;
          overflow: hidden;
          cursor: default;
          backdrop-filter: blur(12px);
          transition: transform 0.1s ease, opacity 0.1s ease;
        }

        .toast-item:hover {
          transform: scale(1.02);
          box-shadow:
            0 12px 40px rgba(0, 0, 0, 0.12),
            0 4px 12px rgba(0, 0, 0, 0.06);
        }

        /* Type-specific left border accent */
        .toast-success {
          border-left: 4px solid var(--color-success, hsl(142, 71%, 45%));
        }
        .toast-error {
          border-left: 4px solid var(--color-danger, hsl(346, 84%, 61%));
        }
        .toast-warning {
          border-left: 4px solid var(--color-warning, hsl(35, 92%, 50%));
        }
        .toast-info {
          border-left: 4px solid var(--color-primary, hsl(221, 83%, 53%));
        }

        /* Icon colors by type */
        .toast-success .toast-icon { color: var(--color-success, hsl(142, 71%, 45%)); }
        .toast-error .toast-icon { color: var(--color-danger, hsl(346, 84%, 61%)); }
        .toast-warning .toast-icon { color: var(--color-warning, hsl(35, 92%, 50%)); }
        .toast-info .toast-icon { color: var(--color-primary, hsl(221, 83%, 53%)); }

        .toast-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          margin-top: 1px;
        }

        .toast-content {
          flex: 1;
          min-width: 0;
        }

        .toast-title {
          font-weight: 600;
          font-size: 13.5px;
          color: var(--text-primary, hsl(215, 25%, 15%));
          margin-bottom: 2px;
          line-height: 1.4;
        }

        .toast-message {
          font-size: 13px;
          color: var(--text-secondary, hsl(215, 15%, 45%));
          line-height: 1.5;
          word-break: break-word;
        }

        .toast-close {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm, 6px);
          border: none;
          background: transparent;
          color: var(--text-muted, hsl(215, 10%, 65%));
          cursor: pointer;
          transition: all 0.15s ease;
          margin: -4px -4px 0 0;
        }

        .toast-close:hover {
          background: hsl(215, 15%, 95%);
          color: var(--text-primary, hsl(215, 25%, 15%));
        }

        /* Animations */
        @keyframes toast-slide-in {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes toast-slide-out {
          from {
            transform: translateY(0);
            opacity: 1;
            max-height: 200px;
            margin-bottom: 10px;
          }
          to {
            transform: translateY(-20px);
            opacity: 0;
            max-height: 0;
            margin-bottom: 0;
            padding-top: 0;
            padding-bottom: 0;
          }
        }

        .toast-enter {
          animation: toast-slide-in 0.32s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
        }

        .toast-exit {
          animation: toast-slide-out 0.28s cubic-bezier(0.06, 0.71, 0.55, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};
