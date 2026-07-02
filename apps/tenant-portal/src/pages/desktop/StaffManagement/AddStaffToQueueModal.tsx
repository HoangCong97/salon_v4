import React, { useState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";

import { useToast } from "../../../components/desktop/ToastProvider";

import { api } from "../../../utils/apiClient";

import { StaffMember } from "./types";

import styles from "./StaffManagement.module.css";

interface AddStaffToQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  queueAddableStaff: StaffMember[];
  currentTenantId: string | null;
  currentBranchId: string | null;
  fetchDailyTurns: (silent?: boolean) => Promise<void>;
}

export const AddStaffToQueueModal: React.FC<AddStaffToQueueModalProps> = ({
  isOpen,
  onClose,
  queueAddableStaff,
  currentTenantId,
  currentBranchId,
  fetchDailyTurns,
}) => {
  const toast = useToast();
  const [staffToAddId, setStaffToAddId] = useState("");

  useEffect(() => {
    if (isOpen && queueAddableStaff.length > 0) {
      setStaffToAddId(queueAddableStaff[0].id);
    } else {
      setStaffToAddId("");
    }
  }, [isOpen, queueAddableStaff]);

  if (!isOpen) return null;

  const handleAddStaffToQueueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffToAddId) return;

    try {
      await api.post(`/tenants/${currentTenantId}/branches/${currentBranchId}/daily-turns/add-staff`, {
        staffId: staffToAddId
      });

      onClose();
      await fetchDailyTurns();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi thêm thợ");
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
          <UserPlus size={18} style={{ color: "var(--color-primary)" }} />
          Thêm thợ vào hàng đợi hôm nay
        </h2>

        <form onSubmit={handleAddStaffToQueueSubmit} className={styles.modalForm}>
          <div className={`form-group ${styles.formGroup}`}>
            <label className="form-label">Chọn nhân viên gán chi nhánh này</label>
            <select className="form-input" value={staffToAddId} onChange={(e) => setStaffToAddId(e.target.value)}>
              {queueAddableStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role ? s.role.name : "Thợ"})
                </option>
              ))}
            </select>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Chỉ hiển thị các nhân sự thuộc chi nhánh hiện tại nhưng chưa có mặt trong hàng đợi.
            </p>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Thêm thợ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
