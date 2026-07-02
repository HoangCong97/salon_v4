import React from "react";
import { Edit2, Trash2 } from "lucide-react";

import { ExcelInput } from "../../../components/desktop/TableComponents";
import { Tooltip } from "../../../components/desktop/ui/Tooltip";
import { useAuthStore } from "../../../store/useAuthStore";

import { Customer } from "./types";

import styles from "./Customers.module.css";

interface CustomerTableProps {
  filteredCustomers: Customer[];
  inlineEdits: Record<string, Partial<Customer>>;
  handleInlineChange: (customerId: string, field: keyof Customer, value: string | number | undefined | null) => void;
  handleAutoSave: (customerId: string, updatedFields: Partial<Customer>) => Promise<void>;
  handleOpenEditModal: (customer: Customer) => void;
  handleDelete: (id: string) => Promise<void>;
  getInlineValue: (customer: Customer, field: keyof Customer) => string | number | undefined | null;
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
    <div className={`data-table-container ${styles.tableContainer}`}>
      <table className="data-table">
        <thead>
          <tr>
            <th className={styles.thDefault}>Họ tên</th>
            <th className={`${styles.thDefault} ${styles.thPhone}`}>Số điện thoại</th>
            <th className={`${styles.thDefault} ${styles.thEmail}`}>Email</th>
            <th className={`${styles.thDefault} ${styles.thScore}`}>Điểm uy tín</th>
            <th className={`${styles.thDefault} ${styles.thCreated}`}>Ngày tham gia</th>
            {canManage && <th className={`${styles.thDefault} ${styles.thActions}`}>Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.length === 0 ? (
            <tr>
              <td colSpan={canManage ? 6 : 5} className={styles.tdEmpty}>
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
                  <td className={styles.tdDefault}>
                    <ExcelInput
                      value={(getInlineValue(customer, "name") as string) || ""}
                      onChange={(val) => handleInlineChange(customer.id, "name", val)}
                      onBlur={() => handleAutoSave(customer.id, { name: getInlineValue(customer, "name") as string })}
                      fontWeight="600"
                      disabled={!canManage}
                    />
                  </td>
                  <td className={styles.tdDefault}>
                    <ExcelInput
                      value={(getInlineValue(customer, "phone") as string) || ""}
                      onChange={(val) => handleInlineChange(customer.id, "phone", val)}
                      onBlur={() => handleAutoSave(customer.id, { phone: getInlineValue(customer, "phone") as string })}
                      textAlign="center"
                      disabled={!canManage}
                    />
                  </td>
                  <td className={styles.tdDefault}>
                    <ExcelInput
                      value={(getInlineValue(customer, "email") as string) || ""}
                      onChange={(val) => handleInlineChange(customer.id, "email", val)}
                      onBlur={() => handleAutoSave(customer.id, { email: getInlineValue(customer, "email") as string })}
                      textAlign="center"
                      disabled={!canManage}
                    />
                  </td>
                  <td className={styles.tdDefault}>
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
                  <td className={`${styles.tdDefault} ${styles.tdCenteredText}`}>
                    {formatDateDMY(customer.createdAt)}
                  </td>
                  {canManage && (
                    <td className={styles.actionTd}>
                      <div className={styles.actionButtons}>
                        <Tooltip content="Chỉnh sửa chi tiết">
                          <button
                            className={`btn btn-secondary ${styles.actionBtn}`}
                            onClick={() => handleOpenEditModal(customer)}
                          >
                            <Edit2 size={12} />
                          </button>
                        </Tooltip>
                        <Tooltip content="Xóa khách hàng">
                          <button
                            className={`btn btn-danger ${styles.actionBtn}`}
                            onClick={() => handleDelete(customer.id)}
                          >
                            <Trash2 size={12} />
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

