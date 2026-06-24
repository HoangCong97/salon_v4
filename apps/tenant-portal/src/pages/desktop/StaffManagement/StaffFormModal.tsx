import React, { useState, useEffect } from "react";
import { X, Users, Edit2 } from "lucide-react";
import { PriceInputWithSuggestion } from "../../../components/desktop/TableComponents";
import { StaffMember, Role, Branch } from "./types";

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selectedStaffId: string | null;
  staff: StaffMember[];
  roles: Role[];
  branchList: Branch[];
  currentTenantId: string | null;
  fetchStaffAndRoles: (silent?: boolean) => Promise<void>;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  selectedStaffId,
  staff,
  roles,
  branchList,
  currentTenantId,
  fetchStaffAndRoles,
}) => {
  // Staff Form Fields State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [sex, setSex] = useState("Nam");
  const [roleId, setRoleId] = useState("");
  const [baseSalary, setBaseSalary] = useState("0");
  const [status, setStatus] = useState("ACTIVE");
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const formatNumber = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === "") return "";
    const cleaned = String(val).replace(/\D/g, "");
    if (!cleaned) return "";
    return new Intl.NumberFormat("en-US").format(parseInt(cleaned, 10));
  };

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && selectedStaffId) {
        const item = staff.find((s) => s.id === selectedStaffId);
        if (item) {
          setName(item.name);
          setEmail(item.email);
          setPassword("");
          setPhone(item.phone || "");
          setSex(item.sex || "Nam");
          setRoleId(item.role ? item.role.id : "");
          setBaseSalary(String(item.baseSalary));
          setStatus(item.status);
          setSelectedBranchIds(item.branches.map((b) => b.id));
          setNote(item.note || "");
        }
      } else {
        // Create mode defaults
        setName("");
        setEmail("");
        setPassword("");
        setPhone("");
        setSex("Nam");
        setRoleId(roles[0]?.id || "");
        setBaseSalary("0");
        setStatus("ACTIVE");
        setSelectedBranchIds(branchList.length > 0 ? [branchList[0].id] : []);
        setNote("");
      }
    }
  }, [isOpen, mode, selectedStaffId, staff, roles, branchList]);

  if (!isOpen) return null;

  const handleBranchCheckboxChange = (bId: string) => {
    setSelectedBranchIds((prev) =>
      prev.includes(bId) ? prev.filter((id) => id !== bId) : [...prev, bId]
    );
  };

  const handleModalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Email không đúng định dạng!");
      return;
    }

    const payload = {
      name,
      email,
      password: password.trim() ? password : undefined,
      phone,
      sex,
      baseSalary: parseInt(baseSalary.replace(/\D/g, ""), 10) || 0,
      roleId: roleId || null,
      status,
      branchIds: selectedBranchIds,
      note,
    };

    try {
      let res;
      if (mode === "create") {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/staff`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/staff/${selectedStaffId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi khi lưu tài khoản nhân sự");
      }

      onClose();
      await fetchStaffAndRoles();
    } catch (err: any) {
      alert(err.message);
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
        zIndex: 1000,
      }}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "600px",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px",
        }}
      >
        <button
          style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          {mode === "create" ? (
            <>
              <Users size={20} style={{ color: "var(--color-primary)" }} /> Thêm nhân viên mới
            </>
          ) : (
            <>
              <Edit2 size={20} style={{ color: "var(--color-primary)" }} /> Chỉnh sửa tài khoản nhân sự
            </>
          )}
        </h2>

        <form onSubmit={handleModalSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Họ và tên nhân viên *</label>
              <input
                className="form-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email liên hệ *</label>
              <input
                className="form-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ví dụ: email@gmail.com"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Mật khẩu {mode === "create" ? "*" : "(để trống nếu giữ nguyên)"}</label>
              <input
                className="form-input"
                type="password"
                required={mode === "create"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "create" ? "Nhập mật khẩu" : "••••••••"}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Số điện thoại</label>
              <input
                className="form-input"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 0901234567"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Giới tính</label>
              <select className="form-input" value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Chức vụ (Phân quyền)</label>
              <select className="form-input" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                <option value="">-- Chọn vai trò --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Mức lương cơ bản (VND)</label>
              <PriceInputWithSuggestion
                value={formatNumber(baseSalary)}
                onChange={(val) => setBaseSalary(val)}
                placeholder="Ví dụ: 8,000,000"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Trạng thái tài khoản</label>
              <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ACTIVE">Hoạt động (Active)</option>
                <option value="INACTIVE">Tạm khóa (Inactive)</option>
              </select>
            </div>
          </div>

          {/* Chi nhánh hoạt động checkboxes */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chi nhánh hoạt động (Được chọn nhiều)</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "10px",
                maxHeight: "150px",
                overflowY: "auto",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                padding: "12px",
                background: "#f8fafc",
              }}
            >
              {branchList.length === 0 ? (
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
                  Chưa có chi nhánh nào được tạo
                </span>
              ) : (
                branchList.map((b) => {
                  const isChecked = selectedBranchIds.includes(b.id);
                  return (
                    <label
                      key={b.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        cursor: "pointer",
                        userSelect: "none",
                        fontWeight: isChecked ? "600" : "400",
                        color: isChecked ? "var(--color-primary)" : "var(--text-primary)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleBranchCheckboxChange(b.id)}
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                        }}
                      />
                      <span>{b.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Ghi chú thêm</label>
            <textarea
              className="form-input"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú hoặc thông tin bổ sung về nhân sự..."
              style={{ resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: "120px" }}>
              Lưu thông tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
