import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { prisma, Prisma } from "@salon/database";

@Controller("api/tenants/:tenantId/branches/:branchId/dashboard-stats")
export class DashboardController {
  @Get()
  async getDashboardStats(
    @Param("tenantId") tenantId: string,
    @Param("branchId") branchId: string,
    @Query("month") monthParam?: string,
    @Query("days") daysParam?: string,
    @Query("staff") staffParam?: string,
    @Query("services") servicesParam?: string,
  ) {
    const selectedDaysList = daysParam
      ? daysParam.split(",").filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      : [];
    const selectedStaffList = staffParam
      ? staffParam.split(",").filter((id) => id.trim().length > 0)
      : [];
    const selectedServicesList = servicesParam
      ? servicesParam.split(",").filter((id) => id.trim().length > 0)
      : [];
    try {
      // 1. Timezone offset UTC+7 (Vietnam Time)
      const nowLocal = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
      const todayStr = nowLocal.toISOString().split("T")[0]; // yyyy-MM-dd

      const startOfToday = new Date(`${todayStr}T00:00:00+07:00`);
      const endOfToday = new Date(`${todayStr}T23:59:59.999+07:00`);

      // Yesterday dates
      const yesterdayLocal = new Date(nowLocal.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayStr = yesterdayLocal.toISOString().split("T")[0];
      const startOfYesterday = new Date(`${yesterdayStr}T00:00:00+07:00`);
      const endOfYesterday = new Date(`${yesterdayStr}T23:59:59.999+07:00`);

      // Target year and month calculation (based on query param e.g. "2025-07,2025-08")
      interface SelectedMonthRange {
        year: number;
        month: number;
        monthStr: string;
        daysInMonth: number;
        start: Date;
        end: Date;
        yearMonth: string;
      }
      const selectedMonthRanges: SelectedMonthRange[] = [];

      if (monthParam) {
        const monthsList = monthParam
          .split(",")
          .filter((m) => /^\d{4}-\d{2}$/.test(m));
        for (const mStr of monthsList) {
          const parts = mStr.split("-");
          const yr = parseInt(parts[0], 10);
          const mn = parseInt(parts[1], 10) - 1;
          const monthStr = String(mn + 1).padStart(2, "0");
          const days = new Date(yr, mn + 1, 0).getDate();
          const start = new Date(`${yr}-${monthStr}-01T00:00:00+07:00`);
          const end = new Date(`${yr}-${monthStr}-${days}T23:59:59.999+07:00`);
          selectedMonthRanges.push({
            year: yr,
            month: mn,
            monthStr,
            daysInMonth: days,
            start,
            end,
            yearMonth: mStr,
          });
        }
      }

      if (selectedMonthRanges.length === 0) {
        const yr = nowLocal.getFullYear();
        const mn = nowLocal.getMonth();
        const monthStr = String(mn + 1).padStart(2, "0");
        const days = new Date(yr, mn + 1, 0).getDate();
        const start = new Date(`${yr}-${monthStr}-01T00:00:00+07:00`);
        const end = new Date(`${yr}-${monthStr}-${days}T23:59:59.999+07:00`);
        selectedMonthRanges.push({
          year: yr,
          month: mn,
          monthStr,
          daysInMonth: days,
          start,
          end,
          yearMonth: `${yr}-${monthStr}`,
        });
      }

      // Current calendar month (for general stats cards comparison)
      const curYear = nowLocal.getFullYear();
      const curMonth = nowLocal.getMonth();
      const curMonthStr = String(curMonth + 1).padStart(2, "0");
      const startOfThisMonth = new Date(
        `${curYear}-${curMonthStr}-01T00:00:00+07:00`,
      );

      // Last calendar month (for comparison cards)
      const lastMonthYear = curMonth === 0 ? curYear - 1 : curYear;
      const lastMonthVal = curMonth === 0 ? 12 : curMonth;
      const lastMonthStr = String(lastMonthVal).padStart(2, "0");
      const startOfLastMonth = new Date(
        `${lastMonthYear}-${lastMonthStr}-01T00:00:00+07:00`,
      );
      const endOfLastMonth = new Date(startOfThisMonth.getTime() - 1);

      // Start of 12 months ago (for the horizontal bar chart)
      const startOf12MonthsAgo = new Date(
        curYear - 1,
        curMonth + 1,
        1,
        0,
        0,
        0,
      );

      // Start of 7 days ago
      const sevenDaysAgoLocal = new Date(
        nowLocal.getTime() - 6 * 24 * 60 * 60 * 1000,
      );
      const sevenDaysAgoStr = sevenDaysAgoLocal.toISOString().split("T")[0];
      const startOfSevenDaysAgo = new Date(`${sevenDaysAgoStr}T00:00:00+07:00`);

      // 2. Fetch parallel DB data to compute stats
      const [
        invoicesToday,
        invoicesYesterday,
        invoicesThisMonth,
        invoicesLastMonth,
        invoicesLast7Days,
        invoicesLast12Months,
        invoicesTargetMonth,
        bookingsToday,
        bookingsLast7Days,
        staffOnShiftToday,
        lowStockCount,
        recentBookingsList,
        dailyTurnsQueue,
        allServices,
        allInventories,
        allServicePackages,
      ] = await Promise.all([
        // Invoices Today
        prisma.invoice.findMany({
          where: {
            tenantId,
            branchId,
            deletedAt: null,
            status: "COMPLETED",
            createdAt: { gte: startOfToday, lte: endOfToday },
          },
          select: { finalAmount: true },
        }),
        // Invoices Yesterday
        prisma.invoice.findMany({
          where: {
            tenantId,
            branchId,
            deletedAt: null,
            status: "COMPLETED",
            createdAt: { gte: startOfYesterday, lte: endOfYesterday },
          },
          select: { finalAmount: true },
        }),
        // Invoices This Month
        prisma.invoice.findMany({
          where: {
            tenantId,
            branchId,
            deletedAt: null,
            status: "COMPLETED",
            createdAt: { gte: startOfThisMonth, lte: endOfToday },
          },
          select: { finalAmount: true },
        }),
        // Invoices Last Month
        prisma.invoice.findMany({
          where: {
            tenantId,
            branchId,
            deletedAt: null,
            status: "COMPLETED",
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
          select: { finalAmount: true },
        }),
        // Invoices Last 7 Days (for payment breakdown)
        prisma.invoice.findMany({
          where: {
            tenantId,
            branchId,
            deletedAt: null,
            status: "COMPLETED",
            createdAt: { gte: startOfSevenDaysAgo },
          },
          select: { finalAmount: true, createdAt: true, paymentMethod: true },
        }),
        // Invoices Last 12 Months
        prisma.invoice.findMany({
          where: {
            tenantId,
            branchId,
            deletedAt: null,
            status: "COMPLETED",
            createdAt: { gte: startOf12MonthsAgo, lte: endOfToday },
          },
          select: {
            totalPrice: true,
            finalAmount: true,
            discountAmount: true,
            createdAt: true,
          },
        }),
        // Invoices Target Month (selected months for daily table)
        prisma.invoice.findMany({
          where: {
            tenantId,
            branchId,
            deletedAt: null,
            status: "COMPLETED",
            OR: selectedMonthRanges.map((r) => ({
              createdAt: { gte: r.start, lte: r.end },
            })),
          },
          include: {
            customer: { select: { id: true, name: true, phone: true } },
            cashier: { select: { id: true, name: true } },
            items: {
              include: {
                stylist: { select: { id: true, name: true, avatar: true } },
              },
            },
          },
          orderBy: { createdAt: "asc" }, // Order asc to align with daily aggregation order
        }),
        // Bookings Today
        prisma.booking.findMany({
          where: {
            tenantId,
            branchId,
            deletedAt: null,
            startTime: { gte: startOfToday, lte: endOfToday },
          },
          select: { id: true, status: true },
        }),
        // Bookings Last 7 Days
        prisma.booking.findMany({
          where: {
            tenantId,
            branchId,
            deletedAt: null,
            startTime: { gte: startOfSevenDaysAgo },
          },
          select: { id: true, status: true, startTime: true },
        }),
        // Staff Shifts Today
        prisma.employeeShift.findMany({
          where: {
            tenantId,
            branchId,
            deletedAt: null,
            workDate: startOfToday,
            isOff: false,
          },
          select: { id: true, staffId: true },
        }),
        // Low stock count (quantity <= 5)
        prisma.inventory.count({
          where: {
            tenantId,
            branchId,
            deletedAt: null,
            isActive: true,
            quantity: { lte: 5 },
          },
        }),
        // Recent Bookings
        prisma.booking.findMany({
          where: { tenantId, branchId, deletedAt: null },
          include: {
            customer: { select: { name: true, phone: true } },
            bookingDetails: {
              where: { deletedAt: null },
              include: {
                service: { select: { name: true } },
                staff: { select: { name: true } },
              },
            },
          },
          orderBy: { startTime: "desc" },
          take: 5,
        }),
        // Daily turns queue
        prisma.employeeDailyTurn.findMany({
          where: {
            tenantId,
            branchId,
            workDate: startOfToday,
            deletedAt: null,
          },
          include: { staff: { select: { name: true, avatar: true } } },
          orderBy: { totalCustomersToday: "desc" },
        }),
        // Name mappings
        prisma.service.findMany({
          where: { tenantId, deletedAt: null },
          select: { id: true, name: true },
        }),
        prisma.inventory.findMany({
          where: { tenantId, deletedAt: null },
          select: { id: true, name: true },
        }),
        prisma.servicePackage.findMany({
          where: { tenantId, deletedAt: null },
          select: { id: true, name: true },
        }),
      ]);

      // Map item names
      const itemNames = new Map<string, string>();
      allServices.forEach((s) => itemNames.set(s.id, s.name));
      allInventories.forEach((i) => itemNames.set(i.id, i.name));
      allServicePackages.forEach((p) => itemNames.set(p.id, p.name));

      let targetInvoices = invoicesTargetMonth;

      if (selectedStaffList.length > 0 || selectedServicesList.length > 0) {
        targetInvoices = invoicesTargetMonth
          .map((inv) => {
            const filteredItems = inv.items.filter((item) => {
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

            const totalPrice = new Prisma.Decimal(
              filteredItems.reduce(
                (sum, item) => sum + Number(item.totalPrice),
                0,
              ),
            );
            const discountAmount = new Prisma.Decimal(
              filteredItems.reduce(
                (sum, item) => sum + Number(item.discountAmount),
                0,
              ),
            );
            const actualFinal = new Prisma.Decimal(
              filteredItems.reduce(
                (sum, item) => sum + Number(item.finalAmount),
                0,
              ),
            );

            return {
              ...inv,
              items: filteredItems,
              totalPrice,
              discountAmount,
              finalAmount: actualFinal,
            };
          })
          .filter((inv): inv is NonNullable<typeof inv> => inv !== null);
      }

      // 3. Aggregate stats in-memory
      const todayRevenue = invoicesToday.reduce(
        (sum, inv) => sum + Number(inv.finalAmount),
        0,
      );
      const yesterdayRevenue = invoicesYesterday.reduce(
        (sum, inv) => sum + Number(inv.finalAmount),
        0,
      );

      const thisMonthRevenue = invoicesThisMonth.reduce(
        (sum, inv) => sum + Number(inv.finalAmount),
        0,
      );
      const lastMonthRevenue = invoicesLastMonth.reduce(
        (sum, inv) => sum + Number(inv.finalAmount),
        0,
      );

      const getGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      const dailyRevenueGrowth = getGrowth(todayRevenue, yesterdayRevenue);
      const monthlyRevenueGrowth = getGrowth(
        thisMonthRevenue,
        lastMonthRevenue,
      );

      const totalBookingsToday = bookingsToday.length;
      const completedBookingsToday = bookingsToday.filter(
        (b) => b.status === "COMPLETED",
      ).length;

      const totalStaffScheduled = staffOnShiftToday.length;
      const totalStaffActive = dailyTurnsQueue.length;

      // 4. Construct 12 Months Horizontal Chart Data (MM/YYYY layout on a single line)
      const monthlyTrends = [];
      for (let i = 11; i >= 0; i--) {
        const m = new Date(curYear, curMonth - i, 1);
        const yVal = m.getFullYear();
        const mVal = m.getMonth(); // 0-11
        const monthLabel = `${String(mVal + 1).padStart(2, "0")}/${yVal}`; // e.g. 12/2024
        const yearMonth = `${yVal}-${String(mVal + 1).padStart(2, "0")}`; // e.g. 2024-12

        const monthInvoices = invoicesLast12Months.filter((inv) => {
          const invLocal = new Date(
            inv.createdAt.getTime() + 7 * 60 * 60 * 1000,
          );
          return invLocal.toISOString().startsWith(yearMonth);
        });

        const totalPrice = monthInvoices.reduce(
          (sum, inv) => sum + Number(inv.totalPrice),
          0,
        );
        const finalAmount = monthInvoices.reduce(
          (sum, inv) => sum + Number(inv.finalAmount),
          0,
        );
        const discountAmount = monthInvoices.reduce(
          (sum, inv) => sum + Number(inv.discountAmount),
          0,
        );

        monthlyTrends.push({
          month: monthLabel,
          yearMonth,
          totalPrice,
          finalAmount,
          discountAmount,
        });
      }

      // 5. Construct Target Month's Daily Revenues list (dailyRevenues) - Ascending Order (1 to targetDaysInMonth)
      const dailyRevenues = [];
      for (const r of selectedMonthRanges) {
        for (let d = 1; d <= r.daysInMonth; d++) {
          const dStr = `${r.year}-${r.monthStr}-${String(d).padStart(2, "0")}`;
          const dateLabel = `${d} thg ${r.monthStr}, ${r.year}`;

          const dayInvoices = targetInvoices.filter((inv) => {
            const invLocal = new Date(
              inv.createdAt.getTime() + 7 * 60 * 60 * 1000,
            );
            return invLocal.toISOString().startsWith(dStr);
          });

          const totalPrice = dayInvoices.reduce(
            (sum, inv) => sum + Number(inv.totalPrice),
            0,
          );
          const finalAmount = dayInvoices.reduce(
            (sum, inv) => sum + Number(inv.finalAmount),
            0,
          );
          const discountAmount = dayInvoices.reduce(
            (sum, inv) => sum + Number(inv.discountAmount),
            0,
          );

          const dayDate = new Date(`${dStr}T12:00:00+07:00`);
          let dayOfWeek = dayDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
          if (dayOfWeek === 0) dayOfWeek = 7; // Map Sunday to 7

          const formattedInvoices = dayInvoices.map((inv) => {
            const timeLocal = new Date(
              inv.createdAt.getTime() + 7 * 60 * 60 * 1000,
            );
            const timeStr = timeLocal.toISOString().substr(11, 5); // HH:MM

            return {
              id: inv.id,
              invoiceNumber: inv.id.substring(0, 8).toUpperCase(),
              totalPrice: Number(inv.totalPrice),
              discountAmount: Number(inv.discountAmount),
              finalAmount: Number(inv.finalAmount),
              paymentMethod: inv.paymentMethod,
              paymentStatus: inv.paymentStatus,
              time: timeStr,
              customerName: inv.customer?.name || "Khách vãng lai",
              cashierId: inv.staffId || inv.cashier?.id || null,
              cashierName: inv.cashier?.name || "Hệ thống",
              note: inv.note || "",
              items: inv.items.map((item) => ({
                id: item.id,
                itemId: item.itemId,
                name: itemNames.get(item.itemId) || "Sản phẩm/Dịch vụ đã xóa",
                itemType: item.itemType,
                price: Number(item.price),
                quantity: item.quantity,
                totalPrice: Number(item.totalPrice),
                discountAmount: Number(item.discountAmount),
                finalAmount: Number(item.finalAmount),
                staffId: item.staffId,
                staffName: (item as any).stylist?.name || null,
                staffAvatar: (item as any).stylist?.avatar || null,
              })),
            };
          });

          dailyRevenues.push({
            date: dateLabel,
            dateRaw: dStr,
            day: d,
            dayOfWeek,
            totalPrice,
            finalAmount,
            discountAmount,
            invoices: formattedInvoices,
          });
        }
      }
      dailyRevenues.sort((a, b) => a.dateRaw.localeCompare(b.dateRaw));

      // 6. Aggregate Payment Methods (from last 7 days invoices)
      const paymentMethodTotals: Record<string, number> = {
        CASH: 0,
        CREDIT: 0,
        TRANSFER: 0,
      };
      let totalRevenue7Days = 0;
      for (const inv of invoicesLast7Days) {
        const amt = Number(inv.finalAmount);
        const method = inv.paymentMethod || "CASH";
        paymentMethodTotals[method] = (paymentMethodTotals[method] || 0) + amt;
        totalRevenue7Days += amt;
      }
      const paymentMethodsBreakdown = Object.entries(paymentMethodTotals).map(
        ([method, amount]) => ({
          method,
          amount,
          percentage:
            totalRevenue7Days > 0
              ? Math.round((amount / totalRevenue7Days) * 100)
              : 0,
        }),
      );

      // 7. Aggregate Top Services & Staff Performance (from target month completed invoices)
      const invoicesForStats =
        selectedDaysList.length > 0
          ? targetInvoices.filter((inv) => {
              const invLocal = new Date(
                inv.createdAt.getTime() + 7 * 60 * 60 * 1000,
              );
              const dateStr = invLocal.toISOString().split("T")[0];
              return selectedDaysList.includes(dateStr);
            })
          : targetInvoices;

      const completedInvoiceIds = invoicesForStats.map((i) => i.id);

      // Load all users to resolve staff names
      const allUsers = await prisma.user.findMany({
        where: { tenantId, deletedAt: null },
        select: { id: true, name: true },
      });
      const userNameMap = new Map(allUsers.map((u) => [u.id, u.name]));

      // 7.a Staff Performance aggregation
      const staffPerformanceMap = new Map<
        string,
        {
          staffName: string;
          totalPrice: number;
          actualRevenue: number;
          revenue: number;
          customers: Set<string>;
          recordCount: number;
        }
      >();

      for (const inv of invoicesForStats) {
        const custId = inv.customerId || `guest-${inv.id}`;
        for (const item of inv.items) {
          if (item.staffId) {
            const staffId = item.staffId;
            const staffName = userNameMap.get(staffId) || "Nhân viên khác";

            const existing = staffPerformanceMap.get(staffId) || {
              staffName,
              totalPrice: 0,
              actualRevenue: 0,
              revenue: 0,
              customers: new Set<string>(),
              recordCount: 0,
            };

            existing.totalPrice += Number(
              item.totalPrice ?? (Number(item.price) * (Number(item.quantity) || 1)),
            );
            existing.actualRevenue += Number(item.finalAmount);
            existing.revenue += Number(item.finalAmount);
            existing.customers.add(custId);
            existing.recordCount += 1;

            staffPerformanceMap.set(staffId, existing);
          }
        }
      }

      const staffPerformance = Array.from(staffPerformanceMap.entries())
        .map(([staffId, data]) => ({
          staffId,
          staffName: data.staffName,
          totalPrice: data.totalPrice,
          actualRevenue: data.actualRevenue,
          revenue: data.revenue,
          customers: data.customers.size,
          recordCount: data.recordCount,
        }))
        .sort((a, b) => b.revenue - a.revenue);

      // 7.b Top Services aggregation
      let topServices: Array<{
        id: string;
        name: string;
        count: number;
        revenue: number;
      }> = [];
      if (completedInvoiceIds.length > 0) {
        const invoiceItemsThisMonth = await prisma.invoiceItem.findMany({
          where: {
            invoiceId: { in: completedInvoiceIds },
            itemType: "SERVICE",
            deletedAt: null,
          },
          select: {
            itemId: true,
            quantity: true,
            finalAmount: true,
            staffId: true,
          },
        });

        let filteredInvoiceItems = invoiceItemsThisMonth;
        if (selectedStaffList.length > 0) {
          filteredInvoiceItems = filteredInvoiceItems.filter(
            (item) => item.staffId && selectedStaffList.includes(item.staffId),
          );
        }
        if (selectedServicesList.length > 0) {
          filteredInvoiceItems = filteredInvoiceItems.filter((item) =>
            selectedServicesList.includes(item.itemId),
          );
        }

        const serviceNameMap = new Map(allServices.map((s) => [s.id, s.name]));
        const serviceStats = new Map<
          string,
          { count: number; revenue: number }
        >();
        for (const item of filteredInvoiceItems) {
          const serviceId = item.itemId;
          const qty = item.quantity;
          const revenue = Number(item.finalAmount);

          const existing = serviceStats.get(serviceId) || {
            count: 0,
            revenue: 0,
          };
          serviceStats.set(serviceId, {
            count: existing.count + qty,
            revenue: existing.revenue + revenue,
          });
        }

        topServices = Array.from(serviceStats.entries())
          .map(([serviceId, stats]) => ({
            id: serviceId,
            name: serviceNameMap.get(serviceId) || "Dịch vụ đã xóa",
            count: stats.count,
            revenue: stats.revenue,
          }))
          .sort((a, b) => b.revenue - a.revenue) // Sort by revenue descending
          .slice(0, 15);
      }

      // 8. Format Recent Bookings list
      const formattedRecentBookings = recentBookingsList.map((b) => {
        const timeLocal = new Date(b.startTime.getTime() + 7 * 60 * 60 * 1000);
        const timeStr = timeLocal.toISOString().substr(11, 5); // HH:MM

        const serviceNames =
          b.bookingDetails.map((d) => d.service.name).join(", ") ||
          "Không có dịch vụ";
        const staffNames =
          b.bookingDetails
            .map((d) => d.staff?.name)
            .filter(Boolean)
            .join(", ") || "Chưa gán thợ";

        return {
          id: b.id,
          customerName: b.customer?.name || b.customerName || "Khách vãng lai",
          service: serviceNames,
          staff: staffNames,
          time: timeStr,
          status: b.status,
        };
      });

      // 9. Format Daily Turns list
      const formattedTurns = dailyTurnsQueue.map((t, idx) => ({
        rank: idx + 1,
        name: t.staff.name,
        avatar: t.staff.avatar,
        served: t.totalCustomersToday,
      }));

      // 10. Return everything
      return {
        daily: {
          revenue: todayRevenue,
          previous: yesterdayRevenue,
          growth: dailyRevenueGrowth,
        },
        monthly: {
          revenue: thisMonthRevenue,
          previous: lastMonthRevenue,
          growth: monthlyRevenueGrowth,
        },
        bookings: {
          total: totalBookingsToday,
          completed: completedBookingsToday,
        },
        staff: {
          scheduled: totalStaffScheduled,
          active: totalStaffActive,
        },
        inventory: {
          lowStock: lowStockCount,
        },
        charts: {
          monthlyTrends,
          dailyRevenues,
          paymentMethods: paymentMethodsBreakdown,
          topServices,
          staffPerformance,
        },
        recentBookings: formattedRecentBookings,
        dailyTurns: formattedTurns,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to calculate dashboard statistics: ${(error as any).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
