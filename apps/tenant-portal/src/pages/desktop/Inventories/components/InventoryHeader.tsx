import React from "react";
import { AlertTriangle, Search, Plus } from "lucide-react";

import { Input } from "../../../../components/desktop/ui/Input";
import { ExportButton } from "../../../../components/desktop/ExportButton";
import { ImportButton } from "../../../../components/desktop/ImportButton";
import { ExportColumnMapping } from "../../../../utils/exportData";
import { InventoryItem } from "../types";

import styles from "../Inventories.module.css";

interface InventoryHeaderProps {
  showLowStockOnly: boolean;
  setShowLowStockOnly: (val: boolean) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onOpenCreateModal: () => void;
  onOpenImportModal: () => void;
  filteredItems: InventoryItem[];
  exportColumns: ExportColumnMapping[];
  canManage: boolean;
}

export const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  showLowStockOnly,
  setShowLowStockOnly,
  searchTerm,
  setSearchTerm,
  onOpenCreateModal,
  onOpenImportModal,
  filteredItems,
  exportColumns,
  canManage,
}) => {
  return (
    <div className={`card ${styles.headerCard}`}>
      {/* Left side: Search & Filter */}
      <div className={styles.filtersLeft}>
        <Input
          icon={<Search size={16} />}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "280px" }}
        />

        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={showLowStockOnly}
            onChange={(e) => setShowLowStockOnly(e.target.checked)}
            className={styles.toggleCheckbox}
          />
          <span
            className={styles.toggleText}
            style={{ color: showLowStockOnly ? "var(--color-danger)" : "inherit" }}
          >
            {showLowStockOnly && <AlertTriangle size={16} />}
            Sản phẩm sắp hết hàng (&lt; 5)
          </span>
        </label>
      </div>

      {/* Right side: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        {canManage && (
          <ImportButton onClick={onOpenImportModal} />
        )}

        <ExportButton
          data={filteredItems}
          fileName="danh_sach_kho_hang"
          columns={exportColumns}
        />

        {canManage && (
          <button
            className={`btn btn-primary ${styles.addButton}`}
            onClick={onOpenCreateModal}
          >
            <Plus size={18} /> Nhập sản phẩm mới
          </button>
        )}
      </div>
    </div>
  );
};

