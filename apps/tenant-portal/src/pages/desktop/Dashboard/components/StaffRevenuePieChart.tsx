import React, { useMemo } from "react";
import { PieChart as PieChartIcon, Award } from "lucide-react";
import { StaffPerformanceItem } from "../types";

const SLICE_COLORS = [
  "#2563eb", // Blue
  "#0891b2", // Cyan
  "#059669", // Emerald
  "#d97706", // Amber
  "#dc2626", // Red
  "#7c3aed", // Violet
  "#db2777", // Pink
  "#4f46e5", // Indigo
  "#16a34a", // Green
  "#ea580c", // Orange
  "#64748b", // Slate
  "#9333ea", // Purple
];

interface StaffRevenuePieChartProps {
  staffPerformance: StaffPerformanceItem[];
  selectedStaff?: string;
  onSelectStaff?: (staffId: string) => void;
}

export function StaffRevenuePieChart({
  staffPerformance = [],
  selectedStaff = "",
  onSelectStaff,
}: StaffRevenuePieChartProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const totalRevenue = useMemo(() => {
    return staffPerformance.reduce((sum, s) => sum + s.revenue, 0);
  }, [staffPerformance]);

  const activeStaffWithRevenue = useMemo(() => {
    return staffPerformance.filter((s) => s.revenue > 0);
  }, [staffPerformance]);

  const topStaff = useMemo(() => {
    return activeStaffWithRevenue.length > 0 ? activeStaffWithRevenue[0] : null;
  }, [activeStaffWithRevenue]);

  // SVG Pie calculations
  const cx = 160;
  const cy = 160;
  const r = 135;

  const pieSlices = useMemo(() => {
    if (totalRevenue === 0 || activeStaffWithRevenue.length === 0) return [];

    let currentAngle = -90; // Start at 12 o'clock

    return activeStaffWithRevenue.map((staff, idx) => {
      const color = SLICE_COLORS[idx % SLICE_COLORS.length];
      const revenue = staff.revenue;
      const percentage = (revenue / totalRevenue) * 100;
      const angle = (revenue / totalRevenue) * 360;

      const startAngleRad = (currentAngle * Math.PI) / 180;
      const endAngleRad = ((currentAngle + angle) * Math.PI) / 180;

      const x1 = cx + r * Math.cos(startAngleRad);
      const y1 = cy + r * Math.sin(startAngleRad);
      const x2 = cx + r * Math.cos(endAngleRad);
      const y2 = cy + r * Math.sin(endAngleRad);

      const largeArcFlag = angle > 180 ? 1 : 0;
      const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      const midAngleRad = ((currentAngle + angle / 2) * Math.PI) / 180;
      const labelX = cx + r * 0.65 * Math.cos(midAngleRad);
      const labelY = cy + r * 0.65 * Math.sin(midAngleRad);

      currentAngle += angle;

      return {
        staffId: staff.staffId,
        staffName: staff.staffName,
        revenue,
        percentage,
        color,
        pathData,
        labelX,
        labelY,
        angle,
      };
    });
  }, [activeStaffWithRevenue, totalRevenue]);

  const selectedStaffList = useMemo(() => {
    return selectedStaff ? selectedStaff.split(",").filter(Boolean) : [];
  }, [selectedStaff]);

  return (
    <div className="bg-white rounded-[14px] border border-slate-200 shadow-sm overflow-hidden select-none">
      {/* 1. High-Contrast Card Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0">
            <PieChartIcon size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 m-0 leading-tight">
              Tỷ trọng doanh thu theo nhân viên
            </h3>
            <p className="text-[11px] text-slate-600 font-medium m-0 mt-0.5 leading-normal">
              Cơ cấu đóng góp doanh thu của đội ngũ nhân sự trong kỳ lọc
            </p>
          </div>
        </div>

        {/* Highlight Badges */}
        <div className="flex items-center gap-2.5">
          {topStaff && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100 border border-amber-300 text-xs shadow-xs">
              <Award size={15} className="text-amber-800" />
              <span className="text-slate-700 font-bold">Dẫn đầu:</span>
              <strong className="text-amber-900 font-black">{topStaff.staffName}</strong>
              <span className="text-amber-800 font-black">
                ({((topStaff.revenue / (totalRevenue || 1)) * 100).toFixed(1)}%)
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-100 border border-blue-300 text-xs shadow-xs">
            <span className="text-slate-700 font-bold">Tổng thu:</span>
            <strong className="text-blue-900 font-black">{formatNumber(totalRevenue)} đ</strong>
          </div>
        </div>
      </div>

      {/* 2. Card Content: Chart & Legend Side by Side */}
      <div className="p-5 flex flex-col md:flex-row items-center justify-around gap-6 bg-slate-50/50">
        {/* Left: SVG Pie Chart */}
        <div className="w-[320px] h-[320px] flex-shrink-0 flex items-center justify-center relative p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          {totalRevenue > 0 && pieSlices.length > 0 ? (
            <svg
              width="290"
              height="290"
              viewBox="0 0 320 320"
              className="drop-shadow-xs"
            >
              {pieSlices.map((slice) => {
                const isSelected = selectedStaffList.includes(slice.staffId);
                const hasSelection = selectedStaffList.length > 0;
                return (
                  <g key={slice.staffId || slice.staffName} className="group">
                    <path
                      d={slice.pathData}
                      fill={slice.color}
                      onClick={() => {
                        if (onSelectStaff && slice.staffId) {
                          onSelectStaff(isSelected ? "" : slice.staffId);
                        }
                      }}
                      opacity={hasSelection && !isSelected ? 0.35 : 1}
                      className="stroke-2 stroke-white transition-all duration-200 hover:opacity-90 hover:stroke-slate-900 hover:stroke-[2.5] cursor-pointer"
                    >
                      <title>{`${slice.staffName}: ${formatVND(slice.revenue)} (${slice.percentage.toFixed(1)}%)\nBấm để lọc theo nhân viên này`}</title>
                    </path>
                    {slice.angle > 18 && (
                      <text
                        x={slice.labelX}
                        y={slice.labelY}
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="pointer-events-none drop-shadow-xs select-none"
                      >
                        {slice.percentage >= 8
                          ? `${slice.percentage.toFixed(0)}%`
                          : ""}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
              <PieChartIcon size={36} className="text-slate-300" />
              <span className="text-xs font-bold text-slate-500">Chưa có số liệu doanh thu nhân sự</span>
            </div>
          )}
        </div>

        {/* Right: Legend Breakdown Grid */}
        <div className="flex-1 w-full max-h-[320px] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {pieSlices.length === 0 ? (
              <div className="col-span-2 text-center text-slate-500 font-bold text-xs py-8">
                Không có dữ liệu nhân sự
              </div>
            ) : (
              pieSlices.map((slice) => {
                const isSelected = selectedStaffList.includes(slice.staffId);
                return (
                  <div
                    key={slice.staffId || slice.staffName}
                    onClick={() => {
                      if (onSelectStaff && slice.staffId) {
                        onSelectStaff(isSelected ? "" : slice.staffId);
                      }
                    }}
                    title="Bấm để lọc theo nhân viên này"
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all text-xs cursor-pointer shadow-2xs ${
                      isSelected
                        ? "bg-blue-100 border-blue-600 ring-2 ring-blue-500 shadow-xs"
                        : "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-2xs border border-white"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className="font-extrabold text-slate-900 truncate">
                        {slice.staffName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-right flex-shrink-0">
                      <span className="font-bold text-slate-700">
                        {formatNumber(slice.revenue)} đ
                      </span>
                      <span className="font-black text-blue-900 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded text-[11px] shadow-2xs">
                        {slice.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
