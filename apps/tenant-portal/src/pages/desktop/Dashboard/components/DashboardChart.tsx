import React, { useState, useEffect, useRef } from "react";

import { DashboardCharts, DailyRevenueItem, InvoiceDetailItem } from "../types";
import { TableSectionHeader } from "./TableSectionHeader";
import styles from "../Dashboard.module.css";

function getNiceTicks(maxVal: number, maxTicks = 5) {
  const translationFactor = 1000000; // Work in Millions for cleaner math
  const maxValM = maxVal / translationFactor;
  const roughStep = maxValM / maxTicks;
  const log = Math.log10(roughStep);
  const power = Math.floor(log);
  const base = Math.pow(10, power);
  const normalized = roughStep / base;

  let niceNormalizedStep = 1;
  if (normalized < 1.5) niceNormalizedStep = 1;
  else if (normalized < 3) niceNormalizedStep = 2;
  else if (normalized < 7) niceNormalizedStep = 5;
  else niceNormalizedStep = 10;

  const niceStepM = niceNormalizedStep * base;
  const niceStep = niceStepM * translationFactor;
  const niceMax = Math.ceil(maxVal / niceStep) * niceStep;

  const ticks: number[] = [];
  for (let val = 0; val <= niceMax; val += niceStep) {
    ticks.push(val);
  }

  return { ticks, niceMax };
}

interface DashboardChartProps {
  charts: DashboardCharts;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}

