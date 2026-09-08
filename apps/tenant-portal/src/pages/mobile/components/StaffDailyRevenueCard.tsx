import React, { useMemo } from "react";
import { Invoice, Staff } from "../../desktop/Invoices/types";
import MultiStaffAvatar from "./MultiStaffAvatar";

interface StaffDailyRevenueProps {
  staffList: Staff[];
  todayInvoices: Invoice[];
  isLoading?: boolean;
}

interface StaffRevenueItem {
  id: string;
  name: string;
  avatar?: string;
  grossRevenue: number; // Doanh thu (chưa giảm giá)
  netRevenue: number;   // Thu thực tế (đã trừ giảm giá)
  serviceCount: number;
}

interface DateGroup {
  dateStr: string;
  rawDate: string;
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
}: StaffDailyRevenueProps) {
  const formatShortCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val);
  };

  // Aggregate revenue data & calculate totals
  const dateGroups = useMemo((): {
    groups: DateGroup[];
    grandTotalGross: number;
    grandTotalNet: number;
  } => {
    const groupMap = new Map<
      string,
      {
        rawDate: string;
        staffMap: Map<string, StaffRevenueItem>;
      }
    >();

    let grandTotalGross = 0;
    let grandTotalNet = 0;

    todayInvoices.forEach((inv) => {
      const d = new Date(inv.createdAt);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const dateDisplay = `${day}/${month}/${year}`;
      const rawDate = `${year}-${month}-${day}`;

      if (!groupMap.has(dateDisplay)) {
        groupMap.set(dateDisplay, {
          rawDate,
          staffMap: new Map<string, StaffRevenueItem>(),
        });
      }

      const { staffMap } = groupMap.get(dateDisplay)!;

      if (inv.items && inv.items.length > 0) {
        inv.items.forEach((item) => {
          const sId = item.staffId || item.stylist?.id;
          const sName = item.stylist?.name || "Nhân viên";

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
        const gross = Number(inv.totalPrice || inv.finalAmount);
        const net = Number(inv.finalAmount);

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

    const result: DateGroup[] = [];
    Array.from(groupMap.entries()).forEach(([dateStr, { rawDate, staffMap }]) => {
      const staffArr = Array.from(staffMap.values()).sort(
        (a, b) => b.netRevenue - a.netRevenue,
      );
      const totalNetRevenue = staffArr.reduce((sum, s) => sum + s.netRevenue, 0);
      const totalGrossRevenue = staffArr.reduce((sum, s) => sum + s.grossRevenue, 0);

      grandTotalNet += totalNetRevenue;
      grandTotalGross += totalGrossRevenue;

      result.push({
        dateStr,
        rawDate,
        totalNetRevenue,
        staffList: staffArr,
      });
    });

    result.sort((a, b) => (b.rawDate > a.rawDate ? 1 : -1));

    return {
      groups: result,
      grandTotalGross,
      grandTotalNet,
    };
  }, [todayInvoices]);

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
        {/* Column 1 (45%): Title 'Hôm nay' */}
        <div
          style={{
            width: "45%",
            paddingLeft: "14px",
            fontSize: "17px",
            fontWeight: "700",
            color: "#1e293b",
          }}
        >
          Hôm nay
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
            {formatShortCurrency(dateGroups.grandTotalGross)}
          </span>
        </div>

        {/* Column 3 (27.5%): Total Net Revenue Badge (Thu thực tế) */}
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
              background: "#dbeafe",
              color: "#2563eb",
              fontWeight: "700",
              whiteSpace: "nowrap",
            }}
            title="Thu thực tế (đã trừ giảm giá)"
          >
            {formatShortCurrency(dateGroups.grandTotalNet)}
          </span>
        </div>
      </div>

      {/* Table section */}
      <div
        style={{
          flexGrow: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
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
            ) : dateGroups.groups.length === 0 ? (
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
              dateGroups.groups.map((group) => (
                <React.Fragment key={group.dateStr}>
                  {/* Staff Rows */}
                  {group.staffList.map((staff) => {
                    const nameColor = getNameColor(staff.name);
                    const matchingStaffObj = staffList.find(
                      (s) => s.id === staff.id,
                    );
                    const avatarUrl = matchingStaffObj?.avatar;

                    return (
                      <tr
                        key={staff.id}
                        style={{
                          borderBottom: "1px solid var(--border-color)",
                          background: "white",
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
                            <span
                              style={{
                                fontWeight: "600",
                                color: nameColor,
                                fontSize: "13px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                minWidth: 0,
                                flexShrink: 1,
                              }}
                              title={staff.name}
                            >
                              {staff.name}
                            </span>
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
                  })}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
