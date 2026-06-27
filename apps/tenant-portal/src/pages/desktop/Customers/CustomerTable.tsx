import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import { ExcelInput } from "../../../components/desktop/TableComponents";
import { Tooltip } from "../../../components/desktop/Tooltip";
import { Customer } from "./types";
import { useAuthStore } from "../../../store/useAuthStore";

interface CustomerTableProps {
  filteredCustomers: Customer[];
  inlineEdits: Record<string, Partial<Customer>>;
  handleInlineChange: (customerId: string, field: keyof Customer, value: any) => void;
  handleAutoSave: (customerId: string, updatedFields: Partial<Customer>) => Promise<void>;
  handleOpenEditModal: (customer: Customer) => void;
  handleDelete: (id: string) => Promise<void>;
  getInlineValue: (customer: Customer, field: keyof Customer) => any;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  filteredCustomers,
  inlineEdits,
  handleInlineChange,
  handleAutoSave,
  handleOpenEditModal,
  handleDelete,
  getInlineValue,
}) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canManage = hasPermission("customer.manage");

  const formatDateDMY = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="data-table-container" style={{ overflow: "visible" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ padding: "6px 10px", fontSize: "13px" }}>Họ tên</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "200px", textAlign: "center" }}>Số điện thoại</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "250px", textAlign: "center" }}>Email</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "150px", textAlign: "center" }}>Điểm uy tín</th>
            <th style={{ padding: "6px 10px", fontSize: "13px", width: "150px", textAlign: "center" }}>Ngày tham gia</th>
            {canManage && <th style={{ padding: "6px 10px", fontSize: "13px", width: "120px", textAlign: "center" }}>Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.length === 0 ? (
            <tr>
              <td colSpan={canManage ? 6 : 5} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontWeight: "500" }}>
                Không tìm thấy khách hàng nào phù hợp.
              </td>
            </tr>
          ) : (
            filteredCustomers.map((customer) => {
              const currentScore = getInlineValue(customer, "credibilityScore") ?? 100;
              
              // Helper to style credibility score colors based on value
              const getScoreColor = (score: number) => {
                if (score >= 80) return "var(--color-success)";
                if (score >= 50) return "var(--color-warning)";
                return "var(--color-danger)";
              };

              return (
                <tr key={customer.id}>
                  <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                    <ExcelInput
                      value={getInlineValue(customer, "name") as string || ""}
                      onChange={(val) => handleInlineChange(customer.id, "name", val)}
                      onBlur={() => handleAutoSave(customer.id, { name: getInlineValue(customer, "name") as string })}
                      fontWeight="600"
                      disabled={!canManage}
                    />
                  </td>
                  <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                    <ExcelInput
                      value={getInlineValue(customer, "phone") as string || ""}
                      onChange={(val) => handleInlineChange(customer.id, "phone", val)}
                      onBlur={() => handleAutoSave(customer.id, { phone: getInlineValue(customer, "phone") as string })}
                      textAlign="center"
                      disabled={!canManage}
                    />
                  </td>
                  <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                    <ExcelInput
                      value={getInlineValue(customer, "email") as string || ""}
                      onChange={(val) => handleInlineChange(customer.id, "email", val)}
                      onBlur={() => handleAutoSave(customer.id, { email: getInlineValue(customer, "email") as string })}
                      textAlign="center"
                      disabled={!canManage}
                    />
                  </td>
                  <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                    <ExcelInput
                      type="number"
                      value={currentScore}
                      onChange={(val) => handleInlineChange(customer.id, "credibilityScore", parseInt(val) || 0)}
                      onBlur={() => handleAutoSave(customer.id, { credibilityScore: getInlineValue(customer, "credibilityScore") as number })}
                      textAlign="center"
                      textColor={getScoreColor(Number(currentScore))}
                      fontWeight="700"
                      unit="/100"
                      disabled={!canManage}
                    />
                  </td>
                  <td style={{ textAlign: "center", fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>
                    {formatDateDMY(customer.createdAt)}
                  </td>
                  {canManage && (
                    <td style={{ padding: "0 8px", verticalAlign: "middle", textAlign: "center", height: "38px" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                        <Tooltip content="Chỉnh sửa chi tiết">
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "4px 8px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={() => handleOpenEditModal(customer)}
                          >
                            <Edit2 size={13} />
                          </button>
                        </Tooltip>
                        <Tooltip content="Xóa khách hàng">
                          <button
                            className="btn btn-danger"
                            style={{ padding: "4px 8px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={() => handleDelete(customer.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
