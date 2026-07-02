import React from "react";
import { AlertTriangle, Search, Plus } from "lucide-react";

import styles from "../Inventories.module.css";

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
    <div className={`card ${styles.headerCard}`}>
      {/* Toggle Option */}
      <div className={styles.toggleWrapper}>
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

      {/* Search & Actions */}
      <div className={styles.actionsWrapper}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={`form-input ${styles.searchInput}`}
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className={`btn btn-primary ${styles.addButton}`}
          onClick={onOpenCreateModal}
        >
          <Plus size={18} /> Nhập sản phẩm mới
        </button>
      </div>
    </div>
  );
};

