import React, { useMemo } from "react";
import { X } from "lucide-react";
import { Invoice, Staff } from "../../desktop/Invoices/types";
import MultiStaffAvatar from "./MultiStaffAvatar";

interface StaffDailyRevenueProps {
  staffList?: Staff[];
  todayInvoices: Invoice[];
  isLoading?: boolean;
  targetDateRaw?: string;
  selectedStaffId?: string | null;
  onSelectStaff?: (staffId: string | null) => void;
  maxHeight?: string | number;
  title?: string;
  totalGross?: number;
  totalNet?: number;
  onClose?: () => void;
}

interface StaffRevenueItem {
  id: string;
  name: string;
  avatar?: string;
  grossRevenue: number; // Doanh thu (chưa giảm giá)
  netRevenue: number;   // Thu thực tế (đã trừ giảm giá)
  serviceCount: number;
}

interface SelectedDaySummary {
  title: string;
  isToday: boolean;
  dateStr: string;
  rawDate: string;
  totalGrossRevenue: number;
  totalNetRevenue: number;
  staffList: StaffRevenueItem[];
}

const NAME_COLORS = [
  "#d946ef", // magenta/pink
  "#ec4899", // bright pink
  "#3b82f6", // blue
  "#10b981", // green
  "#8b5cf6", // purple
  "#f59e0b", // amber
];

function getNameColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return NAME_COLORS[Math.abs(hash) % NAME_COLORS.length];
}

