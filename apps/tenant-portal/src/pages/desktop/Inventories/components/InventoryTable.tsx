import React from "react";
import { AlertTriangle, Edit2, Trash2 } from "lucide-react";
import { ExcelInput } from "../../../../components/desktop/TableComponents";
import { Tooltip } from "../../../../components/desktop/Tooltip";
import { InventoryItem } from "../types";

interface InventoryTableProps {
  filteredItems: InventoryItem[];
  getInlineValue: (item: InventoryItem, field: keyof InventoryItem) => any;
  handleInlineChange: (itemId: string, field: keyof InventoryItem, value: any) => void;
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
    <div className="data-table-container" style={{ overflow: "visible" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ padding: "6px 10px", fontSize: "13px" }}>Tên sản phẩm</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "160px", textAlign: "center" }}>Giá vốn (giá nhập)</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "160px", textAlign: "center" }}>Giá bán lẻ</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "120px", textAlign: "center" }}>Tồn kho</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "140px" }}>Trạng thái</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "160px", textAlign: "center" }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => {
            const isLowStock = item.quantity < 5;
            const isOutOfStock = item.quantity === 0;

            return (
              <tr key={item.id}>
                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                  <ExcelInput
                    value={getInlineValue(item, "name") as string}
                    onChange={(val: string) => handleInlineChange(item.id, "name", val)}
                    onBlur={() => handleAutoSave(item.id, { name: getInlineValue(item, "name") as string })}
                    fontWeight="600"
                  />
                </td>
                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                  <ExcelInput
                    value={formatNumber(getInlineValue(item, "costPrice") as number | string)}
                    onChange={(val: string) => handlePriceChange(item.id, "costPrice", val)}
                    onBlur={() => handleAutoSave(item.id, { costPrice: getInlineValue(item, "costPrice") as number })}
                    textAlign="center"
                    fontWeight="500"
                    unit="đ"
                  />
                </td>
                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                  <ExcelInput
                    value={formatNumber(getInlineValue(item, "sellPrice") as number | string)}
                    onChange={(val: string) => handlePriceChange(item.id, "sellPrice", val)}
                    onBlur={() => handleAutoSave(item.id, { sellPrice: getInlineValue(item, "sellPrice") as number })}
                    textAlign="center"
                    fontWeight="500"
                    unit="đ"
                  />
                </td>
                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
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
                <td style={{ padding: "0 10px", verticalAlign: "middle", height: "38px" }}>
                  {isOutOfStock ? (
                    <span className="badge badge-danger">Hết hàng</span>
                  ) : isLowStock ? (
                    <span className="badge badge-warning" style={{ gap: "4px" }}>
                      <AlertTriangle size={12} /> Sắp hết hàng
                    </span>
                  ) : (
                    <span className="badge badge-success">Còn hàng</span>
                  )}
                </td>
                <td style={{ padding: "0 8px", verticalAlign: "middle", textAlign: "center", height: "38px" }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                    <Tooltip content="Nhập / Xuất kho">
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "var(--radius-sm)" }}
                        onClick={() => onOpenAdjustModal(item)}
                      >
                        Nhập/Xuất
                      </button>
                    </Tooltip>
                    <Tooltip content="Chỉnh sửa chi tiết">
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}
                        onClick={() => onOpenEditModal(item)}
                      >
                        <Edit2 size={13} />
                      </button>
                    </Tooltip>
                    <Tooltip content="Xóa sản phẩm">
                      <button
                        className="btn btn-danger"
                        style={{ padding: "4px 8px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}
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
