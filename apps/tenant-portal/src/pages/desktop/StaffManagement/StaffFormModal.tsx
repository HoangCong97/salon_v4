import React, { useState, useEffect } from "react";
import { X, Users, Edit2, Camera, User, Loader2 } from "lucide-react";
import { PriceInputWithSuggestion } from "../../../components/desktop/TableComponents";
import { StaffMember, Role, Branch, getAdminUser } from "./types";
import { useAuthStore } from "../../../store/useAuthStore";
import { useToast } from "../../../components/desktop/ToastProvider";

const compressAndGetBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selectedStaffId: string | null;
  staff: StaffMember[];
  roles: Role[];
  branchList: Branch[];
  currentTenantId: string | null;
  onSave: (payload: any, mode: "create" | "edit", staffId?: string | null) => void;
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
  onSave,
}) => {
  const toast = useToast();
  // Staff Form Fields State
  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [sex, setSex] = useState("Nam");
  const [roleId, setRoleId] = useState("");
  const [baseSalary, setBaseSalary] = useState("0");
  const [status, setStatus] = useState("ACTIVE");
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [avatar, setAvatar] = useState("");
  
  // Avatar drag-and-drop & immediate upload preview states
  const [hoverAvatar, setHoverAvatar] = useState(false);
  const [isDragOverAvatar, setIsDragOverAvatar] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const currentUser = useAuthStore((state) => state.user);

  const adminUser = getAdminUser(staff);

  const isAdminRow = mode === "edit" && selectedStaffId === adminUser?.id;
  const isSelf = mode === "edit" && selectedStaffId === currentUser?.id;
  const isSelfAdmin = isAdminRow && isSelf;

  const filteredRoles = roles.filter(
    (r) => isAdminRow || r.name.toUpperCase() !== "ADMIN"
  );

  const formatNumber = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === "") return "";
    const cleaned = String(val).replace(/\D/g, "");
    if (!cleaned) return "";
    return new Intl.NumberFormat("en-US").format(parseInt(cleaned, 10));
  };

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  useEffect(() => {
    if (isOpen) {
      setAvatarPreviewUrl(null);
      setIsUploading(false);
      setIsDragOverAvatar(false);
      if (mode === "edit" && selectedStaffId) {
        const item = staff.find((s) => s.id === selectedStaffId);
        if (item) {
          setName(item.name);
          setLoginId(item.loginId);
          setPassword("");
          setPhone(item.phone || "");
          setSex(item.sex || "Nam");
          setRoleId(item.role ? item.role.id : "");
          setBaseSalary(String(item.baseSalary));
          setStatus(item.status);
          setSelectedBranchIds(item.branches.map((b) => b.id));
          setNote(item.note || "");
          setAvatar(item.avatar || "");
        }
      } else {
        // Create mode defaults
        setName("");
        setLoginId("");
        setPassword("");
        setPhone("");
        setSex("Nam");
        setRoleId(roles[0]?.id || "");
        setBaseSalary("0");
        setStatus("ACTIVE");
        setSelectedBranchIds(branchList.length > 0 ? [branchList[0].id] : []);
        setNote("");
        setAvatar("");
      }
    }
  }, [isOpen, mode, selectedStaffId, staff, roles, branchList]);

  if (!isOpen) return null;

  const handleBranchCheckboxChange = (bId: string) => {
    setSelectedBranchIds((prev) =>
      prev.includes(bId) ? prev.filter((id) => id !== bId) : [...prev, bId]
    );
  };

  const uploadFile = async (base64Data: string, category: string, originalFilename?: string): Promise<string> => {
    const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: base64Data,
        category,
        filename: originalFilename
      })
    });
    if (!res.ok) {
      throw new Error("Lỗi khi tải ảnh lên máy chủ");
    }
    const data = await res.json();
    return data.url;
  };

  const processAndUploadFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chỉ chọn tệp hình ảnh!");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(previewUrl);
    setIsUploading(true);

    // Defer heavy canvas compression and network request to next tick to let browser paint preview immediately
    setTimeout(async () => {
      try {
        const base64 = await compressAndGetBase64(file);
        const fileUrl = await uploadFile(base64, "staff", file.name);
        setAvatar(fileUrl);
      } catch (err: any) {
        toast.error("Lỗi tải ảnh đại diện: " + err.message);
        setAvatarPreviewUrl(null);
      } finally {
        setIsUploading(false);
      }
    }, 50);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processAndUploadFile(files[0]);
    }
  };

  const handleModalSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !loginId.trim()) return;

    if (mode === "create" && !password.trim()) {
      toast.warning("Mật khẩu là bắt buộc khi tạo mới!");
      return;
    }

    const payload = {
      name,
      loginId: loginId.trim(),
      password: password.trim() ? password : undefined,
      phone,
      sex,
      baseSalary: parseInt(baseSalary.replace(/\D/g, ""), 10) || 0,
      roleId: roleId || null,
      status,
      branchIds: selectedBranchIds,
      note,
      avatar: avatar || null,
    };

    try {
      onSave(payload, mode, selectedStaffId);
      onClose();
    } catch (err: any) {
      // Error notifications are already handled by custom hook mutation callbacks
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

        {/* Circular Avatar Uploader */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <div
            style={{
              position: "relative",
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              overflow: "hidden",
              border: isDragOverAvatar 
                ? "2px dashed var(--color-primary)" 
                : "2px solid var(--border-color)",
              cursor: "pointer",
              backgroundColor: isDragOverAvatar ? "rgba(0, 112, 243, 0.05)" : "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: isDragOverAvatar ? "scale(1.05)" : "scale(1)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
            onClick={() => document.getElementById("staff-avatar-input")?.click()}
            onMouseEnter={() => setHoverAvatar(true)}
            onMouseLeave={() => setHoverAvatar(false)}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOverAvatar(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOverAvatar(false);
            }}
            onDrop={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOverAvatar(false);
              const files = e.dataTransfer.files;
              if (files && files.length > 0) {
                await processAndUploadFile(files[0]);
              }
            }}
          >
            {avatarPreviewUrl || avatar ? (
              <img
                src={avatarPreviewUrl || avatar}
                alt="Avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <User size={36} style={{ color: "var(--text-muted)" }} />
            )}

            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(15, 23, 42, 0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: hoverAvatar && !isUploading ? 1 : 0,
                transition: "opacity 0.15s ease",
                color: "white"
              }}
            >
              <Camera size={20} />
            </div>

            {isUploading && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(15, 23, 42, 0.65)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "11px",
                  fontWeight: "600",
                  gap: "4px"
                }}
              >
                <Loader2 className="animate-spin" size={18} />
                <span>Đang tải...</span>
              </div>
            )}
          </div>

          <input
            type="file"
            id="staff-avatar-input"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />

          {(avatarPreviewUrl || avatar) && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: "2px 8px", fontSize: "11px", height: "24px" }}
              onClick={() => {
                setAvatar("");
                setAvatarPreviewUrl(null);
              }}
            >
              Xóa ảnh
            </button>
          )}
        </div>

        <form onSubmit={handleModalSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }} autoComplete="off">
          {/* Dummy inputs to fool browser autofill */}
          <input type="text" name="prevent_autofill_username" style={{ display: "none" }} tabIndex={-1} readOnly />
          <input type="password" name="prevent_autofill_password" style={{ display: "none" }} tabIndex={-1} readOnly />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Họ và tên nhân viên *</label>
              <input
                className="form-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Họ tên nhân viên..."
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">ID đăng nhập *</label>
              <input
                className="form-input"
                type="text"
                required
                name="staff-new-username"
                id="staff-new-username"
                autoComplete="new-username"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="ID đăng nhập..."
                disabled={isSelfAdmin}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Mật khẩu {mode === "create" ? "*" : "(để trống nếu giữ nguyên)"}</label>
              <input
                className="form-input"
                type="text"
                required={mode === "create"}
                name="staff-new-password"
                id="staff-new-password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "create" ? "Mật khẩu" : "••••••••"}
                style={{
                  WebkitTextSecurity: "disc"
                } as any}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Số điện thoại</label>
              <input
                className="form-input"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại..."
                disabled={isSelfAdmin}
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
              <select
                className="form-input"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                disabled={isAdminRow}
              >
                <option value="">-- Chọn vai trò --</option>
                {filteredRoles.map((r) => (
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
              <label className="form-label">Trạng thái hoạt động</label>
              <select
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isSelfAdmin}
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="SUSPENDED">Tạm ngừng</option>
                <option value="INACTIVE">Tạm khóa</option>
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
            <button type="submit" className="btn btn-primary" style={{ minWidth: "120px" }} disabled={isUploading}>
              {isUploading ? "Đang tải ảnh..." : "Lưu thông tin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