export default function StaffDailyRevenueCard({
  staffList,
  todayInvoices,
  isLoading = false,
  targetDateRaw,
  selectedStaffId,
  onSelectStaff,
  maxHeight,
  title,
  totalGross,
  totalNet,
  onClose,
}: StaffDailyRevenueProps) {
  const formatShortCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val);
  };

  // Aggregate revenue data for the selected day or month:
  const selectedDayData = useMemo((): SelectedDaySummary => {
    const now = new Date();
    const nowDay = String(now.getDate()).padStart(2, "0");
    const nowMonth = String(now.getMonth() + 1).padStart(2, "0");
    const nowYear = now.getFullYear();
    const todayRaw = `${nowYear}-${nowMonth}-${nowDay}`;
    const todayDateStr = `${nowDay}/${nowMonth}/${nowYear}`;

    // 1. Direct aggregation mode when title or targetDateRaw is explicitly given
    if (title || targetDateRaw) {
      const staffMap = new Map<string, StaffRevenueItem>();

      todayInvoices.forEach((inv) => {
        if (inv.items && inv.items.length > 0) {
          inv.items.forEach((item) => {
            const sId = item.staffId || item.stylist?.id;
            const sName = item.stylist?.name || (item as any).staffName || "Nhân viên";

            const gross = Number(item.price * item.quantity);
            const net = Number(item.finalAmount ?? (gross - (item.discountAmount || 0)));

            if (sId) {
              const existing = staffMap.get(sId);
              if (existing) {
                existing.grossRevenue += gross;
                existing.netRevenue += net;
                existing.serviceCount += item.quantity || 1;
              } else {
                staffMap.set(sId, {
                  id: sId,
                  name: sName,
                  avatar: item.stylist?.avatar || (item as any).staffAvatar || undefined,
                  grossRevenue: gross,
                  netRevenue: net,
                  serviceCount: item.quantity || 1,
                });
              }
            } else if (inv.cashierId) {
              const cashierName = inv.cashier?.name || "Thu ngân";
              const existing = staffMap.get(inv.cashierId);
              if (existing) {
                existing.grossRevenue += gross;
                existing.netRevenue += net;
                existing.serviceCount += item.quantity || 1;
              } else {
                staffMap.set(inv.cashierId, {
                  id: inv.cashierId,
                  name: cashierName,
                  grossRevenue: gross,
                  netRevenue: net,
                  serviceCount: item.quantity || 1,
                });
              }
            }
          });
        } else {
          const cashierId = inv.cashierId || "UNKNOWN";
          const cashierName = inv.cashier?.name || "Thu ngân";
          const gross = Number(inv.totalPrice || inv.finalAmount || 0);
          const net = Number(inv.finalAmount || 0);

          const existing = staffMap.get(cashierId);
          if (existing) {
            existing.grossRevenue += gross;
            existing.netRevenue += net;
            existing.serviceCount += 1;
          } else {
            staffMap.set(cashierId, {
              id: cashierId,
              name: cashierName,
              grossRevenue: gross,
              netRevenue: net,
              serviceCount: 1,
            });
          }
        }
      });

      const staffArr = Array.from(staffMap.values()).sort(
        (a, b) => b.netRevenue - a.netRevenue,
      );

      const computedGross = todayInvoices.reduce(
        (sum, i) => sum + Number(i.totalPrice || 0),
        0,
      );
      const computedNet = todayInvoices.reduce(
        (sum, i) => sum + Number(i.finalAmount || 0),
        0,
      );

      let resolvedTitle = title;
      if (!resolvedTitle && targetDateRaw) {
        const parts = targetDateRaw.split("-");
        const dStr =
          parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : targetDateRaw;
        resolvedTitle = targetDateRaw === todayRaw ? "Hôm nay" : `Ngày ${dStr}`;
      }

      return {
        title: resolvedTitle || "Hôm nay",
        isToday: targetDateRaw === todayRaw,
        dateStr: targetDateRaw || todayRaw,
        rawDate: targetDateRaw || todayRaw,
        totalGrossRevenue: totalGross !== undefined ? totalGross : computedGross,
        totalNetRevenue: totalNet !== undefined ? totalNet : computedNet,
        staffList: staffArr,
      };
    }

    // 2. Default Invoices.tsx mode: group invoices by rawDate (YYYY-MM-DD)
    const dayMap = new Map<
      string,
      {
        rawDate: string;
        dateStr: string;
        staffMap: Map<string, StaffRevenueItem>;
      }
    >();

    todayInvoices.forEach((inv) => {
      if (!inv.createdAt) return;
      const d = new Date(inv.createdAt);
      if (isNaN(d.getTime())) return;

      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const dateDisplay = `${day}/${month}/${year}`;
      const rawDate = `${year}-${month}-${day}`;

      if (!dayMap.has(rawDate)) {
        dayMap.set(rawDate, {
          rawDate,
          dateStr: dateDisplay,
          staffMap: new Map<string, StaffRevenueItem>(),
        });
      }

      const { staffMap } = dayMap.get(rawDate)!;

      if (inv.items && inv.items.length > 0) {
        inv.items.forEach((item) => {
          const sId = item.staffId || item.stylist?.id;
          const sName = item.stylist?.name || (item as any).staffName || "Nhân viên";

          const gross = Number(item.price * item.quantity);
          const net = Number(item.finalAmount ?? (gross - (item.discountAmount || 0)));

          if (sId) {
            const existing = staffMap.get(sId);
            if (existing) {
              existing.grossRevenue += gross;
              existing.netRevenue += net;
              existing.serviceCount += item.quantity || 1;
            } else {
              staffMap.set(sId, {
                id: sId,
                name: sName,
                avatar: item.stylist?.avatar || (item as any).staffAvatar || undefined,
                grossRevenue: gross,
                netRevenue: net,
                serviceCount: item.quantity || 1,
              });
            }
          } else if (inv.cashierId) {
            const cashierName = inv.cashier?.name || "Thu ngân";
            const existing = staffMap.get(inv.cashierId);
            if (existing) {
              existing.grossRevenue += gross;
              existing.netRevenue += net;
              existing.serviceCount += item.quantity || 1;
            } else {
              staffMap.set(inv.cashierId, {
                id: inv.cashierId,
                name: cashierName,
                grossRevenue: gross,
                netRevenue: net,
                serviceCount: item.quantity || 1,
              });
            }
          }
        });
      } else {
        const cashierId = inv.cashierId || "UNKNOWN";
        const cashierName = inv.cashier?.name || "Thu ngân";
        const gross = Number(inv.totalPrice || inv.finalAmount || 0);
        const net = Number(inv.finalAmount || 0);

        const existing = staffMap.get(cashierId);
        if (existing) {
          existing.grossRevenue += gross;
          existing.netRevenue += net;
          existing.serviceCount += 1;
        } else {
          staffMap.set(cashierId, {
            id: cashierId,
            name: cashierName,
            grossRevenue: gross,
            netRevenue: net,
            serviceCount: 1,
          });
        }
      }
    });

    // Build list of day summaries
    const dayGroups: {
      rawDate: string;
      dateStr: string;
      totalGrossRevenue: number;
      totalNetRevenue: number;
      staffList: StaffRevenueItem[];
    }[] = [];

    dayMap.forEach(({ rawDate, dateStr, staffMap }) => {
      const staffArr = Array.from(staffMap.values()).sort(
        (a, b) => b.netRevenue - a.netRevenue,
      );
      const totalNetRevenue = staffArr.reduce((sum, s) => sum + s.netRevenue, 0);
      const totalGrossRevenue = staffArr.reduce((sum, s) => sum + s.grossRevenue, 0);

      dayGroups.push({
        rawDate,
        dateStr,
        totalGrossRevenue,
        totalNetRevenue,
        staffList: staffArr,
      });
    });

    // Sort descending by rawDate (most recent first)
    dayGroups.sort((a, b) => b.rawDate.localeCompare(a.rawDate));

    // Check if today has any invoices
    const todayGroup = dayGroups.find((g) => g.rawDate === todayRaw);

    if (todayGroup) {
      return {
        title: "Hôm nay",
        isToday: true,
        dateStr: todayGroup.dateStr,
        rawDate: todayGroup.rawDate,
        totalGrossRevenue: todayGroup.totalGrossRevenue,
        totalNetRevenue: todayGroup.totalNetRevenue,
        staffList: todayGroup.staffList,
      };
    }

    // If today has NO invoices, select the most recent day with invoices
    if (dayGroups.length > 0) {
      const mostRecent = dayGroups[0];
      return {
        title: `Ngày ${mostRecent.dateStr}`,
        isToday: false,
        dateStr: mostRecent.dateStr,
        rawDate: mostRecent.rawDate,
        totalGrossRevenue: mostRecent.totalGrossRevenue,
        totalNetRevenue: mostRecent.totalNetRevenue,
        staffList: mostRecent.staffList,
      };
    }

    // Default empty state
    return {
      title: "Hôm nay",
      isToday: true,
      dateStr: todayDateStr,
      rawDate: todayRaw,
      totalGrossRevenue: 0,
      totalNetRevenue: 0,
      staffList: [],
    };
  }, [todayInvoices, targetDateRaw, title, totalGross, totalNet]);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* Header section: Columns aligned 100% with the table below (45%, 27.5%, 27.5%) */}
      <div
        style={{
          padding: "10px 0",
          background: "white",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          width: "100%",
          flexShrink: 0,
        }}
      >
        {/* Column 1 (45%): Title ('Hôm nay' or 'Ngày dd/MM/yyyy' or 'Tháng MM/yyyy') */}
        <div
          style={{
            width: "45%",
            paddingLeft: "14px",
            fontSize: selectedDayData.isToday ? "17px" : "15px",
            fontWeight: "700",
            color: "#1e293b",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {selectedDayData.title}
        </div>

        {/* Column 2 (27.5%): Total Gross Revenue Badge (Doanh thu) */}
        <div
          style={{
            width: "27.5%",
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              padding: "3px 10px",
              borderRadius: "12px",
              background: "#e2e8f0",
              color: "#334155",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
            title="Tổng Doanh thu (chưa giảm giá)"
          >
            {formatShortCurrency(selectedDayData.totalGrossRevenue)}
          </span>
        </div>

        {/* Column 3 (27.5%): Total Net Revenue Badge (Thu thực tế) + Optional [X] Close button */}
        <div
          style={{
            width: "27.5%",
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: onClose ? "space-between" : "flex-start",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              padding: "3px 10px",
              borderRadius: "12px",
              background: "#dbeafe",
              color: "#2563eb",
              fontWeight: "700",
              whiteSpace: "nowrap",
            }}
            title="Thu thực tế (đã trừ giảm giá)"
          >
            {formatShortCurrency(selectedDayData.totalNetRevenue)}
          </span>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "9999px",
                border: "none",
                outline: "none",
                background: "#f1f5f9",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
                marginLeft: "4px",
              }}
              aria-label="Đóng modal"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Table section */}
      <div
        style={{
          flexGrow: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          maxHeight: maxHeight || undefined,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
            textAlign: "left",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#ffffff",
                borderBottom: "1px solid var(--border-color)",
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              <th
                style={{
                  padding: "10px 14px",
                  fontWeight: "600",
                  color: "#475569",
                  width: "45%",
                  borderRight: "1px solid var(--border-color)",
                }}
              >
                Nhân viên
              </th>
              <th
                style={{
                  padding: "10px 12px",
                  fontWeight: "600",
                  color: "#475569",
                  textAlign: "left",
                  width: "27.5%",
                  borderRight: "1px solid var(--border-color)",
                }}
              >
                Doanh thu
              </th>
              <th
                style={{
                  padding: "10px 12px",
                  fontWeight: "600",
                  color: "#475569",
                  textAlign: "left",
                  width: "27.5%",
                }}
              >
                Thu thực tế
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  Đang tải thống kê doanh thu...
                </td>
              </tr>
            ) : selectedDayData.staffList.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  Chưa có dữ liệu doanh thu
                </td>
              </tr>
            ) : (
              selectedDayData.staffList.map((staff) => {
                const nameColor = getNameColor(staff.name);
                const matchingStaffObj = staffList?.find(
                  (s) => s.id === staff.id,
                );
                const avatarUrl = matchingStaffObj?.avatar || staff.avatar;
                const isSelected = selectedStaffId === staff.id;

                return (
                  <tr
                    key={staff.id}
                    onClick={() => {
                      if (onSelectStaff) {
                        onSelectStaff(isSelected ? null : staff.id);
                      }
                    }}
                    style={{
                      borderBottom: "1px solid var(--border-color)",
                      background: isSelected ? "#eff6ff" : "white",
                      cursor: onSelectStaff ? "pointer" : "default",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    {/* Staff Column: Avatar + Name */}
                    <td
                      style={{
                        padding: "8px 14px",
                        verticalAlign: "middle",
                        borderRight: "1px solid var(--border-color)",
                        overflow: "hidden",
                        width: "45%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          overflow: "hidden",
                          minWidth: 0,
                        }}
                      >
                        <MultiStaffAvatar
                          staffList={[
                            {
                              id: staff.id,
                              name: staff.name,
                              avatar: avatarUrl,
                            },
                          ]}
                          size={28}
                        />
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            minWidth: 0,
                            flexShrink: 1,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "600",
                              color: isSelected ? "#1d4ed8" : nameColor,
                              fontSize: "13px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              minWidth: 0,
                            }}
                            title={staff.name}
                          >
                            {staff.name}
                          </span>
                          {isSelected && (
                            <span
                              style={{
                                fontSize: "10px",
                                color: "#2563eb",
                                fontWeight: "600",
                                lineHeight: "1",
                                marginTop: "2px",
                              }}
                            >
                              ✓ Đang lọc
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Gross Revenue Column (Doanh thu) */}
                    <td
                      style={{
                        padding: "8px 12px",
                        color: "#2563eb",
                        fontWeight: "500",
                        fontSize: "13px",
                        verticalAlign: "middle",
                        borderRight: "1px solid var(--border-color)",
                        width: "27.5%",
                      }}
                    >
                      {formatShortCurrency(staff.grossRevenue)}
                    </td>

                    {/* Net Revenue Column (Thu thực tế) */}
                    <td
                      style={{
                        padding: "8px 12px",
                        color: "#2563eb",
                        fontWeight: "600",
                        fontSize: "13px",
                        verticalAlign: "middle",
                        width: "27.5%",
                      }}
                    >
                      {formatShortCurrency(staff.netRevenue)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
