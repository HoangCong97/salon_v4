import React, { useState, useEffect } from "react";
import { X, Key } from "lucide-react";
import { Role } from "./types";

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
      let res;
      if (mode === "create") {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/roles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/roles/${selectedRoleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi khi lưu chức vụ");
      }

      const roleResult = await res.json();
      onClose();
      await fetchStaffAndRoles();
      if (mode === "create" && roleResult && roleResult.id) {
        onRoleCreated(roleResult.id);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingRole(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1001,
      }}
    >
      <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "420px", position: "relative", padding: "24px" }}>
        <button
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Key size={18} style={{ color: "var(--color-primary)" }} />
          {mode === "create" ? "Thêm vai trò chức vụ mới" : "Chỉnh sửa vai trò"}
        </h2>

        <form onSubmit={handleRoleModalSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
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

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Mô tả chức năng</label>
            <textarea
              className="form-input"
              rows={3}
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Mô tả tóm tắt quyền hạn/công việc của vai trò..."
              style={{ resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
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
