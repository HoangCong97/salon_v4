import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/useAuthStore";
import { useToast } from "../../../components/desktop/ToastProvider";
import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";

import {
  ViewMode, ServiceItem, AppointmentStatus, Staff, AppointmentService, ModalState, DragState
} from "./types";

import {
  SLOT_HEIGHT, START_HOUR, END_HOUR, TOTAL_SLOTS, TIME_COL_W, SIDEBAR_W,
} from "./constants";

import {
  todayStr, toLocalDateStr, hashColor, hashBg, hashBorder, timeToSlot, slotToTime,
  durationSlots,
} from "./helpers";

const STAFF_COLORS = ["#6366f1","#ec4899","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#f97316","#14b8a6","#e11d48"];
const assignColor = (index: number) => STAFF_COLORS[index % STAFF_COLORS.length];

export function useAppointments() {
  const { currentBranchId, currentTenantId } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [serviceList, setServiceList] = useState<AppointmentService[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("by-staff");
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
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

  // Columns
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
  const colW = useMemo(() => {
    const viewWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
    return Math.max(155, Math.min(240, Math.floor((viewWidth - SIDEBAR_W - TIME_COL_W - 260) / Math.max(activeCols.length, 1))));
  }, [activeCols.length]);

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

  const getColors = useCallback((item: ServiceItem) => {
    if (viewMode === "by-staff") {
      return { accentColor: hashColor(item.customerName), bgColor: hashBg(item.customerName), bdColor: hashBorder(item.customerName) };
    } else {
      const c = staffList.find(s => s.id === item.staffId)?.color ?? "#6366f1";
      return { accentColor: c, bgColor: c + "14", bdColor: c + "55" };
    }
  }, [viewMode, staffList]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, id: string, source: "grid" | "sidebar") => {
    setDragState({ id, source }); e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragEnd = useCallback(() => {
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
      .catch((err: any) => {
        toast.error("Lỗi cập nhật lịch: " + err.message);
        queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all(currentTenantId!) });
      });
  }, [dragState, viewMode, selectedDate, currentTenantId, queryClient]);

  const handleModalSave = async (newItems: ServiceItem[]) => {
    if (modal?.mode === "create") {
      // Call backend to create booking
      try {
        const first = newItems[0];
        await api.post(`/tenants/${currentTenantId}/bookings`, {
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
      .catch((err: any) => {
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

  const handleDelete = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setModal(null);
    api.delete(`/tenants/${currentTenantId}/bookings/${id}`)
      .then(() => {
        toast.success("Xóa lịch hẹn thành công!");
        queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all(currentTenantId!) });
      })
      .catch((err: any) => {
        toast.error("Lỗi xóa lịch hẹn: " + err.message);
        queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all(currentTenantId!) });
      });
  }, [currentTenantId, queryClient]);

  return {
    currentBranchId,
    currentTenantId,
    selectedDate,
    setSelectedDate,
    items,
    staffList,
    serviceList,
    viewMode,
    setViewMode,
    dragState,
    setDragState,
    dragOverKey,
    setDragOverKey,
    modal,
    setModal,
    selectedCustomer,
    setSelectedCustomer,
    gridScrollRef,
    sidebarScrollRef,
    handleGridScroll,
    handleSidebarScroll,
    isToday,
    currentTimePx,
    nowLabel,
    loading,
    todayItems,
    customerList,
    customerItems,
    selCust,
    staffCols,
    customerCols,
    activeCols,
    colW,
    occupiedBodySlots,
    isSlotRangeBlocked,
    getColors,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleModalSave,
    handleCardResize,
    timeSlots,
    gridH,
    navigateDate,
    handleDelete,
  };
}
