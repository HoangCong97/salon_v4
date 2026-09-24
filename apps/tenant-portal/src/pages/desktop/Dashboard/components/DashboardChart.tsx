import React, { useState, useEffect, useRef } from "react";

import { DashboardCharts, DailyRevenueItem, InvoiceDetailItem } from "../types";
import { TableSectionHeader } from "./TableSectionHeader";
import { DailyRevenueCalendar } from "./DailyRevenueCalendar";
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
  selectedDays: string;
  onSelectDays: (days: string) => void;
}

export function DashboardChart({
  charts,
  selectedMonth,
  onSelectMonth,
  selectedDays,
  onSelectDays,
}: DashboardChartProps) {
  const { monthlyTrends = [], dailyRevenues = [] } = charts;

  // Selected day for invoice details modal
  const [selectedDay, setSelectedDay] = useState<DailyRevenueItem | null>(null);



  // If no selectedMonth is set yet, choose the latest month from trends
  useEffect(() => {
    if (!selectedMonth && monthlyTrends.length > 0) {
      const latest = monthlyTrends[monthlyTrends.length - 1];
      onSelectMonth(latest.yearMonth);
    }
  }, [monthlyTrends, selectedMonth, onSelectMonth]);

  const anchorMonthRef = useRef<string | null>(null);

  useEffect(() => {
    if (!anchorMonthRef.current && selectedMonth) {
      const parts = selectedMonth.split(",");
      anchorMonthRef.current = parts[parts.length - 1];
    }
  }, [selectedMonth]);

  const handleMonthClick = (e: React.MouseEvent, clickedMonth: string) => {
    const allMonths = monthlyTrends.map((m) => m.yearMonth);
    const selectedList = selectedMonth ? selectedMonth.split(",") : [];

    let newSelected: string[] = [];

    if (e.ctrlKey || e.metaKey) {
      if (selectedList.includes(clickedMonth)) {
        newSelected = selectedList.filter((m) => m !== clickedMonth);
      } else {
        newSelected = [...selectedList, clickedMonth];
      }
      anchorMonthRef.current = clickedMonth;
    } else if (e.shiftKey && anchorMonthRef.current) {
      const anchorIndex = allMonths.indexOf(anchorMonthRef.current);
      const clickedIndex = allMonths.indexOf(clickedMonth);

      if (anchorIndex !== -1 && clickedIndex !== -1) {
        const start = Math.min(anchorIndex, clickedIndex);
        const end = Math.max(anchorIndex, clickedIndex);
        newSelected = allMonths.slice(start, end + 1);
      } else {
        newSelected = [clickedMonth];
        anchorMonthRef.current = clickedMonth;
      }
    } else {
      newSelected = [clickedMonth];
      anchorMonthRef.current = clickedMonth;
    }

    if (newSelected.length === 0) {
      newSelected = [clickedMonth];
      anchorMonthRef.current = clickedMonth;
    }

    onSelectMonth(newSelected.join(","));
  };

  const formatSelectedMonthsLabel = (selectedMonthStr: string) => {
    if (!selectedMonthStr) return "Tháng này";
    const parts = selectedMonthStr.split(",");
    if (parts.length === 1) {
      const [year, month] = parts[0].split("-");
      return `${month}/${year}`;
    }
    return parts
      .map((p) => {
        const [year, month] = p.split("-");
        return `${month}/${year}`;
      })
      .join(", ");
  };

  const anchorDayRef = useRef<string | null>(null);

  useEffect(() => {
    if (!anchorDayRef.current && selectedDays) {
      const parts = selectedDays.split(",");
      anchorDayRef.current = parts[parts.length - 1];
    }
  }, [selectedDays]);

  const handleDayClick = (e: React.MouseEvent, clickedDay: string) => {
    const allDays = dailyRevenues.map((d) => d.dateRaw);
    const selectedList = selectedDays ? selectedDays.split(",") : [];

    let newSelected: string[] = [];

    if (e.ctrlKey || e.metaKey) {
      if (selectedList.includes(clickedDay)) {
        newSelected = selectedList.filter((d) => d !== clickedDay);
      } else {
        newSelected = [...selectedList, clickedDay];
      }
      anchorDayRef.current = clickedDay;
    } else if (e.shiftKey && anchorDayRef.current) {
      const anchorIndex = allDays.indexOf(anchorDayRef.current);
      const clickedIndex = allDays.indexOf(clickedDay);

      if (anchorIndex !== -1 && clickedIndex !== -1) {
        const start = Math.min(anchorIndex, clickedIndex);
        const end = Math.max(anchorIndex, clickedIndex);
        newSelected = allDays.slice(start, end + 1);
      } else {
        newSelected = [clickedDay];
        anchorDayRef.current = clickedDay;
      }
    } else {
      newSelected = [clickedDay];
      anchorDayRef.current = clickedDay;
    }

    if (
      !e.ctrlKey &&
      !e.shiftKey &&
      selectedList.length === 1 &&
      selectedList[0] === clickedDay
    ) {
      newSelected = [];
      anchorDayRef.current = null;
    }

    onSelectDays(newSelected.join(","));
  };

  // Formatter helpers
  const formatMonthLabel = (monthStr: string) => {
    let cleaned = monthStr.replace(/thg\s*/i, "").trim();
    cleaned = cleaned.replace(/\s+/g, "/");
    return cleaned;
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
            const selectedList = selectedMonth ? selectedMonth.split(",") : [];
            const isActive = selectedList.includes(item.yearMonth);

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
                onMouseDown={(e) => {
                  if (e.shiftKey || e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                  }
                }}
                onClick={(e) => handleMonthClick(e, item.yearMonth)}
                title="Bấm để lọc. Giữ Ctrl hoặc Shift để chọn nhiều tháng"
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

      {/* RIGHT COLUMN: Daily Revenues Calendar */}
      <div className={styles.splitRightCard}>
        <DailyRevenueCalendar
          dailyRevenues={dailyRevenues}
          selectedDays={selectedDays}
          onDayClick={handleDayClick}
          onClearDayFilter={() => onSelectDays("")}
          onViewDayDetails={setSelectedDay}
          totalServicePrice={totalServicePrice}
          totalFinalAmount={totalFinalAmount}
        />
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
