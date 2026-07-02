import React from "react";
import { Loader2, AlertTriangle } from "lucide-react";

import { AttendanceHeader } from "./components/AttendanceHeader";
import { AttendanceLegend } from "./components/AttendanceLegend";
import { AttendanceGrid } from "./components/AttendanceGrid";
import { AttendanceModal } from "./components/AttendanceModal";

import { useAttendance } from "./useAttendance";

import styles from "./AttendanceCalendar.module.css";

export default function AttendanceCalendar() {
  const {
    branches,
    currentBranchId,
    setBranch,
    canManage,
    selectedStaffIds,
    setSelectedStaffIds,
    selectedTypes,
    setSelectedTypes,
    staffSearchQuery,
    setStaffSearchQuery,
    staffList,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    activeDialogTab,
    setActiveDialogTab,
    selectedDateStr,
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
    year,
    month,
    loading,
    error,
    calendarCells,
    formatDateString,
    handlePrevMonth,
    handleNextMonth,
    handleToday,
    handleCellClick,
    handleEditAnomaly,
    handleEditAdvance,
    handleSave,
    handleDelete,
    getCellItems,
    formatAdvanceAmount,
    formatNumber,
  } = useAttendance();

  return (
    <div className={`animate-fade-in ${styles.container}`}>
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
      <div className={`card ${styles.legendCard}`}>
        <AttendanceLegend />
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className={styles.loadingWrapper}>
          <Loader2 className="animate-spin" size={36} style={{ color: "var(--color-primary)" }} />
        </div>
      ) : error ? (
        <div className={`card ${styles.errorCard}`}>
          <div className={styles.errorHeader}>
            <AlertTriangle size={18} />
            <span>Lỗi tải lịch</span>
          </div>
          <p className={styles.errorText}>{error}</p>
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

