import React from "react";
import { CalendarDays, Trash2, Edit2 } from "lucide-react";
import { PriceInputWithSuggestion } from "../../../../components/desktop/TableComponents";
import { Staff } from "../types";

import styles from "../AttendanceCalendar.module.css";

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalMode: "create" | "edit";
  activeDialogTab: "attendance" | "advance";
  setActiveDialogTab: (tab: "attendance" | "advance") => void;
  selectedDateStr: string;
  staffList: Staff[];
  formStaffId: string;
  setFormStaffId: (id: string) => void;
  formWorkStatus: string;
  setFormWorkStatus: (status: string) => void;
  formLateMinutes: number;
  setFormLateMinutes: (mins: number) => void;
  formAdvanceAmount: number;
  setFormAdvanceAmount: (amt: number) => void;
  formAdvanceStatus: string;
  setFormAdvanceStatus: (status: string) => void;
  formNote: string;
  setFormNote: (note: string) => void;
  handleSave: (e: React.FormEvent) => void;
  handleDelete: () => void;
  formatNumber: (val: number | string | undefined | null) => string;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  modalMode,
  activeDialogTab,
  setActiveDialogTab,
  selectedDateStr,
  staffList,
  formStaffId,
  setFormStaffId,
  formWorkStatus,
  setFormWorkStatus,
  formLateMinutes,
  setFormLateMinutes,
  formAdvanceAmount,
  setFormAdvanceAmount,
  formAdvanceStatus,
  setFormAdvanceStatus,
  formNote,
  setFormNote,
  handleSave,
  handleDelete,
  formatNumber,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={`card animate-fade-in ${styles.modalCard}`}>
        {/* Modal Title */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <CalendarDays size={18} style={{ color: "var(--color-primary)" }} />
            <span>
              {modalMode === "create" ? "Ghi chép phát sinh ngày" : "Chỉnh sửa ghi chép ngày"} {selectedDateStr}
            </span>
          </h2>
          <button onClick={onClose} className={styles.modalCloseBtn}>
            &times;
          </button>
        </div>

        {/* Create mode: Tabs selector */}
        {modalMode === "create" && (
          <div className={styles.modalTabsContainer}>
            <button
              type="button"
              onClick={() => setActiveDialogTab("attendance")}
              className={`${styles.modalTabBtn} ${activeDialogTab === "attendance" ? styles.modalTabBtnActive : ""}`}
            >
              Điểm danh bất thường
            </button>
            <button
              type="button"
              onClick={() => setActiveDialogTab("advance")}
              className={`${styles.modalTabBtn} ${activeDialogTab === "advance" ? styles.modalTabBtnActive : ""}`}
            >
              Tạm ứng tiền
            </button>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSave} className={styles.formWrapper}>
          {/* Common: Staff Select */}
          <div className="form-group">
            <label className="form-label">Nhân viên liên quan</label>
            <select
              value={formStaffId}
              onChange={(e) => setFormStaffId(e.target.value)}
              className="form-input"
              required
              disabled={modalMode === "edit"}
            >
              <option value="">-- Chọn nhân viên --</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Tab 1: Attendance Fields */}
          {activeDialogTab === "attendance" && (
            <>
              <div className="form-group">
                <label className="form-label">Loại bất thường</label>
                <select
                  value={formWorkStatus}
                  onChange={(e) => setFormWorkStatus(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="ABSENT">Vắng mặt (Không phép)</option>
                  <option value="LATE">Đi muộn</option>
                  <option value="EARLY_OUT">Về sớm</option>
                  <option value="LEAVE">Nghỉ phép (Có phép)</option>
                  <option value="SICK">Nghỉ ốm / Bệnh</option>
                </select>
              </div>

              {(formWorkStatus === "LATE" || formWorkStatus === "EARLY_OUT") && (
                <div className="form-group">
                  <label className="form-label">
                    {formWorkStatus === "LATE" ? "Số phút đi muộn (phút)" : "Số phút về sớm (phút)"}
                  </label>
                  <input
                    type="number"
                    value={formLateMinutes}
                    onChange={(e) => setFormLateMinutes(parseInt(e.target.value, 10) || 0)}
                    className="form-input"
                    min="1"
                    required
                  />
                </div>
              )}
            </>
          )}

          {/* Tab 2: Cash Advance Fields */}
          {activeDialogTab === "advance" && (
            <>
              <div className="form-group">
                <label className="form-label">Số tiền tạm ứng (VND)</label>
                <PriceInputWithSuggestion
                  value={formatNumber(formAdvanceAmount)}
                  onChange={(val: string) => {
                    const numericVal = parseInt(val.replace(/\D/g, ""), 10) || 0;
                    setFormAdvanceAmount(numericVal);
                  }}
                  required
                  placeholder="Nhập số tiền tạm ứng..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Trạng thái phê duyệt</label>
                <select
                  value={formAdvanceStatus}
                  onChange={(e) => setFormAdvanceStatus(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="PENDING">Chờ phê duyệt</option>
                  <option value="APPROVED">Đã duyệt & Chi tiền</option>
                  <option value="REJECTED">Từ chối ứng tiền</option>
                </select>
              </div>
            </>
          )}

          {/* Common: Note */}
          <div className="form-group">
            <label className="form-label">Ghi chú chi tiết</label>
            <textarea
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              className="form-input"
              rows={3}
              placeholder="Lý do chi tiết..."
            />
          </div>

          {/* Actions Footer */}
          <div className={`${styles.modalFooter} ${modalMode === "edit" ? styles.modalFooterEdit : styles.modalFooterCreate}`}>
            {modalMode === "edit" && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Trash2 size={14} /> Xóa bỏ
              </button>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Edit2 size={14} /> Lưu lại
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

