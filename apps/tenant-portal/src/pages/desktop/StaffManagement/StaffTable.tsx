import React from "react";
import { Search, Plus, Users, Edit2, Trash2 } from "lucide-react";
import { ExcelInput, ExcelSelect } from "../../../components/desktop/TableComponents";
import { StaffMember, Role, getRoleColorStyle, getStatusColorStyle } from "./types";

interface StaffTableProps {
  filteredStaff: StaffMember[];
  roles: Role[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleOpenCreateModal: () => void;
  handleOpenEditModal: (item: StaffMember) => void;
  handleDeleteStaff: (id: string) => Promise<void>;
  inlineEdits: Record<string, Partial<StaffMember>>;
  handleInlineChange: (staffId: string, field: keyof StaffMember, value: any) => void;
  handleSalaryChange: (staffId: string, valStr: string) => void;
  handleAutoSave: (staffId: string, updatedFields: Partial<StaffMember>) => Promise<void>;
  getInlineValue: (item: StaffMember, field: keyof StaffMember) => any;
  formatNumber: (val: number | string | undefined | null) => string;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  filteredStaff,
  roles,
  searchTerm,
  setSearchTerm,
  handleOpenCreateModal,
  handleOpenEditModal,
  handleDeleteStaff,
  inlineEdits,
  handleInlineChange,
  handleSalaryChange,
  handleAutoSave,
  getInlineValue,
  formatNumber,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Search Bar & Action Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            className="form-input"
            type="text"
            placeholder="Tìm kiếm nhân viên (Tên, SĐT, Chức vụ)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "36px" }}
          />
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <Plus size={18} /> Thêm nhân viên mới
        </button>
      </div>

      {filteredStaff.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <Users size={48} style={{ color: "var(--text-muted)", marginBottom: "16px", marginInline: "auto" }} />
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Không tìm thấy nhân viên</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
            {searchTerm ? "Không tìm thấy kết quả phù hợp với từ khóa." : "Salon của bạn hiện chưa có nhân viên nào."}
          </p>
          {!searchTerm && (
            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={18} /> Thêm nhân viên ngay
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="data-table-container" style={{ border: "none", boxShadow: "none", borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding: "12px 16px", fontSize: "13px", width: "220px" }}>Họ tên nhân viên</th>
                  <th style={{ padding: "12px 16px", fontSize: "13px", width: "150px" }}>Số điện thoại</th>
                  <th style={{ padding: "12px 16px", fontSize: "13px", width: "200px" }}>Email</th>
                  <th style={{ padding: "12px 16px", fontSize: "13px", width: "150px" }}>Chức vụ</th>
                  <th style={{ padding: "12px 16px", fontSize: "13px", width: "150px", textAlign: "center" }}>Lương cơ bản</th>
                  <th style={{ padding: "12px 16px", fontSize: "13px", minWidth: "220px" }}>Chi nhánh hoạt động</th>
                  <th style={{ padding: "12px 16px", fontSize: "13px", width: "140px" }}>Trạng thái</th>
                  <th style={{ padding: "12px 16px", fontSize: "13px", width: "120px", textAlign: "center" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((item) => {
                  const inlineRoleVal = getInlineValue(item, "role") as { id: string; name: string } | null;
                  const inlineStatusVal = getInlineValue(item, "status") as string;

                  return (
                    <tr key={item.id}>
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          value={getInlineValue(item, "name") as string}
                          onChange={(val) => handleInlineChange(item.id, "name", val)}
                          onBlur={() => handleAutoSave(item.id, { name: getInlineValue(item, "name") as string })}
                          fontWeight="600"
                        />
                      </td>

                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          value={getInlineValue(item, "phone") as string}
                          onChange={(val) => handleInlineChange(item.id, "phone", val)}
                          onBlur={() => handleAutoSave(item.id, { phone: getInlineValue(item, "phone") as string })}
                        />
                      </td>

                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          value={getInlineValue(item, "email") as string}
                          onChange={(val) => handleInlineChange(item.id, "email", val)}
                          onBlur={() => handleAutoSave(item.id, { email: getInlineValue(item, "email") as string })}
                        />
                      </td>

                      <td style={{ padding: "3px 6px", verticalAlign: "middle", height: "38px" }}>
                        <ExcelSelect
                          value={inlineRoleVal ? inlineRoleVal.id : ""}
                          onChange={(newRoleId) => {
                            const foundRole = roles.find((r) => r.id === newRoleId);
                            const nextRoleObj = foundRole ? { id: foundRole.id, name: foundRole.name } : null;
                            handleInlineChange(item.id, "role", nextRoleObj);
                            handleAutoSave(item.id, { role: nextRoleObj });
                          }}
                          options={roles.map((r) => ({ value: r.id, label: r.name }))}
                          colorStyle={getRoleColorStyle(inlineRoleVal ? inlineRoleVal.name : "Employee")}
                          placeholder="-- Chọn vai trò --"
                        />
                      </td>

                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          value={formatNumber(getInlineValue(item, "baseSalary") as number | string)}
                          onChange={(val) => handleSalaryChange(item.id, val)}
                          onBlur={() => handleAutoSave(item.id, { baseSalary: getInlineValue(item, "baseSalary") as number })}
                          textAlign="center"
                          fontWeight="500"
                          unit="đ"
                        />
                      </td>

                      <td
                        style={{ padding: "0 16px", verticalAlign: "middle", height: "38px", cursor: "pointer" }}
                        onClick={() => handleOpenEditModal(item)}
                        title="Click để thay đổi chi nhánh hoạt động"
                      >
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                          {item.branches.length === 0 ? (
                            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
                              Chưa gán chi nhánh
                            </span>
                          ) : (
                            item.branches.map((b) => (
                              <span
                                key={b.id}
                                style={{
                                  fontSize: "11px",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  background: "#f1f5f9",
                                  color: "#475569",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                {b.name.replace(/HairStar|BarberShop| - Chi nhánh/g, "").trim()}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      <td style={{ padding: "3px 6px", verticalAlign: "middle", height: "38px" }}>
                        <ExcelSelect
                          value={inlineStatusVal}
                          onChange={(newStatus) => {
                            handleInlineChange(item.id, "status", newStatus);
                            handleAutoSave(item.id, { status: newStatus });
                          }}
                          options={[
                            { value: "ACTIVE", label: "Hoạt động" },
                            { value: "INACTIVE", label: "Tạm khóa" },
                          ]}
                          colorStyle={getStatusColorStyle(inlineStatusVal)}
                        />
                      </td>

                      <td style={{ padding: "0 8px", verticalAlign: "middle", height: "38px" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "var(--radius-sm)" }}
                            onClick={() => handleOpenEditModal(item)}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "var(--radius-sm)" }}
                            onClick={() => handleDeleteStaff(item.id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
