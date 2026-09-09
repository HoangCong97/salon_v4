import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/useAuthStore";
import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";
import { Staff } from "../../desktop/Invoices/types";
import { useDashboardStats } from "../../desktop/Dashboard/useDashboardStats";
import {
  CalendarDayCell,
  DailyRevenueItem,
  CalendarDisplayFormat,
  InvoiceDetailItem,
} from "./types";
import { MonthDetailData } from "./components/DailyInvoicesModal";

export function useMobileRevenue() {
  const { currentTenantId, currentBranchId } = useAuthStore();

  // Load active staff list for staff names, avatars & filters
  const { data: staffData } = useQuery<Staff[]>({
    queryKey: queryKeys.shifts.staff(currentTenantId!, currentBranchId!),
    queryFn: () =>
      api.get(
        `/tenants/${currentTenantId}/branches/${currentBranchId}/shifts/staff`,
      ),
    enabled: !!currentTenantId && !!currentBranchId,
    staleTime: 5 * 60 * 1000,
  });

  // Preserve selected month during multitasking / app switching
  const getInitialYearMonth = () => {
    try {
      const saved = sessionStorage.getItem("mobile_revenue_selected_ym");
      if (saved && /^\d{4}-\d{2}$/.test(saved)) {
        const [y, m] = saved.split("-");
        return { year: parseInt(y, 10), monthIndex: parseInt(m, 10) - 1 };
      }
    } catch {}
    const now = new Date();
    return { year: now.getFullYear(), monthIndex: now.getMonth() };
  };

  const initialYM = useMemo(() => getInitialYearMonth(), []);
  const [currentYear, setCurrentYear] = useState<number>(initialYM.year);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(initialYM.monthIndex);
  const [selectedDay, setSelectedDay] = useState<DailyRevenueItem | null>(null);
  const [selectedMonthDetail, setSelectedMonthDetail] = useState<MonthDetailData | null>(null);
  const [pendingMonthModal, setPendingMonthModal] = useState<string | null>(null);
  const [calendarFormat, setCalendarFormat] = useState<CalendarDisplayFormat>("GRID");

  // String format: YYYY-MM
  const selectedYearMonth = useMemo(() => {
    const m = String(currentMonthIndex + 1).padStart(2, "0");
    return `${currentYear}-${m}`;
  }, [currentYear, currentMonthIndex]);

  // Persist selected month to sessionStorage so multitasking doesn't reset it
  useEffect(() => {
    try {
      sessionStorage.setItem("mobile_revenue_selected_ym", selectedYearMonth);
    } catch {}
  }, [selectedYearMonth]);

  // Fetch dashboard stats for the selected month (with persistent localStorage cache & 5-min staleTime)
  const { stats, loading, error, refetch } = useDashboardStats(selectedYearMonth);

  const monthlyTrends = stats?.charts.monthlyTrends || [];
  const dailyRevenues = stats?.charts.dailyRevenues || [];

  // Monthly totals
  const monthSummary = useMemo(() => {
    const gross = dailyRevenues.reduce((sum, d) => sum + (d.totalPrice || 0), 0);
    const net = dailyRevenues.reduce((sum, d) => sum + (d.finalAmount || 0), 0);
    const discount = dailyRevenues.reduce((sum, d) => sum + (d.discountAmount || 0), 0);
    const invoiceCount = dailyRevenues.reduce((sum, d) => sum + (d.invoices?.length || 0), 0);

    return {
      gross,
      net,
      discount,
      invoiceCount,
    };
  }, [dailyRevenues]);

  // Navigation handlers
  const goToPrevMonth = useCallback(() => {
    setCurrentMonthIndex((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonthIndex((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonthIndex(today.getMonth());
  }, []);

  // Jump to specific month (e.g. clicked from horizontal chart in Panel 2)
  const setTargetMonth = useCallback((yearMonth: string) => {
    const [y, m] = yearMonth.split("-");
    if (y && m) {
      setCurrentYear(parseInt(y, 10));
      setCurrentMonthIndex(parseInt(m, 10) - 1);
    }
  }, []);

  // Open month staff revenue modal when clicking on the 12-month chart
  const handleOpenMonthDetail = useCallback(
    (yearMonth: string) => {
      if (yearMonth === selectedYearMonth) {
        const allInvoices = dailyRevenues.flatMap((d) => d.invoices || []);
        setSelectedMonthDetail({
          yearMonth,
          gross: monthSummary.gross,
          net: monthSummary.net,
          invoices: allInvoices,
        });
      } else {
        setTargetMonth(yearMonth);
        setPendingMonthModal(yearMonth);
      }
    },
    [selectedYearMonth, dailyRevenues, monthSummary, setTargetMonth],
  );

  // When a pending month finishes loading, automatically open its detail modal
  useEffect(() => {
    if (pendingMonthModal && pendingMonthModal === selectedYearMonth && !loading) {
      const allInvoices = dailyRevenues.flatMap((d) => d.invoices || []);
      setSelectedMonthDetail({
        yearMonth: pendingMonthModal,
        gross: monthSummary.gross,
        net: monthSummary.net,
        invoices: allInvoices,
      });
      setPendingMonthModal(null);
    }
  }, [pendingMonthModal, selectedYearMonth, loading, dailyRevenues, monthSummary]);

  // Generate 42 calendar cells for matrix grid (6 weeks x 7 days: T2 to CN)
  const calendarCells = useMemo((): CalendarDayCell[] => {
    const cells: CalendarDayCell[] = [];
    const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);

    // Vietnam: Week starts on Monday (1). Sunday is index 6.
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const totalDays = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonthIndex, 0).getDate();

    const today = new Date();
    const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // Map dailyRevenues by dateRaw for O(1) lookup
    const dailyMap = new Map<string, DailyRevenueItem>();
    dailyRevenues.forEach((d) => {
      dailyMap.set(d.dateRaw, d);
    });

    const formatDateStr = (d: Date) => {
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const da = String(d.getDate()).padStart(2, "0");
      return `${yr}-${mo}-${da}`;
    };

    // 1. Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const cellDate = new Date(
        currentMonthIndex === 0 ? currentYear - 1 : currentYear,
        currentMonthIndex === 0 ? 11 : currentMonthIndex - 1,
        day,
      );
      const dateStr = formatDateStr(cellDate);
      const rev = dailyMap.get(dateStr);
      const dow = cellDate.getDay() === 0 ? 7 : cellDate.getDay();

      cells.push({
        date: cellDate,
        dateStr,
        day,
        dayOfWeek: dow,
        isCurrentMonth: false,
        isToday: dateStr === todayDateStr,
        totalPrice: rev?.totalPrice || 0,
        finalAmount: rev?.finalAmount || 0,
        discountAmount: rev?.discountAmount || 0,
        invoices: rev?.invoices || [],
      });
    }

    // 2. Current month days
    for (let i = 1; i <= totalDays; i++) {
      const cellDate = new Date(currentYear, currentMonthIndex, i);
      const dateStr = formatDateStr(cellDate);
      const rev = dailyMap.get(dateStr);
      const dow = cellDate.getDay() === 0 ? 7 : cellDate.getDay();

      cells.push({
        date: cellDate,
        dateStr,
        day: i,
        dayOfWeek: dow,
        isCurrentMonth: true,
        isToday: dateStr === todayDateStr,
        totalPrice: rev?.totalPrice || 0,
        finalAmount: rev?.finalAmount || 0,
        discountAmount: rev?.discountAmount || 0,
        invoices: rev?.invoices || [],
      });
    }

    // 3. Next month padding to fill out 42 cells (6 rows x 7 cols)
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const cellDate = new Date(
        currentMonthIndex === 11 ? currentYear + 1 : currentYear,
        currentMonthIndex === 11 ? 0 : currentMonthIndex + 1,
        i,
      );
      const dateStr = formatDateStr(cellDate);
      const rev = dailyMap.get(dateStr);
      const dow = cellDate.getDay() === 0 ? 7 : cellDate.getDay();

      cells.push({
        date: cellDate,
        dateStr,
        day: i,
        dayOfWeek: dow,
        isCurrentMonth: false,
        isToday: dateStr === todayDateStr,
        totalPrice: rev?.totalPrice || 0,
        finalAmount: rev?.finalAmount || 0,
        discountAmount: rev?.discountAmount || 0,
        invoices: rev?.invoices || [],
      });
    }

    return cells;
  }, [currentYear, currentMonthIndex, dailyRevenues]);

  // Daily list sorted descending by date for list view
  const sortedDailyList = useMemo(() => {
    return [...dailyRevenues].sort((a, b) => b.dateRaw.localeCompare(a.dateRaw));
  }, [dailyRevenues]);

  // Format currency helpers
  const formatShortCurrency = useCallback((val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val);
  }, []);

  const formatCurrencyK = useCallback((val: number) => {
    if (!val || val === 0) return "-";
    const k = Math.round(val / 1000);
    return `${new Intl.NumberFormat("vi-VN").format(k)}K`;
  }, []);

  const formatCompactNumber = useCallback((val: number) => {
    if (!val || val === 0) return "-";
    if (val >= 1_000_000_000) {
      return `${(val / 1_000_000_000).toFixed(1)}B`;
    }
    if (val >= 1_000_000) {
      const m = val / 1_000_000;
      return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
    }
    if (val >= 1_000) {
      const k = val / 1_000;
      return k % 1 === 0 ? `${k}k` : `${k.toFixed(0)}k`;
    }
    return String(val);
  }, []);

  return {
    currentYear,
    currentMonthIndex,
    selectedYearMonth,
    monthlyTrends,
    dailyRevenues,
    sortedDailyList,
    calendarCells,
    monthSummary,
    selectedDay,
    setSelectedDay,
    selectedMonthDetail,
    setSelectedMonthDetail,
    handleOpenMonthDetail,
    activeStaff: staffData || [],
    calendarFormat,
    setCalendarFormat,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    setTargetMonth,
    formatShortCurrency,
    formatCompactNumber,
    formatCurrencyK,
    loading,
    error,
    refetch,
  };
}
