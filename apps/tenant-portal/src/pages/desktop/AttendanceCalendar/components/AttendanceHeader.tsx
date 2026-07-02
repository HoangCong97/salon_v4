import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Filter, ChevronDown, Plus } from "lucide-react";
import { Staff, TYPE_OPTIONS } from "../types";

import styles from "../AttendanceCalendar.module.css";

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
    <div className={`card ${styles.headerCard}`}>
      {/* Top Row: Navigation, Filters and Action */}
      <div className={styles.headerTopRow}>
        <div className={styles.navFiltersGroup}>
          <button
            className="btn btn-secondary"
            style={{ padding: "8px 12px" }}
            onClick={onToday}
          >
            Hôm nay
          </button>
          <div className={styles.btnGroupBorder}>
            <button
              onClick={onPrevMonth}
              className={styles.navArrowBtn}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={onNextMonth}
              className={styles.navArrowBtn}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <span className={styles.monthTitle}>
            Tháng {month + 1} năm {year}
          </span>

          {/* Vertical Separator */}
          <div className={styles.vSeparator} />

          {/* Inline Filters */}
          <div className={styles.filterLabelGroup}>
            <Filter size={14} style={{ color: "var(--text-secondary)" }} />
            <span className={styles.filterLabelText}>Lọc:</span>
          </div>

          {/* Branch Dropdown */}
          {branches && branches.length > 0 && (
            <div ref={branchDropdownRef} className={styles.relativePosition}>
              <button
                type="button"
                onClick={() => {
                  setIsBranchDropdownOpen(!isBranchDropdownOpen);
                  setIsStaffDropdownOpen(false);
                  setIsTypeDropdownOpen(false);
                }}
                className={styles.dropdownTriggerBtn}
              >
                <span>
                  🏢 Chi nhánh: {branches.find(b => b.id === currentBranchId)?.name || "Chưa chọn"}
                </span>
                <ChevronDown size={12} style={{ color: "var(--text-muted)", marginLeft: "2px" }} />
              </button>

              {isBranchDropdownOpen && (
                <div className={`${styles.dropdownMenu} ${styles.branchDropdown}`}>
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
                        className={`${styles.dropdownOption} ${isSelected ? styles.dropdownOptionSelected : ""}`}
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
          <div ref={staffDropdownRef} className={styles.relativePosition}>
            <button
              type="button"
              onClick={() => {
                setIsStaffDropdownOpen(!isStaffDropdownOpen);
                setIsTypeDropdownOpen(false);
              }}
              className={styles.dropdownTriggerBtn}
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
              <div className={`${styles.dropdownMenu} ${styles.staffDropdown}`}>
                {/* Search Bar */}
                <div className={styles.dropdownSearchWrapper}>
                  <input
                    type="text"
                    placeholder="Tìm nhân viên..."
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    className={styles.dropdownSearchInput}
                  />
                </div>

                {/* Quick Actions */}
                <div className={styles.dropdownQuickActions}>
                  <button
                    type="button"
                    onClick={() => setSelectedStaffIds(staffList.map(s => s.id))}
                    className={styles.dropdownQuickBtnSelect}
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStaffIds([])}
                    className={styles.dropdownQuickBtnDeselect}
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>

                {/* Scrollable list */}
                <div className={styles.dropdownScrollableList}>
                  {filteredStaffForDropdown.length === 0 ? (
                    <div className={styles.dropdownNoResult}>
                      Không tìm thấy nhân viên
                    </div>
                  ) : (
                    filteredStaffForDropdown.map((staff) => {
                      const isChecked = selectedStaffIds.includes(staff.id);
                      return (
                        <label
                          key={staff.id}
                          className={styles.dropdownLabelOption}
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
          <div ref={typeDropdownRef} className={styles.relativePosition}>
            <button
              type="button"
              onClick={() => {
                setIsTypeDropdownOpen(!isTypeDropdownOpen);
                setIsStaffDropdownOpen(false);
              }}
              className={styles.dropdownTriggerBtn}
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
              <div className={`${styles.dropdownMenu} ${styles.typeDropdown}`}>
                {/* Quick Actions */}
                <div className={styles.dropdownQuickActions}>
                  <button
                    type="button"
                    onClick={() => setSelectedTypes(TYPE_OPTIONS.map(o => o.value))}
                    className={styles.dropdownQuickBtnSelect}
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTypes([])}
                    className={styles.dropdownQuickBtnDeselect}
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>

                {/* Scrollable list */}
                <div className={styles.dropdownScrollableList}>
                  {TYPE_OPTIONS.map((opt) => {
                    const isChecked = selectedTypes.includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className={styles.dropdownLabelOption}
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
              className={styles.resetFiltersBtn}
            >
              Xóa lọc
            </button>
          )}
        </div>

        {canManage && (
          <button
            className="btn btn-primary"
            onClick={onNewRecordClick}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} /> Ghi chép mới
          </button>
        )}
      </div>
    </div>
  );
};

