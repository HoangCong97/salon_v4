import { DailyRevenueItem, MonthlyTrendItem, InvoiceDetailItem } from "../../desktop/Dashboard/types";

export type { DailyRevenueItem, MonthlyTrendItem, InvoiceDetailItem };

export interface CalendarDayCell {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  day: number; // 1 - 31
  dayOfWeek: number; // 1 (Thứ 2) to 7 (CN)
  isCurrentMonth: boolean;
  isToday: boolean;
  totalPrice: number; // Doanh thu (Gross)
  finalAmount: number; // Thu thực tế (Net)
  discountAmount: number; // Giảm giá
  invoices: InvoiceDetailItem[];
}

export type RevenueViewMode = "SPLIT" | "CALENDAR" | "CHART";
export type CalendarDisplayFormat = "GRID" | "LIST";
