import React from "react";
import { DashboardCharts } from "../types";
import { TableSectionHeader } from "./TableSectionHeader";
import styles from "../Dashboard.module.css";

interface StaffAndServiceStatsProps {
  charts: DashboardCharts;
}

export function StaffAndServiceStats({ charts }: StaffAndServiceStatsProps) {
  const { staffPerformance = [], topServices = [] } = charts;

  // Color palette matching the mockup exactly
  const sliceColors = [
    "#007bff", // Blue (tien.le)
    "#00acc1", // Cyan (chung.nguyen)
    "#e91e63", // Pink/Magenta (duong.tuan)
    "#ff9800", // Orange (ngoc)
    "#fbc02d", // Yellow (van.thanh)
    "#4caf50", // Green (thuan.le)
    "#9c27b0", // Purple (thanh.dang)
    "#2196f3", // Light Blue (duy.huynh)
    "#d81b60", // Dark Pink (nhinguyen1988)
    "#ff7043", // Coral (trong.tran)
    "#78909c", // Slate (trang.nguyen)
    "#ef5350", // Red (anpham2002)
  ];

  // Helper formats
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Staff Table Calculations
  const staffTotalRevenue = staffPerformance.reduce((sum, s) => sum + s.revenue, 0);
  const staffTotalCustomers = staffPerformance.reduce((sum, s) => sum + s.customers, 0);
  const staffTotalRecords = staffPerformance.reduce((sum, s) => sum + s.recordCount, 0);

  // Service Table Calculations
  const serviceTotalQty = topServices.reduce((sum, s) => sum + s.count, 0);
  const serviceTotalRevenue = topServices.reduce((sum, s) => sum + s.revenue, 0);

  // Pad tables to at least 5 rows
  const minRows = 5;
  const paddedStaff = [...staffPerformance];
  while (paddedStaff.length < minRows) {
    paddedStaff.push({
      staffId: `empty-${paddedStaff.length}`,
      staffName: "",
      revenue: 0,
      customers: 0,
      recordCount: 0,
    });
  }

  const paddedServices = [...topServices];
  while (paddedServices.length < minRows) {
    paddedServices.push({
      id: `empty-${paddedServices.length}`,
      name: "",
      count: 0,
      revenue: 0,
    });
  }

  // SVG Pie Chart Coordinates Calculation
  const cx = 175;
  const cy = 175;
  const r = 140;

  let currentAngle = -90; // Start at top 12 o'clock position
  const pieSlices = staffPerformance.map((staff, idx) => {
    const color = sliceColors[idx % sliceColors.length];
    const revenue = staff.revenue;
    const percentage = staffTotalRevenue > 0 ? (revenue / staffTotalRevenue) * 100 : 0;
    const angle = staffTotalRevenue > 0 ? (revenue / staffTotalRevenue) * 360 : 0;

    const startAngleRad = (currentAngle * Math.PI) / 180;
    const endAngleRad = ((currentAngle + angle) * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startAngleRad);
    const y1 = cy + r * Math.sin(startAngleRad);
    const x2 = cx + r * Math.cos(endAngleRad);
    const y2 = cy + r * Math.sin(endAngleRad);

    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    // Label placement (inside slice)
    const midAngleRad = ((currentAngle + angle / 2) * Math.PI) / 180;
    const labelX = cx + (r * 0.65) * Math.cos(midAngleRad);
    const labelY = cy + (r * 0.65) * Math.sin(midAngleRad);

    currentAngle += angle;

    return {
      staffName: staff.staffName,
      revenue,
      percentage,
      color,
      pathData,
      labelX,
      labelY,
      angle
    };
  });

  return (
    <div className={styles.staffAndServiceSection}>
      {/* Tables Side-by-Side row */}
      <div className={styles.statsTablesGrid}>

        {/* STAFF PERFORMANCE TABLE */}
        <div className={styles.splitCard}>
          <TableSectionHeader title="Nhân viên" />

          <div className={styles.tableBodyWrapper}>
            <table className={styles.excelDailyTable}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", width: "40%" }}>Nhân viên</th>
                  <th style={{ textAlign: "right", width: "25%" }}>Giá dịch vụ</th>
                  <th style={{ textAlign: "right", width: "15%" }}>Khách</th>
                  <th style={{ textAlign: "right", width: "20%" }}>Records</th>
                </tr>
              </thead>
              <tbody>
                {paddedStaff.map((staff) => (
                  <tr key={staff.staffId} className={styles.clickableTableRow}>
                    <td style={{ fontWeight: "500", textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {staff.staffName || "\u00A0"}
                    </td>
                    <td style={{ textAlign: "right", color: "var(--color-primary-dark)", fontWeight: "500" }}>
                      {staff.staffName ? (staff.revenue > 0 ? formatNumber(staff.revenue) : "-") : "\u00A0"}
                    </td>
                    <td style={{ textAlign: "right", color: "var(--text-secondary)", fontWeight: "500" }}>
                      {staff.staffName ? (staff.customers > 0 ? formatNumber(staff.customers) : "-") : "\u00A0"}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "700" }}>
                      {staff.staffName ? (staff.recordCount > 0 ? formatNumber(staff.recordCount) : "-") : "\u00A0"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ fontWeight: "700" }}>Tổng cộng</td>
                  <td style={{ textAlign: "right", fontWeight: "700", color: "var(--color-primary)" }}>
                    {formatNumber(staffTotalRevenue)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "700", color: "#f57c00" }}>
                    {formatNumber(staffTotalCustomers)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "700", color: "#2196f3" }}>
                    {formatNumber(staffTotalRecords)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* SERVICE PERFORMANCE TABLE */}
        <div className={styles.splitCard}>
          <TableSectionHeader title="Dịch vụ" />

          <div className={styles.tableBodyWrapper}>
            <table className={styles.excelDailyTable}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", width: "50%" }}>Dịch vụ</th>
                  <th style={{ textAlign: "right", width: "20%" }}>SL</th>
                  <th style={{ textAlign: "right", width: "30%" }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {paddedServices.map((service) => (
                  <tr key={service.id} className={styles.clickableTableRow}>
                    <td style={{ fontWeight: "500", textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {service.name || "\u00A0"}
                    </td>
                    <td style={{ textAlign: "right", color: "var(--text-secondary)", fontWeight: "500" }}>
                      {service.name ? (service.count > 0 ? formatNumber(service.count) : "-") : "\u00A0"}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "700" }}>
                      {service.name ? (service.revenue > 0 ? formatNumber(service.revenue) : "-") : "\u00A0"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ fontWeight: "700" }}>Tổng cộng</td>
                  <td style={{ textAlign: "right", fontWeight: "700", color: "#f57c00" }}>
                    {formatNumber(serviceTotalQty)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "700", color: "var(--color-success)" }}>
                    {formatNumber(serviceTotalRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>

      {/* STAFF REVENUE PIE CHART CARD */}
      <div className={styles.pieChartCard}>

        <div className={styles.pieLayoutContainer}>
          {/* SVG Pie Chart */}
          <div className={styles.pieSvgWrapper}>
            {staffTotalRevenue > 0 ? (
              <svg width="350" height="350" viewBox="0 0 350 350" className={styles.pieSvg}>
                <g>
                  {pieSlices.map((slice) => (
                    <g key={slice.staffName}>
                      {/* Pie slice path */}
                      <path
                        d={slice.pathData}
                        fill={slice.color}
                        className={styles.pieSlicePath}
                      />

                      {/* Name labels inside slice if slice is large enough */}
                      {slice.angle > 15 && (
                        <text
                          x={slice.labelX}
                          y={slice.labelY}
                          fill="black"
                          fontSize="10"
                          fontWeight="700"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className={styles.pieSliceText}
                        >
                          {slice.staffName}
                        </text>
                      )}
                    </g>
                  ))}
                </g>
              </svg>
            ) : (
              <div className={styles.emptyPieState}>Không có dữ liệu doanh thu</div>
            )}
          </div>

          {/* Legend Listing */}
          <div className={styles.pieLegendList}>
            {pieSlices.map((slice) => (
              <div key={slice.staffName} className={styles.legendItemRow}>
                <span
                  className={styles.legendColorIndicator}
                  style={{ backgroundColor: slice.color }}
                ></span>
                <span className={styles.legendLabelText}>{slice.staffName}</span>
                <span className={styles.legendPercentageText}>
                  ({slice.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
