import React from "react";
import { UserX, Clock, CircleDollarSign } from "lucide-react";
import { AttendanceAnomaly, CashAdvance } from "../types";

interface AttendanceGridProps {
  calendarCells: { date: Date; day: number; isCurrentMonth: boolean; dateStr: string }[];
  getCellItems: (cellDateStr: string) => { dayAttendances: AttendanceAnomaly[]; dayAdvances: CashAdvance[] };
  canManage: boolean;
  onCellClick: (dateStr: string) => void;
  onEditAnomaly: (anomaly: AttendanceAnomaly, e: React.MouseEvent) => void;
  onEditAdvance: (advance: CashAdvance, e: React.MouseEvent) => void;
  formatDateString: (d: Date) => string;
  formatAdvanceAmount: (num: number) => string;
}

export const AttendanceGrid: React.FC<AttendanceGridProps> = ({
  calendarCells,
  getCellItems,
  canManage,
  onCellClick,
  onEditAnomaly,
  onEditAdvance,
  formatDateString,
  formatAdvanceAmount,
}) => {
  return (
    <div style={{ 
      padding: 0, 
      border: "1px solid var(--border-color)", 
      borderRadius: "var(--radius-lg)", 
      width: "100%", 
      flexGrow: 1, 
      display: "flex", 
      flexDirection: "column", 
      minHeight: 0,
      overflowX: "auto",
      overflowY: "hidden"
    }}>
      <div style={{ minWidth: "850px", width: "100%", flexGrow: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* Weekday headers */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(7, 1fr)", 
          background: "hsl(210, 40%, 96%)", 
          borderBottom: "1px solid var(--border-color)", 
          textAlign: "center",
          flexShrink: 0 
        }}>
          {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"].map((dayName, idx) => (
            <div key={idx} style={{ padding: "12px 6px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
              {dayName}
            </div>
          ))}
        </div>

        {/* Scrollable grid wrapper */}
        <div style={{ flexGrow: 1, overflowY: "auto", minHeight: 0, display: "flex", flexDirection: "column" }}>
          {/* Monthly grid */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(7, 1fr)", 
            gridTemplateRows: "repeat(6, minmax(1fr, auto))",
            background: "var(--border-color)", 
            gap: "1px",
            flexGrow: 1 
          }}>
            {calendarCells.map((cell, idx) => {
              const { dayAttendances, dayAdvances } = getCellItems(cell.dateStr);
              const isToday = cell.dateStr === formatDateString(new Date());

              // Build a combined list of items
              const allCellItems = [
                ...dayAttendances.map(att => ({ type: "attendance" as const, data: att })),
                ...dayAdvances.map(adv => ({ type: "advance" as const, data: adv }))
              ];

              return (
                <div
                  key={idx}
                  onClick={() => onCellClick(cell.dateStr)}
                  style={{
                    backgroundColor: cell.isCurrentMonth ? "white" : "hsl(210, 40%, 98%)",
                    padding: "6px 8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    cursor: canManage ? "pointer" : "default",
                    position: "relative",
                    transition: "all 0.15s ease",
                    minHeight: "90px",
                    height: "100%"
                  }}
                  onMouseEnter={(e) => {
                    if (canManage) e.currentTarget.style.backgroundColor = "hsl(210, 40%, 96%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = cell.isCurrentMonth ? "white" : "hsl(210, 40%, 98%)";
                  }}
                >
                  {/* Date number */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: isToday ? "700" : "500",
                        color: isToday ? "white" : (cell.isCurrentMonth ? "var(--text-primary)" : "var(--text-muted)"),
                        backgroundColor: isToday ? "var(--color-primary)" : "transparent",
                        width: isToday ? "24px" : "auto",
                        height: isToday ? "24px" : "auto",
                        borderRadius: isToday ? "50%" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {cell.day}
                    </span>
                  </div>

                  {/* Render items */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    {allCellItems.map((item) => {
                      if (item.type === "attendance") {
                        const att = item.data;
                        const isAbsent = att.workStatus === "ABSENT";
                        const isLate = att.workStatus === "LATE";
                        const isEarlyOut = att.workStatus === "EARLY_OUT";
                        
                        let colorStyle = { bg: "var(--color-warning-light)", text: "var(--color-warning)", border: "var(--color-warning)", label: `Muộn ${att.lateMinutes}'` };
                        if (isAbsent) {
                          colorStyle = { bg: "var(--color-danger-light)", text: "var(--color-danger)", border: "var(--color-danger)", label: "Vắng" };
                        } else if (isEarlyOut) {
                          colorStyle = { bg: "hsl(24, 95%, 95%)", text: "hsl(24, 95%, 45%)", border: "hsl(24, 95%, 45%)", label: `Về sớm ${att.lateMinutes}'` };
                        } else if (att.workStatus === "LEAVE") {
                          colorStyle = { bg: "var(--color-primary-light)", text: "var(--color-primary)", border: "var(--color-primary)", label: "Nghỉ phép" };
                        } else if (att.workStatus === "SICK") {
                          colorStyle = { bg: "hsl(180, 70%, 95%)", text: "hsl(180, 70%, 40%)", border: "hsl(180, 70%, 40%)", label: "Nghỉ bệnh" };
                        }

                        return (
                          <div
                            key={`att-${att.id}`}
                            onClick={(e) => onEditAnomaly(att, e)}
                            title={`${att.staff.name}: ${isAbsent ? "Vắng mặt" : isEarlyOut ? `Về sớm ${att.lateMinutes} phút` : isLate ? `Đi muộn ${att.lateMinutes} phút` : att.workStatus}${att.note ? ` (${att.note})` : ""}`}
                            style={{
                              fontSize: "11px",
                              padding: "3px 6px",
                              borderRadius: "4px",
                              backgroundColor: colorStyle.bg,
                              color: colorStyle.text,
                              borderLeft: `3px solid ${colorStyle.border}`,
                              fontWeight: "600",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            {isAbsent ? <UserX size={10} /> : <Clock size={10} />}
                            <span>{att.staff.name}</span>
                            <span style={{ opacity: 0.85, fontWeight: "500" }}>
                              {colorStyle.label}
                            </span>
                          </div>
                        );
                      } else {
                        const adv = item.data;
                        const isPending = adv.status === "PENDING";
                        const colorStyle = isPending
                          ? { bg: "var(--color-info-light)", text: "var(--color-info)", border: "var(--color-info)" }
                          : { bg: "hsl(271, 81%, 96%)", text: "hsl(271, 81%, 56%)", border: "hsl(271, 81%, 56%)" };

                        return (
                          <div
                            key={`adv-${adv.id}`}
                            onClick={(e) => onEditAdvance(adv, e)}
                            title={`${adv.staff.name}: Ứng ${adv.amount.toLocaleString("vi-VN")}đ (${isPending ? "Chờ duyệt" : "Đã duyệt"})${adv.note ? ` - ${adv.note}` : ""}`}
                            style={{
                              fontSize: "11px",
                              padding: "3px 6px",
                              borderRadius: "4px",
                              backgroundColor: colorStyle.bg,
                              color: colorStyle.text,
                              borderLeft: `3px solid ${colorStyle.border}`,
                              fontWeight: "600",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <CircleDollarSign size={10} />
                            <span>{adv.staff.name}</span>
                            <span style={{ fontWeight: "700" }}>
                              -{formatAdvanceAmount(adv.amount)}
                            </span>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
