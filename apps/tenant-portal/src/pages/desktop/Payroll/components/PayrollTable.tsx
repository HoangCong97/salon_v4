import React from "react";

import { ExcelInput, ExcelRow } from "../../../../components/desktop/TableComponents";

import { PayrollMember } from "../types";

import styles from "../Payroll.module.css";

interface PayrollTableProps {
  filteredPayrolls: PayrollMember[];
  getInlineValue: (item: PayrollMember, field: keyof PayrollMember) => any;
  handleNumericChange: (payrollId: string, field: keyof PayrollMember, valStr: string) => void;
  handleAutoSave: (payrollId: string, updatedFields: Partial<PayrollMember>) => Promise<void>;
  formatMoney: (val: number | string | undefined | null) => string;
  getInitials: (name: string) => string;
  canManage: boolean;
  handleMarkPaid: (id: string) => void;
}

export const PayrollTable: React.FC<PayrollTableProps> = ({
  filteredPayrolls,
  getInlineValue,
  handleNumericChange,
  handleAutoSave,
  formatMoney,
  getInitials,
  canManage,
  handleMarkPaid,
}) => {
  return (
    <div className={`card ${styles.tableCard}`}>
      <div className={`data-table-container ${styles.tableContainer}`}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "200px" }}>Nhân viên</th>
              <th style={{ width: "130px", textAlign: "right" }}>Lương cơ bản</th>
              <th style={{ width: "120px", textAlign: "right" }}>Phụ cấp</th>
              <th style={{ width: "120px", textAlign: "right" }}>Hoa hồng</th>
              <th style={{ width: "120px", textAlign: "right" }}>Tiền Tip</th>
              <th style={{ width: "120px", textAlign: "right" }}>Khấu trừ</th>
              <th style={{ width: "140px", textAlign: "right", fontWeight: "bold" }}>Thực nhận</th>
              <th style={{ width: "140px", textAlign: "center" }}>Trạng thái</th>
              <th style={{ width: "140px" }}>Ngày chi trả</th>
              {canManage && <th style={{ width: "120px", textAlign: "center" }}>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {filteredPayrolls.map((item) => {
              const isPaid = getInlineValue(item, "status") === "PAID";
              const inlineAllowance = getInlineValue(item, "allowance") as number;
              const inlineTip = getInlineValue(item, "tipAmount") as number;
              const inlineDeduction = getInlineValue(item, "deductionAmount") as number;

              // Calculate finalSalary dynamically based on inline values
              const baseVal = Number(getInlineValue(item, "baseSalary"));
              const commVal = Number(getInlineValue(item, "commissionAmount"));
              const finalVal = baseVal + inlineAllowance + commVal + inlineTip - inlineDeduction;
              const displayFinal = finalVal > 0 ? finalVal : 0;

              return (
                <ExcelRow key={item.id}>
                  {/* Name Card */}
                  <td className={styles.td}>
                    <div className={styles.staffCell}>
                      {item.staff.avatar ? (
                        <img
                          src={item.staff.avatar}
                          alt={item.staff.name}
                          className={styles.avatar}
                        />
                      ) : (
                        <div className={styles.avatarFallback}>
                          <span className={styles.avatarFallbackText}>
                            {getInitials(item.staff.name)}
                          </span>
                        </div>
                      )}
                      <div className={styles.detailsWrapper}>
                        <span className={styles.staffName}>
                          {item.staff.name}
                        </span>
                        <span className={styles.staffRole}>
                          {item.staff.phone || item.staff.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Base Salary */}
                  <td className={styles.tdRight}>
                    <div className={styles.moneyText}>
                      {formatMoney(getInlineValue(item, "baseSalary") as number)}đ
                    </div>
                  </td>

                  {/* Allowance */}
                  <td className={styles.td}>
                    <ExcelInput
                      value={formatMoney(inlineAllowance)}
                      onChange={(val: string) => handleNumericChange(item.id, "allowance", val)}
                      onBlur={() => handleAutoSave(item.id, { allowance: inlineAllowance })}
                      textAlign="right"
                      fontWeight="500"
                      unit="đ"
                      disabled={isPaid || !canManage}
                    />
                  </td>

                  {/* Commissions */}
                  <td className={styles.tdRight}>
                    <div className={`${styles.moneyText} ${styles.moneyPrimary}`}>
                      +{formatMoney(getInlineValue(item, "commissionAmount") as number)}đ
                    </div>
                  </td>

                  {/* Tips */}
                  <td className={styles.td}>
                    <ExcelInput
                      value={formatMoney(inlineTip)}
                      onChange={(val: string) => handleNumericChange(item.id, "tipAmount", val)}
                      onBlur={() => handleAutoSave(item.id, { tipAmount: inlineTip })}
                      textAlign="right"
                      fontWeight="500"
                      unit="đ"
                      disabled={isPaid || !canManage}
                    />
                  </td>

                  {/* Deductions */}
                  <td className={styles.td}>
                    <ExcelInput
                      value={formatMoney(inlineDeduction)}
                      onChange={(val: string) => handleNumericChange(item.id, "deductionAmount", val)}
                      onBlur={() => handleAutoSave(item.id, { deductionAmount: inlineDeduction })}
                      textAlign="right"
                      fontWeight="500"
                      unit="đ"
                      textColor="var(--color-danger)"
                      disabled={isPaid || !canManage}
                    />
                  </td>

                  {/* Final Salary */}
                  <td className={styles.tdRight}>
                    <div className={`${styles.moneyText} ${styles.moneyTextBold}`} style={{ color: displayFinal > 0 ? "var(--color-success)" : "var(--text-primary)" }}>
                      {formatMoney(displayFinal)}đ
                    </div>
                  </td>

                  {/* Status */}
                  <td className={styles.statusTd}>
                    <span
                      className={`badge ${isPaid ? "badge-success" : "badge-warning"} ${styles.statusBadge}`}
                    >
                      {isPaid ? "Đã thanh toán" : "Bản nháp"}
                    </span>
                  </td>

                  {/* Paid date */}
                  <td className={styles.payDateTd}>
                    {item.paidAt ? new Date(item.paidAt).toLocaleDateString("vi-VN") : "---"}
                  </td>

                  {/* Actions */}
                  {canManage && (
                    <td className={styles.actionTd}>
                      {!isPaid ? (
                        <button
                          className={`btn btn-secondary ${styles.paidBtn}`}
                          onClick={() => handleMarkPaid(item.id)}
                        >
                          Trả lương
                        </button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "500" }}>
                          Khóa chỉnh sửa
                        </span>
                      )}
                    </td>
                  )}
                </ExcelRow>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
