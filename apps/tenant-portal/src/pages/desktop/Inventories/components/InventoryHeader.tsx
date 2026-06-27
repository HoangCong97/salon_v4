import React from "react";
import { AlertTriangle, Search, Plus } from "lucide-react";

interface InventoryHeaderProps {
  showLowStockOnly: boolean;
  setShowLowStockOnly: (val: boolean) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onOpenCreateModal: () => void;
}

export const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  showLowStockOnly,
  setShowLowStockOnly,
  searchTerm,
  setSearchTerm,
  onOpenCreateModal,
}) => {
  return (
    <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between", padding: "16px" }}>
      {/* Toggle Option */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "600", color: "var(--text-primary)" }}>
          <input
            type="checkbox"
            checked={showLowStockOnly}
            onChange={(e) => setShowLowStockOnly(e.target.checked)}
            style={{
              width: "16px",
              height: "16px",
              cursor: "pointer"
            }}
          />
          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: showLowStockOnly ? "var(--color-danger)" : "inherit" }}>
            {showLowStockOnly && <AlertTriangle size={16} />}
            Sản phẩm sắp hết hàng (&lt; 5)
          </span>
        </label>
      </div>

      {/* Search & Actions */}
      <div style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        width: "100%",
        maxWidth: "520px",
        marginLeft: "auto"
      }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "320px", flexShrink: 1, minWidth: "160px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="form-input"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "36px" }}
          />
        </div>
        <button className="btn btn-primary" onClick={onOpenCreateModal} style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", flexShrink: 0 }}>
          <Plus size={18} /> Nhập sản phẩm mới
        </button>
      </div>
    </div>
  );
};
