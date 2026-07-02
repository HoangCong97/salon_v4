import React, { useState, useEffect } from "react";
import { X, Award, Phone, Mail, User, ShieldAlert } from "lucide-react";

import { useToast } from "../../../components/desktop/ToastProvider";
import { api } from "../../../utils/apiClient";

import { Customer, ModalMode } from "./types";

import styles from "./Customers.module.css";

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
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
  const toast = useToast();
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
      if (mode === "create") {
        await api.post(`/tenants/${currentTenantId}/customers`, payload);
        toast.success("Thêm khách hàng mới thành công!");
      } else {
        await api.put(`/tenants/${currentTenantId}/customers/${selectedCustomerId}`, payload);
        toast.success("Cập nhật thông tin khách hàng thành công!");
      }

      await fetchCustomers();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || "Lỗi khi lưu thông tin");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitleText}>
            {mode === "create" ? "THÊM KHÁCH HÀNG MỚI" : "CHỈNH SỬA CHI TIẾT KHÁCH HÀNG"}
          </h3>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave}>
          <div className={styles.modalBody}>
            {/* Name */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Họ và tên <span className={styles.requiredStar}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <User size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  required
                  placeholder="Nhập tên khách hàng"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.formInputWithIcon}
                />
              </div>
            </div>

            {/* Phone */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Số điện thoại</label>
              <div className={styles.inputWrapper}>
                <Phone size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Ví dụ: 0987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.formInputWithIcon}
                />
              </div>
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Thư điện tử (Email)</label>
              <div className={styles.inputWrapper}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="tenkhachhang@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.formInputWithIcon}
                />
              </div>
            </div>

            {/* Password */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Mật khẩu đăng nhập (Dành cho App Đặt Lịch)
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu (nếu có)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.formInput}
              />
            </div>

            {/* Credibility Score */}
            <div className={styles.formGroup}>
              <div className={styles.scoreHeader}>
                <label className={styles.scoreLabel}>
                  <Award size={15} color="#f59e0b" /> Điểm uy tín
                </label>
                <span
                  className={styles.scoreBadge}
                  style={{
                    color:
                      credibilityScore >= 80
                        ? "var(--color-success)"
                        : credibilityScore >= 50
                          ? "var(--color-warning)"
                          : "var(--color-danger)",
                  }}
                >
                  {credibilityScore}/100
                </span>
              </div>
              <div className={styles.scoreSliderRow}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={credibilityScore}
                  onChange={(e) => setCredibilityScore(Number(e.target.value))}
                  className={styles.sliderInput}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={credibilityScore}
                  onChange={(e) =>
                    setCredibilityScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))
                  }
                  className={styles.numberInput}
                />
              </div>
              {credibilityScore < 80 && (
                <div
                  className={`${styles.warningAlert} ${
                    credibilityScore >= 50 ? styles.warningAlertWarning : styles.warningAlertDanger
                  }`}
                >
                  <ShieldAlert size={14} className={styles.warningIcon} />
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
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={`btn btn-secondary ${styles.btnFooterCancel}`}
              onClick={onClose}
              disabled={saving}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${styles.btnFooterSave}`}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
