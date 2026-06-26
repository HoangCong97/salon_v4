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

export const MOCK_STAFF: Staff[] = [
  { id: "s1", name: "Nguyễn Văn A", color: "#6366f1" },
  { id: "s2", name: "Trần Thị B",   color: "#ec4899" },
  { id: "s3", name: "Lê Văn C",     color: "#f59e0b" },
  { id: "s4", name: "Phạm Thị D",   color: "#10b981" },
  { id: "s5", name: "Hoàng Văn E",  color: "#ef4444" },
];

export const MOCK_SERVICES: AppointmentService[] = [
  { id: "sv1", name: "Cắt tóc",       duration: 45,  price: 150000 },
  { id: "sv2", name: "Gội đầu + Xả",  duration: 30,  price: 80000  },
  { id: "sv3", name: "Nhuộm tóc",     duration: 90,  price: 450000 },
  { id: "sv4", name: "Uốn tóc",       duration: 120, price: 600000 },
  { id: "sv5", name: "Hấp dầu",       duration: 40,  price: 120000 },
  { id: "sv6", name: "Dưỡng keratin", duration: 60,  price: 350000 },
  { id: "sv7", name: "Cạo râu",       duration: 20,  price: 50000  },
  { id: "sv8", name: "Massage đầu",   duration: 30,  price: 100000 },
];
