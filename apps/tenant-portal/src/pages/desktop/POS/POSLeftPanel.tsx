import React from "react";
import { Search, Users, Check } from "lucide-react";
import { formatCurrencyVND } from "@salon/shared-utils";

export const getEmployeeColor = (id: string) => {
  const colors = [
    { bg: "#fee2e2", border: "#fca5a5", text: "#991b1b" }, // Light Red
    { bg: "#fef3c7", border: "#fcd34d", text: "#92400e" }, // Amber/Yellow
    { bg: "#dcfce7", border: "#86efac", text: "#166534" }, // Light Green
    { bg: "#e0f2fe", border: "#7dd3fc", text: "#0369a1" }, // Sky Blue
    { bg: "#fae8ff", border: "#f5d0fe", text: "#86198f" }, // Purple
    { bg: "#e0e7ff", border: "#a5b4fc", text: "#3730a3" }, // Indigo
    { bg: "#ffedd5", border: "#fdbb2d", text: "#9a3412" }  // Orange
  ];
  let sum = 0;
  const safeId = id || "default";
  for (let i = 0; i < safeId.length; i++) {
    sum += safeId.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

const getServiceCategoryColor = (categoryName: string) => {
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
  cart,
  flashStaff = false,
}) => {
  // Helper UI: Render active cart assignment badges on item card
  const renderItemCartBadges = (itemId: string) => {
    const assignments = cart.filter(c => c.itemId === itemId);
    if (assignments.length === 0) return null;

    return (
      <div style={{ display: "flex", gap: "4px" }}>
        {assignments.map((asg) => {
          const staffMember = activeStaff.find(s => s.id === asg.staffId);
          const empColor = getEmployeeColor(asg.staffId);
          const staffName = staffMember ? staffMember.name.split("(")[0].trim() : "Nhân viên";
          return (
            <span
              key={asg.id}
              title={`${staffName}: ${asg.quantity}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "20px",
                height: "20px",
                fontSize: "11px",
                fontWeight: "800",
                borderRadius: "50%",
                background: empColor.bg,
                border: `1.5px solid ${empColor.border}`,
                color: empColor.text,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
              }}
            >
              {asg.quantity}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", paddingRight: "8px" }}>

      {/* Top Panel: Active Staff Members */}
      <div
        className="card"
        style={{
          padding: "16px",
          border: "1px solid var(--border-color)",
          borderColor: flashStaff ? "var(--color-danger)" : "var(--border-color)",
          animation: flashStaff ? "flash-red-border 0.4s infinite alternate" : "none",
          transition: "all 0.2s"
        }}
      >
        <style>{`
          @keyframes flash-red-border {
            0% { border-color: var(--color-danger); box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
            100% { border-color: var(--border-color); box-shadow: none; }
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}</style>
        <h4 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Users size={16} /> NHÂN VIÊN CHI NHÁNH (Chọn để gán lượt)
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
          {activeStaff.map((s) => {
            const isSelected = selectedStylistId === s.id;
            const empColor = getEmployeeColor(s.id);
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
                  border: isSelected ? `2px solid ${empColor.text}` : `2px solid ${empColor.border}`,
                  background: isSelected ? empColor.bg : "white",
                  color: empColor.text,
                  fontWeight: isSelected ? "700" : "500",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: isSelected ? `0 2px 8px ${empColor.border}` : "none"
                }}
              >
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: empColor.text,
                }}></div>
                {s.name.split("(")[0]}
                {isSelected && <Check size={12} />}
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
              Gói combo
            </button>
          </div>
        </div>
      </div>

      {/* Main Items Listing: Services, Products, Packages */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* 1. SERVICES SECTION (Primary/blue layout) */}
        {(selectedCategory === "All" || selectedCategory.startsWith("Service:")) && filteredServices.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "var(--color-primary)", padding: "4px 10px", borderRadius: "6px", background: "var(--color-primary-light)" }}>
                Dịch vụ Salon
              </span>
              <div style={{ flexGrow: 1, height: "1px", background: "linear-gradient(to right, var(--color-primary-light), transparent)" }}></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
              {filteredServices.map((item) => {
                const catName = item.category?.name || "Dịch vụ";
                const catColor = getServiceCategoryColor(catName);

                // Determine filter behavior
                if (selectedCategory !== "All" && selectedCategory !== `Service:${catName}`) {
                  return null;
                }

                return (
                  <div
                    key={item.id}
                    className="card"
                    onClick={() => addToCart(item, "SERVICE")}
                    style={{
                      position: "relative",
                      padding: "12px 14px",
                      background: catColor.bg,
                      border: `1.5px solid ${catColor.border}`,
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
                          paddingRight: "28px",
                          marginBottom: "4px"
                        }}
                      >
                        {item.name}
                      </h4>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                      <span style={{ fontWeight: "800", fontSize: "14px", color: catColor.text }}>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
              {filteredProducts.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  onClick={() => addToCart(item, "PRODUCT")}
                  style={{
                    position: "relative",
                    padding: "12px 14px",
                    background: "#faf6f0",
                    border: "1.5px solid #ebdcc5",
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
                Gói combo
              </span>
              <div style={{ flexGrow: 1, height: "1px", background: "linear-gradient(to right, #eed0fc, transparent)" }}></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
              {filteredPackages.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  onClick={() => addToCart(item, "PACKAGE")}
                  style={{
                    position: "relative",
                    padding: "12px 14px",
                    background: "#faf5ff",
                    border: "1.5px solid #eed0fc",
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
