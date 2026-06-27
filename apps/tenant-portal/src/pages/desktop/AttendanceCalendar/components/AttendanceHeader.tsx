import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Filter, ChevronDown, Plus } from "lucide-react";
import { Staff, TYPE_OPTIONS } from "../types";

interface AttendanceHeaderProps {
  month: number;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  branches: { id: string; name: string }[] | null;
  currentBranchId: string | null;
  setBranch: (id: string) => void;
  staffList: Staff[];
  selectedStaffIds: string[];
  setSelectedStaffIds: (ids: string[]) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  staffSearchQuery: string;
  setStaffSearchQuery: (query: string) => void;
  canManage: boolean;
  onNewRecordClick: () => void;
}

export const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({
  month,
  year,
  onPrevMonth,
  onNextMonth,
  onToday,
  branches,
  currentBranchId,
  setBranch,
  staffList,
  selectedStaffIds,
  setSelectedStaffIds,
  selectedTypes,
  setSelectedTypes,
  staffSearchQuery,
  setStaffSearchQuery,
  canManage,
  onNewRecordClick,
}) => {
  // Dropdown open states
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // Refs for click outside
  const branchDropdownRef = useRef<HTMLDivElement>(null);
  const staffDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
      if (staffDropdownRef.current && !staffDropdownRef.current.contains(event.target as Node)) {
        setIsStaffDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtered staff list for dropdown search
  const filteredStaffForDropdown = useMemo(() => {
    return staffList.filter((s) => s.name.toLowerCase().includes(staffSearchQuery.toLowerCase()));
  }, [staffList, staffSearchQuery]);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px 20px", flexShrink: 0 }}>
      {/* Top Row: Navigation, Filters and Action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary" style={{ padding: "8px 12px" }} onClick={onToday}>
            Hôm nay
          </button>
          <div style={{ display: "flex", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
            <button
              onClick={onPrevMonth}
              style={{ padding: "8px 12px", border: "none", background: "white", cursor: "pointer", color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-app)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={onNextMonth}
              style={{ padding: "8px 12px", border: "none", background: "white", cursor: "pointer", color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-app)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", marginRight: "4px" }}>
            Tháng {month + 1} năm {year}
          </span>

          {/* Vertical Separator */}
          <div style={{ width: "1px", height: "20px", backgroundColor: "var(--border-color)" }} />

          {/* Inline Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={14} style={{ color: "var(--text-secondary)" }} />
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Lọc:</span>
          </div>

          {/* Branch Dropdown */}
          {branches && branches.length > 0 && (
            <div ref={branchDropdownRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => {
                  setIsBranchDropdownOpen(!isBranchDropdownOpen);
                  setIsStaffDropdownOpen(false);
                  setIsTypeDropdownOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  background: "white",
                  fontSize: "12.5px",
                  fontWeight: "500",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                onMouseLeave={(e) => {
                  if (!isBranchDropdownOpen) e.currentTarget.style.borderColor = "var(--border-color)";
                }}
              >
                <span>
                  🏢 Chi nhánh: {branches.find(b => b.id === currentBranchId)?.name || "Chưa chọn"}
                </span>
                <ChevronDown size={12} style={{ color: "var(--text-muted)", marginLeft: "2px" }} />
              </button>

              {isBranchDropdownOpen && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "4px",
                  width: "220px",
                  background: "white",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "260px",
                  overflowY: "auto",
                  padding: "4px 0"
                }}>
                  {branches.map((b) => {
                    const isSelected = b.id === currentBranchId;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setBranch(b.id);
                          setIsBranchDropdownOpen(false);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 12px",
                          fontSize: "12px",
                          border: "none",
                          background: isSelected ? "var(--color-primary-light)" : "transparent",
                          color: isSelected ? "var(--color-primary)" : "var(--text-primary)",
                          fontWeight: isSelected ? "600" : "400",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-app)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {b.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Staff Multi-Select Dropdown */}
          <div ref={staffDropdownRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => {
                setIsStaffDropdownOpen(!isStaffDropdownOpen);
                setIsTypeDropdownOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                background: "white",
                fontSize: "12.5px",
                fontWeight: "500",
                color: "var(--text-primary)",
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
              onMouseLeave={(e) => {
                if (!isStaffDropdownOpen) e.currentTarget.style.borderColor = "var(--border-color)";
              }}
            >
              <span>
                {selectedStaffIds.length === staffList.length
                  ? "Nhân viên: Tất cả"
                  : selectedStaffIds.length === 0
                  ? "Nhân viên: Không có"
                  : `Nhân viên: ${selectedStaffIds.length}/${staffList.length}`}
              </span>
              <ChevronDown size={12} style={{ color: "var(--text-muted)", marginLeft: "2px" }} />
            </button>

            {isStaffDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "4px",
                width: "260px",
                background: "white",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                maxHeight: "320px",
              }}>
                {/* Search Bar */}
                <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-color)" }}>
                  <input
                    type="text"
                    placeholder="Tìm nhân viên..."
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      fontSize: "12px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-sm)",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Quick Actions */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 12px",
                  borderBottom: "1px solid var(--border-color)",
                  fontSize: "11px",
                  background: "var(--bg-app)"
                }}>
                  <button
                    type="button"
                    onClick={() => setSelectedStaffIds(staffList.map(s => s.id))}
                    style={{ border: "none", background: "none", color: "var(--color-primary)", fontWeight: "600", cursor: "pointer" }}
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStaffIds([])}
                    style={{ border: "none", background: "none", color: "var(--color-danger)", fontWeight: "600", cursor: "pointer" }}
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>

                {/* Scrollable list */}
                <div style={{ overflowY: "auto", flexGrow: 1, padding: "4px 0" }}>
                  {filteredStaffForDropdown.length === 0 ? (
                    <div style={{ padding: "12px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                      Không tìm thấy nhân viên
                    </div>
                  ) : (
                    filteredStaffForDropdown.map((staff) => {
                      const isChecked = selectedStaffIds.includes(staff.id);
                      return (
                        <label
                          key={staff.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 12px",
                            fontSize: "12px",
                            cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-app)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedStaffIds(selectedStaffIds.filter(id => id !== staff.id));
                              } else {
                                setSelectedStaffIds([...selectedStaffIds, staff.id]);
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          />
                          <span style={{ fontWeight: isChecked ? "600" : "400" }}>{staff.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Record Type Multi-Select Dropdown */}
          <div ref={typeDropdownRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => {
                setIsTypeDropdownOpen(!isTypeDropdownOpen);
                setIsStaffDropdownOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                background: "white",
                fontSize: "12.5px",
                fontWeight: "500",
                color: "var(--text-primary)",
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
              onMouseLeave={(e) => {
                if (!isTypeDropdownOpen) e.currentTarget.style.borderColor = "var(--border-color)";
              }}
            >
              <span>
                {selectedTypes.length === TYPE_OPTIONS.length
                  ? "Loại: Tất cả"
                  : selectedTypes.length === 0
                  ? "Loại: Không có"
                  : `Loại: ${selectedTypes.length}/${TYPE_OPTIONS.length}`}
              </span>
              <ChevronDown size={12} style={{ color: "var(--text-muted)", marginLeft: "2px" }} />
            </button>

            {isTypeDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "4px",
                width: "250px",
                background: "white",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                maxHeight: "320px",
              }}>
                {/* Quick Actions */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 12px",
                  borderBottom: "1px solid var(--border-color)",
                  fontSize: "11px",
                  background: "var(--bg-app)"
                }}>
                  <button
                    type="button"
                    onClick={() => setSelectedTypes(TYPE_OPTIONS.map(o => o.value))}
                    style={{ border: "none", background: "none", color: "var(--color-primary)", fontWeight: "600", cursor: "pointer" }}
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTypes([])}
                    style={{ border: "none", background: "none", color: "var(--color-danger)", fontWeight: "600", cursor: "pointer" }}
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>

                {/* Scrollable list */}
                <div style={{ overflowY: "auto", flexGrow: 1, padding: "4px 0" }}>
                  {TYPE_OPTIONS.map((opt) => {
                    const isChecked = selectedTypes.includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 12px",
                          fontSize: "12px",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-app)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedTypes(selectedTypes.filter(val => val !== opt.value));
                            } else {
                              setSelectedTypes([...selectedTypes, opt.value]);
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        />
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: opt.color }}></span>
                          <span style={{ fontWeight: isChecked ? "600" : "400" }}>{opt.label}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Reset Filters Button */}
          {(selectedStaffIds.length !== staffList.length || selectedTypes.length !== TYPE_OPTIONS.length) && (
            <button
              onClick={() => {
                setSelectedStaffIds(staffList.map(s => s.id));
                setSelectedTypes(TYPE_OPTIONS.map(o => o.value));
              }}
              style={{
                border: "none",
                background: "none",
                color: "var(--color-primary)",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-primary-light)"
              }}
            >
              Xóa lọc
            </button>
          )}
        </div>

        {canManage && (
          <button className="btn btn-primary" onClick={onNewRecordClick} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={16} /> Ghi chép mới
          </button>
        )}
      </div>
    </div>
  );
};
