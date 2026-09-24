import React, { useRef, useEffect, useMemo } from "react";
import { BarChart3, Calendar, X } from "lucide-react";
import { MonthlyTrendItem } from "../types";
import { getNiceTicks, formatNumber, handleMultiRangeSelect } from "../utils";

interface MonthlyRevenueChartProps {
  monthlyTrends: MonthlyTrendItem[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}

export function MonthlyRevenueChart({
  monthlyTrends = [],
  selectedMonth,
  onSelectMonth,
}: MonthlyRevenueChartProps) {
  const anchorMonthRef = useRef<string | null>(null);

  useEffect(() => {
    if (!anchorMonthRef.current && selectedMonth) {
      const parts = selectedMonth.split(",");
      anchorMonthRef.current = parts[parts.length - 1];
    }
  }, [selectedMonth]);

  const selectedMonthList = useMemo(() => {
    return selectedMonth ? selectedMonth.split(",").filter(Boolean) : [];
  }, [selectedMonth]);

  const isMonthFiltered =
    selectedMonthList.length > 0 && selectedMonthList.length < monthlyTrends.length;

  const totalYearRevenue = useMemo(() => {
    return monthlyTrends.reduce((sum, m) => sum + m.finalAmount, 0);
  }, [monthlyTrends]);

  const selectedRevenue = useMemo(() => {
    if (!isMonthFiltered) return totalYearRevenue;
    return monthlyTrends
      .filter((m) => selectedMonthList.includes(m.yearMonth))
      .reduce((sum, m) => sum + m.finalAmount, 0);
  }, [monthlyTrends, selectedMonthList, isMonthFiltered, totalYearRevenue]);

  const activeMonthsCount = useMemo(() => {
    return monthlyTrends.filter((m) => m.finalAmount > 0).length;
  }, [monthlyTrends]);

  const handleMonthClick = (e: React.MouseEvent, clickedMonth: string) => {
    const allMonths = monthlyTrends.map((m) => m.yearMonth);
    handleMultiRangeSelect({
      event: e,
      clickedKey: clickedMonth,
      allKeys: allMonths,
      currentSelected: selectedMonth,
      anchorKey: anchorMonthRef.current,
      onSelect: onSelectMonth,
      setAnchorKey: (key) => {
        anchorMonthRef.current = key;
      },
    });
  };

  const formatMonthLabel = (monthStr: string) => {
    let cleaned = monthStr.replace(/thg\s*/i, "").trim();
    cleaned = cleaned.replace(/\s+/g, "/");
    return cleaned;
  };

  const { niceMax } = getNiceTicks(
    Math.max(
      ...monthlyTrends.map((m) => m.totalPrice),
      10000000,
    ),
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-[14px] border border-slate-300 shadow-sm overflow-hidden select-none">
      {/* 1. Header - Fixed exact height h-[60px] to match DailyRevenueCalendar */}
      <div className="h-[60px] flex items-center justify-between px-4 border-b border-slate-300 bg-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0">
            <BarChart3 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 m-0 leading-tight">
              Doanh thu theo tháng
            </h3>
            <p className="text-[11px] text-slate-600 font-medium m-0 mt-0.5 leading-normal">
              Chọn tháng để xem lịch chi tiết
            </p>
          </div>
        </div>

        {/* Legend with standardized h-8 badges matching calendar right side */}
        <div className="flex items-center gap-2 text-xs">
          {selectedMonthList.length > 0 ? (
            <div className="h-8 inline-flex items-center gap-2 pl-3 pr-1.5 py-1 bg-blue-50 border border-blue-300 text-blue-950 rounded-full shadow-2xs transition-all">
              <span className="text-xs font-extrabold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Đang chọn {selectedMonthList.length} tháng
              </span>
              <button
                type="button"
                onClick={() => onSelectMonth("")}
                className="w-5 h-5 rounded-full flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-2xs"
                title="Bỏ chọn tháng (Xem cả năm)"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <>
              <div className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block flex-shrink-0" />
                <span className="text-xs">Thành tiền</span>
              </div>
              <div className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-600 inline-block flex-shrink-0" />
                <span className="text-xs">Giảm giá</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Scrollable Monthly Bar Rows - Flex-1 evenly distributed */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col justify-between gap-1 min-h-0 bg-slate-50/50">
        {monthlyTrends.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <span className="text-xs font-bold">Không có dữ liệu 12 tháng</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 flex-1 justify-around min-h-0">
            {monthlyTrends.map((item) => {
              const selectedList = selectedMonth ? selectedMonth.split(",").filter(Boolean) : [];
              const isActive = selectedList.includes(item.yearMonth);

              // Total price represents length of the stacked bar
              const totalBarWidth = niceMax > 0 ? (item.totalPrice / niceMax) * 62 : 0;

              // Percentage of final vs discount within the total price bar
              const finalPercent =
                item.totalPrice > 0 ? (item.finalAmount / item.totalPrice) * 100 : 0;
              const discountPercent =
                item.totalPrice > 0 ? (item.discountAmount / item.totalPrice) * 100 : 0;

              // Effective width of the blue bar relative to container (range 0 to 62%)
              const blueBarWidthPercent =
                niceMax > 0 ? (item.finalAmount / niceMax) * 62 : 0;
              // Text requires at least ~75-80px width (which is ~30% of this container width) to fit without ellipsis
              const canFitInside = blueBarWidthPercent >= 30;

              return (
                <div
                  key={item.month}
                  onMouseDown={(e) => {
                    if (e.shiftKey || e.ctrlKey || e.metaKey) {
                      e.preventDefault();
                    }
                  }}
                  onClick={(e) => handleMonthClick(e, item.yearMonth)}
                  title={`Tháng ${item.month}\nThực thu: ${formatNumber(
                    item.finalAmount,
                  )} đ\nGiảm giá: ${formatNumber(
                    item.discountAmount,
                  )} đ\n(Bấm để lọc, giữ Ctrl/Shift để chọn nhiều tháng)`}
                  className={`group flex items-center gap-2.5 px-2.5 py-0.5 rounded-lg cursor-pointer transition-all duration-150 border shadow-2xs h-8 flex-shrink-0 ${
                    isActive
                      ? "bg-blue-100 border-blue-600 ring-2 ring-blue-400/60 shadow-xs"
                      : "bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50/40"
                  }`}
                >
                  {/* Month Label (12px) */}
                  <div className="w-14 flex-shrink-0 text-left">
                    <span
                      className={`text-xs font-black ${
                        isActive
                          ? "text-blue-900"
                          : "text-slate-800 group-hover:text-blue-700"
                      }`}
                    >
                      {formatMonthLabel(item.month)}
                    </span>
                  </div>

                  {/* Horizontal Bar Container - Fills parent height */}
                  <div className="flex-1 flex items-center h-full min-w-0">
                    {item.totalPrice > 0 ? (
                      <div className="flex items-center h-full w-full">
                        {/* Contiguous Stacked Bar: Cột liền nhau (Cột xanh thành tiền + Cột đỏ giảm giá dính liền) */}
                        <div
                          className="h-full flex items-stretch rounded overflow-hidden shadow-2xs flex-shrink-0"
                          style={{ width: `${Math.max(totalBarWidth, 6)}%` }}
                        >
                          {/* Final Amount (Xanh) */}
                          {item.finalAmount > 0 && (
                            <div
                              className="h-full bg-blue-600 flex items-center justify-end transition-all text-white font-black text-xs"
                              style={{ width: `${finalPercent}%` }}
                            >
                              {canFitInside && (
                                <span className="whitespace-nowrap px-1.5">
                                  {formatNumber(item.finalAmount)}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Discount (Đỏ) - Liền nhau với cột xanh */}
                          {item.discountAmount > 0 && (
                            <div
                              className="h-full bg-rose-500 transition-all flex-shrink-0"
                              style={{ width: `${discountPercent}%` }}
                            />
                          )}
                        </div>

                        {/* Right side: số tiền doanh thu thực tế được đẩy ra ngoài khi cột quá bé, kèm số tiền giảm giá */}
                        <div className="flex items-center flex-shrink-0">
                          {!canFitInside && item.finalAmount > 0 && (
                            <span className="text-xs text-blue-900 font-black whitespace-nowrap pl-1.5">
                              {formatNumber(item.finalAmount)}
                            </span>
                          )}

                          {item.discountAmount > 0 && (
                            <span className="text-xs font-black text-rose-600 whitespace-nowrap pl-1.5">
                              -{formatNumber(item.discountAmount)}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-bold select-none">
                        -
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Footer - Fixed exact height h-[46px] to match DailyRevenueCalendar */}
      <div className="h-[46px] flex items-center justify-between px-4 bg-slate-100 border-t border-slate-300 text-xs flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
          <Calendar size={14} className="text-slate-600 flex-shrink-0" />
          <span>
            {isMonthFiltered ? (
              <>Đang chọn <strong className="text-blue-700 font-bold">{selectedMonthList.length}</strong>/{monthlyTrends.length} tháng</>
            ) : (
              <><strong className="text-blue-700 font-bold">{activeMonthsCount}</strong>/{monthlyTrends.length} tháng phát sinh</>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-700 font-bold">
            {isMonthFiltered ? "Tổng thu đã chọn:" : "Tổng thu cả năm:"}
          </span>
          <span className="text-xs font-black text-[#047857]">
            {formatNumber(selectedRevenue)} đ
          </span>
        </div>
      </div>
    </div>
  );
}
