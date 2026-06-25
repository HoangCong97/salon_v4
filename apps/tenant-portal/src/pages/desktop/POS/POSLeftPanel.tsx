import React from "react";
import { Search, Users, Check } from "lucide-react";
import { formatCurrencyVND } from "@salon/shared-utils";

export const getEmployeeColor = (id: string, activeStaff?: any[]) => {
  const colors = [
    { color: "#0d9488" }, // Teal 600
    { color: "#0284c7" }, // Sky Blue 600
    { color: "#4f46e5" }, // Indigo 600
    { color: "#7c3aed" }, // Violet 600
    { color: "#e11d48" }, // Rose 600
    { color: "#ea580c" }, // Orange 600
    { color: "#d97706" }  // Amber 600
  ];
  if (activeStaff && activeStaff.length > 0) {
    const idx = activeStaff.findIndex(s => s.id === id);
    if (idx !== -1) {
      return colors[idx % colors.length];
    }
  }
  let sum = 0;
  const safeId = id || "default";
  for (let i = 0; i < safeId.length; i++) {
    sum += safeId.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

const getServiceCategoryColor = (categoryName: string, colorName?: string) => {
  if (colorName) {
    const presets: Record<string, { bg: string; border: string; text: string; labelBg: string }> = {
      blue: { bg: "hsl(210, 100%, 96%)", border: "hsl(210, 100%, 90%)", text: "hsl(210, 100%, 45%)", labelBg: "hsl(210, 100%, 96%)" },
      green: { bg: "hsl(142, 70%, 95%)", border: "hsl(142, 70%, 88%)", text: "hsl(142, 72%, 29%)", labelBg: "hsl(142, 70%, 95%)" },
      orange: { bg: "hsl(30, 100%, 95%)", border: "hsl(30, 100%, 90%)", text: "hsl(30, 100%, 40%)", labelBg: "hsl(30, 100%, 95%)" },
      red: { bg: "hsl(0, 100%, 96%)", border: "hsl(0, 100%, 90%)", text: "hsl(0, 100%, 45%)", labelBg: "hsl(0, 100%, 96%)" },
      sky: { bg: "hsl(193, 90%, 95%)", border: "hsl(193, 90%, 88%)", text: "hsl(193, 90%, 35%)", labelBg: "hsl(193, 90%, 95%)" },
      purple: { bg: "hsl(270, 80%, 96%)", border: "hsl(270, 80%, 90%)", text: "hsl(270, 80%, 45%)", labelBg: "hsl(270, 80%, 96%)" },
      pink: { bg: "hsl(330, 80%, 96%)", border: "hsl(330, 80%, 90%)", text: "hsl(330, 80%, 45%)", labelBg: "hsl(330, 80%, 96%)" },
      indigo: { bg: "hsl(235, 80%, 96%)", border: "hsl(235, 80%, 90%)", text: "hsl(235, 80%, 45%)", labelBg: "hsl(235, 80%, 96%)" },
      lime: { bg: "hsl(80, 80%, 94%)", border: "hsl(80, 80%, 85%)", text: "hsl(80, 80%, 30%)", labelBg: "hsl(80, 80%, 94%)" },
      teal: { bg: "hsl(170, 80%, 94%)", border: "hsl(170, 80%, 85%)", text: "hsl(170, 80%, 30%)", labelBg: "hsl(170, 80%, 94%)" },
    };
    const c = colorName.toLowerCase();
    if (presets[c]) return presets[c];
  }

  const name = (categoryName || "").toLowerCase();
  if (name.includes("hair") || name.includes("tóc")) {
    return { bg: "#f0f7ff", border: "#bae6fd", text: "#0369a1", labelBg: "#e0f2fe" }; // Light Blue
  }
  if (name.includes("spa") || name.includes("gội") || name.includes("massage")) {
    return { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", labelBg: "#dcfce7" }; // Light Green
  }
  if (name.includes("nail") || name.includes("móng") || name.includes("art")) {
    return { bg: "#fff5f5", border: "#fed7d7", text: "#c53030", labelBg: "#fff5f5" }; // Light Rose
  }
  return { bg: "#fafaf9", border: "#e7e5e4", text: "#57534e", labelBg: "#f5f5f4" };
};

interface POSLeftPanelProps {
  activeStaff: any[];
  selectedStylistId: string;
  setSelectedStylistId: (id: string) => void;
  search: string;
  setSearch: (s: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  serviceCategories: string[];
  filteredServices: any[];
  filteredProducts: any[];
  filteredPackages: any[];
  addToCart: (item: any, type: "SERVICE" | "PRODUCT" | "PACKAGE") => void;
  removeFromCart: (itemId: string) => void;
  cart: any[];
  flashStaff?: boolean;
}

export const POSLeftPanel: React.FC<POSLeftPanelProps> = ({
  activeStaff,
  selectedStylistId,
  setSelectedStylistId,
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  serviceCategories,
  filteredServices,
  filteredProducts,
  filteredPackages,
  addToCart,
  removeFromCart,
  cart,
  flashStaff = false,
}) => {
  // Helper UI: Render active cart assignment badges on item card
  const renderItemCartBadges = (itemId: string) => {
    const assignments = cart.filter(c => c.itemId === itemId);
    if (assignments.length === 0) return null;

    // Group assignments by staffId and sum quantities
    const groupedAssignments: { staffId: string; quantity: number }[] = [];
    assignments.forEach((asg) => {
      const existing = groupedAssignments.find(x => x.staffId === asg.staffId);
      if (existing) {
        existing.quantity += asg.quantity;
      } else {
        groupedAssignments.push({ staffId: asg.staffId, quantity: asg.quantity });
      }
    });

    return (
      <div style={{ display: "flex", gap: "4px" }}>
        {groupedAssignments.map((ga) => {
          const staffMember = activeStaff.find(s => s.id === ga.staffId);
          const empColor = getEmployeeColor(ga.staffId, activeStaff);
          const staffName = staffMember ? staffMember.name.split("(")[0].trim() : "Nhân viên";
          return (
            <span
              key={ga.staffId}
              title={`${staffName}: ${ga.quantity}`}
              onContextMenu={(e) => { e.preventDefault(); removeFromCart(itemId); }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                fontSize: "10.5px",
                fontWeight: "700",
                backgroundColor: empColor.color,
                color: "white",
                border: `2px solid ${empColor.color}`,
                cursor: "pointer",
              }}
            >
              {ga.quantity}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%", overflow: "hidden" }}>

      {/* Top Panel: Active Staff Members */}
      <div
        className={`card ${flashStaff ? "flash-active" : ""}`}
        style={{
          padding: "16px",
          transition: "all 0.2s"
        }}
      >
        <style>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}</style>
        <h4 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Users size={16} /> NHÂN VIÊN CHI NHÁNH (Có thể sử dụng hàng phím số để chọn)
        </h4>
        <div
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            height: "44px",
            alignItems: "center",
            boxSizing: "border-box"
          }}
        >
          {activeStaff.map((s, idx) => {
            const isSelected = selectedStylistId === s.id;
            const empColor = getEmployeeColor(s.id, activeStaff);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStylistId(s.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0 16px",
                  height: "38px",
                  boxSizing: "border-box",
                  borderRadius: "var(--radius-sm)",
                  border: isSelected ? `2px solid ${empColor.color}` : `2px solid ${empColor.color}`,
                  background: isSelected ? empColor.color : "white",
                  backgroundClip: "padding-box",
                  color: isSelected ? "white" : empColor.color,
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s",
                  boxShadow: isSelected ? "0 4px 12px rgba(0, 0, 0, 0.12)" : "none",
                  outline: "none"
                }}
              >
                {s.name.split("(")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle Panel: Shrunk search box + all category options on the SAME ROW */}
      <div className="card" style={{ padding: "16px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", width: "100%", justifyContent: "space-between", flexWrap: "nowrap" }}>

          {/* Shrunk Search Box */}
          <div style={{ position: "relative", width: "180px", flexShrink: 0 }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              className="form-input"
              placeholder="Tìm kiếm nhanh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "30px", width: "100%", height: "36px", fontSize: "12.5px" }}
            />
          </div>

          {/* Category Buttons including ALL service categories */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end", flexGrow: 1 }}>
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              style={{
                padding: "0 12px",
                height: "36px",
                fontSize: "12.5px",
                fontWeight: "600",
                borderRadius: "var(--radius-sm)",
                border: selectedCategory === "All" ? "1px solid var(--color-primary)" : "1px solid var(--border-color)",
                background: selectedCategory === "All" ? "var(--color-primary)" : "white",
                color: selectedCategory === "All" ? "white" : "var(--text-primary)",
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap"
              }}
            >
              Tất cả
            </button>

            {/* Display every individual Service Category */}
            {serviceCategories.map((catName) => {
              const filterValue = `Service:${catName}`;
              const isActive = selectedCategory === filterValue;
              return (
                <button
                  key={catName}
                  type="button"
                  onClick={() => setSelectedCategory(filterValue)}
                  style={{
                    padding: "0 12px",
                    height: "36px",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    borderRadius: "var(--radius-sm)",
                    border: isActive ? "1px solid var(--color-primary)" : "1px solid var(--border-color)",
                    background: isActive ? "var(--color-primary)" : "white",
                    color: isActive ? "white" : "var(--text-primary)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap"
                  }}
                >
                  {catName}
                </button>
              );
            })}

            {/* Display Product option */}
            <button
              type="button"
              onClick={() => setSelectedCategory("Product")}
              style={{
                padding: "0 12px",
                height: "36px",
                fontSize: "12.5px",
                fontWeight: "600",
                borderRadius: "var(--radius-sm)",
                border: selectedCategory === "Product" ? "1px solid var(--color-primary)" : "1px solid var(--border-color)",
                background: selectedCategory === "Product" ? "var(--color-primary)" : "white",
                color: selectedCategory === "Product" ? "white" : "var(--text-primary)",
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap"
              }}
            >
              Sản phẩm
            </button>

            {/* Display Package option */}
            <button
              type="button"
              onClick={() => setSelectedCategory("Package")}
              style={{
                padding: "0 12px",
                height: "36px",
                fontSize: "12.5px",
                fontWeight: "600",
                borderRadius: "var(--radius-sm)",
                border: selectedCategory === "Package" ? "1px solid var(--color-primary)" : "1px solid var(--border-color)",
                background: selectedCategory === "Package" ? "var(--color-primary)" : "white",
                color: selectedCategory === "Package" ? "white" : "var(--text-primary)",
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap"
              }}
            >
              Gói dịch vụ
            </button>
          </div>
        </div>
      </div>

      {/* Main Items Listing: Services, Products, Packages */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto", flex: 1, paddingRight: "8px" }}>

        {/* 1. SERVICES SECTION (Primary/blue layout) */}
        {(selectedCategory === "All" || selectedCategory.startsWith("Service:")) && filteredServices.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "var(--color-primary)", padding: "4px 10px", borderRadius: "6px", background: "var(--color-primary-light)" }}>
                Dịch vụ Salon
              </span>
              <div style={{ flexGrow: 1, height: "1px", background: "linear-gradient(to right, var(--color-primary-light), transparent)" }}></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
              {filteredServices.map((item) => {
                const catName = item.category?.name || "Dịch vụ";
                const catColor = getServiceCategoryColor(catName, item.category?.color);

                // Determine filter behavior
                if (selectedCategory !== "All" && selectedCategory !== `Service:${catName}`) {
                  return null;
                }

                return (
                  <div
                    key={item.id}
                    className="card"
                    onClick={() => addToCart(item, "SERVICE")}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      removeFromCart(item.id);
                    }}
                    style={{
                      position: "relative",
                      padding: "12px 14px",
                      background: "transparent",
                      border: `1px solid ${catColor.text}`,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: "80px",
                      cursor: "pointer",
                      transition: "transform 0.15s, box-shadow 0.15s",
                      overflow: "hidden"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Absolute Top-Right Badge Corner */}
                    <div style={{ position: "absolute", top: "4px", right: "4px", display: "flex", gap: "4px", zIndex: 10 }}>
                      {renderItemCartBadges(item.id)}
                    </div>

                    <div>
                      <h4
                        title={item.name}
                        style={{
                          fontWeight: "700",
                          fontSize: "13.5px",
                          color: catColor.text,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          width: "100%",
                          marginBottom: "4px"
                        }}
                      >
                        {item.name}
                      </h4>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                      <span style={{ fontWeight: "600", fontSize: "14px" }}>
                        {formatCurrencyVND(item.price)}
                      </span>
                      {item.duration && (
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                          ⏱️ {item.duration}p
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. PRODUCTS SECTION (Wood brown layout) */}
        {(selectedCategory === "All" || selectedCategory === "Product") && filteredProducts.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#8a5a22", padding: "4px 10px", borderRadius: "6px", background: "#fcf8f2" }}>
                Sản phẩm
              </span>
              <div style={{ flexGrow: 1, height: "1px", background: "linear-gradient(to right, #ebdcc5, transparent)" }}></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
              {filteredProducts.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  onClick={() => addToCart(item, "PRODUCT")}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    removeFromCart(item.id);
                  }}
                  style={{
                    position: "relative",
                    padding: "12px 14px",
                    background: "transparent",
                    border: "1px solid #8a5a22",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "80px",
                    cursor: "pointer",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Absolute Top-Right Badge Corner */}
                  <div style={{ position: "absolute", top: "4px", right: "4px", display: "flex", gap: "4px", zIndex: 10 }}>
                    {renderItemCartBadges(item.id)}
                  </div>

                  <div>
                    <h4
                      title={item.name}
                      style={{
                        fontWeight: "700",
                        fontSize: "13.5px",
                        color: "#8a5a22",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%",
                        paddingRight: "28px",
                        marginBottom: "4px"
                      }}
                    >
                      {item.name}
                    </h4>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                    <span style={{ fontWeight: "800", fontSize: "14px", color: "#8a5a22" }}>
                      {formatCurrencyVND(item.sellPrice)}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                      Kho: {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. PACKAGES SECTION (Purple layout) */}
        {(selectedCategory === "All" || selectedCategory === "Package") && filteredPackages.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#7e22ce", padding: "4px 10px", borderRadius: "6px", background: "#faf0fc" }}>
                Gói dịch vụ
              </span>
              <div style={{ flexGrow: 1, height: "1px", background: "linear-gradient(to right, #eed0fc, transparent)" }}></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
              {filteredPackages.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  onClick={() => addToCart(item, "PACKAGE")}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    removeFromCart(item.id);
                  }}
                  style={{
                    position: "relative",
                    padding: "12px 14px",
                    background: "transparent",
                    border: "1px solid #6b21a8",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "80px",
                    cursor: "pointer",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Absolute Top-Right Badge Corner */}
                  <div style={{ position: "absolute", top: "4px", right: "4px", display: "flex", gap: "4px", zIndex: 10 }}>
                    {renderItemCartBadges(item.id)}
                  </div>

                  <div>
                    <h4
                      title={item.name}
                      style={{
                        fontWeight: "700",
                        fontSize: "13.5px",
                        color: "#6b21a8",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%",
                        paddingRight: "28px",
                        marginBottom: "4px"
                      }}
                    >
                      {item.name}
                    </h4>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                    <span style={{ fontWeight: "800", fontSize: "14px", color: "#6b21a8" }}>
                      {formatCurrencyVND(item.price)}
                    </span>
                    {item.duration && (
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                        ⏱️ {item.duration}p
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
