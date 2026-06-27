import React from "react";
import { ExcelInput, ExcelRow } from "../../../../components/desktop/TableComponents";
import { PayrollMember } from "../types";

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
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="data-table-container" style={{ border: "none", boxShadow: "none", borderRadius: 0 }}>
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
                  <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "10px", width: "100%", height: "100%" }}>
                      {item.staff.avatar ? (
                        <img
                          src={item.staff.avatar}
                          alt={item.staff.name}
                          style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            backgroundColor: "hsl(210, 40%, 90%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}
                        >
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary)" }}>
                            {getInitials(item.staff.name)}
                          </span>
                        </div>
                      )}
                      <div style={{ flexGrow: 1, minWidth: 0, paddingRight: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "600", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.staff.name}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.staff.phone || item.staff.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Base Salary */}
                  <td style={{ padding: 0, verticalAlign: "middle", height: "38px", textAlign: "right" }}>
                    <div style={{ paddingRight: "10px", fontWeight: "500" }}>
                      {formatMoney(getInlineValue(item, "baseSalary") as number)}đ
                    </div>
                  </td>

                  {/* Allowance */}
                  <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
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
                  <td style={{ padding: 0, verticalAlign: "middle", height: "38px", textAlign: "right" }}>
                    <div style={{ paddingRight: "10px", fontWeight: "500", color: "var(--color-primary)" }}>
                      +{formatMoney(getInlineValue(item, "commissionAmount") as number)}đ
                    </div>
                  </td>

                  {/* Tips */}
                  <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
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
                  <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
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
                  <td style={{ padding: 0, verticalAlign: "middle", height: "38px", textAlign: "right" }}>
                    <div style={{ paddingRight: "10px", fontWeight: "700", color: displayFinal > 0 ? "var(--color-success)" : "var(--text-primary)", fontSize: "13.5px" }}>
                      {formatMoney(displayFinal)}đ
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "3px 6px", verticalAlign: "middle", height: "38px", textAlign: "center" }}>
                    <span
                      className={`badge ${isPaid ? "badge-success" : "badge-warning"}`}
                      style={{ minWidth: "110px", justifyContent: "center" }}
                    >
                      {isPaid ? "Đã thanh toán" : "Bản nháp"}
                    </span>
                  </td>

                  {/* Paid date */}
                  <td style={{ padding: "0 10px", verticalAlign: "middle", height: "38px", color: "var(--text-secondary)", fontSize: "12px" }}>
                    {item.paidAt ? new Date(item.paidAt).toLocaleDateString("vi-VN") : "---"}
                  </td>

                  {/* Actions */}
                  {canManage && (
                    <td style={{ padding: "0 8px", verticalAlign: "middle", height: "38px", textAlign: "center" }}>
                      {!isPaid ? (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "4px 10px", fontSize: "11px", borderRadius: "var(--radius-sm)", borderColor: "var(--color-success)", color: "var(--color-success)", backgroundColor: "var(--color-success-light)" }}
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
