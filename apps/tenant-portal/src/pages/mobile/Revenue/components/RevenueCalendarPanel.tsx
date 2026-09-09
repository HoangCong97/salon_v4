import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  LayoutGrid,
  List,
  Receipt,
} from "lucide-react";
import {
  CalendarDayCell,
  DailyRevenueItem,
  CalendarDisplayFormat,
} from "../types";

interface RevenueCalendarPanelProps {
  currentYear: number;
  currentMonthIndex: number;
  calendarCells: CalendarDayCell[];
  sortedDailyList: DailyRevenueItem[];
  monthSummary: {
    gross: number;
    net: number;
    discount: number;
    invoiceCount: number;
  };
  calendarFormat: CalendarDisplayFormat;
  setCalendarFormat: (format: CalendarDisplayFormat) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onSelectDay: (day: DailyRevenueItem) => void;
  formatShortCurrency: (val: number) => string;
  formatCompactNumber: (val: number) => string;
  formatCurrencyK: (val: number) => string;
  isLoading?: boolean;
}

export const RevenueCalendarPanel: React.FC<RevenueCalendarPanelProps> = ({
  currentYear,
  currentMonthIndex,
  calendarCells,
  sortedDailyList,
  monthSummary,
  calendarFormat,
  setCalendarFormat,
  onPrevMonth,
  onNextMonth,
  onToday,
  onSelectDay,
  formatShortCurrency,
  formatCompactNumber,
  formatCurrencyK,
  isLoading = false,
}) => {
  const monthDisplayStr = `Tháng ${String(currentMonthIndex + 1).padStart(2, "0")}/${currentYear}`;

  // Helper for Thứ labels
  const weekDays = [
    { label: "T2", isWeekend: false },
    { label: "T3", isWeekend: false },
    { label: "T4", isWeekend: false },
    { label: "T5", isWeekend: false },
    { label: "T6", isWeekend: false },
    { label: "T7", isWeekend: true, isSaturday: true },
    { label: "CN", isWeekend: true, isSunday: true },
  ];

  // Helper to format date string to DD/MM
  const formatDayMonth = (dateRaw: string) => {
    const parts = dateRaw.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    return dateRaw;
  };

  const getDayOfWeekBadge = (dayOfWeek: number) => {
    if (dayOfWeek === 7) {
      return (
        <span className="px-1.5 py-0.5 text-[11px] font-bold text-white bg-emerald-600 rounded">
          CN
        </span>
      );
    }
    if (dayOfWeek === 6) {
      return (
        <span className="px-1.5 py-0.5 text-[11px] font-bold text-emerald-800 bg-emerald-100 rounded">
          T7
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 text-[11px] font-medium text-slate-500 bg-slate-100 rounded">
        {`T${dayOfWeek + 1}`}
      </span>
    );
  };

  return (
    <div className="flex flex-col w-full bg-white select-none">
      {/* 1. Header: Month Navigation & View Format Toggle */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onPrevMonth}
            className="p-1 rounded-lg hover:bg-slate-100 active:bg-slate-200 text-slate-600 transition-colors"
            title="Tháng trước"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-[15px] font-bold text-slate-800 tracking-tight whitespace-nowrap">
            {monthDisplayStr}
          </span>

          <button
            type="button"
            onClick={onNextMonth}
            className="p-1 rounded-lg hover:bg-slate-100 active:bg-slate-200 text-slate-600 transition-colors"
            title="Tháng sau"
          >
            <ChevronRight size={18} />
          </button>

          <button
            type="button"
            onClick={onToday}
            className="ml-1 px-2 py-0.5 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full border border-blue-200 transition-colors"
          >
            Hôm nay
          </button>
        </div>

        {/* View Switcher: Grid vs List */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setCalendarFormat("GRID")}
            className={`p-1 rounded-md transition-all ${
              calendarFormat === "GRID"
                ? "bg-white text-blue-600 shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-700"
            }`}
            title="Xem dạng lưới lịch"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            type="button"
            onClick={() => setCalendarFormat("LIST")}
            className={`p-1 rounded-md transition-all ${
              calendarFormat === "LIST"
                ? "bg-white text-blue-600 shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-700"
            }`}
            title="Xem dạng danh sách ngày"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* 2. Monthly Summary Pills (Doanh thu & Thu thực tế) */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/80 border-b border-slate-100 flex-shrink-0 text-xs">
        <div className="flex items-center gap-1 text-slate-500">
          <span className="font-medium">Tổng tháng:</span>
          <span className="px-1.5 py-0.5 bg-slate-200/80 text-slate-700 rounded-full font-semibold text-[11px]">
            {monthSummary.invoiceCount} HĐ
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Gross Revenue Pill */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200/90 text-slate-700 font-semibold text-[11px]"
            title="Tổng Doanh thu (chưa giảm giá)"
          >
            <span className="text-[10px] text-slate-500 font-normal">DT:</span>
            <span>{formatCurrencyK(monthSummary.gross)}</span>
          </div>

          {/* Net Revenue Pill */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px]"
            title="Thu thực tế (đã trừ giảm giá)"
          >
            <span className="text-[10px] text-blue-500 font-normal">Thu:</span>
            <span>{formatCurrencyK(monthSummary.net)}</span>
          </div>
        </div>
      </div>

      {/* 3. Main Content: Grid View or List View */}
      <div className="w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Đang tải số liệu lịch...</span>
          </div>
        ) : calendarFormat === "GRID" ? (
          /* ================= CALENDAR MATRIX GRID ================= */
          <div className="flex flex-col min-w-full">
            {/* Weekday Header Row (T2 -> CN) */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-[11px] font-semibold py-1">
              {weekDays.map((wd) => (
                <div
                  key={wd.label}
                  className={`py-0.5 ${
                    wd.isSunday
                      ? "text-emerald-700 font-bold"
                      : wd.isSaturday
                        ? "text-emerald-600 font-bold"
                        : "text-slate-600"
                  }`}
                >
                  {wd.label}
                </div>
              ))}
            </div>

            {/* 42 Calendar Cells (7 cols x 6 rows) */}
            <div className="grid grid-cols-7 auto-rows-fr border-b border-slate-200">
              {calendarCells.map((cell, idx) => {
                const hasRevenue = cell.totalPrice > 0 || cell.finalAmount > 0;
                const isSelected = false;

                return (
                  <button
                    key={`${cell.dateStr}-${idx}`}
                    type="button"
                    onClick={() => {
                      if (hasRevenue || cell.invoices.length > 0) {
                        onSelectDay({
                          date: cell.dateStr,
                          dateRaw: cell.dateStr,
                          day: cell.day,
                          dayOfWeek: cell.dayOfWeek,
                          totalPrice: cell.totalPrice,
                          finalAmount: cell.finalAmount,
                          discountAmount: cell.discountAmount,
                          invoices: cell.invoices,
                        });
                      }
                    }}
                    className={`min-h-[62px] p-1 border-r border-b border-slate-100 flex flex-col justify-between text-left transition-colors relative ${
                      !cell.isCurrentMonth
                        ? "bg-slate-50/50 opacity-40"
                        : cell.isToday
                          ? "bg-blue-50/40"
                          : hasRevenue
                            ? "hover:bg-blue-50/20 active:bg-blue-100/40 cursor-pointer"
                            : "hover:bg-slate-50/50"
                    } ${idx % 7 === 6 ? "border-r-0" : ""}`}
                  >
                    {/* Top Row: Day Number + Weekend indicator */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-[11px] leading-none ${
                          cell.isToday
                            ? "w-4 h-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]"
                            : cell.dayOfWeek === 7
                              ? "font-bold text-emerald-700"
                              : cell.dayOfWeek === 6
                                ? "font-semibold text-emerald-600"
                                : cell.isCurrentMonth
                                  ? "font-medium text-slate-700"
                                  : "text-slate-400"
                        }`}
                      >
                        {cell.day}
                      </span>

                      {/* Small invoice count badge if any */}
                      {cell.invoices.length > 0 && (
                        <span className="min-w-[15px] h-[15px] px-1 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px] flex items-center justify-center leading-none">
                          {cell.invoices.length}
                        </span>
                      )}
                    </div>

                    {/* Middle: Doanh thu (Gross) & Thu thực tế (Net) */}
                    <div className="flex flex-col mt-0.5 w-full overflow-hidden items-end text-right">
                      {hasRevenue ? (
                        <>
                          {/* Doanh thu (Gross) */}
                          <span
                            className="text-[11px] text-slate-500 font-semibold truncate leading-tight tracking-tight text-right w-full"
                            title={`Doanh thu: ${formatShortCurrency(cell.totalPrice)} đ`}
                          >
                            {formatCurrencyK(cell.totalPrice)}
                          </span>

                          {/* Thu thực tế (Net) */}
                          <span
                            className="text-[12px] font-bold text-blue-700 truncate leading-tight tracking-tight text-right w-full"
                            title={`Thu thực tế: ${formatShortCurrency(cell.finalAmount)} đ`}
                          >
                            {formatCurrencyK(cell.finalAmount)}
                          </span>
                        </>
                      ) : cell.isCurrentMonth ? (
                        <span className="text-[11px] text-slate-300 text-right pr-0.5 leading-tight w-full">
                          -
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ================= CALENDAR DAY LIST VIEW ================= */
          <div className="divide-y divide-slate-100">
            {sortedDailyList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Chưa có dữ liệu doanh thu trong tháng này
              </div>
            ) : (
              sortedDailyList.map((item) => (
                <div
                  key={item.dateRaw}
                  onClick={() => onSelectDay(item)}
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 active:bg-blue-50 transition-colors cursor-pointer"
                >
                  {/* Left: Date + Day of week + Invoice count */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex flex-col items-center">
                      {getDayOfWeekBadge(item.dayOfWeek)}
                      <span className="text-[11px] font-bold text-slate-700 mt-0.5">
                        {formatDayMonth(item.dateRaw)}
                      </span>
                    </div>

                    <div className="flex flex-col ml-1 min-w-0">
                      <span className="text-[13px] font-semibold text-slate-800">
                        {`Ngày ${formatDayMonth(item.dateRaw)}`}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Receipt size={12} className="text-slate-400" />
                        {item.invoices?.length || 0} hóa đơn
                      </span>
                    </div>
                  </div>

                  {/* Right: Gross & Net Revenue Badges */}
                  <div className="flex items-center gap-2 flex-shrink-0 text-right">
                    {/* Gross Revenue */}
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Doanh thu
                      </span>
                      <span className="text-[12px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {formatShortCurrency(item.totalPrice)}
                      </span>
                    </div>

                    {/* Net Revenue */}
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-blue-500 font-semibold">
                        Thu thực tế
                      </span>
                      <span className="text-[12px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        {formatShortCurrency(item.finalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 4. Legend Footer */}
      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Doanh thu</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="font-medium text-blue-700">Thu thực tế</span>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 italic">
          Bấm ngày để xem hóa đơn
        </span>
      </div>
    </div>
  );
};
export default RevenueCalendarPanel;
