import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  X,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Tooltip } from "../../../../components/desktop/ui/Tooltip";
import { DailyRevenueItem } from "../types";

interface DailyRevenueCalendarProps {
  dailyRevenues: DailyRevenueItem[];
  availableMonths?: { month: string; yearMonth: string }[];
  selectedDays: string;
  selectedMonth?: string;
  selectedStaff?: string;
  selectedServices?: string;
  onSelectMonth?: (month: string) => void;
  onDayClick: (e: React.MouseEvent, clickedDay: string) => void;
  onSelectDays?: (days: string) => void;
  onClearDayFilter: () => void;
  onClearStaffFilter?: () => void;
  onClearServiceFilter?: () => void;
  onViewDayDetails: (day: DailyRevenueItem) => void;
  totalServicePrice: number;
  totalFinalAmount: number;
}

const WEEKDAYS = [
  { key: "t2", label: "T2", fullName: "Thứ 2", isWeekend: false },
  { key: "t3", label: "T3", fullName: "Thứ 3", isWeekend: false },
  { key: "t4", label: "T4", fullName: "Thứ 4", isWeekend: false },
  { key: "t5", label: "T5", fullName: "Thứ 5", isWeekend: false },
  { key: "t6", label: "T6", fullName: "Thứ 6", isWeekend: false },
  { key: "t7", label: "T7", fullName: "Thứ 7", isSaturday: true, isWeekend: true },
  { key: "cn", label: "CN", fullName: "Chủ Nhật", isSunday: true, isWeekend: true },
];

