import React from "react";
import { AlertTriangle, Edit2, Trash2 } from "lucide-react";
import { ExcelInput } from "../../../../components/desktop/TableComponents";
import { Tooltip } from "../../../../components/desktop/ui/Tooltip";
import { InventoryItem } from "../types";
import styles from "../Inventories.module.css";

interface InventoryTableProps {
  filteredItems: InventoryItem[];
  getInlineValue: (item: InventoryItem, field: keyof InventoryItem) => string | number | undefined | null;
  handleInlineChange: (itemId: string, field: keyof InventoryItem, value: string | number | undefined | null) => void;
  handlePriceChange: (itemId: string, field: "costPrice" | "sellPrice" | "quantity", valStr: string) => void;
  handleAutoSave: (itemId: string, updatedFields: Partial<InventoryItem>) => Promise<void>;
  formatNumber: (val: number | string | undefined | null) => string;
  onOpenAdjustModal: (item: InventoryItem) => void;
  onOpenEditModal: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  filteredItems,
  getInlineValue,
  handleInlineChange,
  handlePriceChange,
  handleAutoSave,
  formatNumber,
  onOpenAdjustModal,
  onOpenEditModal,
  onDelete,
}) => {
  return (
    <div className={`data-table-container ${styles.tableContainer}`}>
      <table className="data-table">
        <thead>
          <tr>
            <th className={styles.thDefault}>Tên sản phẩm</th>
            <th className={`${styles.thDefault} ${styles.thCostPrice}`}>Giá vốn (giá nhập)</th>
            <th className={`${styles.thDefault} ${styles.thSellPrice}`}>Giá bán lẻ</th>
            <th className={`${styles.thDefault} ${styles.thQty}`}>Tồn kho</th>
            <th className={`${styles.thDefault} ${styles.thStatus}`}>Trạng thái</th>
            <th className={`${styles.thDefault} ${styles.thAction}`}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => {
            const isLowStock = item.quantity < 5;
            const isOutOfStock = item.quantity === 0;

            return (
              <tr key={item.id}>
                <td className={styles.tdDefault}>
                  <ExcelInput
                    value={getInlineValue(item, "name") as string}
                    onChange={(val: string) => handleInlineChange(item.id, "name", val)}
                    onBlur={() => handleAutoSave(item.id, { name: getInlineValue(item, "name") as string })}
                    fontWeight="600"
                  />
                </td>
                <td className={styles.tdDefault}>
                  <ExcelInput
                    value={formatNumber(getInlineValue(item, "costPrice") as number | string)}
                    onChange={(val: string) => handlePriceChange(item.id, "costPrice", val)}
                    onBlur={() => handleAutoSave(item.id, { costPrice: getInlineValue(item, "costPrice") as number })}
                    textAlign="center"
                    fontWeight="500"
                    unit="đ"
                  />
                </td>
                <td className={styles.tdDefault}>
                  <ExcelInput
                    value={formatNumber(getInlineValue(item, "sellPrice") as number | string)}
                    onChange={(val: string) => handlePriceChange(item.id, "sellPrice", val)}
                    onBlur={() => handleAutoSave(item.id, { sellPrice: getInlineValue(item, "sellPrice") as number })}
                    textAlign="center"
                    fontWeight="500"
                    unit="đ"
                  />
                </td>
                <td className={styles.tdDefault}>
                  <ExcelInput
                    type="number"
                    value={getInlineValue(item, "quantity") as number || 0}
                    onChange={(val: string) => handleInlineChange(item.id, "quantity", parseInt(val) || 0)}
                    onBlur={() => handleAutoSave(item.id, { quantity: getInlineValue(item, "quantity") as number })}
                    textAlign="center"
                    fontWeight="600"
                    textColor={isOutOfStock ? "var(--color-danger)" : isLowStock ? "var(--color-warning)" : "inherit"}
                  />
                </td>
                <td className={styles.tdStatus}>
                  {isOutOfStock ? (
                    <span className="badge badge-danger">Hết hàng</span>
                  ) : isLowStock ? (
                    <span className={`badge badge-warning ${styles.badgeLowStock}`}>
                      <AlertTriangle size={12} /> Sắp hết hàng
                    </span>
                  ) : (
                    <span className="badge badge-success">Còn hàng</span>
                  )}
                </td>
                <td className={styles.tdAction}>
                  <div className={styles.btnWrapper}>
                    <Tooltip content="Nhập / Xuất kho">
                      <button
                        className={`btn btn-secondary ${styles.btnAdjust}`}
                        onClick={() => onOpenAdjustModal(item)}
                      >
                        Nhập/Xuất
                      </button>
                    </Tooltip>
                    <Tooltip content="Chỉnh sửa chi tiết">
                      <button
                        className={`btn btn-secondary ${styles.btnIcon}`}
                        onClick={() => onOpenEditModal(item)}
                      >
                        <Edit2 size={13} />
                      </button>
                    </Tooltip>
                    <Tooltip content="Xóa sản phẩm">
                      <button
                        className={`btn btn-danger ${styles.btnIcon}`}
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

