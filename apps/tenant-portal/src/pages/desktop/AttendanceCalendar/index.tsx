import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/useAuthStore";
import { useConfirm } from "../../../components/desktop/ConfirmDialog";
import { Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "../../../components/desktop/ToastProvider";
import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";

import { Staff, AttendanceAnomaly, CashAdvance, TYPE_OPTIONS } from "./types";
import { AttendanceHeader } from "./components/AttendanceHeader";
import { AttendanceLegend } from "./components/AttendanceLegend";
import { AttendanceGrid } from "./components/AttendanceGrid";
import { AttendanceModal } from "./components/AttendanceModal";

export default function AttendanceCalendar() {
  const { currentTenantId, currentBranchId, hasPermission, branches, setBranch } = useAuthStore();
  const confirm = useConfirm();
  const toast = useToast();
  const queryClient = useQueryClient();
  const canManage = hasPermission("shift.manage");

  // Calendar states
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Filter states
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [staffSearchQuery, setStaffSearchQuery] = useState("");

  // Data states
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [attendances, setAttendances] = useState<AttendanceAnomaly[]>([]);
  const [advances, setAdvances] = useState<CashAdvance[]>([]);

  // Dialog State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeDialogTab, setActiveDialogTab] = useState<"attendance" | "advance">("attendance");
  const [selectedDateStr, setSelectedDateStr] = useState<string>(""); // YYYY-MM-DD
  
  // Create/Edit form values
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [formStaffId, setFormStaffId] = useState("");
  const [formWorkStatus, setFormWorkStatus] = useState("ABSENT");
  const [formLateMinutes, setFormLateMinutes] = useState(15);
  const [formAdvanceAmount, setFormAdvanceAmount] = useState(500000);
  const [formAdvanceStatus, setFormAdvanceStatus] = useState("PENDING");
  const [formNote, setFormNote] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Queries
  const { data: staffData } = useQuery<Staff[]>({
    queryKey: queryKeys.staff.list(currentTenantId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/staff`),
    enabled: !!currentTenantId,
  });

  const { data: attData } = useQuery<AttendanceAnomaly[]>({
    queryKey: queryKeys.payrolls.attendances(currentTenantId!, currentBranchId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/payrolls/attendances?branchId=${currentBranchId}`),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const { data: advData } = useQuery<CashAdvance[]>({
    queryKey: queryKeys.payrolls.advances(currentTenantId!, currentBranchId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/payrolls/advances?branchId=${currentBranchId}`),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  useEffect(() => {
    if (staffData) setStaffList(staffData);
  }, [staffData]);

  useEffect(() => {
    if (attData) setAttendances(attData);
  }, [attData]);

  useEffect(() => {
    if (advData) setAdvances(advData);
  }, [advData]);

  const loading = !staffData || !attData || !advData;
  const error = null;

  const fetchCalendarData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all(currentTenantId!) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.payrolls.attendances(currentTenantId!, currentBranchId!) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.payrolls.advances(currentTenantId!, currentBranchId!) }),
    ]);
  }, [queryClient, currentTenantId, currentBranchId]);

  // Sync selected staff when staffList changes (e.g. branch change)
  useEffect(() => {
    setSelectedStaffIds(staffList.map((s) => s.id));
  }, [staffList]);

  // Initialize selected types on mount
  useEffect(() => {
    setSelectedTypes(TYPE_OPTIONS.map((o) => o.value));
  }, []);

  // Memoized filtered attendances and advances
  const filteredAttendances = useMemo(() => {
    return attendances.filter((att) => {
      // Staff filter
      if (!selectedStaffIds.includes(att.staffId)) {
        return false;
      }
      // Type filter
      if (!selectedTypes.includes(att.workStatus)) {
        return false;
      }
      return true;
    });
  }, [attendances, selectedStaffIds, selectedTypes]);

  const filteredAdvances = useMemo(() => {
    return advances.filter((adv) => {
      // Staff filter
      if (!selectedStaffIds.includes(adv.staffId)) {
        return false;
      }
      // Type filter
      const typeKey = `ADVANCE_${adv.status}`;
      if (!selectedTypes.includes(typeKey)) {
        return false;
      }
      return true;
    });
  }, [advances, selectedStaffIds, selectedTypes]);

  // Generate calendar grid array
  const calendarCells = useMemo(() => {
    const cells = [];
    
    // First day of the current month
    const firstDayOfMonth = new Date(year, month, 1);
    // Day of the week of first day (0 = CN, 1 = T2, ..., 6 = T7)
    // Map to make Monday (T2) the first index (0 = T2, 1 = T3, ..., 6 = CN)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday gets index 6

    // Total days in the month
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Previous month total days
    const prevMonthDays = new Date(year, month, 0).getDate();

    // Add empty padding from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const cellDate = new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, day);
      cells.push({
        date: cellDate,
        day,
        isCurrentMonth: false,
        dateStr: formatDateString(cellDate)
      });
    }

    // Add days of current month
    for (let i = 1; i <= totalDays; i++) {
      const cellDate = new Date(year, month, i);
      cells.push({
        date: cellDate,
        day: i,
        isCurrentMonth: true,
        dateStr: formatDateString(cellDate)
      });
    }

    // Add padding from next month to complete 42 cell grid (6 rows of 7)
    const remainingCells = 42 - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      const cellDate = new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, i);
      cells.push({
        date: cellDate,
        day: i,
        isCurrentMonth: false,
        dateStr: formatDateString(cellDate)
      });
    }

    return cells;
  }, [year, month]);

  function formatDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Open modal for a specific day
  const handleCellClick = (cellDateStr: string) => {
    if (!canManage) return;
    setSelectedDateStr(cellDateStr);
    setModalMode("create");
    setSelectedItemId(null);
    setActiveDialogTab("attendance");
    // Pre-fill form defaults
    setFormStaffId(staffList[0]?.id || "");
    setFormWorkStatus("ABSENT");
    setFormLateMinutes(15);
    setFormAdvanceAmount(500000);
    setFormAdvanceStatus("PENDING");
    setFormNote("");
    setIsModalOpen(true);
  };

  // Open modal for editing an anomaly
  const handleEditAnomaly = (anomaly: AttendanceAnomaly, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canManage) return;
    setSelectedDateStr(anomaly.workDate.split("T")[0]);
    setModalMode("edit");
    setSelectedItemId(anomaly.id);
    setActiveDialogTab("attendance");
    setFormStaffId(anomaly.staffId);
    setFormWorkStatus(anomaly.workStatus);
    setFormLateMinutes(anomaly.lateMinutes);
    setFormNote(anomaly.note || "");
    setIsModalOpen(true);
  };

  // Open modal for editing a cash advance
  const handleEditAdvance = (advance: CashAdvance, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canManage) return;
    setSelectedDateStr(advance.advanceDate.split("T")[0]);
    setModalMode("edit");
    setSelectedItemId(advance.id);
    setActiveDialogTab("advance");
    setFormStaffId(advance.staffId);
    setFormAdvanceAmount(advance.amount);
    setFormAdvanceStatus(advance.status);
    setFormNote(advance.note || "");
    setIsModalOpen(true);
  };

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId || !currentBranchId) return;

    try {
      if (activeDialogTab === "attendance") {
        const payload = {
          id: selectedItemId || undefined,
          branchId: currentBranchId,
          staffId: formStaffId,
          workDate: selectedDateStr,
          workStatus: formWorkStatus,
          lateMinutes: (formWorkStatus === "LATE" || formWorkStatus === "EARLY_OUT") ? formLateMinutes : 0,
          note: formNote
        };

        await api.post(`/tenants/${currentTenantId}/payrolls/attendances`, payload);
        toast.success("Ghi nhận điểm danh bất thường thành công!");
      } else {
        const payload = {
          branchId: currentBranchId,
          staffId: formStaffId,
          advanceDate: selectedDateStr,
          amount: formAdvanceAmount,
          status: formAdvanceStatus,
          note: formNote
        };

        if (modalMode === "edit" && selectedItemId) {
          await api.put(`/tenants/${currentTenantId}/payrolls/advances/${selectedItemId}`, payload);
          toast.success("Cập nhật phiếu ứng tiền thành công!");
        } else {
          await api.post(`/tenants/${currentTenantId}/payrolls/advances`, payload);
          toast.success("Tạo phiếu ứng tiền thành công!");
        }
      }

      setIsModalOpen(false);
      await fetchCalendarData();
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!currentTenantId || !selectedItemId) return;

    const message = activeDialogTab === "attendance"
      ? "Bạn có chắc chắn muốn xóa ghi chép bất thường này?"
      : "Bạn có chắc chắn muốn xóa phiếu ứng tiền này?";

    if (!(await confirm({
      title: "Xác nhận xóa bỏ",
      message,
      type: "danger",
      confirmText: "Xóa bỏ"
    }))) return;

    try {
      const endpoint = activeDialogTab === "attendance"
        ? `attendances/${selectedItemId}`
        : `advances/${selectedItemId}`;

      await api.delete(`/tenants/${currentTenantId}/payrolls/${endpoint}`);
      toast.success("Đã xóa bỏ ghi chép thành công!");

      setIsModalOpen(false);
      await fetchCalendarData();
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    }
  };

  // Get items matching a cell date string
  const getCellItems = (cellDateStr: string) => {
    const dayAttendances = filteredAttendances.filter(a => a.workDate.startsWith(cellDateStr));
    const dayAdvances = filteredAdvances.filter(a => a.advanceDate.startsWith(cellDateStr));
    return { dayAttendances, dayAdvances };
  };

  const formatAdvanceAmount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(".0", "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(0) + "k";
    return num.toString();
  };

  const formatNumber = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === "") return "";
    const cleaned = String(val).replace(/\D/g, "");
    if (!cleaned) return "";
    return new Intl.NumberFormat("en-US").format(parseInt(cleaned, 10));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "calc(100vh - 70px - 48px - 10px)" }} className="animate-fade-in">
      {/* AttendanceHeader containing unified controls & filters */}
      <AttendanceHeader
        month={month}
        year={year}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        branches={branches}
        currentBranchId={currentBranchId}
        setBranch={setBranch}
        staffList={staffList}
        selectedStaffIds={selectedStaffIds}
        setSelectedStaffIds={setSelectedStaffIds}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        staffSearchQuery={staffSearchQuery}
        setStaffSearchQuery={setStaffSearchQuery}
        canManage={canManage}
        onNewRecordClick={() => handleCellClick(formatDateString(new Date()))}
      />

      {/* Legend display */}
      <div className="card" style={{ padding: "12px 20px", flexShrink: 0 }}>
        <AttendanceLegend />
      </div>

      {/* Grid Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "100px 0", flexGrow: 1, alignItems: "center" }}>
          <Loader2 className="animate-spin" size={36} style={{ color: "var(--color-primary)" }} />
        </div>
      ) : error ? (
        <div className="card" style={{ borderLeft: "4px solid var(--color-danger)", background: "var(--color-danger-light)", flexGrow: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", color: "var(--color-danger)" }}>
            <AlertTriangle size={18} />
            <span>Lỗi tải lịch</span>
          </div>
          <p style={{ fontSize: "13px", marginTop: "4px", color: "var(--color-danger)" }}>{error}</p>
        </div>
      ) : (
        <AttendanceGrid
          calendarCells={calendarCells}
          getCellItems={getCellItems}
          canManage={canManage}
          onCellClick={handleCellClick}
          onEditAnomaly={handleEditAnomaly}
          onEditAdvance={handleEditAdvance}
          formatDateString={formatDateString}
          formatAdvanceAmount={formatAdvanceAmount}
        />
      )}

      {/* Modal Dialog */}
      <AttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalMode={modalMode}
        activeDialogTab={activeDialogTab}
        setActiveDialogTab={setActiveDialogTab}
        selectedDateStr={selectedDateStr}
        staffList={staffList}
        formStaffId={formStaffId}
        setFormStaffId={setFormStaffId}
        formWorkStatus={formWorkStatus}
        setFormWorkStatus={setFormWorkStatus}
        formLateMinutes={formLateMinutes}
        setFormLateMinutes={setFormLateMinutes}
        formAdvanceAmount={formAdvanceAmount}
        setFormAdvanceAmount={setFormAdvanceAmount}
        formAdvanceStatus={formAdvanceStatus}
        setFormAdvanceStatus={setFormAdvanceStatus}
        formNote={formNote}
        setFormNote={setFormNote}
        handleSave={handleSave}
        handleDelete={handleDelete}
        formatNumber={formatNumber}
      />
    </div>
  );
}
