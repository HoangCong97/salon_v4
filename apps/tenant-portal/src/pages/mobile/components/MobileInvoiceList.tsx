import React, { useState, useMemo } from "react";
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
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flexShrink: 0,
          background: "#ffffff",
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
            <span>🔍 {showFilters ? "Ẩn lọc" : "Lọc"}</span>
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
            {/* Search input */}
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Tìm theo tên nhân viên, dịch vụ, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                height: "34px",
                fontSize: "12.5px",
                borderRadius: "var(--radius-full)",
                padding: "0 14px",
              }}
            />

            {/* Quick Filter chips */}
            <div style={{ display: "flex", gap: "6px" }}>
              {[
                { key: "ALL", label: "Tất cả" },
                { key: "CASH", label: "💵 Tiền mặt" },
                { key: "BANK_TRANSFER", label: "💳 Chuyển khoản" },
              ].map((item) => {
                const isActive = filterPayment === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setFilterPayment(item.key as any)}
                    style={{
                      fontSize: "11px",
                      padding: "3px 10px",
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
                      transition: "all 0.15s ease",
                    }}
                  >
                    {item.label}
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
          filteredList.map((inv) => {
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
                        color: "#16a34a",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        flexShrink: 0,
                      }}
                    >
                      {inv.paymentMethod === "BANK_TRANSFER" && (
                        <span style={{ fontSize: "11px" }}>💳</span>
                      )}
                      <span>{formatShortCurrency(inv.finalAmount)}</span>
                    </div>
                  </div>

                  {/* Line 2: [Secondary: Service Names] */}
                  <div
                    style={{
                      fontSize: "11.5px",
                      color: "#64748b",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {serviceNamesStr}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
