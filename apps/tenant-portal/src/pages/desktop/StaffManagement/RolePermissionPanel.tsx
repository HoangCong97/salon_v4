import React from "react";
import { Plus, Edit2, Trash2, Loader2, Check } from "lucide-react";
import { Role, SystemPermission } from "./types";

interface RolePermissionPanelProps {
  roles: Role[];
  selectedRoleId: string | null;
  setSelectedRoleId: (id: string | null) => void;
  assignedPermissionIds: string[];
  permissionsLoading: boolean;
  savingPermissions: boolean;
  permissions: SystemPermission[];
  handleOpenRoleModal: (mode: "create" | "edit") => void;
  handleDeleteRole: () => Promise<void>;
  handlePermissionCheckboxChange: (permissionId: string) => void;
  handleSavePermissions: () => Promise<void>;
}

export const RolePermissionPanel: React.FC<RolePermissionPanelProps> = ({
  roles,
  selectedRoleId,
  setSelectedRoleId,
  assignedPermissionIds,
  permissionsLoading,
  savingPermissions,
  permissions,
  handleOpenRoleModal,
  handleDeleteRole,
  handlePermissionCheckboxChange,
  handleSavePermissions,
}) => {
  // Group system permissions by groupName
  const groupedPermissions: Record<string, SystemPermission[]> = {};
  permissions.forEach((p) => {
    if (!groupedPermissions[p.groupName]) {
      groupedPermissions[p.groupName] = [];
    }
    groupedPermissions[p.groupName].push(p);
  });

  const activeRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "24px" }}>
      {/* Left Panel: Role List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Danh sách vai trò</span>
            <button
              onClick={() => handleOpenRoleModal("create")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              <Plus size={14} /> Thêm
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {roles.map((role) => {
              const isSelected = selectedRoleId === role.id;
              const isBuiltin = ["ADMIN", "MANAGER", "CASHIER", "EMPLOYEE"].includes(role.name.toUpperCase());
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: isSelected ? "var(--color-primary-light)" : "transparent",
                    border: isSelected ? "1px solid var(--color-primary)" : "1px solid var(--border-color)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: isSelected ? "var(--color-primary)" : "var(--text-primary)",
                      }}
                    >
                      {role.name}
                    </span>
                    {role.description && (
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", lineClamp: 1 }}>{role.description}</span>
                    )}
                  </div>

                  {isSelected && !isBuiltin && (
                    <div style={{ display: "flex", gap: "4px" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenRoleModal("edit")}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "2px" }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={handleDeleteRole}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)", padding: "2px" }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel: Permissions Setup Matrix */}
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: "14px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>
              Thiết lập phân quyền chức vụ:{" "}
              <span style={{ color: "var(--color-primary)" }}>{activeRole?.name || "Chức vụ"}</span>
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
              {activeRole?.description || "Gán và cấu hình các quyền hạn nghiệp vụ cho chức vụ."}
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSavePermissions}
            disabled={savingPermissions || permissionsLoading}
            style={{ minWidth: "150px" }}
          >
            {savingPermissions ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Đang lưu...
              </>
            ) : (
              <>
                <Check size={16} /> Lưu phân quyền
              </>
            )}
          </button>
        </div>

        {permissionsLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 className="animate-spin" size={28} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {Object.keys(groupedPermissions).map((group) => {
              const isSystemAdminRole = activeRole?.name.toUpperCase() === "ADMIN";
              return (
                <div key={group} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <h4
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "var(--color-primary)",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      borderLeft: "3px solid var(--color-primary)",
                      paddingLeft: "8px",
                    }}
                  >
                    Nghiệp vụ {group}
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {groupedPermissions[group].map((perm) => {
                      const isChecked = isSystemAdminRole || assignedPermissionIds.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "10px",
                            padding: "12px",
                            border: "1px solid var(--border-color)",
                            borderRadius: "var(--radius-sm)",
                            cursor: isSystemAdminRole ? "not-allowed" : "pointer",
                            backgroundColor: isChecked ? "var(--color-primary-light)" : "transparent",
                            borderColor: isChecked ? "var(--border-focus)" : "var(--border-color)",
                            transition: "all 0.15s",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isSystemAdminRole}
                            onChange={() => handlePermissionCheckboxChange(perm.id)}
                            style={{ marginTop: "3px", width: "16px", height: "16px" }}
                          />
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{perm.name}</span>
                            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                              {perm.description || "Chưa có mô tả chi tiết."}
                            </span>
                            <code style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", display: "inline-block" }}>
                              {perm.slug}
                            </code>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
