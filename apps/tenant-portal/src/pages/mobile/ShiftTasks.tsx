import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Loader2, CalendarDays, Clock, MapPin, CheckCircle, Info } from "lucide-react";

interface LocalShift {
  id?: string;
  workDate: string; // YYYY-MM-DD
  shiftName: string;
  startTime: string;
  endTime: string;
  isOff: boolean;
}

export default function ShiftTasks() {
  const { user, currentTenantId, currentBranchId } = useAuthStore();

  // Shift States
  const [weeklyShifts, setWeeklyShifts] = useState<LocalShift[]>([]);
  const [dailyTurns, setDailyTurns] = useState<any[]>([]);
  const [turnsLoading, setTurnsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  // Get current week Monday and Sunday
  const getWeekDates = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    
    const monday = new Date(now.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return { monday, sunday };
  };

  const { monday, sunday } = getWeekDates();
  const startDateStr = monday.toISOString().split("T")[0];
  const endDateStr = sunday.toISOString().split("T")[0];

  const formatDateStr = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDayName = (d: Date): string => {
    const days = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return days[d.getDay()];
  };

  const todayStr = formatDateStr(new Date());

  // Fetch shifts for the logged-in staff
  useEffect(() => {
    const fetchShifts = async () => {
      if (!currentTenantId || !user?.id) return;
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/staff/${user.id}/shifts?startDate=${startDateStr}&endDate=${endDateStr}`);
        if (res.ok) {
          const data = await res.json();
          setWeeklyShifts(data);
        }
      } catch (err) {
        console.error("Lỗi khi tải lịch làm việc", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, [currentTenantId, user?.id]);

  // Fetch daily turns with 5-second polling
  useEffect(() => {
    let active = true;
    const fetchTurns = async (showLoading = false) => {
      if (!currentTenantId || !currentBranchId) return;
      if (showLoading) setTurnsLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/daily-turns`);
        if (res.ok && active) {
          const data = await res.json();
          setDailyTurns(data);
        }
      } catch (err) {
        console.error("Lỗi khi tải hàng đợi xoay tua", err);
      } finally {
        if (showLoading && active) setTurnsLoading(false);
      }
    };

    fetchTurns(true);

    const interval = setInterval(() => {
      fetchTurns(false);
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [currentTenantId, currentBranchId]);

  // Find shift for today
  const todayShift = weeklyShifts.find(s => s.workDate === todayStr);

  const getShiftDisplay = (shift?: LocalShift) => {
    if (!shift) return "Chưa xếp ca";
    if (shift.isOff) return "Nghỉ (Off)";
    return `${shift.shiftName} (${shift.startTime} - ${shift.endTime})`;
  };

  const getShiftBadgeStyle = (shift?: LocalShift) => {
    if (!shift) return { backgroundColor: "#f1f5f9", color: "#64748b" };
    if (shift.isOff) return { backgroundColor: "var(--color-danger-light)", color: "var(--color-danger)" };
    const name = shift.shiftName;
    if (name === "Ca Sáng") return { backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)" };
    if (name === "Ca Chiều") return { backgroundColor: "var(--color-warning-light)", color: "var(--color-warning)" };
    if (name === "Cả Ngày") return { backgroundColor: "var(--color-info-light)", color: "var(--color-info)" };
    return { backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)" };
  };

  const handleCheckInToggle = () => {
    if (todayShift?.isOff) {
      alert("Hôm nay là lịch nghỉ của bạn. Không cần chấm công!");
      return;
    }
    if (!todayShift) {
      alert("Hôm nay bạn chưa được xếp ca làm việc. Vui lòng liên hệ quản lý.");
      return;
    }
    
    if (!checkedIn) {
      setCheckedIn(true);
      const now = new Date();
      setCheckInTime(now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: true }));
    } else {
      if (confirm("Bạn muốn Check-out kết thúc ca làm việc?")) {
        setCheckedIn(false);
        setCheckInTime(null);
      }
    }
  };

  // Generate 7 week dates for list display
  const weekDatesList = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDatesList.push(d);
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "24px" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
        <Clock size={20} style={{ color: "var(--color-primary)" }} /> Chấm công & Ca trực
      </h2>

      {/* Today's Shift Check-In Widget */}
      {loading ? (
        <div className="card" style={{ display: "flex", justifyContent: "center", padding: "30px 0" }}>
          <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
        </div>
      ) : (
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "24px", textAlign: "center" }}>
          <div 
            onClick={handleCheckInToggle}
            style={{ 
              width: "100px", 
              height: "100px", 
              borderRadius: "50%", 
              background: checkedIn ? "var(--color-success)" : "var(--color-primary)", 
              color: "white", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              cursor: "pointer", 
              boxShadow: checkedIn ? "0 0 20px var(--color-success-light)" : "0 0 20px var(--border-focus)", 
              fontWeight: "bold",
              transition: "all 0.3s ease"
            }}
          >
            <span style={{ fontSize: "16px" }}>{checkedIn ? "CHECK OUT" : "CHECK IN"}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <h4 style={{ fontWeight: "700", fontSize: "15px" }}>
              Ca hôm nay: <span style={{ color: "var(--color-primary)" }}>{getShiftDisplay(todayShift)}</span>
            </h4>
            
            {checkedIn ? (
              <p style={{ color: "var(--color-success)", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                <CheckCircle size={14} /> Đã Check-in lúc: {checkInTime}
              </p>
            ) : (
              <p style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                {todayShift?.isOff 
                  ? "Hôm nay bạn được nghỉ lễ/tuần." 
                  : todayShift 
                    ? "Nhấn vào nút tròn phía trên để chấm công vào ca." 
                    : "Chưa được gán lịch trực hôm nay."
                }
              </p>
            )}
          </div>
        </div>
      )}

      {/* Week shifts schedule calendar list */}
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h3 className="card-title" style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <CalendarDays size={16} style={{ color: "var(--color-primary)" }} /> Lịch làm việc tuần này
        </h3>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
            <Loader2 className="animate-spin" size={20} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {weekDatesList.map((date, idx) => {
              const dateStr = formatDateStr(date);
              const isToday = dateStr === todayStr;
              const dayShift = weeklyShifts.find(s => s.workDate === dateStr);
              const badgeStyle = getShiftBadgeStyle(dayShift);

              return (
                <div 
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: isToday ? "var(--color-primary-light)" : "white",
                    border: isToday ? "1px solid var(--color-primary)" : "1px solid var(--border-color)",
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: isToday ? "var(--color-primary)" : "var(--text-primary)" }}>
                      {getDayName(date)} {isToday && <span style={{ fontSize: "11px", fontWeight: "700" }}>(Hôm nay)</span>}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                      {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}
                    </span>
                  </div>

                  <span 
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      ...badgeStyle
                    }}
                  >
                    {dayShift ? (dayShift.isOff ? "NGHỈ" : dayShift.shiftName) : "CHƯA XẾP"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Turn Queue Widget */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <h3 className="card-title" style={{ fontSize: "14px", margin: 0 }}>Hàng đợi xoay tua ngày</h3>
          {turnsLoading && <Loader2 className="animate-spin" size={14} style={{ color: "var(--color-primary)" }} />}
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "12px", fontSize: "12px" }}>
          Thứ tự thợ nhận khách tiếp theo tại chi nhánh (Cập nhật tự động).
        </p>

        {dailyTurns.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-secondary)", fontSize: "13px" }}>
            {turnsLoading ? "Đang tải hàng đợi..." : "Không có thợ nào trong hàng đợi hôm nay."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {dailyTurns.map((turn, index) => {
              const isSelf = turn.staffId === user?.id;
              const isNext = index === 0;

              // Style variables
              let background = "hsl(210, 40%, 96%)";
              let borderLeft = "4px solid transparent";
              let fontWeight = "400";
              let textColor = "var(--text-primary)";

              if (isSelf) {
                background = "var(--color-success-light)";
                borderLeft = "4px solid var(--color-success)";
                fontWeight = "600";
              } else if (isNext) {
                background = "var(--color-primary-light)";
                borderLeft = "4px solid var(--color-primary)";
                fontWeight = "600";
              }

              let nameText = turn.staffName;
              if (isSelf) {
                nameText = isNext ? "Bạn (Lượt tiếp theo)" : "Bạn";
              } else if (isNext) {
                nameText = `${turn.staffName} (Lượt tiếp theo)`;
              }

              return (
                <div
                  key={turn.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background,
                    borderLeft,
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontWeight, fontSize: "13px", color: textColor }}>
                      {nameText}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                      {turn.role} • Walk-in: {turn.totalWalkinCount} • Tổng: {turn.totalCustomersToday}
                    </span>
                  </div>
                  <span className={isSelf ? "badge badge-success" : (isNext ? "badge badge-primary" : "badge badge-secondary")} style={{ fontSize: "11px", fontWeight: "700" }}>
                    Số {turn.queueNumber}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
