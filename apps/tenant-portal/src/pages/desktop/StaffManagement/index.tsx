import React from "react";
import { Users, Shield, RefreshCw, Upload } from "lucide-react";

import { StaffTable } from "./StaffTable";
import { RolePermissionPanel } from "./RolePermissionPanel";
import { DailyTurnsTable } from "./DailyTurnsTable";
import { StaffFormModal } from "./StaffFormModal";
import { RoleModal } from "./RoleModal";
import { AddStaffToQueueModal } from "./AddStaffToQueueModal";
import { ImportWizardModal } from "../../../components/desktop/ImportWizard/ImportWizardModal";
import { DragOverlay } from "../../../components/desktop/ui/DragOverlay";
import { LoadingState } from "../../../components/desktop/ui/LoadingState";
import { ErrorState } from "../../../components/desktop/ui/ErrorState";

import { useStaffManagement } from "./useStaffManagement";

import styles from "./StaffManagement.module.css";

export default function StaffManagement() {
  const {
    currentTenantId,
    currentBranchId,
    branches,
    activeTab,
    setActiveTab,
    staff,
    roles,
    branchList,
    permissions,
    dailyTurns,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedBranchFilter,
    setSelectedBranchFilter,
    selectedRoleFilter,
    setSelectedRoleFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    inlineEdits,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    selectedStaffId,
    selectedRoleId,
    setSelectedRoleId,
    assignedPermissionIds,
    permissionsLoading,
    savingPermissions,
    isRoleModalOpen,
    setIsRoleModalOpen,
    roleModalMode,
    isAddStaffToQueueOpen,
    setIsAddStaffToQueueOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    droppedFile,
    setDroppedFile,
    isDragActive,
    staffSchema,
    fetchStaffAndRoles,
    handleSaveStaff,
    fetchDailyTurns,
    formatNumber,
    handleSalaryChange,
    handleInlineChange,
    getInlineValue,
    handleAutoSave,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleDeleteStaff,
    handlePermissionCheckboxChange,
    handleSavePermissions,
    handleOpenRoleModal,
    handleDeleteRole,
    handleAssignTurn,
    handleResetTurns,
    handleInlineTurnChange,
    getInlineTurnValue,
    handleAutoSaveTurn,
    handleOpenAddStaffToQueue,
    adminUserId,
    filteredStaff,
    queueAddableStaff,
  } = useStaffManagement();

  return (
    <>
      <div
        className={`animate-fade-in ${styles.container} ${
          activeTab === "permissions" ? styles.containerPermissions : styles.containerNormal
        }`}
      >
        {/* Navigation Tabs Header */}
        <div className={styles.tabHeader}>
          <button
            onClick={() => setActiveTab("staff")}
            className={`${styles.tabButton} ${activeTab === "staff" ? styles.tabButtonActive : ""}`}
          >
            <Users size={16} /> Danh sách nhân viên
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            className={`${styles.tabButton} ${activeTab === "permissions" ? styles.tabButtonActive : ""}`}
          >
            <Shield size={16} /> Chức vụ & Phân quyền động
          </button>
          <button
            onClick={() => setActiveTab("turns")}
            className={`${styles.tabButton} ${activeTab === "turns" ? styles.tabButtonActive : ""}`}
          >
            <RefreshCw size={16} /> Xoay tua thợ hôm nay
          </button>
        </div>

        {/* LOADING & GENERAL ERROR STATE */}
        {loading && activeTab !== "turns" ? (
          <LoadingState text="Đang tải dữ liệu nhân sự..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <div
            className={`${styles.viewContainer} ${
              activeTab === "permissions" ? styles.viewContainerPermissions : styles.viewContainerNormal
            }`}
          >
            {/* VIEW TAB 1: STAFF LIST */}
            {activeTab === "staff" && (
              <StaffTable
                filteredStaff={filteredStaff}
                roles={roles}
                branches={branchList}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleOpenCreateModal={handleOpenCreateModal}
                handleOpenEditModal={handleOpenEditModal}
                handleDeleteStaff={handleDeleteStaff}
                inlineEdits={inlineEdits}
                handleInlineChange={handleInlineChange}
                handleSalaryChange={handleSalaryChange}
                handleAutoSave={handleAutoSave}
                getInlineValue={getInlineValue}
                formatNumber={formatNumber}
                adminUserId={adminUserId}
                handleOpenImportModal={() => {
                  setDroppedFile(null);
                  setIsImportModalOpen(true);
                }}
                selectedBranchFilter={selectedBranchFilter}
                setSelectedBranchFilter={setSelectedBranchFilter}
                selectedRoleFilter={selectedRoleFilter}
                setSelectedRoleFilter={setSelectedRoleFilter}
                selectedStatusFilter={selectedStatusFilter}
                setSelectedStatusFilter={setSelectedStatusFilter}
              />
            )}

            {/* VIEW TAB 2: DYNAMIC ROLES & PERMISSIONS */}
            {activeTab === "permissions" && (
              <RolePermissionPanel
                roles={roles}
                selectedRoleId={selectedRoleId}
                setSelectedRoleId={setSelectedRoleId}
                assignedPermissionIds={assignedPermissionIds}
                permissionsLoading={permissionsLoading}
                savingPermissions={savingPermissions}
                permissions={permissions}
                handleOpenRoleModal={handleOpenRoleModal}
                handleDeleteRole={handleDeleteRole}
                handlePermissionCheckboxChange={handlePermissionCheckboxChange}
                handleSavePermissions={handleSavePermissions}
              />
            )}

            {/* VIEW TAB 3: DAILY TURNS QUEUE */}
            {activeTab === "turns" && (
              <DailyTurnsTable
                dailyTurns={dailyTurns}
                loading={loading}
                branches={branches}
                currentBranchId={currentBranchId}
                handleOpenAddStaffToQueue={handleOpenAddStaffToQueue}
                handleResetTurns={handleResetTurns}
                handleAssignTurn={handleAssignTurn}
                handleInlineTurnChange={handleInlineTurnChange}
                handleAutoSaveTurn={handleAutoSaveTurn}
                getInlineTurnValue={getInlineTurnValue}
              />
            )}
          </div>
        )}
      </div>

      {/* Creation & Editing Staff Modal */}
      <StaffFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        selectedStaffId={selectedStaffId}
        staff={staff}
        roles={roles}
        branchList={branchList}
        currentTenantId={currentTenantId}
        onSave={handleSaveStaff}
      />

      {/* Custom Role creation/editing modal */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        mode={roleModalMode}
        selectedRoleId={selectedRoleId}
        roles={roles}
        currentTenantId={currentTenantId}
        fetchStaffAndRoles={fetchStaffAndRoles}
        onRoleCreated={(id) => setSelectedRoleId(id)}
      />

      {/* Manual Add Staff to Daily Turns Queue Modal */}
      <AddStaffToQueueModal
        isOpen={isAddStaffToQueueOpen}
        onClose={() => setIsAddStaffToQueueOpen(false)}
        queueAddableStaff={queueAddableStaff}
        currentTenantId={currentTenantId}
        currentBranchId={currentBranchId}
        fetchDailyTurns={fetchDailyTurns}
      />

      {/* Import Excel/CSV Wizard Modal */}
      <ImportWizardModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setDroppedFile(null);
        }}
        onSuccess={() => {
          fetchStaffAndRoles(true);
        }}
        entity="staff"
        entityLabel="Nhân sự"
        targetSchema={staffSchema}
        droppedFile={droppedFile}
      />

      {/* Global Drag-and-Drop Overlay */}
      <DragOverlay
        isActive={isDragActive && activeTab === "staff"}
        title="Thả file Excel/CSV vào đây để nhập nhân sự"
      />
    </>
  );
}
