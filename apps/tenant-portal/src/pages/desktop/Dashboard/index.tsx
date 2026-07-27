import React, { useState } from "react";

import { DashboardChart } from "./components/DashboardChart";
import { DailyTurns } from "./components/DailyTurns";
import { DashboardStats } from "./components/DashboardStats";
import { RecentBookings } from "./components/RecentBookings";
import { StaffAndServiceStats } from "./components/StaffAndServiceStats";
import { useDashboardStats } from "./useDashboardStats";
import { DashboardCharts } from "./types";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string>("");

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

    if (
      selectedDaysList.length === 0 &&
      selectedStaffList.length === 0 &&
      selectedServicesList.length === 0
    ) {
      return rawCharts;
    }

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

    // 2. Gather invoices for selected days (or all if empty)
    const invoicesForStats = dailyRevenues
      .filter(
        (d) =>
          selectedDaysList.length === 0 || selectedDaysList.includes(d.dateRaw),
      )
      .flatMap((d) => d.invoices);

    // 3. Aggregate Staff Performance
    const staffMap = new Map<
      string,
      {
        staffName: string;
        revenue: number;
        customers: Set<string>;
        recordCount: number;
      }
    >();

    (rawCharts.staffPerformance || []).forEach((s) => {
      staffMap.set(s.staffId, {
        staffName: s.staffName,
        revenue: 0,
        customers: new Set<string>(),
        recordCount: 0,
      });
    });

    for (const inv of invoicesForStats) {
      const custId = inv.customerName || `guest-${inv.id}`;
      for (const item of inv.items) {
        if (item.staffId) {
          const existing = staffMap.get(item.staffId);
          if (existing) {
            existing.revenue += item.finalAmount;
            existing.customers.add(custId);
            existing.recordCount += 1;
          }
        }
      }
    }

    const staffPerformance = Array.from(staffMap.entries())
      .map(([staffId, data]) => ({
        staffId,
        staffName: data.staffName,
        revenue: data.revenue,
        customers: data.customers.size,
        recordCount: data.recordCount,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // 4. Aggregate Top Services
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

    for (const inv of invoicesForStats) {
      for (const item of inv.items) {
        if (item.itemType === "SERVICE") {
          const existing = servicesMap.get(item.itemId);
          if (existing) {
            existing.count += item.quantity;
            existing.revenue += item.finalAmount;
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

  if (loading && !stats) {
    return (
      <div className={`${styles.container} animate-fade-in`}>
        {/* Skeleton for Stats Grid */}
        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="card"
              style={{
                height: "135px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div
                  style={{
                    width: "100px",
                    height: "16px",
                    background: "rgba(15,23,42,0.08)",
                    borderRadius: "4px",
                    animation: "pulse 1.5s infinite",
                  }}
                ></div>
                <div
                  style={{
                    width: "50px",
                    height: "16px",
                    background: "rgba(15,23,42,0.08)",
                    borderRadius: "4px",
                    animation: "pulse 1.5s infinite",
                  }}
                ></div>
              </div>
              <div
                style={{
                  width: "140px",
                  height: "32px",
                  background: "rgba(15,23,42,0.08)",
                  borderRadius: "4px",
                  animation: "pulse 1.5s infinite",
                }}
              ></div>
              <div
                style={{
                  width: "180px",
                  height: "12px",
                  background: "rgba(15,23,42,0.08)",
                  borderRadius: "4px",
                  animation: "pulse 1.5s infinite",
                }}
              ></div>
            </div>
          ))}
        </div>

        {/* Skeleton for Chart */}
        <div
          className="card"
          style={{
            height: "450px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "20px",
              background: "rgba(15,23,42,0.08)",
              borderRadius: "4px",
              animation: "pulse 1.5s infinite",
            }}
          ></div>
          <div
            style={{
              width: "90%",
              height: "320px",
              background: "rgba(15,23,42,0.08)",
              borderRadius: "8px",
              animation: "pulse 1.5s infinite",
            }}
          ></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div
        className={`${styles.container} animate-fade-in`}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: "450px",
            textAlign: "center",
            padding: "30px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "48px" }}>⚠️</span>
          <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
            Không thể tải dữ liệu tổng quan
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            {error || "Đã xảy ra lỗi không xác định khi kết nối với máy chủ."}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => refetch()}
            style={{ padding: "8px 24px", marginTop: "8px" }}
          >
            Thử tải lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      {/* Container chứa toàn bộ các biểu đồ chính gộp chung thành 1 Panel lớn thống nhất */}
      <div className={`card ${styles.widgetsLayoutWrapper}`}>
        {/* Thanh chỉ số hôm nay nhỏ gọn ghim ở trên cùng của panel */}
        <DashboardStats stats={stats} />

        {/* Biểu đồ gộp xếp chồng 12 tháng (trái) và Bảng chi tiết Excel cuộn dưới ghim tổng (phải) */}
        <DashboardChart
          charts={chartsToDisplay}
          selectedMonth={selectedMonth}
          onSelectMonth={handleSelectMonth}
          selectedDays={selectedDays}
          onSelectDays={setSelectedDays}
        />

        {/* Bảng Nhân viên, Dịch vụ & Biểu đồ tròn Doanh thu nhân viên */}
        <StaffAndServiceStats
          charts={chartsToDisplay}
          selectedStaff={selectedStaff}
          onSelectStaff={setSelectedStaff}
          selectedServices={selectedServices}
          onSelectServices={setSelectedServices}
        />
      </div>

      {/* Main content grid */}
      <div className={styles.contentGrid}>
        {/* Left Column: Recent Bookings */}
        <RecentBookings bookings={stats.recentBookings} />

        {/* Right Column: Daily Turns */}
        <div className={styles.rightColumn}>
          {/* Daily Turns Card */}
          <DailyTurns turns={stats.dailyTurns} />
        </div>
      </div>
    </div>
  );
}
