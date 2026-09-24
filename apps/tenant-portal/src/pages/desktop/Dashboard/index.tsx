import React, { useState, useRef, useEffect, useMemo } from "react";

import { MonthlyRevenueChart } from "./components/MonthlyRevenueChart";
import { DailyRevenueCalendar } from "./components/DailyRevenueCalendar";
import { StaffAndServiceColumn } from "./components/StaffAndServiceColumn";
import { StaffRevenuePieChart } from "./components/StaffRevenuePieChart";
import { DailyInvoiceModal } from "./components/DailyInvoiceModal";
import { DailyTurns } from "./components/DailyTurns";
import { RecentBookings } from "./components/RecentBookings";
import { useDashboardStats } from "./useDashboardStats";
import { DailyRevenueItem, DashboardCharts } from "./types";
import { handleMultiRangeSelect } from "./utils";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<DailyRevenueItem | null>(null);

  // We only pass selectedMonth to the query hook so that day/staff/service changes don't trigger slow API roundtrips
  const { stats, loading, error, refetch } = useDashboardStats(selectedMonth);

  const handleSelectMonth = (month: string) => {
    setSelectedMonth(month);
    setSelectedDays("");
    setSelectedStaff("");
    setSelectedServices("");
  };

  // Perform filtering and aggregations client-side for instantaneous filtering speed
  const filteredCharts = React.useMemo(() => {
    if (!stats || !stats.charts) return null;
    const rawCharts = stats.charts;

    const selectedDaysList = selectedDays
      ? selectedDays.split(",").filter((d) => d.trim().length > 0)
      : [];
    const selectedStaffList = selectedStaff
      ? selectedStaff.split(",").filter((id) => id.trim().length > 0)
      : [];
    const selectedServicesList = selectedServices
      ? selectedServices.split(",").filter((id) => id.trim().length > 0)
      : [];

    // 1. Filter daily revenues based on selected staff/services
    const dailyRevenues = (rawCharts.dailyRevenues || []).map((d) => {
      const filteredInvoices = (d.invoices || [])
        .map((inv) => {
          const filteredItems = (inv.items || []).filter((item) => {
            const matchesStaff =
              selectedStaffList.length === 0 ||
              (item.staffId && selectedStaffList.includes(item.staffId));
            const matchesService =
              selectedServicesList.length === 0 ||
              (item.itemType === "SERVICE" &&
                selectedServicesList.includes(item.itemId));
            return matchesStaff && matchesService;
          });

          if (filteredItems.length === 0) return null;

          const totalPrice = filteredItems.reduce(
            (sum, item) => sum + item.totalPrice,
            0,
          );
          const discountAmount = filteredItems.reduce(
            (sum, item) => sum + item.discountAmount,
            0,
          );
          const finalAmount = filteredItems.reduce(
            (sum, item) => sum + item.finalAmount,
            0,
          );

          return {
            ...inv,
            items: filteredItems,
            totalPrice,
            discountAmount,
            finalAmount,
          };
        })
        .filter((inv): inv is NonNullable<typeof inv> => inv !== null);

      const totalPrice = filteredInvoices.reduce(
        (sum, inv) => sum + inv.totalPrice,
        0,
      );
      const finalAmount = filteredInvoices.reduce(
        (sum, inv) => sum + inv.finalAmount,
        0,
      );
      const discountAmount = filteredInvoices.reduce(
        (sum, inv) => sum + inv.discountAmount,
        0,
      );

      return {
        ...d,
        invoices: filteredInvoices,
        totalPrice,
        finalAmount,
        discountAmount,
      };
    });

    // 2. Gather invoices for date stats (scoped ONLY to selectedDays, NOT narrowed by staff or service)
    // This ensures selecting a staff/service highlights that entity without wiping out or hiding other rows!
    const invoicesForDateStats = (rawCharts.dailyRevenues || [])
      .filter(
        (d) =>
          selectedDaysList.length === 0 || selectedDaysList.includes(d.dateRaw),
      )
      .flatMap((d) => d.invoices || []);

    // 3. Aggregate Staff Performance (starts at 0 to avoid double counting)
    const staffMap = new Map<
      string,
      {
        staffName: string;
        totalPrice: number;
        actualRevenue: number;
        customers: Set<string>;
        recordCount: number;
      }
    >();

    (rawCharts.staffPerformance || []).forEach((s) => {
      staffMap.set(s.staffId, {
        staffName: s.staffName,
        totalPrice: 0,
        actualRevenue: 0,
        customers: new Set<string>(),
        recordCount: 0,
      });
    });

    for (const inv of invoicesForDateStats) {
      const custId = inv.customerName || `guest-${inv.id}`;
      for (const item of (inv.items || [])) {
        if (item.staffId) {
          const existing = staffMap.get(item.staffId);
          if (existing) {
            existing.totalPrice += item.totalPrice ?? (item.price * (item.quantity || 1));
            existing.actualRevenue += item.finalAmount;
            existing.customers.add(custId);
            existing.recordCount += 1;
          } else {
            staffMap.set(item.staffId, {
              staffName: item.staffName || "Nhân viên khác",
              totalPrice: item.totalPrice ?? (item.price * (item.quantity || 1)),
              actualRevenue: item.finalAmount,
              customers: new Set([custId]),
              recordCount: 1,
            });
          }
        }
      }
    }

    const staffPerformance = Array.from(staffMap.entries())
      .map(([staffId, data]) => ({
        staffId,
        staffName: data.staffName,
        totalPrice: data.totalPrice,
        actualRevenue: data.actualRevenue,
        revenue: data.actualRevenue,
        customers: data.customers.size,
        recordCount: data.recordCount,
      }))
      .sort((a, b) => (b.actualRevenue || 0) - (a.actualRevenue || 0));

    // 4. Aggregate Top Services (starts at 0, keeps all service rows visible)
    const servicesMap = new Map<
      string,
      {
        name: string;
        count: number;
        revenue: number;
      }
    >();

    (rawCharts.topServices || []).forEach((s) => {
      servicesMap.set(s.id, {
        name: s.name,
        count: 0,
        revenue: 0,
      });
    });

    for (const inv of invoicesForDateStats) {
      for (const item of (inv.items || [])) {
        if (item.itemType === "SERVICE") {
          const existing = servicesMap.get(item.itemId);
          if (existing) {
            existing.count += item.quantity || 1;
            existing.revenue += item.finalAmount;
          } else if (item.itemId) {
            servicesMap.set(item.itemId, {
              name: item.name || "Dịch vụ khác",
              count: item.quantity || 1,
              revenue: item.finalAmount,
            });
          }
        }
      }
    }

    const topServices = Array.from(servicesMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      ...rawCharts,
      dailyRevenues,
      staffPerformance,
      topServices,
    };
  }, [stats, selectedDays, selectedStaff, selectedServices]);

  const chartsToDisplay = (filteredCharts || stats?.charts) as DashboardCharts;

  // Auto-select latest month on initial mount (allows user to deselect and view whole year)
  const hasInitializedMonthRef = useRef(false);
  useEffect(() => {
    if (
      !hasInitializedMonthRef.current &&
      stats?.charts?.monthlyTrends &&
      stats.charts.monthlyTrends.length > 0
    ) {
      const latest = stats.charts.monthlyTrends[stats.charts.monthlyTrends.length - 1];
      setSelectedMonth(latest.yearMonth);
      hasInitializedMonthRef.current = true;
    }
  }, [stats?.charts?.monthlyTrends]);

  // Day selection anchor and click handler
  const anchorDayRef = useRef<string | null>(null);

  useEffect(() => {
    if (!anchorDayRef.current && selectedDays) {
      const parts = selectedDays.split(",");
      anchorDayRef.current = parts[parts.length - 1];
    }
  }, [selectedDays]);

  const handleDayClick = (e: React.MouseEvent, clickedDay: string) => {
    const allDays = (chartsToDisplay?.dailyRevenues || []).map((d: DailyRevenueItem) => d.dateRaw);
    handleMultiRangeSelect({
      event: e,
      clickedKey: clickedDay,
      allKeys: allDays,
      currentSelected: selectedDays,
      anchorKey: anchorDayRef.current,
      onSelect: setSelectedDays,
      setAnchorKey: (key) => {
        anchorDayRef.current = key;
      },
    });
  };

  const totalServicePrice = useMemo(() => {
    return (chartsToDisplay?.dailyRevenues || []).reduce(
      (sum: number, d: DailyRevenueItem) => sum + d.totalPrice,
      0,
    );
  }, [chartsToDisplay?.dailyRevenues]);

  const totalFinalAmount = useMemo(() => {
    return (chartsToDisplay?.dailyRevenues || []).reduce(
      (sum: number, d: DailyRevenueItem) => sum + d.finalAmount,
      0,
    );
  }, [chartsToDisplay?.dailyRevenues]);

  if (loading && !stats) {
    return (
      <div className="space-y-4 animate-fade-in">
        {/* Skeleton for 1-2-1 Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 xl:h-[calc(100vh-120px)] xl:min-h-[580px]">
          <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm h-full min-h-[500px] xl:min-h-0 flex items-center justify-center">
            <div className="w-3/4 h-64 bg-slate-100 rounded-lg animate-pulse" />
          </div>
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm h-full min-h-[500px] xl:min-h-0 flex items-center justify-center">
            <div className="w-5/6 h-72 bg-slate-100 rounded-lg animate-pulse" />
          </div>
          <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm h-full min-h-[500px] xl:min-h-0 flex items-center justify-center">
            <div className="w-3/4 h-64 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6 animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md w-full p-8 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-2xl border border-amber-200">
            ⚠️
          </div>
          <h3 className="text-lg font-bold text-slate-900 m-0">
            Không thể tải dữ liệu tổng quan
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed m-0">
            {error || "Đã xảy ra lỗi không xác định khi kết nối với máy chủ."}
          </p>
          <button
            type="button"
            className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            onClick={() => refetch()}
          >
            Thử tải lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Main 1-2-1 Column Grid Layout - Responsive theo chiều dọc phủ kín màn hình */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-stretch xl:h-[calc(100vh-120px)] xl:min-h-[580px]">
        {/* Cột 1 (tỉ lệ 1): Doanh thu theo tháng */}
        <div className="xl:col-span-1 flex flex-col h-full min-h-[500px] xl:min-h-0">
          <MonthlyRevenueChart
            monthlyTrends={chartsToDisplay?.monthlyTrends || []}
            selectedMonth={selectedMonth}
            onSelectMonth={handleSelectMonth}
          />
        </div>

        {/* Cột 2 (tỉ lệ 2): Doanh thu theo ngày */}
        <div className="xl:col-span-2 flex flex-col h-full min-h-[500px] xl:min-h-0">
          <DailyRevenueCalendar
            dailyRevenues={chartsToDisplay?.dailyRevenues || []}
            availableMonths={(chartsToDisplay?.monthlyTrends || []).map((m) => ({
              month: m.month,
              yearMonth: m.yearMonth,
            }))}
            selectedDays={selectedDays}
            selectedMonth={selectedMonth}
            onSelectMonth={handleSelectMonth}
            onDayClick={handleDayClick}
            onSelectDays={setSelectedDays}
            onClearDayFilter={() => setSelectedDays("")}
            onViewDayDetails={setSelectedDay}
            totalServicePrice={totalServicePrice}
            totalFinalAmount={totalFinalAmount}
            selectedStaff={selectedStaff}
            selectedServices={selectedServices}
            onClearStaffFilter={() => setSelectedStaff("")}
            onClearServiceFilter={() => setSelectedServices("")}
          />
        </div>

        {/* Cột 3 (tỉ lệ 1): Nhân viên (trên) + Dịch vụ (dưới) */}
        <div className="xl:col-span-1 flex flex-col h-full min-h-[500px] xl:min-h-0">
          <StaffAndServiceColumn
            staffPerformance={chartsToDisplay?.staffPerformance || []}
            topServices={chartsToDisplay?.topServices || []}
            selectedStaff={selectedStaff}
            onSelectStaff={setSelectedStaff}
            selectedServices={selectedServices}
            onSelectServices={setSelectedServices}
          />
        </div>
      </div>

      {/* 2. Biểu đồ tròn đưa sang 1 panel riêng biệt phía dưới */}
      <StaffRevenuePieChart
        staffPerformance={chartsToDisplay?.staffPerformance || []}
        selectedStaff={selectedStaff}
        onSelectStaff={setSelectedStaff}
      />

      {/* 3. Main content grid (Lịch hẹn gần đây & Lượt phục vụ) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Recent Bookings */}
        <div className="lg:col-span-2">
          <RecentBookings bookings={stats.recentBookings} />
        </div>

        {/* Right Column: Daily Turns */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <DailyTurns turns={stats.dailyTurns} />
        </div>
      </div>

      {/* 4. Modal chi tiết hóa đơn theo ngày */}
      {selectedDay && (
        <DailyInvoiceModal
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
