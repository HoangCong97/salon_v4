import React, { useState } from "react";
import { CalendarClock, X, Search, Phone, MessageSquare, CheckCircle2 } from "lucide-react";
import { ModalState, Staff, ServiceItem, AppointmentStatus, AppointmentSource, AppointmentService } from "./types";
import { START_HOUR, END_HOUR, STATUS_CFG } from "./constants";
import { todayStr, getClosestTimeOption, addMinutes, fmtCurrency } from "./helpers";

import styles from "./Appointments.module.css";

interface ServiceModalProps {
  state: ModalState;
  staffList: Staff[];
  serviceList: AppointmentService[];
  onClose: () => void;
  onSave: (items: ServiceItem[]) => void;
  onDelete?: (id: string) => void;
}

export function ServiceModal({ state, staffList, serviceList, onClose, onSave, onDelete }: ServiceModalProps) {
  const isEdit = state.mode === "edit";
  const [form, setForm] = useState({
    customerName: state.item?.customerName ?? "",
    customerPhone: state.item?.customerPhone ?? "",
    staffId: state.item?.staffId ?? state.prefill?.staffId ?? "",
    selectedServiceIds: state.item ? [state.item.service.id] : [] as string[],
    startTime: state.item?.startTime ?? state.prefill?.startTime ?? getClosestTimeOption(START_HOUR, END_HOUR),
    date: state.item?.date ?? state.prefill?.date ?? todayStr(),
    status: (state.item?.status ?? "CONFIRMED") as AppointmentStatus,
    source: (state.item?.source ?? "WALK_IN") as AppointmentSource,
    note: state.item?.note ?? "",
  });
  const [svcSearch, setSvcSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selSvcs = serviceList.filter(s => form.selectedServiceIds.includes(s.id));
  const totalDur = selSvcs.reduce((a, s) => a + s.duration, 0);
  const totalPrice = selSvcs.reduce((a, s) => a + s.price, 0);
  const filteredSvcs = serviceList.filter(s => s.name.toLowerCase().includes(svcSearch.toLowerCase()));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customer = "Nhập tên khách hàng";
    if (form.selectedServiceIds.length === 0) e.services = "Chọn ít nhất 1 dịch vụ";
    setErrors(e); return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    const groupId = isEdit ? state.item!.groupId : `g${Date.now()}`;
    const newItems: ServiceItem[] = [];
    let t = form.startTime;
    selSvcs.forEach((sv, idx) => {
      newItems.push({
        id: isEdit && selSvcs.length === 1 ? state.item!.id : `${groupId}-${idx}-${Date.now() + idx}`,
        groupId,
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone || undefined,
        service: sv,
        staffId: form.staffId, // empty if not assigned
        startTime: t,
        date: form.date,
        status: form.status,
        source: form.source,
        note: form.note || undefined,
      });
      t = addMinutes(t, sv.duration);
    });
    onSave(newItems);
  };

  const timeOpts: string[] = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    timeOpts.push(`${String(h).padStart(2, "0")}:00`);
    timeOpts.push(`${String(h).padStart(2, "0")}:15`);
    timeOpts.push(`${String(h).padStart(2, "0")}:30`);
    timeOpts.push(`${String(h).padStart(2, "0")}:45`);
  }

  return (
    <div className={styles.modalOverlay}>
      <style>{`
        @keyframes sm-in{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes sm-bd{from{opacity:0}to{opacity:1}}
      `}</style>
      <div onClick={onClose} className={styles.modalBackdrop} />
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderIconWrapper}>
            <CalendarClock size={17} color="white" />
          </div>
          <div>
            <h2 className={styles.modalHeaderTitle}>
              {isEdit ? "Chỉnh sửa lịch hẹn" : "Thêm lịch hẹn"}
            </h2>
            <p className={styles.modalHeaderSub}>
              {isEdit ? "Cập nhật thông tin" : "Mỗi dịch vụ = 1 thẻ độc lập trên lịch"}
            </p>
          </div>
          <button onClick={onClose} className={styles.modalCloseBtn}>
            <X size={19} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Row: Customer Name and Phone */}
          <div className={styles.formGrid2}>
            <div>
              <label className={styles.inputLabel}>Tên khách hàng *</label>
              <div className={styles.inputRelative}>
                <div className={styles.inputIconLeft}>
                  <Search size={12} />
                </div>
                <input
                  value={form.customerName}
                  onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                  placeholder="Nhập tên..."
                  className={styles.textInput}
                  style={{
                    paddingLeft: 28,
                    borderColor: errors.customer ? "#ef4444" : "rgba(15,23,42,0.12)",
                  }}
                />
              </div>
              {errors.customer && <p className={styles.errorText}>{errors.customer}</p>}
            </div>
            <div>
              <label className={styles.inputLabel}>Số điện thoại</label>
              <div className={styles.inputRelative}>
                <div className={styles.inputIconLeft}>
                  <Phone size={12} />
                </div>
                <input
                  value={form.customerPhone}
                  onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))}
                  placeholder="0912 345 678"
                  className={styles.textInput}
                  style={{ paddingLeft: 28 }}
                />
              </div>
            </div>
          </div>

          <div className={styles.formGrid2}>
            <div>
              <label className={styles.inputLabel}>Nguồn</label>
              <select
                value={form.source}
                onChange={e => setForm(f => ({ ...f, source: e.target.value as AppointmentSource }))}
                className={styles.selectInput}
              >
                <option value="WALK_IN">🏠 Tại quầy</option>
                <option value="ONLINE">🌐 Online</option>
              </select>
            </div>
            <div>
              <label className={styles.inputLabel}>Ngày hẹn</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className={styles.dateInput}
              />
            </div>
          </div>

          <div className={styles.formGrid2}>
            <div>
              <label className={styles.inputLabel}>Giờ bắt đầu</label>
              <select
                value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className={styles.selectInput}
              >
                {timeOpts.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={styles.inputLabel}>
              Dịch vụ * {errors.services && <span style={{ color: "#ef4444", fontWeight: 400 }}>— {errors.services}</span>}
            </label>
            <div className={styles.searchServiceWrapper}>
              <div className={styles.inputIconLeft}>
                <Search size={12} />
              </div>
              <input
                value={svcSearch}
                onChange={e => setSvcSearch(e.target.value)}
                placeholder="Tìm dịch vụ..."
                className={styles.textInput}
                style={{ height: 34, paddingLeft: 28, fontSize: 12 }}
              />
            </div>
            <div className={styles.servicesListContainer}>
              {filteredSvcs.map(sv => {
                const sel = form.selectedServiceIds.includes(sv.id);
                return (
                  <div
                    key={sv.id}
                    onClick={() => setForm(f => ({
                      ...f,
                      selectedServiceIds: sel
                        ? f.selectedServiceIds.filter(x => x !== sv.id)
                        : [...f.selectedServiceIds, sv.id]
                    }))}
                    className={styles.serviceItemRow}
                    style={{ background: sel ? "#eff6ff" : "transparent" }}
                  >
                    <div className={`${styles.serviceCheckbox} ${sel ? styles.serviceCheckboxSelected : ""}`}>
                      {sel && <CheckCircle2 size={9} color="white" />}
                    </div>
                    <span className={styles.serviceItemName}>{sv.name}</span>
                    <span className={styles.serviceItemDuration}>{sv.duration}p</span>
                    <span className={styles.serviceItemPrice}>{fmtCurrency(sv.price)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {selSvcs.length > 0 && (
            <div className={styles.summaryGradientBox}>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Tổng thời gian</div>
                <div className={styles.summaryValueBlue}>{totalDur}p</div>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Tổng tiền</div>
                <div className={styles.summaryValuePurple}>{fmtCurrency(totalPrice)}</div>
              </div>
              {!isEdit && selSvcs.length > 1 && (
                <>
                  <div className={styles.summaryDivider} />
                  <div className={styles.summaryItem}>
                    <div className={styles.summaryLabel}>Số thẻ trên lịch</div>
                    <div className={styles.summaryValueViolet}>{selSvcs.length}</div>
                  </div>
                </>
              )}
            </div>
          )}

          {isEdit && (
            <div>
              <label className={styles.inputLabel}>Trạng thái</label>
              <div className={styles.statusButtonsContainer}>
                {(Object.keys(STATUS_CFG) as AppointmentStatus[]).map(s => {
                  const cfg = STATUS_CFG[s];
                  const act = form.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={styles.statusModalBtn}
                      style={{
                        border: `1.5px solid ${act ? cfg.dot : "rgba(15,23,42,0.1)"}`,
                        background: act ? cfg.bg : "transparent",
                        color: act ? cfg.text : "#64748b"
                      }}
                    >
                      <span className={styles.statusModalDot} style={{ background: cfg.dot }} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            <label className={styles.inputLabel}>
              <MessageSquare size={10} style={{ marginRight: 3, verticalAlign: "middle" }} />Ghi chú
            </label>
            <textarea
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Yêu cầu đặc biệt..."
              rows={2}
              className={styles.noteTextarea}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <div>
            {isEdit && onDelete && (
              <button onClick={() => onDelete(state.item!.id)} className={styles.deleteBtn}>
                Xóa lịch hẹn
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} className={styles.cancelBtn}>Hủy</button>
            <button onClick={handleSave} className={styles.saveBtn}>
              {isEdit ? "Lưu thay đổi" : `Thêm ${selSvcs.length > 1 ? selSvcs.length + " dịch vụ" : "lịch hẹn"}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
