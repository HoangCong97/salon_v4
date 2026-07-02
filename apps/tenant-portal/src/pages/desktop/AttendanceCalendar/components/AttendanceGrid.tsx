import React from "react";
import { UserX, Clock, CircleDollarSign } from "lucide-react";
import { AttendanceAnomaly, CashAdvance } from "../types";

import styles from "../AttendanceCalendar.module.css";

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
    <div className={styles.gridContainer}>
      <div className={styles.gridMinWidthWrapper}>
        {/* Weekday headers */}
        <div className={styles.weekdayHeaderRow}>
          {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"].map((dayName, idx) => (
            <div key={idx} className={styles.weekdayHeaderCell}>
              {dayName}
            </div>
          ))}
        </div>

        {/* Scrollable grid wrapper */}
        <div className={styles.scrollableGridWrapper}>
          {/* Monthly grid */}
          <div className={styles.monthlyGrid}>
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
                  className={`${styles.gridCell} ${
                    cell.isCurrentMonth ? styles.gridCellCurrentMonth : styles.gridCellNotCurrentMonth
                  } ${canManage ? styles.gridCellInteractive : ""}`}
                >
                  {/* Date number */}
                  <div className={styles.dateNumRow}>
                    <span
                      className={`${styles.dateNum} ${isToday ? styles.dateNumToday : ""} ${
                        !cell.isCurrentMonth && !isToday ? styles.dateNumNotCurrent : ""
                      }`}
                    >
                      {cell.day}
                    </span>
                  </div>

                  {/* Render items */}
                  <div className={styles.cellItemsContainer}>
                    {allCellItems.map((item) => {
                      if (item.type === "attendance") {
                        const att = item.data;
                        const isAbsent = att.workStatus === "ABSENT";
                        const isLate = att.workStatus === "LATE";
                        const isEarlyOut = att.workStatus === "EARLY_OUT";
                        
                        let colorStyle = {
                          bg: "var(--color-warning-light)",
                          text: "var(--color-warning)",
                          border: "var(--color-warning)",
                          label: `Muộn ${att.lateMinutes}'`
                        };
                        if (isAbsent) {
                          colorStyle = {
                            bg: "var(--color-danger-light)",
                            text: "var(--color-danger)",
                            border: "var(--color-danger)",
                            label: "Vắng"
                          };
                        } else if (isEarlyOut) {
                          colorStyle = {
                            bg: "hsl(24, 95%, 95%)",
                            text: "hsl(24, 95%, 45%)",
                            border: "hsl(24, 95%, 45%)",
                            label: `Về sớm ${att.lateMinutes}'`
                          };
                        } else if (att.workStatus === "LEAVE") {
                          colorStyle = {
                            bg: "var(--color-primary-light)",
                            text: "var(--color-primary)",
                            border: "var(--color-primary)",
                            label: "Nghỉ phép"
                          };
                        } else if (att.workStatus === "SICK") {
                          colorStyle = {
                            bg: "hsl(180, 70%, 95%)",
                            text: "hsl(180, 70%, 40%)",
                            border: "hsl(180, 70%, 40%)",
                            label: "Nghỉ bệnh"
                          };
                        }

                        return (
                          <div
                            key={`att-${att.id}`}
                            onClick={(e) => onEditAnomaly(att, e)}
                            title={`${att.staff.name}: ${isAbsent ? "Vắng mặt" : isEarlyOut ? `Về sớm ${att.lateMinutes} phút` : isLate ? `Đi muộn ${att.lateMinutes} phút` : att.workStatus}${att.note ? ` (${att.note})` : ""}`}
                            className={styles.cellBadge}
                            style={{
                              backgroundColor: colorStyle.bg,
                              color: colorStyle.text,
                              borderLeft: `3px solid ${colorStyle.border}`
                            }}
                          >
                            {isAbsent ? <UserX size={10} /> : <Clock size={10} />}
                            <span>{att.staff.name}</span>
                            <span className={styles.badgeTextLabel}>
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
                            className={styles.cellBadge}
                            style={{
                              backgroundColor: colorStyle.bg,
                              color: colorStyle.text,
                              borderLeft: `3px solid ${colorStyle.border}`
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

