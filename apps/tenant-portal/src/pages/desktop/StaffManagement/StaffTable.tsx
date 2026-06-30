import React from "react";
import { Search, Plus, Users, Edit2, Trash2, Upload, Download } from "lucide-react";
import { ExcelInput, ExcelSelect, ExcelMultipleSelect, ExcelRow } from "../../../components/desktop/TableComponents";
import { StaffMember, Role, Branch, getRoleColorStyle, getStatusColorStyle } from "./types";
import { useAuthStore } from "../../../store/useAuthStore";
import { ExportButton } from "../../../components/desktop/ExportButton";
import { ExportColumnMapping } from "../../../utils/exportData";
import { useToast } from "../../../components/desktop/ToastProvider";

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
  selectedBranchFilter: string;
  setSelectedBranchFilter: (val: string) => void;
  selectedRoleFilter: string;
  setSelectedRoleFilter: (val: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (val: string) => void;
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
  selectedBranchFilter,
  setSelectedBranchFilter,
  selectedRoleFilter,
  setSelectedRoleFilter,
  selectedStatusFilter,
  setSelectedStatusFilter,
}) => {
  const toast = useToast();
  const currentUser = useAuthStore((state) => state.user);
  const currentTenantId = useAuthStore((state) => state.currentTenantId);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canManage = hasPermission("staff.manage");

  const staffExportColumns = React.useMemo<ExportColumnMapping[]>(() => [
    { key: "name", header: "Họ tên nhân viên" },
    { key: "loginId", header: "ID đăng nhập" },
    { key: "phone", header: "Số điện thoại" },
    { key: "sex", header: "Giới tính" },
    { key: "baseSalary", header: "Lương cơ bản (VND)", transform: (val) => Number(val) },
    { key: "role", header: "Chức vụ", transform: (val) => val ? val.name : "" },
    { key: "branches", header: "Chi nhánh hoạt động", transform: (val) => Array.isArray(val) ? val.map((b: any) => b.name).join(", ") : "" },
    { key: "status", header: "Trạng thái", transform: (val) => val === "ACTIVE" ? "Đang hoạt động" : val === "SUSPENDED" ? "Tạm ngừng" : "Ngưng hoạt động" },
    { key: "note", header: "Ghi chú" }
  ], []);

  const handleImageDrop = async (itemId: string, file: File) => {
    if (!canManage) return;
    try {
      const previewUrl = URL.createObjectURL(file);
      // Update local state instantly with local object URL preview
      handleInlineChange(itemId, "avatar", previewUrl);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
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

          // Revoke preview URL to free memory
          if (previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
          }

          handleInlineChange(itemId, "avatar", imageUrl);
          await handleAutoSave(itemId, { avatar: imageUrl });
        } catch (err: any) {
          toast.error("Lỗi tải ảnh kéo thả: " + err.message);
          // Revert back to original avatar on error
          handleInlineChange(itemId, "avatar", undefined);
        }
      };
    } catch (err: any) {
      toast.error("Lỗi tải ảnh kéo thả: " + err.message);
    }
  };

  const getInitialsOfLastWord = (name: string): string => {
    if (!name || !name.trim()) return "?";
    const words = name.trim().split(/\s+/);
    const lastWord = words[words.length - 1];
    return lastWord ? lastWord.charAt(0).toUpperCase() : "?";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Search Bar, Filters & Action Buttons Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        {/* Left: Search Bar & Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flexGrow: 1 }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "240px" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="form-input"
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "36px", height: "34px", fontSize: "13px" }}
            />
          </div>

          {/* Filter by Branch */}
          <select
            className="form-input"
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            style={{ width: "auto", minWidth: "150px", height: "34px", padding: "0 10px", fontSize: "13px" }}
          >
            <option value="">Chi nhánh (Tất cả)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Filter by Role */}
          <select
            className="form-input"
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            style={{ width: "auto", minWidth: "150px", height: "34px", padding: "0 10px", fontSize: "13px" }}
          >
            <option value="">Chức vụ (Tất cả)</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          {/* Filter by Status */}
          <select
            className="form-input"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            style={{ width: "auto", minWidth: "150px", height: "34px", padding: "0 10px", fontSize: "13px" }}
          >
            <option value="">Trạng thái (Tất cả)</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="SUSPENDED">Tạm ngừng</option>
            <option value="INACTIVE">Tạm khóa</option>
          </select>

          {/* Reset Filter Button if any filters are active */}
          {(selectedBranchFilter || selectedRoleFilter || selectedStatusFilter || searchTerm) && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSelectedBranchFilter("");
                setSelectedRoleFilter("");
                setSelectedStatusFilter("");
                setSearchTerm("");
              }}
              style={{ height: "34px", padding: "0 12px", fontSize: "12px", color: "var(--text-secondary)" }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {canManage && (
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
                height: "34px",
                fontSize: "13px",
                padding: "0 12px",
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
          )}

          <ExportButton
            data={filteredStaff}
            fileName="danh_sach_nhan_vien"
            columns={staffExportColumns}
          />

          {canManage && (
            <button 
              className="btn btn-primary" 
              onClick={handleOpenCreateModal}
              style={{ height: "34px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", padding: "0 16px" }}
            >
              <Plus size={18} /> Thêm nhân viên mới
            </button>
          )}
        </div>
      </div>

      {filteredStaff.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <Users size={48} style={{ color: "var(--text-muted)", marginBottom: "16px", marginInline: "auto" }} />
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Không tìm thấy nhân viên</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
            {searchTerm || selectedBranchFilter || selectedRoleFilter || selectedStatusFilter
              ? "Không tìm thấy kết quả phù hợp với các bộ lọc hiện tại."
              : "Salon của bạn hiện chưa có nhân viên nào."}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="data-table-container" style={{ border: "none", boxShadow: "none", borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding: "12px 16px", fontSize: "13px", width: "220px" }}>Họ tên nhân viên</th>
                  <th style={{ padding: "12px 16px", fontSize: "13px", width: "200px" }}>ID đăng nhập</th>
                  <th style={{ padding: "12px 16px", fontSize: "13px", width: "150px" }}>Mật khẩu</th>
                  <th style={{ padding: "12px 16px", fontSize: "13px", width: "150px" }}>Số điện thoại</th>
                  <th style={{ padding: "12px 16px", fontSize: "13px", minWidth: "220px" }}>Chi nhánh hoạt động</th>
                  <th style={{ padding: "12px 16px", fontSize: "13px", width: "150px" }}>Chức vụ</th>
                  <th style={{ padding: "12px 16px", fontSize: "13px", width: "150px", textAlign: "center" }}>Lương cơ bản</th>
                  <th style={{ padding: "12px 16px", fontSize: "13px", width: "140px" }}>Trạng thái</th>
                  {canManage && <th style={{ padding: "12px 16px", fontSize: "13px", width: "120px", textAlign: "center" }}>Hành động</th>}
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((item) => {
                  const inlineRoleVal = getInlineValue(item, "role") as { id: string; name: string } | null;
                  const inlineStatusVal = getInlineValue(item, "status") as string;
                  const inlineBranchesVal = getInlineValue(item, "branches") as Branch[] || [];
                  const selectedBranchIds = inlineBranchesVal.map((b) => b.id);
                  const inlineAvatarVal = getInlineValue(item, "avatar") as string || item.avatar;

                  const isAdminRow = item.isAdmin || item.id === adminUserId;
                  const isSelf = item.id === currentUser?.id;
                  const isSelfAdmin = isAdminRow && isSelf;
                  const isSuspended = inlineStatusVal === "SUSPENDED";

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
                      {/* 1. Họ tên nhân viên */}
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "10px", width: "100%", height: "100%" }}>
                          {inlineAvatarVal ? (
                            <img
                              src={inlineAvatarVal}
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
                              disabled={isSuspended || !canManage}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 2. ID đăng nhập */}
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          value={getInlineValue(item, "loginId") as string}
                          onChange={(val) => handleInlineChange(item.id, "loginId", val)}
                          onBlur={() => handleAutoSave(item.id, { loginId: getInlineValue(item, "loginId") as string })}
                          disabled={isSuspended || isSelfAdmin || !canManage}
                        />
                      </td>

                      {/* 3. Mật khẩu */}
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          type="password"
                          value={getInlineValue(item, "password") as string || ""}
                          onChange={(val) => handleInlineChange(item.id, "password", val)}
                          onBlur={() => handleAutoSave(item.id, { password: getInlineValue(item, "password") as string })}
                          disabled={isSuspended || isSelfAdmin || !canManage}
                        />
                      </td>

                      {/* 4. Số điện thoại */}
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          value={getInlineValue(item, "phone") as string}
                          onChange={(val) => handleInlineChange(item.id, "phone", val)}
                          onBlur={() => handleAutoSave(item.id, { phone: getInlineValue(item, "phone") as string })}
                          disabled={isSuspended || isSelfAdmin || !canManage}
                        />
                      </td>

                      {/* 5. Chi nhánh hoạt động */}
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelMultipleSelect
                          values={selectedBranchIds}
                          options={branches.map((b) => ({ value: b.id, label: b.name }))}
                          onChange={handleBranchChange}
                          placeholder="Chưa gán chi nhánh"
                          disabled={isSuspended || !canManage}
                        />
                      </td>

                      {/* 6. Chức vụ */}
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
                          disabled={isSuspended || isAdminRow || !canManage}
                        />
                      </td>

                      {/* 7. Lương cơ bản */}
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          value={formatNumber(getInlineValue(item, "baseSalary") as number | string)}
                          onChange={(val) => handleSalaryChange(item.id, val)}
                          onBlur={() => handleAutoSave(item.id, { baseSalary: getInlineValue(item, "baseSalary") as number })}
                          textAlign="center"
                          fontWeight="500"
                          unit="đ"
                          disabled={isSuspended || !canManage}
                        />
                      </td>

                      {/* 8. Trạng thái */}
                      <td style={{ padding: "3px 6px", verticalAlign: "middle", height: "38px" }}>
                        <ExcelSelect
                          value={inlineStatusVal}
                          onChange={(newStatus) => {
                            handleInlineChange(item.id, "status", newStatus);
                            handleAutoSave(item.id, { status: newStatus });
                          }}
                          options={[
                            { value: "ACTIVE", label: "Hoạt động", colorStyle: getStatusColorStyle("ACTIVE") },
                            { value: "SUSPENDED", label: "Tạm ngừng", colorStyle: getStatusColorStyle("SUSPENDED") },
                            { value: "INACTIVE", label: "Tạm khóa", colorStyle: getStatusColorStyle("INACTIVE") },
                          ]}
                          colorStyle={getStatusColorStyle(inlineStatusVal)}
                          disabled={isSelfAdmin || !canManage}
                        />
                      </td>

                      {/* 9. Hành động */}
                      {canManage && (
                        <td style={{ padding: "0 8px", verticalAlign: "middle", height: "38px" }}>
                          <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                            <button
                              className="btn btn-secondary"
                              style={{
                                padding: "4px 8px",
                                fontSize: "12px",
                                borderRadius: "var(--radius-sm)",
                                opacity: isSuspended ? 0.5 : 1,
                                cursor: isSuspended ? "not-allowed" : "pointer"
                              }}
                              onClick={() => !isSuspended && handleOpenEditModal(item)}
                              disabled={isSuspended}
                              title={isSuspended ? "Tài khoản tạm ngừng không thể chỉnh sửa" : "Chỉnh sửa"}
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{
                                padding: "4px 8px",
                                fontSize: "12px",
                                borderRadius: "var(--radius-sm)",
                                opacity: (isAdminRow || isSuspended) ? 0.5 : 1,
                                cursor: (isAdminRow || isSuspended) ? "not-allowed" : "pointer"
                              }}
                              disabled={isAdminRow || isSuspended}
                              onClick={() => !isAdminRow && !isSuspended && handleDeleteStaff(item.id)}
                              title={isSuspended ? "Tài khoản tạm ngừng không thể xóa" : "Xóa"}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      )}
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
