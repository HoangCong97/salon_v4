import React from "react";
import { Plus, Edit2, Trash2, Loader2, Check } from "lucide-react";

import { useAuthStore } from "../../../store/useAuthStore";

import { Role, SystemPermission } from "./types";

import styles from "./StaffManagement.module.css";

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
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canManage = hasPermission("staff.manage");

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
    <div className={styles.permissionGrid}>
      {/* Left Panel: Role List */}
      <div className={`card ${styles.roleListCard}`}>
        <div className={styles.roleListHeader}>
          <span className={styles.roleListTitle}>Danh sách vai trò</span>
          {canManage && (
            <button
              onClick={() => handleOpenRoleModal("create")}
              className={styles.addRoleBtn}
            >
              <Plus size={14} /> Thêm
            </button>
          )}
        </div>

        <div className={styles.roleItemsContainer}>
          {roles.map((role) => {
            const isSelected = selectedRoleId === role.id;
            const isBuiltin = ["ADMIN", "MANAGER", "CASHIER", "EMPLOYEE"].includes(role.name.toUpperCase());
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`${styles.roleItem} ${isSelected ? styles.roleItemActive : ""}`}
              >
                <div className={styles.roleItemTextWrapper}>
                  <span className={`${styles.roleItemName} ${isSelected ? styles.roleItemNameActive : ""}`}>
                    {role.name}
                  </span>
                  {role.description && (
                    <span className={styles.roleItemDesc}>{role.description}</span>
                  )}
                </div>

                {isSelected && !isBuiltin && canManage && (
                  <div className={styles.roleItemActions} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenRoleModal("edit")}
                      className={styles.roleItemBtn}
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={handleDeleteRole}
                      className={`${styles.roleItemBtn} ${styles.roleItemBtnDanger}`}
                      title="Xóa vai trò"
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

      {/* Right Panel: Permissions Setup Matrix */}
      <div className={`card ${styles.permissionsPanelCard}`}>
        <div className={styles.permissionsHeaderRow}>
          <div>
            <h3 className={styles.permissionsTitle}>
              Thiết lập phân quyền chức vụ:{" "}
              <span style={{ color: "var(--color-primary)" }}>{activeRole?.name || "Chức vụ"}</span>
            </h3>
            <p className={styles.roleItemDesc} style={{ marginTop: "2px" }}>
              {activeRole?.description || "Gán và cấu hình các quyền hạn nghiệp vụ cho chức vụ."}
            </p>
          </div>

          <button
            className={`btn btn-primary ${styles.savePermissionsBtn}`}
            onClick={handleSavePermissions}
            disabled={savingPermissions || permissionsLoading || !canManage}
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
          <div className={styles.loadingWrapper} style={{ flexGrow: 1 }}>
            <Loader2 className="animate-spin" size={28} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : (
          <div className={styles.permissionsScrollBody}>
            {Object.keys(groupedPermissions).map((group) => {
              const isSystemAdminRole = activeRole?.name.toUpperCase() === "ADMIN";
              return (
                <div key={group} className={styles.viewContainer} style={{ gap: "10px" }}>
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
                          className={`${styles.permissionCard} ${isChecked ? styles.permissionCardActive : ""}`}
                          style={{
                            cursor: (isSystemAdminRole || !canManage) ? "not-allowed" : "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isSystemAdminRole || !canManage}
                            onChange={() => canManage && handlePermissionCheckboxChange(perm.id)}
                            className={styles.permissionCheckbox}
                            style={{ width: "16px", height: "16px" }}
                          />
                          <div className={styles.permissionTextWrapper}>
                            <span className={styles.permissionName}>{perm.name}</span>
                            <span className={styles.permissionDesc}>
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
