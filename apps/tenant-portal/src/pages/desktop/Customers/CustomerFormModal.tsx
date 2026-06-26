import React, { useState, useEffect } from "react";
import { X, Award, Phone, Mail, User, ShieldAlert } from "lucide-react";
import { Customer } from "./types";

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selectedCustomerId: string | null;
  customers: Customer[];
  fetchCustomers: (silent?: boolean) => Promise<void>;
  currentTenantId: string | null;
  currentBranchId: string | null;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  selectedCustomerId,
  customers,
  fetchCustomers,
  currentTenantId,
  currentBranchId,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [credibilityScore, setCredibilityScore] = useState<number>(100);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && selectedCustomerId) {
        const cust = customers.find((c) => c.id === selectedCustomerId);
        if (cust) {
          setName(cust.name || "");
          setPhone(cust.phone || "");
          setEmail(cust.email || "");
          setPassword(cust.password || "");
          setCredibilityScore(cust.credibilityScore ?? 100);
        }
      } else {
        setName("");
        setPhone("");
        setEmail("");
        setPassword("");
        setCredibilityScore(100);
      }
    }
  }, [isOpen, mode, selectedCustomerId, customers]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);

    const payload = {
      name,
      phone: phone.trim() || null,
      email: email.trim() || null,
      password: password.trim() || null,
      credibilityScore,
      branchId: currentBranchId || null,
    };

    try {
      let res;
      if (mode === "create") {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/customers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/customers/${selectedCustomerId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Lỗi khi lưu khách hàng");
      }

      await fetchCustomers();
      onClose();
    } catch (err: any) {
      alert(err.message || "Lỗi khi lưu thông tin");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        fontFamily: "var(--font-family, system-ui, sans-serif)",
      }}
    >
      <div
        className="modal-container"
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
          animation: "confirm-modal-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-color, #e2e8f0)",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
            {mode === "create" ? "THÊM KHÁCH HÀNG MỚI" : "CHỈNH SỬA CHI TIẾT KHÁCH HÀNG"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(15, 23, 42, 0.4)",
              padding: "4px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(15, 23, 42, 0.05)";
              e.currentTarget.style.color = "rgba(15, 23, 42, 0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(15, 23, 42, 0.4)";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                Họ và tên <span style={{ color: "red" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(15, 23, 42, 0.4)" }} />
                <input
                  type="text"
                  required
                  placeholder="Nhập tên khách hàng"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 36px",
                    border: "1.5px solid var(--border-color, #e2e8f0)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-color, #e2e8f0)")}
                />
              </div>
            </div>

            {/* Phone */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                Số điện thoại
              </label>
              <div style={{ position: "relative" }}>
                <Phone size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(15, 23, 42, 0.4)" }} />
                <input
                  type="text"
                  placeholder="Ví dụ: 0987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 36px",
                    border: "1.5px solid var(--border-color, #e2e8f0)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-color, #e2e8f0)")}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                Thư điện tử (Email)
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(15, 23, 42, 0.4)" }} />
                <input
                  type="email"
                  placeholder="tenkhachhang@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 36px",
                    border: "1.5px solid var(--border-color, #e2e8f0)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-color, #e2e8f0)")}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                Mật khẩu đăng nhập (Dành cho App Đặt Lịch)
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu (nếu có)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid var(--border-color, #e2e8f0)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-color, #e2e8f0)")}
              />
            </div>

            {/* Credibility Score */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Award size={15} color="#f59e0b" /> Điểm uy tín
                </label>
                <span
                  style={{
                    fontSize: "13.5px",
                    fontWeight: "800",
                    color: credibilityScore >= 80 ? "var(--color-success)" : credibilityScore >= 50 ? "var(--color-warning)" : "var(--color-danger)",
                  }}
                >
                  {credibilityScore}/100
                </span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={credibilityScore}
                  onChange={(e) => setCredibilityScore(Number(e.target.value))}
                  style={{
                    flexGrow: 1,
                    accentColor: "var(--color-primary)",
                    cursor: "pointer",
                  }}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={credibilityScore}
                  onChange={(e) => setCredibilityScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  style={{
                    width: "60px",
                    padding: "6px",
                    textAlign: "center",
                    border: "1.5px solid var(--border-color, #e2e8f0)",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: "700",
                    outline: "none",
                  }}
                />
              </div>
              {credibilityScore < 80 && (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    background: credibilityScore >= 50 ? "#fef3c7" : "#fee2e2",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    marginTop: "4px",
                    fontSize: "12px",
                    color: credibilityScore >= 50 ? "#b45309" : "#b91c1c",
                    fontWeight: "500",
                  }}
                >
                  <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>
                    {credibilityScore >= 50
                      ? "Khách hàng này từng có lịch sử hủy hẹn muộn hoặc không đến."
                      : "Cảnh báo: Điểm uy tín quá thấp. Khách hàng này có lịch sử bùng hẹn nhiều lần!"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className="modal-footer"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              padding: "16px 20px",
              borderTop: "1px solid var(--border-color, #e2e8f0)",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={saving}
              style={{ padding: "10px 20px", fontSize: "14px", fontWeight: "600" }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                background: "var(--color-primary)",
                border: "none",
                color: "white",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {saving ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
