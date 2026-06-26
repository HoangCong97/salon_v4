import React, { useState } from "react";
import { CalendarClock, X, Search, Phone, MessageSquare, CheckCircle2 } from "lucide-react";
import { ModalState, Staff, ServiceItem, AppointmentStatus, AppointmentSource } from "./types";
import { START_HOUR, END_HOUR, MOCK_SERVICES, STATUS_CFG } from "./constants";
import { todayStr, getClosestTimeOption, addMinutes, fmtCurrency, getInitials } from "./helpers";

interface ServiceModalProps {
  state: ModalState;
  staffList: Staff[];
  onClose: () => void;
  onSave: (items: ServiceItem[]) => void;
  onDelete?: (id: string) => void;
}

export function ServiceModal({ state, staffList, onClose, onSave, onDelete }: ServiceModalProps) {
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

  const selSvcs = MOCK_SERVICES.filter(s => form.selectedServiceIds.includes(s.id));
  const totalDur = selSvcs.reduce((a, s) => a + s.duration, 0);
  const totalPrice = selSvcs.reduce((a, s) => a + s.price, 0);
  const filteredSvcs = MOCK_SERVICES.filter(s => s.name.toLowerCase().includes(svcSearch.toLowerCase()));

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
  const inp: React.CSSProperties = { width: "100%", height: 38, padding: "0 10px", boxSizing: "border-box", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", fontSize: 14, outline: "none", fontFamily: "inherit" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes sm-in{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes sm-bd{from{opacity:0}to{opacity:1}}`}</style>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)", animation: "sm-bd .2s ease" }} />
      <div style={{ position: "relative", zIndex: 1, background: "white", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(0,0,0,0.18)", animation: "sm-in .25s cubic-bezier(.16,1,.3,1)", fontFamily: "var(--font-family, system-ui, sans-serif)" }}>
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid rgba(15,23,42,0.07)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CalendarClock size={17} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{isEdit ? "Chỉnh sửa lịch hẹn" : "Thêm lịch hẹn"}</h2>
            <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{isEdit ? "Cập nhật thông tin" : "Mỗi dịch vụ = 1 thẻ độc lập trên lịch"}</p>
          </div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 6 }}><X size={19} /></button>
        </div>

        <div style={{ padding: "16px 22px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Row: Customer Name and Phone */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Tên khách hàng *</label>
              <div style={{ position: "relative" }}>
                <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                  placeholder="Nhập tên..." style={{ ...inp, paddingLeft: 28, borderColor: errors.customer ? "#ef4444" : "rgba(15,23,42,0.12)" }} />
              </div>
              {errors.customer && <p style={{ margin: "2px 0 0", fontSize: 10, color: "#ef4444" }}>{errors.customer}</p>}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Số điện thoại</label>
              <div style={{ position: "relative" }}>
                <Phone size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} placeholder="0912 345 678" style={{ ...inp, paddingLeft: 28 }} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Nguồn</label>
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value as AppointmentSource }))} style={{ ...inp, padding: "0 10px" }}>
                <option value="WALK_IN">🏠 Tại quầy</option>
                <option value="ONLINE">🌐 Online</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Ngày hẹn</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Giờ bắt đầu</label>
              <select value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} style={{ ...inp, padding: "0 10px" }}>
                {timeOpts.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
              Dịch vụ * {errors.services && <span style={{ color: "#ef4444", fontWeight: 400 }}>— {errors.services}</span>}
            </label>
            <div style={{ position: "relative", marginBottom: 6 }}>
              <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input value={svcSearch} onChange={e => setSvcSearch(e.target.value)} placeholder="Tìm dịch vụ..." style={{ ...inp, height: 34, paddingLeft: 28, fontSize: 12 }} />
            </div>
            <div style={{ maxHeight: 144, overflowY: "auto", border: "1px solid rgba(15,23,42,0.08)", borderRadius: 8, padding: 3 }}>
              {filteredSvcs.map(sv => {
                const sel = form.selectedServiceIds.includes(sv.id);
                return (
                  <div key={sv.id} onClick={() => setForm(f => ({ ...f, selectedServiceIds: sel ? f.selectedServiceIds.filter(x => x !== sv.id) : [...f.selectedServiceIds, sv.id] }))}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 9px", borderRadius: 6, cursor: "pointer", background: sel ? "#eff6ff" : "transparent" }}>
                    <div style={{ width: 15, height: 15, borderRadius: 4, border: `2px solid ${sel ? "#3b82f6" : "#cbd5e1"}`, background: sel ? "#3b82f6" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {sel && <CheckCircle2 size={9} color="white" />}
                    </div>
                    <span style={{ flex: 1, fontSize: 12, color: "#0f172a" }}>{sv.name}</span>
                    <span style={{ fontSize: 10, color: "#64748b" }}>{sv.duration}p</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#6366f1" }}>{fmtCurrency(sv.price)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {selSvcs.length > 0 && (
            <div style={{ background: "linear-gradient(135deg,#eff6ff,#f5f3ff)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 20 }}>
              <div><div style={{ fontSize: 10, color: "#64748b" }}>Tổng thời gian</div><div style={{ fontSize: 15, fontWeight: 700, color: "#3b82f6" }}>{totalDur}p</div></div>
              <div style={{ width: 1, background: "rgba(99,102,241,0.2)" }} />
              <div><div style={{ fontSize: 10, color: "#64748b" }}>Tổng tiền</div><div style={{ fontSize: 15, fontWeight: 700, color: "#6366f1" }}>{fmtCurrency(totalPrice)}</div></div>
              {!isEdit && selSvcs.length > 1 && (
                <><div style={{ width: 1, background: "rgba(99,102,241,0.2)" }} /><div><div style={{ fontSize: 10, color: "#64748b" }}>Số thẻ trên lịch</div><div style={{ fontSize: 15, fontWeight: 700, color: "#8b5cf6" }}>{selSvcs.length}</div></div></>
              )}
            </div>
          )}
          {isEdit && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Trạng thái</label>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {(Object.keys(STATUS_CFG) as AppointmentStatus[]).map(s => {
                  const cfg = STATUS_CFG[s]; const act = form.status === s;
                  return (
                    <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                      style={{ padding: "4px 9px", borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${act ? cfg.dot : "rgba(15,23,42,0.1)"}`, background: act ? cfg.bg : "transparent", color: act ? cfg.text : "#64748b" }}>
                      <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: cfg.dot, marginRight: 4, verticalAlign: "middle" }} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
              <MessageSquare size={10} style={{ marginRight: 3, verticalAlign: "middle" }} />Ghi chú
            </label>
            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Yêu cầu đặc biệt..." rows={2}
              style={{ width: "100%", border: "1.5px solid rgba(15,23,42,0.12)", borderRadius: 8, fontSize: 12, padding: "7px 10px", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
        </div>

        <div style={{ padding: "12px 22px", borderTop: "1px solid rgba(15,23,42,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {isEdit && onDelete && (
              <button onClick={() => onDelete(state.item!.id)}
                style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #fca5a5", background: "#fff1f2", fontSize: 12, fontWeight: 600, color: "#ef4444", cursor: "pointer" }}>
                Xóa lịch hẹn
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(15,23,42,0.12)", background: "transparent", fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Hủy</button>
            <button onClick={handleSave} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontSize: 13, fontWeight: 600, color: "white", cursor: "pointer", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
              {isEdit ? "Lưu thay đổi" : `Thêm ${selSvcs.length > 1 ? selSvcs.length + " dịch vụ" : "lịch hẹn"}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