export function DailyRevenueCalendar({
  dailyRevenues = [],
  availableMonths = [],
  selectedDays,
  selectedMonth,
  selectedStaff = "",
  selectedServices = "",
  onSelectMonth,
  onDayClick,
  onSelectDays,
  onClearDayFilter,
  onClearStaffFilter,
  onClearServiceFilter,
  onViewDayDetails,
}: DailyRevenueCalendarProps) {
  // Formatters
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const formatCompactVND = (amount: number) => {
    if (amount === 0) return "-";
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} Tỷ`;
    }
    if (amount >= 10000000) {
      return `${(amount / 1000000).toFixed(1)} Tr`;
    }
    return formatNumber(amount);
  };

  // Identify today's date in YYYY-MM-DD
  const todayDateStr = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(today.getDate()).padStart(2, "0")}`;
  }, []);

  // Selected items arrays
  const selectedList = useMemo(() => {
    return selectedDays ? selectedDays.split(",").filter((d) => d.trim().length > 0) : [];
  }, [selectedDays]);

  const selectedStaffList = useMemo(() => {
    return selectedStaff ? selectedStaff.split(",").filter((s) => s.trim().length > 0) : [];
  }, [selectedStaff]);

  const selectedServicesList = useMemo(() => {
    return selectedServices ? selectedServices.split(",").filter((s) => s.trim().length > 0) : [];
  }, [selectedServices]);

  // Group dailyRevenues by month
  const monthGroups = useMemo(() => {
    const groupsMap = new Map<
      string,
      {
        monthKey: string;
        monthLabel: string;
        items: DailyRevenueItem[];
        leadingBlanks: number;
        trailingBlanks: number;
      }
    >();

    dailyRevenues.forEach((item) => {
      const key = item.dateRaw.substring(0, 7); // "YYYY-MM"
      if (!groupsMap.has(key)) {
        const [year, month] = key.split("-");
        groupsMap.set(key, {
          monthKey: key,
          monthLabel: `Tháng ${month}/${year}`,
          items: [],
          leadingBlanks: 0,
          trailingBlanks: 0,
        });
      }
      groupsMap.get(key)!.items.push(item);
    });

    const groups = Array.from(groupsMap.values()).sort((a, b) =>
      a.monthKey.localeCompare(b.monthKey),
    );

    // Calculate leading and trailing blank cells for 7-column calendar matrix
    groups.forEach((g) => {
      if (g.items.length > 0) {
        g.leadingBlanks = Math.max(0, (g.items[0].dayOfWeek || 1) - 1);
        const total = g.leadingBlanks + g.items.length;
        g.trailingBlanks = (7 - (total % 7)) % 7;
      }
    });

    return groups;
  }, [dailyRevenues]);

  // Active viewing month key (only 1 month rendered at a time)
  const [activeMonthKey, setActiveMonthKey] = useState<string>("");
  const prevSelectedMonthProp = useRef(selectedMonth);

  useEffect(() => {
    // 1. If selectedMonth prop changed from outside (e.g. user clicked month in left chart)
    if (prevSelectedMonthProp.current !== selectedMonth) {
      prevSelectedMonthProp.current = selectedMonth;
      if (selectedMonth) {
        const parts = selectedMonth.split(",").filter(Boolean);
        if (parts.length > 0) {
          setActiveMonthKey(parts[parts.length - 1]);
          return;
        }
      } else if (monthGroups.length > 0) {
        // When user deselects month filter, reset activeMonthKey to latest available month
        setActiveMonthKey(monthGroups[monthGroups.length - 1].monthKey);
        return;
      }
    }

    // 2. Validate that activeMonthKey exists in monthGroups; if not, reset to valid loaded month
    if (monthGroups.length > 0) {
      const exists = monthGroups.some((g) => g.monthKey === activeMonthKey);
      if (!exists) {
        const todayMonth = todayDateStr.substring(0, 7);
        if (monthGroups.some((g) => g.monthKey === todayMonth)) {
          setActiveMonthKey(todayMonth);
        } else {
          setActiveMonthKey(monthGroups[monthGroups.length - 1].monthKey);
        }
      }
    } else if (!activeMonthKey && availableMonths && availableMonths.length > 0) {
      setActiveMonthKey(availableMonths[availableMonths.length - 1].yearMonth);
    }
  }, [selectedMonth, monthGroups, availableMonths, activeMonthKey, todayDateStr]);

  // Index in currently loaded monthGroups
  const currentMonthIndex = useMemo(() => {
    if (monthGroups.length === 0) return -1;
    const idx = monthGroups.findIndex((g) => g.monthKey === activeMonthKey);
    return idx !== -1 ? idx : monthGroups.length - 1;
  }, [monthGroups, activeMonthKey]);

  // Index in all available 12 months
  const availableIndex = useMemo(() => {
    if (!availableMonths || availableMonths.length === 0) return -1;
    return availableMonths.findIndex((m) => m.yearMonth === activeMonthKey);
  }, [availableMonths, activeMonthKey]);

  // Determine if previous/next is possible
  const canGoPrev = useMemo(() => {
    if (monthGroups.length > 1) {
      return currentMonthIndex > 0;
    }
    if (availableIndex !== -1 && availableMonths && availableMonths.length > 0) {
      return availableIndex > 0;
    }
    return false;
  }, [monthGroups.length, currentMonthIndex, availableIndex, availableMonths]);

  const canGoNext = useMemo(() => {
    if (monthGroups.length > 1) {
      return currentMonthIndex < monthGroups.length - 1;
    }
    if (availableIndex !== -1 && availableMonths && availableMonths.length > 0) {
      return availableIndex < availableMonths.length - 1;
    }
    return false;
  }, [monthGroups.length, currentMonthIndex, availableIndex, availableMonths]);

  const currentGroup = currentMonthIndex !== -1 ? monthGroups[currentMonthIndex] : null;

  // Compute other-month day numbers for leading & trailing cells
  const { leadingDays, trailingDays } = useMemo(() => {
    if (!currentGroup || !currentGroup.monthKey) {
      return { leadingDays: [], trailingDays: [] };
    }
    const [year, month] = currentGroup.monthKey.split("-").map(Number);
    // Last day of previous month
    const prevMonthLastDate = new Date(year, month - 1, 0).getDate();
    const startLead = prevMonthLastDate - currentGroup.leadingBlanks + 1;
    const leads = Array.from({ length: currentGroup.leadingBlanks }, (_, idx) => startLead + idx);
    const trails = Array.from({ length: currentGroup.trailingBlanks }, (_, idx) => idx + 1);
    return { leadingDays: leads, trailingDays: trails };
  }, [currentGroup]);

  // Display label for header
  const displayMonthLabel = useMemo(() => {
    if (currentGroup?.monthLabel) return currentGroup.monthLabel;
    if (activeMonthKey) {
      const [year, month] = activeMonthKey.split("-");
      if (year && month) return `Tháng ${month}/${year}`;
    }
    return "Lịch doanh thu";
  }, [currentGroup, activeMonthKey]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    if (onClearDayFilter && selectedList.length > 0) {
      onClearDayFilter();
    }

    if (monthGroups.length > 1 && currentMonthIndex > 0) {
      setActiveMonthKey(monthGroups[currentMonthIndex - 1].monthKey);
    } else if (availableIndex > 0 && availableMonths && onSelectMonth) {
      const target = availableMonths[availableIndex - 1].yearMonth;
      setActiveMonthKey(target);
      onSelectMonth(target);
    }
  };

  const handleNextMonth = () => {
    if (!canGoNext) return;
    if (onClearDayFilter && selectedList.length > 0) {
      onClearDayFilter();
    }

    if (monthGroups.length > 1 && currentMonthIndex < monthGroups.length - 1) {
      setActiveMonthKey(monthGroups[currentMonthIndex + 1].monthKey);
    } else if (
      availableMonths &&
      availableIndex !== -1 &&
      availableIndex < availableMonths.length - 1 &&
      onSelectMonth
    ) {
      const target = availableMonths[availableIndex + 1].yearMonth;
      setActiveMonthKey(target);
      onSelectMonth(target);
    }
  };

  // Drag-to-select range across consecutive days
  const [dragPreviewRange, setDragPreviewRange] = useState<string[] | null>(null);
  const dragStartRef = useRef<string | null>(null);
  const isMouseDownRef = useRef(false);
  const hasDraggedRef = useRef(false);

  const handleCellMouseDown = (e: React.MouseEvent, dateRaw: string) => {
    if (e.button !== 0) return; // Only primary mouse button
    isMouseDownRef.current = true;
    dragStartRef.current = dateRaw;
    hasDraggedRef.current = false;
    setDragPreviewRange([dateRaw]);
  };

  const handleCellMouseEnter = (dateRaw: string) => {
    if (!isMouseDownRef.current || !dragStartRef.current || !currentGroup) return;
    hasDraggedRef.current = true;

    const allMonthDays = currentGroup.items.map((d) => d.dateRaw);
    const startIdx = allMonthDays.indexOf(dragStartRef.current);
    const currentIdx = allMonthDays.indexOf(dateRaw);

    if (startIdx !== -1 && currentIdx !== -1) {
      const min = Math.min(startIdx, currentIdx);
      const max = Math.max(startIdx, currentIdx);
      const range = allMonthDays.slice(min, max + 1);
      setDragPreviewRange(range);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (!isMouseDownRef.current) return;
      isMouseDownRef.current = false;

      if (hasDraggedRef.current && dragPreviewRange && dragPreviewRange.length > 0) {
        if (onSelectDays) {
          if (e.ctrlKey || e.metaKey) {
            const merged = Array.from(new Set([...selectedList, ...dragPreviewRange]));
            onSelectDays(merged.join(","));
          } else {
            onSelectDays(dragPreviewRange.join(","));
          }
        }
      }

      dragStartRef.current = null;
      hasDraggedRef.current = false;
      setDragPreviewRange(null);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [dragPreviewRange, selectedList, onSelectDays]);

  // Max daily revenue in the current month for heat progress indicators
  const maxDailyRevenue = useMemo(() => {
    if (!currentGroup || currentGroup.items.length === 0) return 1;
    return Math.max(...currentGroup.items.map((d) => d.finalAmount || 0), 1);
  }, [currentGroup]);

  // Current month active statistics
  const currentMonthDays = currentGroup?.items || [];
  const currentMonthTotalInvoices = useMemo(() => {
    return currentMonthDays.reduce((sum, d) => sum + (d.invoices?.length || 0), 0);
  }, [currentMonthDays]);

  const currentMonthActiveDays = useMemo(() => {
    return currentMonthDays.filter((d) => d.finalAmount > 0).length;
  }, [currentMonthDays]);

  const currentMonthRevenue = useMemo(() => {
    return currentMonthDays.reduce((sum, d) => sum + d.finalAmount, 0);
  }, [currentMonthDays]);

  const selectedDaysFinalAmount = useMemo(() => {
    if (selectedList.length === 0) return currentMonthRevenue;
    return dailyRevenues
      .filter((d) => selectedList.includes(d.dateRaw))
      .reduce((sum, d) => sum + d.finalAmount, 0);
  }, [dailyRevenues, selectedList, currentMonthRevenue]);

  const displayedInvoicesCount = useMemo(() => {
    if (selectedList.length === 0) return currentMonthTotalInvoices;
    return dailyRevenues
      .filter((d) => selectedList.includes(d.dateRaw))
      .reduce((sum, d) => sum + (d.invoices?.length || 0), 0);
  }, [dailyRevenues, selectedList, currentMonthTotalInvoices]);

  return (
    <div className="flex flex-col h-full bg-white rounded-[14px] border border-slate-200 shadow-sm overflow-hidden select-none">
      {/* 1. Header - Fixed exact height h-[60px] to match MonthlyRevenueChart */}
      <div className="h-[60px] flex items-center justify-between px-4 border-b border-slate-200 bg-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0">
            <CalendarIcon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 m-0 leading-tight">
                Doanh thu theo ngày
              </h3>
              {/* Tại vị trí đó hiển thị tháng đang chọn */}
              <span className="text-xs font-black text-blue-900 bg-blue-100 border border-blue-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                {displayMonthLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium m-0 mt-0.5 leading-normal">
              Kéo chuột chọn chuỗi ngày • Nháy đúp xem chi tiết hóa đơn
            </p>
          </div>
        </div>

        {/* Right side controls: Sleek Filter Pills & Total */}
        <div className="flex items-center gap-2">
          {selectedStaffList.length > 0 && onClearStaffFilter && (
            <div className="h-8 inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 bg-amber-50 border border-amber-300 text-amber-950 rounded-full shadow-2xs transition-all">
              <span className="text-xs font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                Lọc {selectedStaffList.length} NV
              </span>
              <button
                type="button"
                onClick={onClearStaffFilter}
                className="w-4 h-4 rounded-full flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-2xs"
                title="Tắt lọc nhân viên"
              >
                <X size={10} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {selectedServicesList.length > 0 && onClearServiceFilter && (
            <div className="h-8 inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-full shadow-2xs transition-all">
              <span className="text-xs font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Lọc {selectedServicesList.length} DV
              </span>
              <button
                type="button"
                onClick={onClearServiceFilter}
                className="w-4 h-4 rounded-full flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-2xs"
                title="Tắt lọc dịch vụ"
              >
                <X size={10} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {selectedList.length > 0 ? (
            <div className="h-8 inline-flex items-center gap-2 pl-3 pr-1.5 py-1 bg-blue-50 border border-blue-300 text-blue-950 rounded-full shadow-2xs transition-all">
              <span className="text-xs font-extrabold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Đang lọc {selectedList.length} ngày
              </span>
              <button
                type="button"
                onClick={onClearDayFilter}
                className="w-5 h-5 rounded-full flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-2xs"
                title="Tắt bộ lọc ngày"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </div>
          ) : selectedStaffList.length === 0 && selectedServicesList.length === 0 ? (
            <div className="h-8 flex items-center gap-2 bg-slate-100 px-3 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-700 font-bold text-xs">Tổng thu:</span>
              <span className="font-black text-[#047857] text-xs">
                {formatCompactVND(currentMonthRevenue)}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* 2. Scrollable Calendar Content - Stretches to fill vertical height */}
      <div
        className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0 bg-slate-50/50"
      >
        {!currentGroup || currentGroup.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <CalendarIcon size={36} className="text-slate-300" />
            <span className="text-xs font-bold">Không có dữ liệu doanh thu ngày</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Weekday Header Row (T2 -> CN) - Thứ 7 & CN có màu nền riêng */}
            <div className="grid grid-cols-7 gap-1.5 text-center mb-1.5 flex-shrink-0">
              {WEEKDAYS.map((wd) => (
                <div
                  key={wd.key}
                  className={`py-1.5 text-xs font-extrabold rounded-lg border shadow-2xs ${
                    wd.isSunday
                      ? "text-rose-700 bg-rose-50/80 border-slate-200"
                      : wd.isSaturday
                        ? "text-blue-700 bg-blue-50/80 border-slate-200"
                        : "text-slate-800 bg-white border-slate-200"
                  }`}
                  title={wd.fullName}
                >
                  {wd.label}
                </div>
              ))}
            </div>

            {/* Calendar Grid Matrix - auto-rows-fr stretches cells across available height */}
            <div className="flex-1 grid grid-cols-7 gap-1.5 auto-rows-fr min-h-0">
              {/* 1. Leading Other Month Day Cells - Màu xám khác với nền calender */}
              {leadingDays.map((dayNum, idx) => (
                <div
                  key={`blank-lead-${idx}`}
                  className="min-h-[50px] rounded-lg border border-slate-200 bg-slate-200/70 p-2 flex flex-col justify-between select-none shadow-sm opacity-80"
                >
                  <span className="text-xs font-bold text-slate-400">
                    {dayNum}
                  </span>
                </div>
              ))}

              {/* 2. Actual Day Cells */}
              {currentGroup.items.map((d) => {
                const isSelected = selectedList.includes(d.dateRaw);
                const isInDrag = dragPreviewRange?.includes(d.dateRaw) ?? false;
                const isCellHighlighted = isInDrag || isSelected;
                const isToday = d.dateRaw === todayDateStr;
                const isSunday = d.dayOfWeek === 7;
                const isSaturday = d.dayOfWeek === 6;
                const hasRevenue = d.finalAmount > 0;
                const invoiceCount = d.invoices?.length || 0;

                const tooltipContent = (
                  <div className="flex flex-col gap-1 text-xs whitespace-normal min-w-[170px] max-w-[240px] text-slate-700">
                    <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                      Ngày {d.dateRaw} ({isSunday ? "Chủ Nhật" : `Thứ ${d.dayOfWeek + 1}`})
                    </div>
                    <div className="flex justify-between items-center gap-3">
                      <span className="text-slate-500 font-medium">Doanh thu:</span>
                      <span className="font-bold text-sky-600">{formatVND(d.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-3">
                      <span className="text-slate-500 font-medium">Giảm giá:</span>
                      <span className="font-bold text-rose-600">
                        {d.discountAmount > 0 ? `-${formatVND(d.discountAmount)}` : "0 ₫"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-3 border-t border-slate-200 pt-1">
                      <span className="text-slate-800 font-bold">Thu thực tế:</span>
                      <span className="font-black text-[#047857]">{formatVND(d.finalAmount)}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 italic pt-0.5 border-t border-slate-100">
                      {invoiceCount > 0 ? `${invoiceCount} hóa đơn phát sinh` : "Không có hóa đơn"} • Nháy đúp xem chi tiết
                    </div>
                  </div>
                );

                return (
                  <Tooltip
                    key={d.dateRaw}
                    position="top"
                    delay={150}
                    disabled={dragPreviewRange !== null}
                    content={tooltipContent}
                  >
                    <div
                      data-date={d.dateRaw}
                      onMouseDown={(e) => handleCellMouseDown(e, d.dateRaw)}
                      onMouseEnter={() => handleCellMouseEnter(d.dateRaw)}
                      onClick={(e) => {
                        if (hasDraggedRef.current) return;
                        onDayClick(e, d.dateRaw);
                      }}
                      onDoubleClick={() => onViewDayDetails(d)}
                      className={`group relative flex flex-col justify-between p-2 rounded-lg border text-left transition-all duration-100 select-none cursor-pointer min-h-[50px] shadow-sm ${
                        isCellHighlighted
                          ? "bg-blue-100/90 border-blue-600 ring-2 ring-blue-500 shadow-md z-10"
                          : isSunday
                            ? "bg-rose-50/40 border-slate-200 hover:border-blue-400 hover:bg-rose-50/70 hover:shadow-xs"
                            : isSaturday
                              ? "bg-blue-50/40 border-slate-200 hover:border-blue-400 hover:bg-blue-50/70 hover:shadow-xs"
                              : "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 hover:shadow-xs"
                      }`}
                    >
                      {/* Top Header Row of Cell: Day Number & Invoice Badge */}
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1">
                          {isToday ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-cyan-700 text-white font-black text-xs shadow-xs">
                              {d.day}
                            </span>
                          ) : (
                            <span
                              className={`text-xs ${
                                isSelected
                                  ? "font-black text-blue-900"
                                  : isSunday
                                    ? "font-extrabold text-rose-700"
                                    : isSaturday
                                      ? "font-extrabold text-blue-700"
                                      : "font-extrabold text-slate-800"
                              }`}
                            >
                              {d.day}
                            </span>
                          )}
                        </div>

                        {/* Invoice count badge */}
                        {invoiceCount > 0 && (
                          <span
                            className={`text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-full border transition-colors ${
                              isSelected
                                ? "bg-blue-200 border-blue-400 text-blue-900"
                                : "bg-slate-100 border-slate-200 text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
                            }`}
                          >
                            {invoiceCount} HĐ
                          </span>
                        )}
                      </div>

                      {/* Middle/Bottom: Doanh thu (xanh da trời), giảm giá (đỏ), Thu thực tế (rgb(4 120 87)) */}
                      {hasRevenue ? (
                        <div className="flex flex-col gap-0.5 mt-1 text-[11px] leading-tight w-full select-none">
                          {/* 1. Doanh thu (xanh da trời) */}
                          <div className="flex items-baseline justify-end">
                            <span className="font-bold text-sky-600 truncate text-xs">
                              {formatCompactVND(d.totalPrice)}
                            </span>
                          </div>

                          {/* 2. Giảm giá (đỏ) */}
                          <div className="flex items-baseline justify-end">
                            <span
                              className={`font-bold truncate text-xs ${
                                d.discountAmount > 0 ? "text-rose-600" : "text-slate-300"
                              }`}
                            >
                              {d.discountAmount > 0 ? `-${formatCompactVND(d.discountAmount)}` : "-"}
                            </span>
                          </div>

                          {/* 3. Thu thực tế: rgb(4 120 87) / text-[#047857] */}
                          <div className="flex items-baseline justify-end pt-0.5 border-t border-slate-200">
                            <span className="font-black text-[#047857] text-xs truncate">
                              {formatCompactVND(d.finalAmount)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center flex-1 py-2">
                          <span className="text-xs text-slate-300 font-semibold select-none">-</span>
                        </div>
                      )}
                    </div>
                  </Tooltip>
                );
              })}

              {/* 3. Trailing Other Month Day Cells - Màu xám khác với nền calender */}
              {trailingDays.map((dayNum, idx) => (
                <div
                  key={`blank-trail-${idx}`}
                  className="min-h-[50px] rounded-lg border border-slate-200 bg-slate-200/70 p-2 flex flex-col justify-between select-none shadow-sm opacity-80"
                >
                  <span className="text-xs font-bold text-slate-400">
                    {dayNum}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Footer - Fixed exact height h-[46px] to match MonthlyRevenueChart */}
      <div className="h-[46px] relative flex items-center justify-between px-4 bg-slate-100 border-t border-slate-200 text-xs flex-shrink-0">
        <div className="flex items-center gap-2.5 text-xs text-slate-800 font-semibold z-10">
          <div className="flex items-center gap-1.5">
            <Receipt size={14} className="text-slate-600 flex-shrink-0" />
            <span>
              {selectedList.length > 0 ? (
                <>Đang chọn <strong className="text-blue-700 font-bold">{selectedList.length}</strong>/{currentMonthDays.length} ngày</>
              ) : (
                <><strong className="text-blue-700 font-bold">{currentMonthActiveDays}</strong>/{currentMonthDays.length} ngày phát sinh</>
              )}
            </span>
          </div>
          <span className="text-slate-400 font-bold">•</span>
          <div>
            <span>
              <strong className="text-blue-700 font-bold">{displayedInvoicesCount}</strong> hóa đơn
            </span>
          </div>
        </div>

        {/* Ô thay đổi tháng CỐ ĐỊNH TUYỆT ĐỐI TẠI TRUNG TÂM (không bị dịch chuyển khi đối tượng bên phải đổi độ dài) */}
        <div
          style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}
          className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm z-20 pointer-events-auto"
        >
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-700 hover:bg-slate-200 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Tháng trước"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs font-extrabold text-slate-900 px-2 min-w-[85px] text-center select-none">
            {displayMonthLabel}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={!canGoNext}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-700 hover:bg-slate-200 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Tháng sau"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="flex items-center gap-2 z-10">
          <span className="text-xs text-slate-700 font-bold">
            {selectedList.length > 0 ? "Tổng thu đã chọn:" : "Tổng thu cả tháng:"}
          </span>
          <span className="text-xs font-black text-[#047857]">
            {formatNumber(selectedDaysFinalAmount)} đ
          </span>
        </div>
      </div>
    </div>
  );
}
