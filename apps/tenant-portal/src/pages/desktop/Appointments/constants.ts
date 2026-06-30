import { AppointmentStatus, Staff, AppointmentService } from "./types";

export const SLOT_HEIGHT = 28;   // px per 15-min slot
export const START_HOUR  = 7;
export const END_HOUR    = 22;
export const TOTAL_SLOTS = (END_HOUR - START_HOUR) * 4;
export const TIME_COL_W  = 62;
export const SIDEBAR_W   = 288;

export const STATUS_CFG: Record<AppointmentStatus, { label: string; bg: string; border: string; text: string; dot: string }> = {
  PENDING:     { label: "Chờ xác nhận", bg: "#fffbeb", border: "#fcd34d", text: "#92400e", dot: "#f59e0b" },
  CONFIRMED:   { label: "Đã xác nhận",  bg: "#f0fdf4", border: "#86efac", text: "#14532d", dot: "#22c55e" },
  IN_PROGRESS: { label: "Đang làm",     bg: "#eff6ff", border: "#93c5fd", text: "#1e3a8a", dot: "#3b82f6" },
  DONE:        { label: "Hoàn thành",   bg: "#f8fafc", border: "#cbd5e1", text: "#475569", dot: "#94a3b8" },
  CANCELLED:   { label: "Đã hủy",       bg: "#fff1f2", border: "#fca5a5", text: "#7f1d1d", dot: "#ef4444" },

};

