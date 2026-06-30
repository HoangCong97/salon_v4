import React, { useState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";
import { StaffMember } from "./types";
import { useToast } from "../../../components/desktop/ToastProvider";

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
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/daily-turns/add-staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: staffToAddId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Lỗi khi thêm thợ");
      }

      onClose();
      await fetchDailyTurns();
    } catch (err: any) {
      toast.error(err.message);
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
        zIndex: 1002,
      }}
    >
      <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "420px", position: "relative", padding: "24px" }}>
        <button
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "700",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <UserPlus size={18} style={{ color: "var(--color-primary)" }} />
          Thêm thợ vào hàng đợi hôm nay
        </h2>

        <form onSubmit={handleAddStaffToQueueSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
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

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
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
