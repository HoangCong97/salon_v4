import React, { useState, useMemo } from "react";
import { Filter, Banknote, CreditCard, Search } from "lucide-react";
import { Invoice } from "../../desktop/Invoices/types";
import MultiStaffAvatar from "./MultiStaffAvatar";

interface MobileInvoiceListProps {
  invoices: Invoice[];
  isLoading?: boolean;
  onSelectInvoice: (invoice: Invoice) => void;
}

export default function MobileInvoiceList({
  invoices,
  isLoading = false,
  onSelectInvoice,
}: MobileInvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPayment, setFilterPayment] = useState<"ALL" | "CASH" | "BANK_TRANSFER">("ALL");
  const [showFilters, setShowFilters] = useState(false);

  const formatShortCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val);
  };

  const hasActiveFilters = searchQuery.trim() !== "" || filterPayment !== "ALL";

  // Filter invoices based on search & payment method
  const filteredList = useMemo(() => {
    return invoices.filter((inv) => {
      // Payment method match
      if (filterPayment !== "ALL" && inv.paymentMethod !== filterPayment) {
        return false;
      }

      // Search match (Customer name, customer phone, invoice id, staff name, service name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const custName = inv.customer?.name?.toLowerCase() || "";
        const custPhone = inv.customer?.phone || "";
        const invId = inv.id.toLowerCase();
        const itemNames = inv.items?.map((i) => i.name?.toLowerCase()).join(" ") || "";
        const staffNames = inv.items?.map((i) => i.stylist?.name?.toLowerCase()).join(" ") || "";

        if (
          !custName.includes(q) &&
          !custPhone.includes(q) &&
          !invId.includes(q) &&
          !itemNames.includes(q) &&
          !staffNames.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, filterPayment, searchQuery]);

  // Group invoices into date sections for Sticky Section Headers
  const groupedSections = useMemo(() => {
    const map = new Map<string, { totalNet: number; invoices: Invoice[] }>();

    filteredList.forEach((inv) => {
      let dateKey = "UNKNOWN";
      if (inv.createdAt) {
        const d = new Date(inv.createdAt);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          dateKey = `${year}-${month}-${day}`;
        }
      }

      if (!map.has(dateKey)) {
        map.set(dateKey, { totalNet: 0, invoices: [] });
      }
      const group = map.get(dateKey)!;
      group.totalNet += Number(inv.finalAmount || 0);
      group.invoices.push(inv);
    });

    // Sort sections descending (newest date first)
    const sortedKeys = Array.from(map.keys()).sort((a, b) => {
      if (a === "UNKNOWN") return 1;
      if (b === "UNKNOWN") return -1;
      return b.localeCompare(a);
    });

    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    const dayOfWeekNames = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];

    return sortedKeys.map((key) => {
      const group = map.get(key)!;
      // Sort invoices within section descending by createdAt time
      group.invoices.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime() || 0;
        const timeB = new Date(b.createdAt).getTime() || 0;
        return timeB - timeA;
      });

      let title = key;
      if (key === "UNKNOWN") {
        title = "Khác";
      } else {
        const parts = key.split("-");
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          const day = parseInt(parts[2], 10);
          const dateObj = new Date(year, month - 1, day);
          const formattedDate = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;

          if (key === todayKey) {
            title = `Hôm nay, ${formattedDate}`;
          } else if (key === yesterdayKey) {
            title = `Hôm qua, ${formattedDate}`;
          } else {
            const dayOfWeek = dayOfWeekNames[dateObj.getDay()] || "Ngày";
            title = `${dayOfWeek}, ${formattedDate}`;
          }
        }
      }

      return {
        dateKey: key,
        title,
        count: group.invoices.length,
        totalNet: group.totalNet,
        invoices: group.invoices,
      };
    });
  }, [filteredList]);

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
      {/* Header with Title and Toggle Filter Button */}
      <div
        onTouchMove={(e) => e.stopPropagation()}
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flexShrink: 0,
          background: "#ffffff",
          touchAction: "pan-x",
          userSelect: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Title size */}
          <div
            style={{
              fontSize: "15px",
              fontWeight: "700",
              color: "#1e293b",
            }}
          >
            Danh sách hóa đơn ({filteredList.length})
          </div>

          {/* Toggle Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 12px",
              borderRadius: "var(--radius-full)",
              border: showFilters || hasActiveFilters
                ? "1px solid var(--color-primary)"
                : "1px solid var(--border-color)",
              background: showFilters || hasActiveFilters
                ? "var(--color-primary-light)"
                : "#f8fafc",
              color: showFilters || hasActiveFilters
                ? "var(--color-primary)"
                : "var(--text-secondary)",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Filter size={13} />
            <span>{showFilters ? "Ẩn lọc" : "Lọc"}</span>
            {hasActiveFilters && (
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  display: "inline-block",
                }}
              />
            )}
          </button>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilters && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              paddingTop: "4px",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            {/* Search input with Lucide Search */}
            <div style={{ position: "relative", width: "100%" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Tìm theo tên nhân viên, dịch vụ, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  height: "34px",
                  fontSize: "12.5px",
                  borderRadius: "var(--radius-full)",
                  padding: "0 14px 0 34px",
                  width: "100%",
                }}
              />
            </div>

            {/* Quick Filter chips with Lucide icons */}
            <div style={{ display: "flex", gap: "6px" }}>
              {[
                { key: "ALL", label: "Tất cả", icon: null },
                {
                  key: "CASH",
                  label: "Tiền mặt",
                  icon: <Banknote size={13} />,
                },
                {
                  key: "BANK_TRANSFER",
                  label: "Tài khoản",
                  icon: <CreditCard size={13} />,
                },
              ].map((item) => {
                const isActive = filterPayment === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setFilterPayment(item.key as any)}
                    style={{
                      fontSize: "11px",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-full)",
                      border: isActive
                        ? "1px solid var(--color-primary)"
                        : "1px solid var(--border-color)",
                      background: isActive
                        ? "var(--color-primary-light)"
                        : "white",
                      color: isActive
                        ? "var(--color-primary)"
                        : "var(--text-secondary)",
                      fontWeight: isActive ? "600" : "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Invoice Cards Area matching Image 2 */}
      <div
        style={{
          flexGrow: 1,
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          display: "flex",
          flexDirection: "column",
          paddingBottom: "80px",
        }}
      >
        {isLoading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--text-secondary)",
              fontSize: "13px",
            }}
          >
            Đang tải danh sách hóa đơn...
          </div>
        ) : filteredList.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--text-secondary)",
              fontSize: "13px",
              gap: "6px",
              padding: "30px 0",
            }}
          >
            <span style={{ fontSize: "28px" }}>📜</span>
            <span>Không tìm thấy hóa đơn nào</span>
          </div>
        ) : (
          groupedSections.map((section) => (
            <div key={section.dateKey} style={{ position: "relative" }}>
              {/* Sticky Section Header */}
              <div
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  backgroundColor: "rgba(248, 250, 252, 0.96)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  borderTop: "1px solid #e2e8f0",
                  borderBottom: "1px solid #e2e8f0",
                  padding: "7px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  userSelect: "none",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#334155",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#0891b2",
                      display: "inline-block",
                    }}
                  />
                  <span>{section.title}</span>
                </div>

                <div
                  style={{
                    fontSize: "11.5px",
                    fontWeight: "600",
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>{section.count} HĐ</span>
                  <span style={{ color: "#cbd5e1" }}>•</span>
                  <span style={{ color: "#0891b2", fontWeight: "700" }}>
                    {formatShortCurrency(section.totalNet)}
                  </span>
                </div>
              </div>

              {/* Invoices belonging to this date section */}
              <div>
                {section.invoices.map((inv) => {
                  // Format time: HH:mm
                  const dateObj = new Date(inv.createdAt);
                  const timeStr = dateObj.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });

                  // Extract unique staff members involved in this invoice
                  const invoiceStaff: Array<{ id?: string; name: string; avatar?: string }> = [];
                  const staffSeen = new Set<string>();

                  if (inv.items && inv.items.length > 0) {
                    inv.items.forEach((item) => {
                      if (item.stylist?.name && !staffSeen.has(item.stylist.name)) {
                        staffSeen.add(item.stylist.name);
                        invoiceStaff.push({
                          id: item.stylist.id || item.staffId,
                          name: item.stylist.name,
                        });
                      }
                    });
                  }

                  // Fallback to cashier if no item staff
                  if (invoiceStaff.length === 0 && inv.cashier?.name) {
                    invoiceStaff.push({
                      id: inv.cashierId,
                      name: inv.cashier.name,
                    });
                  }

                  const staffNamesStr =
                    invoiceStaff.map((s) => s.name).join(", ") || "H&T Barber";

                  // Format Line 2: List of services
                  const serviceNamesStr =
                    inv.items && inv.items.length > 0
                      ? inv.items.map((i) => i.name || "Dịch vụ").join(", ")
                      : "Hóa đơn dịch vụ";

                  return (
                    <div
                      key={inv.id}
                      onClick={() => onSelectInvoice(inv)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "10px 14px",
                        borderBottom: "1px solid var(--border-color)",
                        background: "white",
                        cursor: "pointer",
                        gap: "12px",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "white")
                      }
                    >
                      {/* Left Side: Multi-staff Avatar collage */}
                      <MultiStaffAvatar staffList={invoiceStaff} size={48} />

                      {/* Right Side: 2-Line Layout */}
                      <div
                        style={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          gap: "4px",
                          overflow: "hidden",
                        }}
                      >
                        {/* Line 1: [HH:mm - Staff Names] | [Amount / Summary] */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#2563eb",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {timeStr} - {staffNamesStr}
                          </div>

                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#0891b2",
                              whiteSpace: "nowrap",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              flexShrink: 0,
                            }}
                          >
                            {inv.paymentMethod === "BANK_TRANSFER" && (
                              <CreditCard size={13} color="#0891b2" />
                            )}
                            <span>{formatShortCurrency(inv.finalAmount)}</span>
                          </div>
                        </div>

                        {/* Line 2: [Secondary: Service Names] & [Discount Amount if any] */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11.5px",
                              color: "#64748b",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              flexGrow: 1,
                            }}
                          >
                            {serviceNamesStr}
                          </div>

                          {inv.discountAmount > 0 && (
                            <div
                              style={{
                                fontSize: "11px",
                                fontWeight: "600",
                                color: "#dc2626",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                              }}
                            >
                              -{formatShortCurrency(inv.discountAmount)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
