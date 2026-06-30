import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/useAuthStore";
import {
  CalendarClock, ChevronLeft, ChevronRight, Plus,
  Clock, Phone, Loader2, Scissors,
  Globe, Home, Users, User,
} from "lucide-react";
import { useToast } from "../../../components/desktop/ToastProvider";
import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";

import {
  ViewMode, ServiceItem, AppointmentStatus, AppointmentSource, Staff, AppointmentService,
} from "./types";

import {
  SLOT_HEIGHT, START_HOUR, END_HOUR, TOTAL_SLOTS, TIME_COL_W, SIDEBAR_W,
  STATUS_CFG,
} from "./constants";

import {
  todayStr, toLocalDateStr, hashColor, hashBg, hashBorder, timeToSlot, slotToTime,
  durationSlots, getInitials, fmtDateVN,
  getClosestTimeOption
} from "./helpers";

import { GridServiceCard } from "./GridServiceCard";
import { ServiceModal } from "./ServiceModal";

// ─── Staff color palette ────────────────────────────────────────────────────────
const STAFF_COLORS = ["#6366f1","#ec4899","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#f97316","#14b8a6","#e11d48"];
const assignColor = (index: number) => STAFF_COLORS[index % STAFF_COLORS.length];

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function Appointments() {
  const { currentBranchId, currentTenantId } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [serviceList, setServiceList] = useState<AppointmentService[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("by-staff");
  const [dragState, setDragState] = useState<any>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [modal, setModal] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // Scroll synchronization refs
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);

  const handleGridScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (sidebarScrollRef.current && sidebarScrollRef.current.scrollTop !== target.scrollTop) {
      sidebarScrollRef.current.scrollTop = target.scrollTop;
    }
  };

  const handleSidebarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (gridScrollRef.current && gridScrollRef.current.scrollTop !== target.scrollTop) {
      gridScrollRef.current.scrollTop = target.scrollTop;
    }
  };

  // Current time
  const [nowMins, setNowMins] = useState(() => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); });
  useEffect(() => {
    const t = setInterval(() => { const n = new Date(); setNowMins(n.getHours() * 60 + n.getMinutes()); }, 60000);
    return () => clearInterval(t);
  }, []);
  const isToday = selectedDate === todayStr();
  const currentTimePx = useMemo(() => {
    const m = nowMins - START_HOUR * 60;
    return (m < 0 || m > (END_HOUR - START_HOUR) * 60) ? -1 : (m / 15) * SLOT_HEIGHT;
  }, [nowMins]);
  const nowLabel = useMemo(() =>
    `${String(Math.floor(nowMins / 60)).padStart(2, "0")}:${String(nowMins % 60).padStart(2, "0")}`,
    [nowMins]);

  // TanStack Queries
  const { data: dbStaff = [] } = useQuery<any[]>({
    queryKey: queryKeys.staff.list(currentTenantId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/staff`),
    enabled: !!currentTenantId,
  });

  const { data: dbServices = [] } = useQuery<any[]>({
    queryKey: queryKeys.services.list(currentTenantId!, currentBranchId),
    queryFn: () => api.get(`/tenants/${currentTenantId}/services?branchId=${currentBranchId}`),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const { data: dbBookings = [], isLoading: bookingsLoading } = useQuery<ServiceItem[]>({
    queryKey: [...queryKeys.appointments.list(currentTenantId!, currentBranchId!), selectedDate],
    queryFn: () => api.get(`/tenants/${currentTenantId}/bookings?branchId=${currentBranchId}&date=${selectedDate}`),
    enabled: !!currentTenantId && !!currentBranchId && !!selectedDate,
  });

  // Sync to local states for compatibility and mutations
  useEffect(() => {
    if (dbStaff.length > 0) {
      const mapped: Staff[] = dbStaff
        .filter(s => s.status === "ACTIVE" && s.branches?.some((b: any) => b.id === currentBranchId))
        .map((s, i) => ({ id: s.id, name: s.name, color: assignColor(i) }));
      setStaffList(mapped.length > 0 ? mapped : dbStaff.filter(s => s.status === "ACTIVE").map((s, i) => ({ id: s.id, name: s.name, color: assignColor(i) })));
    }
  }, [dbStaff, currentBranchId]);

  useEffect(() => {
    if (dbServices.length > 0) {
      setServiceList(dbServices.map(s => ({ id: s.id, name: s.name, duration: s.duration ?? 30, price: Number(s.price) })));
    }
  }, [dbServices]);

  useEffect(() => {
    if (dbBookings) {
      setItems(dbBookings);
      setSelectedCustomer(null);
    }
  }, [dbBookings]);

  const loading = bookingsLoading;

  const _todayItems = useMemo(() => items.filter(i => i.date === selectedDate), [items, selectedDate]);

  // Keep previous items visible during loading to prevent empty grid flash
  const prevItemsRef = useRef<ServiceItem[]>([]);
  const todayItems = _todayItems.length > 0 || !loading ? _todayItems : prevItemsRef.current;
  useEffect(() => {
    if (_todayItems.length > 0) prevItemsRef.current = _todayItems;
  }, [_todayItems]);

  const customerList = useMemo(() => {
    const map = new Map<string, { name: string; phone?: string; earliest: number }>();
    todayItems.forEach(item => {
      // Filter so only customers with at least one unscheduled service item appear!
      const hasUnscheduled = todayItems.some(i => i.customerName === item.customerName && !i.staffId);
      if (hasUnscheduled) {
        const slot = timeToSlot(item.startTime);
        if (!map.has(item.customerName) || map.get(item.customerName)!.earliest > slot)
          map.set(item.customerName, { name: item.customerName, phone: item.customerPhone, earliest: slot });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.earliest - b.earliest);
  }, [todayItems]);

  useEffect(() => {
    if (!selectedCustomer && customerList.length > 0) {
      setSelectedCustomer(customerList[0].name);
    }
  }, [customerList, selectedCustomer]);

  const customerItems = useMemo(() =>
    !selectedCustomer ? [] :
      todayItems.filter(i => i.customerName === selectedCustomer).sort((a, b) => timeToSlot(a.startTime) - timeToSlot(b.startTime)),
    [todayItems, selectedCustomer]
  );
  const selCust = customerList.find(c => c.name === selectedCustomer);

  // ── Columns ────────────────────────────────────────────────────────────────────

  const staffCols = staffList;
  const customerCols = useMemo(() => {
    const seen = new Set<string>();
    const cols: { id: string; name: string; phone?: string }[] = [];
    todayItems.forEach(i => { if (!seen.has(i.customerName)) { seen.add(i.customerName); cols.push({ id: i.customerName, name: i.customerName, phone: i.customerPhone }); } });
    return cols.sort((a, b) => {
      const at = Math.min(...todayItems.filter(i => i.customerName === a.name).map(i => timeToSlot(i.startTime)));
      const bt = Math.min(...todayItems.filter(i => i.customerName === b.name).map(i => timeToSlot(i.startTime)));
      return at - bt;
    });
  }, [todayItems]);

  const activeCols = viewMode === "by-staff" ? staffCols : customerCols;
  const colW = Math.max(155, Math.min(240, Math.floor((window.innerWidth - SIDEBAR_W - TIME_COL_W - 260) / Math.max(activeCols.length, 1))));

  // ── Per-column items & occupied slots ─────────────────────────────────────────

  const occupiedBodySlots = useMemo(() => {
    const set = new Set<string>();
    todayItems.forEach(item => {
      if (item.id === dragState?.id) return; // exclude dragged item
      const startSlot = timeToSlot(item.startTime);
      const colId = viewMode === "by-staff" ? item.staffId : item.customerName;
      for (let i = 1; i < durationSlots(item.service.duration); i++) {
        set.add(`${colId}:${startSlot + i}`);
      }
    });
    return set;
  }, [todayItems, viewMode, dragState?.id]);

  const isSlotRangeBlocked = useCallback((colId: string, startSlot: number, slotsNeeded: number, dragId: string) => {
    if (startSlot + slotsNeeded > TOTAL_SLOTS) return true;
    for (let s = startSlot; s < startSlot + slotsNeeded; s++) {
      const cellKey = `${colId}:${s}`;
      const hasOtherStart = todayItems.some(i =>
        i.id !== dragId &&
        (viewMode === "by-staff" ? i.staffId === colId : i.customerName === colId) &&
        timeToSlot(i.startTime) === s
      );
      if (hasOtherStart) return true;
      if (occupiedBodySlots.has(cellKey)) return true;
    }
    return false;
  }, [todayItems, viewMode, occupiedBodySlots]);

  // ── Card colors ─────────────────────────────────────────────────────────────────

  const getColors = (item: ServiceItem) => {
    if (viewMode === "by-staff") {
      return { accentColor: hashColor(item.customerName), bgColor: hashBg(item.customerName), bdColor: hashBorder(item.customerName) };
    } else {
      const c = staffList.find(s => s.id === item.staffId)?.color ?? "#6366f1";
      return { accentColor: c, bgColor: c + "14", bdColor: c + "55" };
    }
  };

  // ── Drag handlers ──────────────────────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, id: string, source: "grid" | "sidebar") => {
    setDragState({ id, source }); e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragEnd = useCallback((_id: string) => {
    setDragState(null); setDragOverKey(null);
  }, []);

  const handleDrop = useCallback((colId: string, slot: number) => {
    if (!dragState) return;
    const newStaffId = viewMode === "by-staff" ? colId : undefined;
    const newStartTime = slotToTime(slot);
    // Optimistic update
    setItems(prev => prev.map(item => {
      if (item.id !== dragState.id) return item;
      return { ...item, staffId: newStaffId ?? item.staffId, startTime: newStartTime, date: selectedDate };
    }));
    setDragState(null); setDragOverKey(null);
    // Persist to backend
    api.put(`/tenants/${currentTenantId}/bookings/${dragState.id}/assign`, {
      staffId: newStaffId,
      startTime: newStartTime,
      date: selectedDate
    })
      .then(() => {
        toast.success("Xếp lịch nhân viên thành công!");
        queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all(currentTenantId!) });
      })
      .catch((err) => {
        toast.error("Lỗi cập nhật lịch: " + err.message);
        queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all(currentTenantId!) });
      });
  }, [dragState, viewMode, selectedDate, currentTenantId, queryClient]);

  // ── Modal ──────────────────────────────────────────────────────────────────────

  const handleModalSave = async (newItems: ServiceItem[]) => {
    if (modal?.mode === "create") {
      // Call backend to create booking
      try {
        const first = newItems[0];
        const created: ServiceItem[] = await api.post(`/tenants/${currentTenantId}/bookings`, {
          branchId: currentBranchId,
          customerName: first.customerName,
          customerPhone: first.customerPhone,
          source: first.source,
          note: first.note,
          date: first.date,
          details: newItems.map(item => ({
            serviceId: item.service.id,
            staffId: item.staffId || undefined,
            startTime: item.startTime,
            duration: item.service.duration,
            status: item.status,
          })),
        });
        toast.success("Tạo lịch hẹn thành công!");
        queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all(currentTenantId!) });
      } catch (err: any) {
        toast.error("Lỗi tạo lịch hẹn: " + err.message);
        // Fallback: add locally with temp IDs
        setItems(prev => [...prev, ...newItems]);
      }
    } else {
      setItems(prev => { const without = prev.filter(i => i.id !== modal?.item?.id); return [...without, ...newItems]; });
    }
    setModal(null);
  };

  const handleCardResize = useCallback((id: string, newDuration: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, service: { ...item.service, duration: newDuration } } : item
    ));
    // Persist to backend
    api.put(`/tenants/${currentTenantId}/bookings/${id}/resize`, { duration: newDuration })
      .then(() => {
        toast.success("Cập nhật thời lượng thành công!");
        queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all(currentTenantId!) });
      })
      .catch((err) => {
        toast.error("Lỗi cập nhật thời lượng: " + err.message);
        queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all(currentTenantId!) });
      });
  }, [currentTenantId, queryClient]);

  const timeSlots = useMemo(() => Array.from({ length: TOTAL_SLOTS }, (_, i) => i), []);
  const gridH = TOTAL_SLOTS * SLOT_HEIGHT;

  const navigateDate = (d: number) => {
    const dt = new Date(selectedDate + "T00:00:00"); dt.setDate(dt.getDate() + d);
    setSelectedDate(toLocalDateStr(dt));
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      backgroundColor: "var(--bg-card)",
      border: "1px solid var(--border-color)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-md)",
      overflow: "hidden",
      fontFamily: "var(--font-family, system-ui, sans-serif)",
    }}>
      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes now-blink{0%,100%{opacity:1}50%{opacity:.5}}
      `}</style>

      {/* ══ Row 1: Left Page Header & Right Customer Tabs Header ═══════════════════ */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
        {/* Left Page Header */}
        <div style={{ flex: 1, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CalendarClock size={19} color="white" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Lịch hẹn</h1>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-secondary)" }}>Quản lý lịch hẹn · Kéo thả để xếp lịch</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: 10 }}>
            <button onClick={() => navigateDate(-1)} style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={16} />
            </button>
            <div style={{ padding: "6px 16px", borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 600, minWidth: 160, textAlign: "center", background: isToday ? "var(--color-primary)" : "white", border: isToday ? "none" : "1px solid var(--border-color)", color: isToday ? "white" : "var(--text-primary)" }}>
              {fmtDateVN(selectedDate)}
            </div>
            <button onClick={() => navigateDate(1)} style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronRight size={16} />
            </button>
            {!isToday && <button onClick={() => setSelectedDate(todayStr())} style={{ padding: "6px 12px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--color-primary)", background: "var(--color-primary-light)", fontSize: 12, fontWeight: 600, color: "var(--color-primary)", cursor: "pointer" }}>Hôm nay</button>}
          </div>

          <div style={{ display: "flex", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", overflow: "hidden", marginLeft: 8 }}>
            {([
              { mode: "by-staff" as ViewMode, icon: Users, label: "Theo nhân viên" },
              { mode: "by-customer" as ViewMode, icon: User, label: "Theo khách hàng" },
            ] as { mode: ViewMode; icon: React.ComponentType<any>; label: string }[]).map(({ mode, icon: Icon, label }) => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: viewMode === mode ? "var(--color-primary)" : "white", color: viewMode === mode ? "white" : "var(--text-secondary)", transition: "all 0.15s ease" }}>
                <Icon size={14} />{label}
              </button>
            ))}
          </div>

          {/* Status badges + Add Button on the right */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            {/* Status badges */}
            <div style={{ display: "flex", gap: 5 }}>
              {(["PENDING", "CONFIRMED", "IN_PROGRESS"] as AppointmentStatus[]).map(s => {
                const cnt = todayItems.filter(i => i.status === s).length;
                const cfg = STATUS_CFG[s];
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: cfg.text }}>{cnt}</span>
                  </div>
                );
              })}
            </div>

            {/* Add appointment button */}
            <button
              onClick={() => setModal({
                mode: "create",
                prefill: {
                  staffId: "", // Default to no staff, puts them in the queue!
                  startTime: getClosestTimeOption(START_HOUR, END_HOUR),
                  date: selectedDate
                }
              })}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", background: "var(--color-primary)", color: "white", fontSize: 12, fontWeight: 600, boxShadow: "var(--shadow-sm)", transition: "all 0.15s ease", whiteSpace: "nowrap" }}>
              <Plus size={14} />Thêm lịch hẹn
            </button>
          </div>
        </div>

        {/* Right Customer Tabs Header */}
        <div style={{ width: SIDEBAR_W, borderLeft: "1px solid var(--border-color)", padding: "12px 14px 0", background: "var(--bg-card)", display: "flex", flexDirection: "column", flexShrink: 0, boxSizing: "border-box", height: 68, overflow: "hidden" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "0.05em", flexShrink: 0 }}>
            DANH SÁCH KHÁCH CHỜ
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingTop: 6, paddingBottom: 6, scrollbarWidth: "none", flex: 1, alignItems: "center" }}>
            {customerList.map(cust => {
              const active = selectedCustomer === cust.name;
              const cc = hashColor(cust.name);
              return (
                <button key={cust.name}
                  onClick={() => {
                    setSelectedCustomer(cust.name);
                    const targetScrollTop = cust.earliest * SLOT_HEIGHT - 40;
                    if (gridScrollRef.current) gridScrollRef.current.scrollTop = Math.max(0, targetScrollTop);
                    if (sidebarScrollRef.current) sidebarScrollRef.current.scrollTop = Math.max(0, targetScrollTop);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    padding: "4px 8px",
                    borderRadius: "var(--radius-sm)",
                    border: active ? `1px solid ${cc}` : "1px solid #64748b",
                    cursor: "pointer",
                    flexShrink: 0,
                    minWidth: 60,
                    background: active ? cc + "18" : "transparent",
                    transition: "all 0.15s ease",
                  }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: active ? cc : "#64748b", whiteSpace: "nowrap", maxWidth: 56, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {cust.name.split(" ").pop()}
                  </span>
                </button>
              );
            })}
            {customerList.length === 0 && <div style={{ fontSize: 12, color: "#94a3b8", padding: "8px 4px" }}>Chưa có lịch hẹn</div>}
          </div>
        </div>
      </div>

      {/* ══ Row 2: Left Legend & Right Selected Customer Info ══════════════════════ */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", flexShrink: 0, height: 36 }}>
        {/* Left Legend */}
        <div style={{ flex: 1, padding: "8px 20px", background: "var(--bg-app)", display: "flex", alignItems: "center", gap: 12, overflow: "hidden" }}>
          {viewMode === "by-staff" ? (
            <>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", flexShrink: 0 }}>Màu = khách hàng:</span>
              {Array.from(new Set(todayItems.map(i => i.customerName))).slice(0, 8).map(name => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "4px", background: hashColor(name) }} />
                  <span style={{ fontSize: 11, color: "var(--text-primary)" }}>{name}</span>
                </div>
              ))}
            </>
          ) : (
            <>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", flexShrink: 0 }}>Màu = nhân viên:</span>
              {staffList.filter(s => todayItems.some(i => i.staffId === s.id)).map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "4px", background: s.color }} />
                  <span style={{ fontSize: 11, color: "var(--text-primary)" }}>{s.name}</span>
                </div>
              ))}
            </>
          )}

          {/* Current Time Line Legend on the right */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", flexShrink: 0 }}>
            <div style={{ width: 16, height: 2, background: "var(--color-danger)" }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-danger)" }} />
            <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>Giờ hiện tại</span>
          </div>
        </div>

        {/* Right Selected Customer Info */}
        <div style={{ width: SIDEBAR_W, borderLeft: "1px solid var(--border-color)", padding: "0 14px", background: "var(--bg-card)", display: "flex", alignItems: "center", flexShrink: 0, boxSizing: "border-box" }}>
          {selCust ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 130 }}>
                {selCust.name}
              </div>
              {selCust.phone && (
                <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
                  <Phone size={11} />{selCust.phone}
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Chưa chọn khách hàng</div>
          )}
        </div>
      </div>

      {/* ══ Row 3: Grid (Left) & Timeline (Right) ══════════════════════════════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Grid Container */}
        <div ref={gridScrollRef} onScroll={handleGridScroll} style={{ flex: 1, overflowY: "auto", overflowX: "auto", display: "flex", flexDirection: "column", position: "relative" }}>
          {/* Loading overlay – grid stays mounted underneath */}
          {loading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-secondary)", background: "rgba(255,255,255,0.7)", zIndex: 30, backdropFilter: "blur(2px)" }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />Đang tải lịch hẹn...
            </div>
          )}
            <>
              {/* Sticky column headers */}
              <div style={{ display: "flex", position: "sticky", top: 0, zIndex: 20, background: "var(--bg-card)", borderBottom: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)", height: 52, boxSizing: "border-box" }}>
                <div style={{ width: TIME_COL_W, flexShrink: 0, borderRight: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", height: "100%", boxSizing: "border-box" }}>
                  <Clock size={14} color="var(--text-muted)" />
                </div>
                {viewMode === "by-staff"
                  ? staffCols.map(s => (
                    <div key={s.id} style={{ width: colW, flexShrink: 0, padding: "8px 12px", borderRight: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 8, borderTop: `3px solid ${s.color}`, height: "100%", boxSizing: "border-box" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${s.color}cc,${s.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0, boxShadow: `0 2px 8px ${s.color}44` }}>
                        {getInitials(s.name)}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>{todayItems.filter(i => i.staffId === s.id && i.status !== "CANCELLED").length} DV</div>
                      </div>
                    </div>
                  ))
                  : customerCols.map(c => {
                    const cc = hashColor(c.name);
                    return (
                      <div key={c.id} style={{ width: colW, flexShrink: 0, padding: "8px 12px", borderRight: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 8, borderTop: `3px solid ${cc}`, height: "100%", boxSizing: "border-box" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: hashBg(c.name), border: `2px solid ${hashBorder(c.name)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: cc, flexShrink: 0 }}>
                          {getInitials(c.name)}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{c.name}</div>
                          {c.phone && <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>{c.phone}</div>}
                        </div>
                      </div>
                    );
                  })
                }
              </div>

              {/* Grid body */}
              <div style={{ display: "flex", position: "relative" }}>
                {/* Current time line */}
                {isToday && currentTimePx >= 0 && (
                  <div style={{ position: "absolute", top: currentTimePx, left: 0, right: 0, height: 2, background: "linear-gradient(to right,var(--color-danger),#f87171)", zIndex: 15, pointerEvents: "none" }}>
                    <div style={{ position: "absolute", left: TIME_COL_W - 5, top: -5, width: 12, height: 12, borderRadius: "50%", background: "var(--color-danger)", border: "2px solid white", boxShadow: "0 0 8px rgba(239,68,68,0.6)", animation: "now-blink 2s ease-in-out infinite" }} />
                    <div style={{ position: "absolute", left: 4, top: -10, fontSize: 9, fontWeight: 700, color: "var(--color-danger)", background: "white", padding: "1px 5px", borderRadius: 4, border: "1px solid #fca5a5" }}>{nowLabel}</div>
                  </div>
                )}

                {/* Time gutter */}
                <div style={{ width: TIME_COL_W, flexShrink: 0, background: "var(--bg-app)", borderRight: "1px solid var(--border-color)" }}>
                  {timeSlots.map(slot => (
                    <div key={slot} style={{ height: SLOT_HEIGHT, borderBottom: (slot + 1) % 4 === 0 ? "1px solid var(--border-color)" : "1px dashed var(--border-color)", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 8, paddingTop: 4 }}>
                      {slot % 4 === 0 && <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{slotToTime(slot)}</span>}
                    </div>
                  ))}
                </div>

                {/* Columns */}
                {activeCols.map(col => {
                  const colId = col.id;
                  const colItems = todayItems.filter(item =>
                    viewMode === "by-staff" ? item.staffId === colId : item.customerName === colId
                  );

                  return (
                    <div key={colId}
                      onDragOver={e => {
                        e.preventDefault();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        const slot = Math.floor(y / SLOT_HEIGHT);
                        if (slot >= 0 && slot < TOTAL_SLOTS) {
                          setDragOverKey(`${colId}:${slot}`);
                        }
                      }}
                      onDragLeave={e => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setDragOverKey(null);
                        }
                      }}
                      onDrop={e => {
                        e.preventDefault();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        const slot = Math.floor(y / SLOT_HEIGHT);
                        if (slot >= 0 && slot < TOTAL_SLOTS) {
                          const draggedItem = items.find(i => i.id === dragState?.id);
                          const slotsNeeded = draggedItem ? durationSlots(draggedItem.service.duration) : 1;
                          const blocked = isSlotRangeBlocked(colId, slot, slotsNeeded, dragState?.id ?? "");
                          if (!blocked) {
                            handleDrop(colId, slot);
                          }
                        }
                        setDragOverKey(null);
                      }}
                      style={{
                        width: colW, flexShrink: 0,
                        borderRight: "1px solid var(--border-color)",
                        position: "relative",
                        height: gridH,
                      }}
                    >
                      {/* Layer 1: Background slots for grid lines & drop hover */}
                      {timeSlots.map(slot => {
                        const cellKey = `${colId}:${slot}`;
                        const isHour = (slot + 1) % 4 === 0;
                        const draggedItem = items.find(i => i.id === dragState?.id);
                        const slotsNeeded = draggedItem ? durationSlots(draggedItem.service.duration) : 1;

                        let isHighlightedTarget = false;
                        let highlightBlocked = false;

                        if (dragState && dragOverKey) {
                          const [overColId, overSlotStr] = dragOverKey.split(":");
                          const overSlot = parseInt(overSlotStr, 10);
                          if (overColId === colId && slot >= overSlot && slot < overSlot + slotsNeeded) {
                            isHighlightedTarget = true;
                            highlightBlocked = isSlotRangeBlocked(colId, overSlot, slotsNeeded, dragState.id);
                          }
                        }

                        const hasOtherStart = colItems.some(i => i.id !== dragState?.id && timeToSlot(i.startTime) === slot);
                        const isBodyOfOther = occupiedBodySlots.has(cellKey);
                        const blocked = hasOtherStart || isBodyOfOther;

                        return (
                          <div key={slot} style={{
                            position: "absolute",
                            top: slot * SLOT_HEIGHT,
                            left: 0, right: 0, height: SLOT_HEIGHT,
                            borderBottom: isHour ? "1px solid var(--border-color)" : "1px dashed var(--border-color)",
                            background: isHighlightedTarget
                              ? (highlightBlocked ? "rgba(239,68,68,0.07)" : "rgba(99,102,241,0.08)")
                              : "transparent",
                            pointerEvents: "none",
                            zIndex: 0,
                            transition: "background-color 0.15s",
                          }}
                          >
                            {isHighlightedTarget && slot === parseInt(dragOverKey!.split(":")[1], 10) && (
                              <div style={{
                                position: "absolute",
                                top: 2, left: 2, right: 2,
                                height: slotsNeeded * SLOT_HEIGHT - 4,
                                border: `2px dashed ${highlightBlocked ? "var(--color-danger)" : "var(--color-primary)"}`,
                                borderRadius: 6,
                                pointerEvents: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: highlightBlocked ? "rgba(239,68,68,0.05)" : "rgba(99,102,241,0.02)",
                                zIndex: 1,
                              }}>
                                <span style={{ fontSize: 10, color: highlightBlocked ? "var(--color-danger)" : "var(--color-primary)", fontWeight: 700 }}>
                                  {highlightBlocked ? "Không thể xếp" : "Thả vào đây"}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Layer 2: Appointment cards */}
                      {colItems.map(item => {
                        const startSlot = timeToSlot(item.startTime);
                        const topPx = startSlot * SLOT_HEIGHT + 3;
                        const height = durationSlots(item.service.duration) * SLOT_HEIGHT - 6;
                        const colors = getColors(item);
                        return (
                          <GridServiceCard
                            key={item.id}
                            item={item}
                            topPx={topPx}
                            height={height}
                            {...colors}
                            dragActive={!!dragState}
                            isBeingDragged={dragState?.id === item.id}
                            onDragStart={e => handleDragStart(e, item.id, "grid")}
                            onDragEnd={() => handleDragEnd(item.id)}
                            onDoubleClick={() => setModal({ mode: "edit", item })}
                            onResize={handleCardResize}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </>
        </div>

        {/* Right Timeline Container */}
        <div ref={sidebarScrollRef} onScroll={handleSidebarScroll} style={{ width: SIDEBAR_W, borderLeft: "1px solid var(--border-color)", overflowY: "auto", display: "flex", flexDirection: "column", background: "var(--bg-app)", flexShrink: 0 }}>
          {/* Sticky Header Spacer to align with Left Grid's Sticky Column Headers */}
          <div style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            height: 52,
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            boxSizing: "border-box",
            flexShrink: 0
          }}>
            <span style={{ fontSize: 10, fontWeight: 400, color: "var(--text-secondary)", letterSpacing: "0.05em", fontStyle: "italic" }}>
              Kéo và thả dịch vụ vào lịch hẹn chính!
            </span>
          </div>

          {/* Cards column: background + absolute-positioned cards */}
          <div style={{ flex: 1, position: "relative", height: gridH, display: "flex" }}>
            {/* Time gutter */}
            <div style={{ width: 48, flexShrink: 0, borderRight: "1px solid var(--border-color)", background: "var(--bg-app)" }}>
              {timeSlots.map(slot => (
                <div key={slot} style={{ height: SLOT_HEIGHT, borderBottom: (slot + 1) % 4 === 0 ? "1px solid var(--border-color)" : "1px dashed var(--border-color)", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 6, paddingTop: 4 }}>
                  {slot % 4 === 0 && <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{slotToTime(slot)}</span>}
                </div>
              ))}
            </div>

            {/* Timeline slots column */}
            <div style={{ flex: 1, position: "relative", height: gridH }}>
              {/* Background slots */}
              {timeSlots.map(slot => (
                <div key={slot} style={{
                  position: "absolute", top: slot * SLOT_HEIGHT, left: 0, right: 0, height: SLOT_HEIGHT,
                  borderBottom: (slot + 1) % 4 === 0 ? "1px solid var(--border-color)" : "1px dashed var(--border-color)",
                }} />
              ))}

              {/* Service cards */}
              {customerItems.map(item => {
                const startSlot = timeToSlot(item.startTime);
                const slots = durationSlots(item.service.duration);
                const topPx = startSlot * SLOT_HEIGHT + 3;
                const height = slots * SLOT_HEIGHT - 6;
                const cc = hashColor(item.customerName);
                const isBeingDragged = dragState?.id === item.id;
                const staff = staffList.find(s => s.id === item.staffId);
                const cfg = STATUS_CFG[item.status];

                return (
                  <div key={item.id} draggable
                    onDragStart={e => {
                      const ghost = document.createElement("div");
                      const w = (e.currentTarget as HTMLDivElement).getBoundingClientRect().width;
                      ghost.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${w}px;height:${height}px;background:${hashBg(item.customerName)};border:1.5px solid ${hashBorder(item.customerName)};border-left:4px solid ${cc};border-radius:8px;padding:6px 10px;box-sizing:border-box;font-family:system-ui,sans-serif;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.15)`;
                      ghost.innerHTML = `<div style="font-size:12px;font-weight:700;color:#0f172a">${item.service.name}</div><div style="font-size:10px;color:#64748b;margin-top:2px">${item.customerName} · ${item.service.duration}p</div>`;
                      document.body.appendChild(ghost);
                      e.dataTransfer.setData("text/plain", item.id);
                      e.dataTransfer.setDragImage(ghost, Math.min(w / 2, 80), 20);
                      setTimeout(() => document.body.removeChild(ghost), 0);
                      handleDragStart(e, item.id, "sidebar");
                    }}
                    onDragEnd={() => handleDragEnd(item.id)}
                    style={{
                      position: "absolute", top: topPx, left: 3, right: 3, height,
                      borderRadius: 8, background: hashBg(item.customerName),
                      border: `1.5px solid ${hashBorder(item.customerName)}`,
                      borderLeft: `4px solid ${cc}`,
                      padding: height < 40 ? "2px 6px" : "5px 8px", cursor: "grab",
                      opacity: isBeingDragged ? 0.3 : 1,
                      overflow: "hidden", boxShadow: `0 2px 8px ${cc}22`,
                      userSelect: "none", zIndex: 2, boxSizing: "border-box",
                      pointerEvents: dragState && !isBeingDragged ? "none" : "auto",
                    }}>
                    {height < 40 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, height: "100%", overflow: "hidden" }}>
                        <Scissors size={9} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.service.name}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          <Scissors size={9} style={{ marginRight: 3, verticalAlign: "middle" }} />{item.service.name}
                        </div>
                        {height >= 52 && <div style={{ fontSize: 9, color: "#64748b", marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}><Clock size={8} />{item.startTime} · {item.service.duration}p</div>}
                        {height >= 70 && staff && (
                          <div style={{ marginTop: 4, display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 6px", borderRadius: 6, background: staff.color + "15", border: `1px solid ${staff.color}44` }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: staff.color }} />
                            <span style={{ fontSize: 9, fontWeight: 600, color: staff.color }}>{staff.name.split(" ").pop()}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div style={{ position: "absolute", top: height < 40 ? 6 : 5, right: 6, width: 7, height: 7, borderRadius: "50%", background: cfg.dot }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══ Row 4: Status bar (Left Side) & Right Bottom Spacer ════════════════════ */}
      <div style={{ display: "flex", borderTop: "1px solid var(--border-color)", flexShrink: 0 }}>
        <div style={{ flex: 1, padding: "8px 20px", background: "var(--bg-card)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 10, background: "#ede9fe" }}>
              <Globe size={10} color="#6d28d9" /><span style={{ fontSize: 10, fontWeight: 600, color: "#6d28d9" }}>Online</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 10, background: "#fff7ed" }}>
              <Home size={10} color="#c2410c" /><span style={{ fontSize: 10, fontWeight: 600, color: "#c2410c" }}>Tại quầy</span>
            </div>
          </div>
        </div>
        <div style={{ width: SIDEBAR_W, borderLeft: "1px solid var(--border-color)", background: "var(--bg-card)" }} />
      </div>

      {/* ══ Modal ══════════════════════════════════════════════════════════════════ */}
      {modal && (
        <ServiceModal
          state={modal} staffList={staffList} serviceList={serviceList}
          onClose={() => setModal(null)}
          onSave={handleModalSave}
          onDelete={modal.mode === "edit" ? id => {
            // Optimistic delete
            setItems(prev => prev.filter(i => i.id !== id));
            setModal(null);
            // Persist to backend
            api.delete(`/tenants/${currentTenantId}/bookings/${id}`)
              .then(() => {
                toast.success("Xóa lịch hẹn thành công!");
                queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all(currentTenantId!) });
              })
              .catch((err) => {
                toast.error("Lỗi xóa lịch hẹn: " + err.message);
                queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all(currentTenantId!) });
              });
          } : undefined}
        />
      )}
    </div>
  );
}
