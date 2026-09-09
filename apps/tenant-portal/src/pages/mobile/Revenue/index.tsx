import React from "react";
import { useMobileRevenue } from "./useMobileRevenue";
import { RevenueCalendarPanel } from "./components/RevenueCalendarPanel";
import { RevenueMonthlyChartPanel } from "./components/RevenueMonthlyChartPanel";
import { DailyInvoicesModal } from "./components/DailyInvoicesModal";

export default function MobileRevenuePage() {
  const {
    currentYear,
    currentMonthIndex,
    selectedYearMonth,
    monthlyTrends,
    sortedDailyList,
    calendarCells,
    monthSummary,
    selectedDay,
    setSelectedDay,
    selectedMonthDetail,
    setSelectedMonthDetail,
    handleOpenMonthDetail,
    activeStaff,
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
  } = useMobileRevenue();

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-y-auto overscroll-contain relative pb-6">
      {/* Error Banner if any */}
      {error && (
        <div className="px-3 py-2 bg-rose-50 text-rose-700 border-b border-rose-200 text-xs flex items-center gap-1.5 flex-shrink-0">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* PANEL 1: Dạng Lịch (Hiển thị đầy đủ, không scroll riêng) */}
      <RevenueCalendarPanel
        currentYear={currentYear}
        currentMonthIndex={currentMonthIndex}
        calendarCells={calendarCells}
        sortedDailyList={sortedDailyList}
        monthSummary={monthSummary}
        calendarFormat={calendarFormat}
        setCalendarFormat={setCalendarFormat}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
        onSelectDay={(day) => setSelectedDay(day)}
        formatShortCurrency={formatShortCurrency}
        formatCompactNumber={formatCompactNumber}
        formatCurrencyK={formatCurrencyK}
        isLoading={loading}
      />

      {/* Visual Separator Bar (Thanh phân cách giữa 2 Panel) */}
      <div className="h-2 bg-slate-100 border-t border-b border-slate-200 flex-shrink-0" />

      {/* PANEL 2: Biểu đồ cột ngang 12 tháng (Hiển thị đầy đủ xuống phía dưới) */}
      <RevenueMonthlyChartPanel
        monthlyTrends={monthlyTrends}
        selectedYearMonth={selectedYearMonth}
        onSelectMonth={(ym) => setTargetMonth(ym)}
        onSelectMonthDetail={(ym) => handleOpenMonthDetail(ym)}
        formatShortCurrency={formatShortCurrency}
        formatCompactNumber={formatCompactNumber}
        isLoading={loading}
      />

      {/* Selected Day or Selected Month Detail Modal (Kế thừa trực tiếp StaffDailyRevenueCard & MobileInvoiceList) */}
      {(selectedDay || selectedMonthDetail) && (
        <DailyInvoicesModal
          selectedDay={selectedDay}
          selectedMonth={selectedMonthDetail}
          staffList={activeStaff}
          onClose={() => {
            setSelectedDay(null);
            setSelectedMonthDetail(null);
          }}
          formatShortCurrency={formatShortCurrency}
        />
      )}
    </div>
  );
}
