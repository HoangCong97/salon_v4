import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/useAuthStore";
import { Tooltip } from "../../components/desktop/Tooltip";
import { 
  CalendarRange, ChevronLeft, ChevronRight, Save, 
  Copy, Loader2, Info, Check, CalendarDays, RefreshCw 
} from "lucide-react";
import { useConfirm } from "../../components/desktop/ConfirmDialog";
import { useToast } from "../../components/desktop/ToastProvider";
import { api } from "../../utils/apiClient";
import { queryKeys } from "../../utils/queryKeys";

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ShiftData {
  id?: string;
  staffId: string;
  staffName: string;
  workDate: string; // YYYY-MM-DD
  shiftName: string;
  startTime: string;
  endTime: string;
  isOff: boolean;
}

interface LocalShift {
  id?: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  isOff: boolean;
}

export default function Shifts() {
  const { currentTenantId, currentBranchId, branches } = useAuthStore();
  const confirm = useConfirm();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Navigation state (Start of the week - Monday)
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  });

  // Data States
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);

  // Local grid edits state: staffId -> workDate -> LocalShift
  const [gridEdits, setGridEdits] = useState<Record<string, Record<string, LocalShift>>>({});

  // 1. DATES CALCULATION HELPER
  const getWeekDates = (monday: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeekMonday);
  const startDateStr = weekDates[0].toISOString().split("T")[0];
  const endDateStr = weekDates[6].toISOString().split("T")[0];

  const formatDateStr = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDay = (d: Date): string => {
    const days = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const dayName = days[d.getDay()];
    const datePart = String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0");
    return `${dayName} (${datePart})`;
  };

  // 2. FETCH DATA with useQuery
  const { data: staffData, isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: queryKeys.shifts.staff(currentTenantId!, currentBranchId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/branches/${currentBranchId}/shifts/staff`),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const { data: shiftsData, isLoading: shiftsLoading, error: shiftsError } = useQuery<ShiftData[]>({
    queryKey: queryKeys.shifts.list(currentTenantId!, currentBranchId!, startDateStr, endDateStr),
    queryFn: () => api.get(`/tenants/${currentTenantId}/branches/${currentBranchId}/shifts?startDate=${startDateStr}&endDate=${endDateStr}`),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  const staff = staffData ?? [];
  const shifts = shiftsData ?? [];
  const loading = staffLoading || shiftsLoading || copying;
  const error = shiftsError ? (shiftsError as Error).message : null;

  /** Backward-compatible invalidation helper */
  const fetchStaffAndShifts = useCallback(async () => {
    setGridEdits({});
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.staff(currentTenantId!, currentBranchId!) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.list(currentTenantId!, currentBranchId!, startDateStr, endDateStr) }),
    ]);
  }, [queryClient, currentTenantId, currentBranchId, startDateStr, endDateStr]);

  // Get current branch name
  const currentBranchName = branches.find(b => b.id === currentBranchId)?.name || "Chi nhánh";

  // 3. SHIFT GRID INTERACTIVE LOGIC
  const getCellShift = (staffId: string, dateStr: string): LocalShift => {
    // 1. Check local grid edits first
    if (gridEdits[staffId] && gridEdits[staffId][dateStr] !== undefined) {
      return gridEdits[staffId][dateStr];
    }

    // 2. Check loaded shifts from DB
    const dbShift = shifts.find(s => s.staffId === staffId && s.workDate === dateStr);
    if (dbShift) {
      return {
        id: dbShift.id,
        shiftName: dbShift.shiftName,
        startTime: dbShift.startTime,
        endTime: dbShift.endTime,
        isOff: dbShift.isOff
      };
    }

    // 3. Fallback to empty
    return {
      shiftName: "",
      startTime: "",
      endTime: "",
      isOff: false
    };
  };

  const handleCellSelectChange = (staffId: string, dateStr: string, selectValue: string) => {
    let nextShift: LocalShift;

    const currentCell = getCellShift(staffId, dateStr);

    if (selectValue === "MORNING") {
      nextShift = {
        ...currentCell,
        shiftName: "Ca Sáng",
        startTime: "08:00",
        endTime: "14:30",
        isOff: false
      };
    } else if (selectValue === "AFTERNOON") {
      nextShift = {
        ...currentCell,
        shiftName: "Ca Chiều",
        startTime: "14:30",
        endTime: "21:00",
        isOff: false
      };
    } else if (selectValue === "FULLDAY") {
      nextShift = {
        ...currentCell,
        shiftName: "Cả Ngày",
        startTime: "08:00",
        endTime: "21:00",
        isOff: false
      };
    } else if (selectValue === "OFF") {
      nextShift = {
        ...currentCell,
        shiftName: "Nghỉ",
        startTime: "",
        endTime: "",
        isOff: true
      };
    } else {
      // Clear shift
      nextShift = {
        id: currentCell.id,
        shiftName: "",
        startTime: "",
        endTime: "",
        isOff: false
      };
    }

    setGridEdits(prev => ({
      ...prev,
      [staffId]: {
        ...(prev[staffId] || {}),
        [dateStr]: nextShift
      }
    }));
  };

  const getSelectValue = (localShift: LocalShift): string => {
    if (localShift.isOff) return "OFF";
    const name = localShift.shiftName;
    if (name === "Ca Sáng") return "MORNING";
    if (name === "Ca Chiều") return "AFTERNOON";
    if (name === "Cả Ngày") return "FULLDAY";
    if (name === "") return "";
    return "MORNING"; // Fallback
  };

  const getSelectColorStyle = (value: string) => {
    if (value === "MORNING") {
      return { backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", border: "none" };
    } else if (value === "AFTERNOON") {
      return { backgroundColor: "var(--color-warning-light)", color: "var(--color-warning)", border: "none" };
    } else if (value === "FULLDAY") {
      return { backgroundColor: "var(--color-info-light)", color: "var(--color-info)", border: "none" };
    } else if (value === "OFF") {
      return { backgroundColor: "var(--color-danger-light)", color: "var(--color-danger)", border: "none" };
    }
    return { backgroundColor: "transparent", color: "var(--text-muted)", border: "1px dashed var(--border-color)" };
  };

  // 4. ACTION SUBMISSIONS
  const handleSaveShifts = async () => {
    if (!currentTenantId || !currentBranchId) return;

    // Flatten gridEdits object into a save array
    const shiftsToSave: any[] = [];
    
    Object.keys(gridEdits).forEach(staffId => {
      Object.keys(gridEdits[staffId]).forEach(workDate => {
        const item = gridEdits[staffId][workDate];
        shiftsToSave.push({
          id: item.id,
          staffId,
          workDate,
          shiftName: item.shiftName,
          startTime: item.startTime,
          endTime: item.endTime,
          isOff: item.isOff
        });
      });
    });

    if (shiftsToSave.length === 0) {
      toast.info("Không có thay đổi nào cần lưu!");
      return;
    }

    setSaving(true);
    try {
      await api.post(`/tenants/${currentTenantId}/branches/${currentBranchId}/shifts/bulk`, { shifts: shiftsToSave });

      toast.success("Lưu lịch trực tuần thành công!");
      await fetchStaffAndShifts();
    } catch (err: any) {
      toast.error(err.message || "Lưu lịch trực thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLastWeek = async () => {
    if (!currentTenantId || !currentBranchId) return;

    if (
      !(await confirm({
        title: "Sao chép lịch tuần trước",
        message: "Bạn có chắc chắn muốn sao chép lịch trực tuần trước gán vào tuần này? Hành động này sẽ ghi đè lịch trực hiện có trong ô tương ứng.",
        type: "warning",
        confirmText: "Sao chép",
      }))
    )
      return;

    // Calculate last week monday
    const lastWeekMonday = new Date(currentWeekMonday);
    lastWeekMonday.setDate(currentWeekMonday.getDate() - 7);
    const lastWeekMondayStr = lastWeekMonday.toISOString().split("T")[0];

    const lastWeekSunday = new Date(lastWeekMonday);
    lastWeekSunday.setDate(lastWeekMonday.getDate() + 6);
    const lastWeekSundayStr = lastWeekSunday.toISOString().split("T")[0];

    setCopying(true);
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/shifts?startDate=${lastWeekMondayStr}&endDate=${lastWeekSundayStr}`);
      if (!res.ok) throw new Error();
      const lastWeekShifts: ShiftData[] = await res.json();

      if (lastWeekShifts.length === 0) {
        toast.info("Tuần trước chưa được xếp ca để sao chép!");
        setCopying(false);
        return;
      }

      // Map last week shifts to current week dates (offsetting dates by +7 days)
      const nextEdits: Record<string, Record<string, LocalShift>> = { ...gridEdits };

      lastWeekShifts.forEach(shift => {
        const lastWeekDate = new Date(shift.workDate + "T00:00:00.000Z");
        const currentWeekDate = new Date(lastWeekDate);
        currentWeekDate.setDate(lastWeekDate.getDate() + 7);
        const currentWeekDateStr = formatDateStr(currentWeekDate);

        // Don't copy shift ID since these are new records
        const nextCell = getCellShift(shift.staffId, currentWeekDateStr);
        
        if (!nextEdits[shift.staffId]) {
          nextEdits[shift.staffId] = {};
        }

        nextEdits[shift.staffId][currentWeekDateStr] = {
          id: nextCell.id, // Keep current cell id if exists so we overwrite it instead of creating duplicate
          shiftName: shift.shiftName,
          startTime: shift.startTime,
          endTime: shift.endTime,
          isOff: shift.isOff
        };
      });

      setGridEdits(nextEdits);
      toast.success("Đã sao chép lịch trực tuần trước vào bảng lưới! Hãy nhấn 'Lưu lịch trực' để đồng bộ.");
    } catch (e) {
      toast.error("Lỗi khi tải lịch trực tuần trước.");
    } finally {
      setCopying(false);
    }
  };

  // Week navigation handlers
  const handlePrevWeek = () => {
    const prev = new Date(currentWeekMonday);
    prev.setDate(currentWeekMonday.getDate() - 7);
    setCurrentWeekMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekMonday);
    next.setDate(currentWeekMonday.getDate() + 7);
    setCurrentWeekMonday(next);
  };

  const handleCurrentWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekMonday(new Date(now.setDate(diff)));
  };

  const hasLocalChanges = Object.keys(gridEdits).some(staffId => 
    Object.keys(gridEdits[staffId]).length > 0
  );

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Time Navigation Bar & Actions Card */}
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={handlePrevWeek}>
              <ChevronLeft size={16} /> Tuần trước
            </button>
            <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={handleCurrentWeek}>
              Tuần này
            </button>
            <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={handleNextWeek}>
              Tuần sau <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "14px", color: "var(--color-primary)" }}>
            <CalendarDays size={18} />
            <span>
              {weekDates[0].getDate()}/{weekDates[0].getMonth() + 1} - {weekDates[6].getDate()}/{weekDates[6].getMonth() + 1}/{weekDates[6].getFullYear()}
            </span>
          </div>

          {hasLocalChanges && (
            <span style={{ fontSize: "12px", color: "var(--color-warning)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
              <Info size={14} /> Có lịch chưa lưu
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Tooltip content="Sao chép toàn bộ lịch trực tuần trước sang tuần này" position="top">
            <button 
              className="btn btn-secondary" 
              onClick={handleCopyLastWeek}
              disabled={loading || saving}
              style={{ padding: "8px 12px", fontSize: "13px" }}
            >
              <Copy size={15} /> Sao chép tuần trước
            </button>
          </Tooltip>
          
          <button 
            className="btn btn-primary" 
            onClick={handleSaveShifts}
            disabled={saving || loading || !hasLocalChanges}
            style={{ minWidth: "130px", padding: "8px 12px", fontSize: "13px" }}
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={15} /> Đang lưu...
              </>
            ) : (
              <>
                <Save size={15} /> Lưu lịch trực
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
        </div>
      ) : error ? (
        <div className="card" style={{ borderLeft: "4px solid var(--color-danger)", background: "var(--color-danger-light)" }}>
          <p style={{ color: "var(--color-danger)", fontWeight: "500" }}>{error}</p>
        </div>
      ) : staff.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "50px 20px" }}>
          <Info size={40} style={{ color: "var(--text-muted)", marginBottom: "12px", marginInline: "auto" }} />
          <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "4px" }}>Chưa có nhân viên hoạt động tại chi nhánh này</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
            Vui lòng vào trang <strong>Nhân sự</strong> để gán nhân viên vào chi nhánh <strong>{currentBranchName}</strong> trước.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="data-table-container" style={{ border: "none", boxShadow: "none", borderRadius: 0 }}>
            <table className="data-table" style={{ tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th style={{ padding: "12px 16px", fontSize: "13px", width: "180px", borderRight: "1px solid var(--border-color)" }}>
                    Nhân viên
                  </th>
                  {weekDates.map((date, idx) => (
                    <th 
                      key={idx} 
                      style={{ 
                        padding: "12px 10px", 
                        fontSize: "13px", 
                        textAlign: "center",
                        backgroundColor: formatDateStr(new Date()) === formatDateStr(date) ? "var(--color-primary-light)" : "inherit",
                        color: formatDateStr(new Date()) === formatDateStr(date) ? "var(--color-primary)" : "var(--text-secondary)"
                      }}
                    >
                      {formatDisplayDay(date)}
                      {formatDateStr(new Date()) === formatDateStr(date) && (
                        <span style={{ display: "block", fontSize: "9px", fontWeight: "bold" }}>(Hôm nay)</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map((employee) => (
                  <tr key={employee.id}>
                    {/* Employee info */}
                    <td 
                      style={{ 
                        padding: "10px 16px", 
                        verticalAlign: "middle", 
                        fontWeight: "600",
                        borderRight: "1px solid var(--border-color)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      <span style={{ display: "block" }}>{employee.name}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "400" }}>
                        {employee.role}
                      </span>
                    </td>

                    {/* 7 Days inputs */}
                    {weekDates.map((date, idx) => {
                      const dateStr = formatDateStr(date);
                      const currentCell = getCellShift(employee.id, dateStr);
                      const selectVal = getSelectValue(currentCell);

                      return (
                        <td 
                          key={idx} 
                          style={{ 
                            padding: "3px 4px", 
                            verticalAlign: "middle", 
                            height: "44px",
                            textAlign: "center"
                          }}
                        >
                          <select
                            value={selectVal}
                            onChange={(e) => handleCellSelectChange(employee.id, dateStr, e.target.value)}
                            style={{
                              ...getSelectColorStyle(selectVal),
                              width: "100%",
                              height: "34px",
                              padding: "0 4px",
                              fontSize: "11px",
                              fontWeight: "700",
                              cursor: "pointer",
                              borderRadius: "6px",
                              textAlign: "center"
                            }}
                            className="excel-select"
                          >
                            <option value="" style={{ color: "var(--text-primary)" }}>-- Trống --</option>
                            <option value="MORNING" style={{ color: "var(--text-primary)" }}>Ca Sáng (08h-14h30)</option>
                            <option value="AFTERNOON" style={{ color: "var(--text-primary)" }}>Ca Chiều (14h30-21h)</option>
                            <option value="FULLDAY" style={{ color: "var(--text-primary)" }}>Cả Ngày (08h-21h)</option>
                            <option value="OFF" style={{ color: "var(--text-primary)" }}>Nghỉ (Off)</option>
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instruction alert */}
      <div className="card" style={{ display: "flex", gap: "12px", alignItems: "flex-start", backgroundColor: "var(--color-primary-light)", border: "1px solid var(--border-focus)" }}>
        <Info size={20} style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: "2px" }} />
        <div>
          <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-primary)" }}>
            Hướng dẫn xếp ca trực:
          </h4>
          <ul style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px", paddingLeft: "16px" }}>
            <li>Lưới hiển thị toàn bộ nhân sự được gán quyền tại chi nhánh được chọn trên thanh tiêu đề chính.</li>
            <li>Chọn ca trực tương ứng từ dropdown trong từng ô của ngày làm việc.</li>
            <li>Bấm <strong>Sao chép tuần trước</strong> để nhanh chóng copy ca trực của tuần trước đó làm ca trực tuần hiện tại.</li>
            <li>Sau khi xếp lịch xong, click <strong>Lưu lịch trực</strong> để áp dụng lịch làm việc chính thức.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
