import React, { useState, useEffect } from "react";
import { X, Key } from "lucide-react";

import { useToast } from "../../../components/desktop/ToastProvider";

import { api } from "../../../utils/apiClient";

import { Role } from "./types";

import styles from "./StaffManagement.module.css";

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selectedRoleId: string | null;
  roles: Role[];
  currentTenantId: string | null;
  fetchStaffAndRoles: (silent?: boolean) => Promise<void>;
  onRoleCreated: (id: string) => void;
}

export const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  mode,
  selectedRoleId,
  roles,
  currentTenantId,
  fetchStaffAndRoles,
  onRoleCreated,
}) => {
  const toast = useToast();
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [savingRole, setSavingRole] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && selectedRoleId) {
        const activeRole = roles.find((r) => r.id === selectedRoleId);
        if (activeRole) {
          setRoleName(activeRole.name);
          setRoleDescription(activeRole.description || "");
        }
      } else {
        setRoleName("");
        setRoleDescription("");
      }
    }
  }, [isOpen, mode, selectedRoleId, roles]);

  if (!isOpen) return null;

  const handleRoleModalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    setSavingRole(true);

    const payload = {
      name: roleName,
      description: roleDescription,
    };

    try {
      let roleResult;
      if (mode === "create") {
        roleResult = await api.post<{ id: string }>(`/tenants/${currentTenantId}/roles`, payload);
      } else {
        roleResult = await api.put<{ id: string }>(`/tenants/${currentTenantId}/roles/${selectedRoleId}`, payload);
      }

      onClose();
      await fetchStaffAndRoles();
      if (mode === "create" && roleResult && roleResult.id) {
        onRoleCreated(roleResult.id);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu chức vụ");
    } finally {
      setSavingRole(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`card animate-fade-in ${styles.modalCard}`} style={{ maxWidth: "420px", padding: "24px" }}>
        <button
          className={styles.closeButton}
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 className={styles.modalHeader}>
          <Key size={18} style={{ color: "var(--color-primary)" }} />
          {mode === "create" ? "Thêm vai trò chức vụ mới" : "Chỉnh sửa vai trò"}
        </h2>

        <form onSubmit={handleRoleModalSave} className={styles.modalForm}>
          <div className={`form-group ${styles.formGroup}`}>
            <label className="form-label">Tên vai trò *</label>
            <input
              className="form-input"
              type="text"
              required
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Ví dụ: Stylist Trưởng"
            />
          </div>

          <div className={`form-group ${styles.formGroup}`}>
            <label className="form-label">Mô tả chức năng</label>
            <textarea
              className={`form-input ${styles.textareaField}`}
              rows={3}
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Mô tả tóm tắt quyền hạn/công việc của vai trò..."
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={savingRole}>
              {savingRole ? "Đang lưu..." : "Lưu chức vụ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
