import React from "react";
import { BarChart3, ChevronRight, TrendingUp } from "lucide-react";
import { MonthlyTrendItem } from "../types";

interface RevenueMonthlyChartPanelProps {
  monthlyTrends: MonthlyTrendItem[];
  selectedYearMonth: string;
  onSelectMonth: (yearMonth: string) => void;
  onSelectMonthDetail?: (yearMonth: string) => void;
  formatShortCurrency: (val: number) => string;
  formatCompactNumber: (val: number) => string;
  isLoading?: boolean;
}

export const RevenueMonthlyChartPanel: React.FC<RevenueMonthlyChartPanelProps> = ({
  monthlyTrends,
  selectedYearMonth,
  onSelectMonth,
  onSelectMonthDetail,
  formatShortCurrency,
  formatCompactNumber,
  isLoading = false,
}) => {
  // Max 12 months (ensure at most 12 items, chronological)
  const trends12Months = React.useMemo(() => {
    return monthlyTrends.slice(-12);
  }, [monthlyTrends]);

  // Find max totalPrice across months for proportional scaling
  const maxRevenue = React.useMemo(() => {
    if (trends12Months.length === 0) return 10_000_000;
    const maxVal = Math.max(...trends12Months.map((m) => m.totalPrice || 0));
    return maxVal > 0 ? maxVal : 10_000_000;
  }, [trends12Months]);

  const formatMonthDisplay = (monthStr: string, yearMonth: string) => {
    const [y, m] = yearMonth.split("-");
    if (y && m) {
      return `T${parseInt(m, 10)}/${y.slice(2)}`;
    }
    return monthStr;
  };

  return (
    <div className="flex flex-col w-full bg-white select-none">
      {/* 1. Panel Header & Legend */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={16} className="text-blue-600" />
          <span className="text-[14px] font-bold text-slate-800">
            Biểu đồ doanh thu 12 tháng
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 text-[11px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#0891B2]" />
            <span className="text-cyan-700 font-bold">Thu thực tế</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#DC2626]" />
            <span className="text-red-600 font-medium">Giảm giá</span>
          </div>
        </div>
      </div>

      {/* Sub-header instruction */}
      <div className="px-3 py-1 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-shrink-0">
        <span className="italic">Chạm vào tháng để xem bảng doanh thu nhân viên</span>
        <span className="font-semibold text-slate-600">
          {trends12Months.length} tháng
        </span>
      </div>

      {/* 2. Main Horizontal Bars List */}
      <div className="w-full p-2 space-y-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Đang tải biểu đồ 12 tháng...</span>
          </div>
        ) : trends12Months.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Chưa có dữ liệu xu hướng doanh thu theo tháng
          </div>
        ) : (
          trends12Months.map((item) => {
            const isSelected = selectedYearMonth === item.yearMonth;
            const total = item.totalPrice || 0;
            const net = item.finalAmount || 0;
            const discount = item.discountAmount || 0;

            // Width of the bar relative to maxRevenue (max 75% width on mobile)
            const barWidthPercent = total > 0 ? Math.min((total / maxRevenue) * 75, 75) : 0;
            const netPercent = total > 0 ? (net / total) * 100 : 0;
            const discountPercent = total > 0 ? (discount / total) * 100 : 0;

            return (
              <button
                key={item.yearMonth}
                type="button"
                onClick={() => {
                  onSelectMonth(item.yearMonth);
                  if (onSelectMonthDetail) {
                    onSelectMonthDetail(item.yearMonth);
                  }
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all border ${
                  isSelected
                    ? "bg-cyan-50/70 border-cyan-400 shadow-xs"
                    : "bg-white hover:bg-slate-50 active:bg-slate-100 border-slate-100"
                }`}
                title={`Tháng ${item.month}: Bấm để xem bảng doanh thu nhân viên`}
              >
                {/* Month Label */}
                <div className="w-14 flex-shrink-0 flex items-center gap-1">
                  <span
                    className={`text-[12px] font-bold ${
                      isSelected ? "text-cyan-800" : "text-slate-700"
                    }`}
                  >
                    {formatMonthDisplay(item.month, item.yearMonth)}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0891B2] animate-pulse" />
                  )}
                </div>

                {/* Horizontal Bar Chart Container */}
                <div className="flex-1 flex items-center min-w-0">
                  <div className="w-full flex items-center">
                    {total > 0 ? (
                      <div
                        className="h-5 rounded-md overflow-hidden flex shadow-2xs transition-all duration-300"
                        style={{ width: `${Math.max(barWidthPercent, 8)}%` }}
                      >
                        {/* Net Revenue Segment (🌊 #0891B2) */}
                        <div
                          className="h-full bg-[#0891B2] transition-all duration-300 flex items-center justify-end pr-1"
                          style={{ width: `${netPercent}%` }}
                        />
                        {/* Discount Segment (🔴 #DC2626) */}
                        {discount > 0 && (
                          <div
                            className="h-full bg-[#DC2626] transition-all duration-300"
                            style={{ width: `${discountPercent}%` }}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="h-5 w-8 rounded-md bg-slate-100 flex items-center justify-center">
                        <span className="text-[10px] text-slate-400">-</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount text at end of row */}
                <div className="flex-shrink-0 flex items-center gap-1 text-right">
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-[12px] font-bold ${
                        isSelected ? "text-cyan-800" : "text-[#0891b2]"
                      }`}
                    >
                      {formatShortCurrency(net)}
                    </span>
                    {discount > 0 && (
                      <span className="text-[9px] text-[#dc2626] font-medium leading-none">
                        -{formatCompactNumber(discount)}
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    size={13}
                    className={`transition-transform ${
                      isSelected ? "text-cyan-700 translate-x-0.5" : "text-slate-300"
                    }`}
                  />
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* 3. Panel Footer Summary */}
      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 flex-shrink-0">
        <span>Cao nhất: {formatShortCurrency(maxRevenue)} đ</span>
        <span className="text-cyan-700 font-semibold">
          Đang xem: {selectedYearMonth}
        </span>
      </div>
    </div>
  );
};
export default RevenueMonthlyChartPanel;