export function DashboardChart({
  charts,
  selectedMonth,
  onSelectMonth,
}: DashboardChartProps) {
  const { monthlyTrends = [], dailyRevenues = [] } = charts;

  // Selected day for invoice details modal
  const [selectedDay, setSelectedDay] = useState<DailyRevenueItem | null>(null);

  // Reference to the daily table wrapper for scrolling
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  // Scroll table to today (vertically centered) or fallback to bottom
  useEffect(() => {
    if (tableWrapperRef.current && dailyRevenues.length > 0) {
      const todayLocal = new Date();
      const currentYearMonth = `${todayLocal.getFullYear()}-${String(
        todayLocal.getMonth() + 1,
      ).padStart(2, "0")}`;

      const isCurrentMonth = selectedMonth === currentYearMonth;
      if (isCurrentMonth) {
        const todayDay = todayLocal.getDate();
        const todayRow = tableWrapperRef.current.querySelector(
          `[data-day="${todayDay}"]`,
        ) as HTMLElement;

        if (todayRow) {
          const containerHeight = tableWrapperRef.current.clientHeight;
          const rowTop = todayRow.offsetTop;
          const rowHeight = todayRow.clientHeight;
          // Center the row in viewport
          tableWrapperRef.current.scrollTop =
            rowTop - containerHeight / 2 + rowHeight / 2;
          return;
        }
      }

      // Fallback: scroll to bottom
      tableWrapperRef.current.scrollTop = tableWrapperRef.current.scrollHeight;
    }
  }, [dailyRevenues, selectedMonth]);

  // If no selectedMonth is set yet, choose the latest month from trends
  useEffect(() => {
    if (!selectedMonth && monthlyTrends.length > 0) {
      const latest = monthlyTrends[monthlyTrends.length - 1];
      onSelectMonth(latest.yearMonth);
    }
  }, [monthlyTrends, selectedMonth, onSelectMonth]);

  // Formatter helpers
  const formatMonthLabel = (monthStr: string) => {
    let cleaned = monthStr.replace(/thg\s*/i, "").trim();
    cleaned = cleaned.replace(/\s+/g, "/");
    return cleaned;
  };

  const formatDayLabel = (dateRaw: string) => {
    const parts = dateRaw.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateRaw;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  // Find max totalPrice in monthlyTrends for scaling the combined horizontal bars
  const { ticks, niceMax } = getNiceTicks(
    Math.max(
      ...monthlyTrends.map((m) => m.totalPrice),
      10000000, // default 10M min scale
    ),
  );

  // Calculate totals for the daily table footer
  const totalServicePrice = dailyRevenues.reduce(
    (sum, d) => sum + d.totalPrice,
    0,
  );
  const totalFinalAmount = dailyRevenues.reduce(
    (sum, d) => sum + d.finalAmount,
    0,
  );

  // Vietnamese day of week labels
  const formatDayOfWeekText = (dayNum: number) => {
    if (dayNum === 7) return "CN";
    return `Thứ ${dayNum + 1}`;
  };

  // Helper for Thứ highlight background and text colors
  const getDayOfWeekStyles = (dayOfWeek: number) => {
    if (dayOfWeek === 7) {
      // Sunday (CN) - Darker Green Highlight as requested
      return {
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        color: "white",
        fontWeight: "700",
      };
    } else if (dayOfWeek === 6) {
      // Saturday (Thứ 7) - Lighter Green Highlight
      return {
        backgroundColor: "rgba(16, 185, 129, 0.4)",
        color: "hsl(161, 90%, 15%)",
        fontWeight: "700",
      };
    } else {
      // Weekdays (Thứ 2 - 6) - Gray Text / Transparent
      return {
        backgroundColor: "transparent",
        color: "var(--text-secondary)",
        border: "1px solid var(--border-color)",
      };
    }
  };

  return (
    <div className={styles.dashboardSplitSection}>
      {/* LEFT COLUMN: Horizontal Monthly Bar Chart */}
      <div className={styles.splitLeftCard}>
        <TableSectionHeader title="Doanh thu theo tháng" />
        <p
          className={styles.chartSub}
          style={{
            margin: "4px 0 12px 0",
            fontSize: "11px",
            color: "var(--text-muted)",
            fontStyle: "italic",
          }}
        >
          Chọn 1 tháng để xem doanh số ngày tương ứng
        </p>

        {/* Legend */}
        <div className={styles.horizontalLegend}>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColorBox}
              style={{ backgroundColor: "var(--color-primary)" }}
            ></span>
            <span>Thành tiền</span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColorBox}
              style={{ backgroundColor: "var(--color-danger)" }}
            ></span>
            <span>Giảm giá</span>
          </div>
        </div>

        {/* Combined Horizontal Stacked Bar Chart */}
        <div className={styles.horizontalChartContainer}>
          {monthlyTrends.map((item) => {
            const isActive = selectedMonth === item.yearMonth;

            // Total price represents length of the stacked bar
            const totalBarWidth = (item.totalPrice / niceMax) * 80; // max 80% width

            // Calculate percentage of final vs discount within the total price bar
            const finalPercent =
              item.totalPrice > 0
                ? (item.finalAmount / item.totalPrice) * 100
                : 0;
            const discountPercent =
              item.totalPrice > 0
                ? (item.discountAmount / item.totalPrice) * 100
                : 0;

            return (
              <div
                key={item.month}
                className={`${styles.horizontalBarRow} ${
                  isActive ? styles.activeMonthRow : ""
                }`}
                onClick={() => onSelectMonth(item.yearMonth)}
                title="Bấm để lọc doanh thu theo ngày"
              >
                {/* Month label in single line MM/YYYY */}
                <div className={styles.monthLabelCol}>
                  <span className={styles.singleLineMonth}>
                    {formatMonthLabel(item.month)}
                  </span>
                </div>

                {/* Stacked bar container */}
                <div className={styles.barsCol}>
                  {item.totalPrice > 0 ? (
                    <div
                      className={styles.stackedBarWrapper}
                      style={{ width: `${Math.max(totalBarWidth, 2)}%` }}
                    >
                      {/* Final Amount (Paid) Portion */}
                      {item.finalAmount > 0 && (
                        <div
                          className={styles.stackedFinalPart}
                          style={{ width: `${finalPercent}%` }}
                        >
                          {finalPercent > 25 && (
                            <span className={styles.stackedValueText}>
                              {formatNumber(item.finalAmount)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Discount Portion */}
                      {item.discountAmount > 0 && (
                        <div
                          className={styles.stackedDiscountPart}
                          style={{ width: `${discountPercent}%` }}
                        >
                          {discountPercent > 20 && (
                            <span className={styles.stackedDiscountValueText}>
                              -{formatNumber(item.discountAmount)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Fallback label outside the bar if portions are too thin to display text */}
                      {(finalPercent <= 25 ||
                        (item.discountAmount > 0 && discountPercent <= 20)) && (
                        <span className={styles.stackedOuterValueLabel}>
                          {formatNumber(item.finalAmount)}
                          {item.discountAmount > 0 &&
                            ` (-${formatNumber(item.discountAmount)})`}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className={styles.noRevenueText}>
                      Không phát sinh
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis ticks */}
        <div className={styles.xAxisCol} style={{ padding: "0 6px" }}>
          <div style={{ width: "72px" }}></div>
          <div className={styles.xAxisTicks} style={{ flex: "0 0 80%" }}>
            {ticks.map((tickVal) => (
              <span key={tickVal}>
                {tickVal === 0
                  ? "0"
                  : tickVal >= 1000000000
                    ? `${Number((tickVal / 1000000000).toFixed(2))} Tỷ`
                    : `${Number((tickVal / 1000000).toFixed(2))} Tr`}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Daily Revenues Table */}
      <div className={styles.splitRightCard}>
        <TableSectionHeader
          title={
            <>
              Doanh số theo ngày (
              {selectedMonth
                ? `${selectedMonth.split("-")[1]}/${selectedMonth.split("-")[0]}`
                : "Tháng này"}
              )
            </>
          }
        />

        <div className={styles.dailyTableWrapper} ref={tableWrapperRef}>
          <table className={styles.excelDailyTable}>
            <thead>
              <tr>
                <th style={{ width: "80px", textAlign: "center" }}>Ngày</th>
                <th style={{ width: "50px", textAlign: "center" }}>Thứ</th>
                <th style={{ width: "85px", textAlign: "right" }}>
                  Giá dịch vụ
                </th>
                <th style={{ width: "90px", textAlign: "right" }}>
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {dailyRevenues.map((d, index) => (
                <tr
                  key={d.dateRaw}
                  className={styles.clickableTableRow}
                  onClick={() => setSelectedDay(d)}
                  data-day={d.day}
                >
                  <td style={{ fontWeight: "500", textAlign: "center" }}>
                    {formatDayLabel(d.dateRaw)}
                  </td>
                  <td style={{ textAlign: "center", padding: "4px" }}>
                    <div
                      className={styles.dayOfWeekBadge}
                      style={getDayOfWeekStyles(d.dayOfWeek)}
                    >
                      {formatDayOfWeekText(d.dayOfWeek)}
                    </div>
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      color: "var(--color-primary-dark)",
                      fontWeight: "500",
                    }}
                  >
                    {d.totalPrice > 0 ? formatNumber(d.totalPrice) : "-"}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "700" }}>
                    {d.finalAmount > 0 ? formatNumber(d.finalAmount) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ fontWeight: "700" }}>Tổng cộng</td>
                <td style={{ textAlign: "center", fontWeight: "700" }}>
                  {dailyRevenues.length} ngày
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: "700",
                    color: "var(--color-primary)",
                  }}
                >
                  {formatNumber(totalServicePrice)}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: "700",
                    color: "var(--color-success)",
                  }}
                >
                  {formatNumber(totalFinalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* POPUP MODAL: Daily Invoices Details */}
      {selectedDay && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedDay(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h4 className={styles.modalTitle}>
                  Doanh thu ngày {selectedDay.date}
                </h4>
                <p className={styles.modalSubtitle}>
                  Có {selectedDay.invoices.length} hóa đơn phát sinh
                </p>
              </div>
              <button
                className={styles.closeModalBtn}
                onClick={() => setSelectedDay(null)}
              >
                &times;
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Daily Summary Stats in Popup */}
              <div className={styles.popupSummaryGrid}>
                <div className={styles.popupSummaryCard}>
                  <span className={styles.popupSummaryLabel}>Giá dịch vụ</span>
                  <strong className={styles.popupSummaryValue}>
                    {formatVND(selectedDay.totalPrice)}
                  </strong>
                </div>
                <div className={styles.popupSummaryCard}>
                  <span className={styles.popupSummaryLabel}>Giảm giá</span>
                  <strong
                    className={styles.popupSummaryValue}
                    style={{ color: "var(--color-danger)" }}
                  >
                    {formatVND(selectedDay.discountAmount)}
                  </strong>
                </div>
                <div className={styles.popupSummaryCard}>
                  <span className={styles.popupSummaryLabel}>Thành tiền</span>
                  <strong
                    className={styles.popupSummaryValue}
                    style={{ color: "var(--color-success)" }}
                  >
                    {formatVND(selectedDay.finalAmount)}
                  </strong>
                </div>
              </div>

              {/* Invoices List Table */}
              <h5 className={styles.sectionTitle}>Danh sách hóa đơn</h5>
              {selectedDay.invoices.length === 0 ? (
                <div className={styles.emptyInvoicesBox}>
                  Không có hóa đơn nào phát sinh trong ngày này.
                </div>
              ) : (
                <div className={styles.popupInvoicesList}>
                  {selectedDay.invoices.map((inv) => (
                    <div key={inv.id} className={styles.invoiceItemCard}>
                      <div className={styles.invoiceCardHeader}>
                        <div>
                          <strong className={styles.invoiceCode}>
                            #{inv.invoiceNumber}
                          </strong>
                          <span className={styles.invoiceTime}>
                            ⏰ {inv.time}
                          </span>
                        </div>
                        <div className={styles.invoiceMetaRight}>
                          <span className={`badge badge-success`}>
                            {inv.paymentStatus === "PAID"
                              ? "Đã thu"
                              : inv.paymentStatus}
                          </span>
                          <span className={styles.invoiceMethodBadge}>
                            {inv.paymentMethod === "CASH"
                              ? "Tiền mặt"
                              : inv.paymentMethod === "TRANSFER"
                                ? "Chuyển khoản"
                                : "Quẹt thẻ"}
                          </span>
                        </div>
                      </div>

                      <div className={styles.invoiceCustomerRow}>
                        <span>
                          Khách hàng: <strong>{inv.customerName}</strong>
                        </span>
                        <span>
                          Thu ngân: <strong>{inv.cashierName}</strong>
                        </span>
                      </div>

                      {/* Purchased items list */}
                      <div className={styles.invoiceItemsSubTable}>
                        <div className={styles.subTableHeader}>
                          <span>Mặt hàng</span>
                          <span style={{ textAlign: "center" }}>SL</span>
                          <span style={{ textAlign: "right" }}>Đơn giá</span>
                          <span style={{ textAlign: "right" }}>Thành tiền</span>
                        </div>
                        {inv.items.map((item) => (
                          <div key={item.id} className={styles.subTableRow}>
                            <span className={styles.subItemName}>
                              {item.name}
                              <span className={styles.itemTypeTag}>
                                {item.itemType === "SERVICE"
                                  ? "Dịch vụ"
                                  : item.itemType === "PRODUCT"
                                    ? "Sản phẩm"
                                    : "Gói"}
                              </span>
                            </span>
                            <span style={{ textAlign: "center" }}>
                              {item.quantity}
                            </span>
                            <span style={{ textAlign: "right" }}>
                              {formatNumber(item.price)}
                            </span>
                            <span
                              style={{ textAlign: "right", fontWeight: "600" }}
                            >
                              {formatNumber(item.finalAmount)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Invoice bottom line totals */}
                      <div className={styles.invoiceTotalFooter}>
                        {inv.discountAmount > 0 && (
                          <div className={styles.invoiceTotalRow}>
                            <span>Giảm giá hóa đơn:</span>
                            <span style={{ color: "var(--color-danger)" }}>
                              -{formatVND(inv.discountAmount)}
                            </span>
                          </div>
                        )}
                        <div className={styles.invoiceTotalRow}>
                          <strong>Tổng thanh toán:</strong>
                          <strong
                            style={{
                              color: "var(--color-primary)",
                              fontSize: "14px",
                            }}
                          >
                            {formatVND(inv.finalAmount)}
                          </strong>
                        </div>
                        {inv.note && (
                          <div className={styles.invoiceNote}>
                            * Ghi chú: {inv.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
