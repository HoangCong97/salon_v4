import React from "react";
import { Search, Plus, Users, Edit2, Trash2, Upload, Download } from "lucide-react";
import { ExcelInput, ExcelSelect, ExcelMultipleSelect, ExcelRow } from "../../../components/desktop/TableComponents";
import { StaffMember, Role, Branch, getRoleColorStyle, getStatusColorStyle } from "./types";
import { useAuthStore } from "../../../store/useAuthStore";
import { ExportButton } from "../../../components/desktop/ExportButton";
import { ExportColumnMapping } from "../../../utils/exportData";

interface StaffTableProps {
  filteredStaff: StaffMember[];
  roles: Role[];
  branches: Branch[];
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
  adminUserId?: string;
  handleOpenImportModal: () => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  filteredStaff,
  roles,
  branches,
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
  adminUserId,
  handleOpenImportModal,
}) => {
  const currentUser = useAuthStore((state) => state.user);
  const currentTenantId = useAuthStore((state) => state.currentTenantId);

  const staffExportColumns = React.useMemo<ExportColumnMapping[]>(() => [
    { key: "name", header: "Họ tên nhân viên" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Số điện thoại" },
    { key: "sex", header: "Giới tính" },
    { key: "baseSalary", header: "Lương cơ bản (VND)", transform: (val) => Number(val) },
    { key: "role", header: "Chức vụ", transform: (val) => val ? val.name : "" },
    { key: "branches", header: "Chi nhánh hoạt động", transform: (val) => Array.isArray(val) ? val.map((b: any) => b.name).join(", ") : "" },
    { key: "status", header: "Trạng thái", transform: (val) => val === "ACTIVE" ? "Đang hoạt động" : "Ngưng hoạt động" },
    { key: "note", header: "Ghi chú" }
  ], []);

  const handleImageDrop = async (itemId: string, file: File) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: base64Data,
            category: "staff",
            filename: file.name
          })
        });

        if (!res.ok) {
          throw new Error("Lỗi khi tải ảnh lên máy chủ");
        }

        const data = await res.json();
        const imageUrl = data.url;

        handleInlineChange(itemId, "avatar", imageUrl);
        await handleAutoSave(itemId, { avatar: imageUrl });
      };
    } catch (err: any) {
      alert("Lỗi tải ảnh kéo thả: " + err.message);
    }
  };

  const getInitialsOfLastWord = (name: string): string => {
    if (!name || !name.trim()) return "?";
    const words = name.trim().split(/\s+/);
    const lastWord = words[words.length - 1];
    return lastWord ? lastWord.charAt(0).toUpperCase() : "?";
  };

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
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            className="btn btn-secondary"
            onClick={handleOpenImportModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
              borderColor: "hsl(142, 76%, 36%)",
              color: "hsl(142, 76%, 36%)",
              backgroundColor: "hsl(142, 76%, 97%)",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "hsl(142, 76%, 92%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "hsl(142, 76%, 97%)";
            }}
          >
            <Download size={16} /> Nhập dữ liệu
          </button>

          <ExportButton
            data={filteredStaff}
            fileName="danh_sach_nhan_vien"
            columns={staffExportColumns}
          />

          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={18} /> Thêm nhân viên mới
          </button>
        </div>
      </div>

      {filteredStaff.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <Users size={48} style={{ color: "var(--text-muted)", marginBottom: "16px", marginInline: "auto" }} />
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Không tìm thấy nhân viên</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
            {searchTerm ? "Không tìm thấy kết quả phù hợp với từ khóa." : "Salon của bạn hiện chưa có nhân viên nào."}
          </p>
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
                  <th style={{ padding: "12px 16px", fontSize: "13px", width: "150px" }}>Mật khẩu</th>
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
                  const inlineBranchesVal = getInlineValue(item, "branches") as Branch[] || [];
                  const selectedBranchIds = inlineBranchesVal.map((b) => b.id);

                  const isAdminRow = item.isAdmin || item.id === adminUserId;
                  const isSelf = item.id === currentUser?.id;
                  const isSelfAdmin = isAdminRow && isSelf;

                  const filteredRoles = roles.filter(
                    (r) => isAdminRow || r.name.toUpperCase() !== "ADMIN"
                  );

                  const handleBranchChange = (newBranchIds: string[]) => {
                    const newBranchesObj = newBranchIds
                      .map((id) => {
                        const b = branches.find((br) => br.id === id);
                        return b ? { id: b.id, name: b.name } : null;
                      })
                      .filter(Boolean) as Branch[];

                    handleInlineChange(item.id, "branches", newBranchesObj);
                    handleAutoSave(item.id, { branches: newBranchesObj });
                  };

                  return (
                    <ExcelRow
                      key={item.id}
                      onImageDrop={(file) => handleImageDrop(item.id, file)}
                    >
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "10px", width: "100%", height: "100%" }}>
                          {item.avatar ? (
                            <img
                              src={item.avatar}
                              alt={item.name}
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
                                {getInitialsOfLastWord(item.name)}
                              </span>
                            </div>
                          )}
                          <div style={{ flexGrow: 1, minWidth: 0, height: "100%" }}>
                            <ExcelInput
                              value={getInlineValue(item, "name") as string}
                              onChange={(val) => handleInlineChange(item.id, "name", val)}
                              onBlur={() => handleAutoSave(item.id, { name: getInlineValue(item, "name") as string })}
                              fontWeight="600"
                            />
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          value={getInlineValue(item, "phone") as string}
                          onChange={(val) => handleInlineChange(item.id, "phone", val)}
                          onBlur={() => handleAutoSave(item.id, { phone: getInlineValue(item, "phone") as string })}
                          disabled={isSelfAdmin}
                        />
                      </td>

                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          value={getInlineValue(item, "email") as string}
                          onChange={(val) => handleInlineChange(item.id, "email", val)}
                          onBlur={() => handleAutoSave(item.id, { email: getInlineValue(item, "email") as string })}
                          disabled={isSelfAdmin}
                        />
                      </td>

                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          type="password"
                          value={getInlineValue(item, "password") as string || ""}
                          onChange={(val) => handleInlineChange(item.id, "password", val)}
                          onBlur={() => handleAutoSave(item.id, { password: getInlineValue(item, "password") as string })}
                          disabled={isSelfAdmin}
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
                          options={filteredRoles.map((r) => ({ value: r.id, label: r.name, colorStyle: getRoleColorStyle(r.name) }))}
                          colorStyle={getRoleColorStyle(inlineRoleVal ? inlineRoleVal.name : "Employee")}
                          placeholder="-- Chọn vai trò --"
                          disabled={isAdminRow}
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

                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelMultipleSelect
                          values={selectedBranchIds}
                          options={branches.map((b) => ({ value: b.id, label: b.name }))}
                          onChange={handleBranchChange}
                          placeholder="Chưa gán chi nhánh"
                        />
                      </td>

                      <td style={{ padding: "3px 6px", verticalAlign: "middle", height: "38px" }}>
                        <ExcelSelect
                          value={inlineStatusVal}
                          onChange={(newStatus) => {
                            handleInlineChange(item.id, "status", newStatus);
                            handleAutoSave(item.id, { status: newStatus });
                          }}
                          options={[
                            { value: "ACTIVE", label: "Hoạt động", colorStyle: getStatusColorStyle("ACTIVE") },
                            { value: "INACTIVE", label: "Tạm khóa", colorStyle: getStatusColorStyle("INACTIVE") },
                          ]}
                          colorStyle={getStatusColorStyle(inlineStatusVal)}
                          disabled={isSelfAdmin}
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
                            style={{
                              padding: "4px 8px",
                              fontSize: "12px",
                              borderRadius: "var(--radius-sm)",
                              opacity: isAdminRow ? 0.5 : 1,
                              cursor: isAdminRow ? "not-allowed" : "pointer"
                            }}
                            disabled={isAdminRow}
                            onClick={() => !isAdminRow && handleDeleteStaff(item.id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </ExcelRow>
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
