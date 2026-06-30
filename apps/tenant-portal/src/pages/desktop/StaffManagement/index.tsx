import React from "react";
import { Users, Shield, RefreshCw, Info, Loader2, Upload } from "lucide-react";
import { StaffTable } from "./StaffTable";
import { RolePermissionPanel } from "./RolePermissionPanel";
import { DailyTurnsTable } from "./DailyTurnsTable";
import { StaffFormModal } from "./StaffFormModal";
import { RoleModal } from "./RoleModal";
import { AddStaffToQueueModal } from "./AddStaffToQueueModal";
import { ImportWizardModal } from "../../../components/desktop/ImportWizard/ImportWizardModal";
import { useStaffManagement } from "./useStaffManagement";

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
        className="animate-fade-in"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          height: activeTab === "permissions" ? "calc(100vh - 120px)" : "auto",
          overflow: activeTab === "permissions" ? "hidden" : "visible",
          minHeight: 0,
        }}
      >
        {/* Navigation Tabs Header */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", paddingBottom: "2px", gap: "8px" }}>
          <button
            onClick={() => setActiveTab("staff")}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              background: "none",
              border: "none",
              borderBottom: activeTab === "staff" ? "3px solid var(--color-primary)" : "3px solid transparent",
              color: activeTab === "staff" ? "var(--color-primary)" : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            <Users size={16} /> Danh sách nhân viên
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              background: "none",
              border: "none",
              borderBottom: activeTab === "permissions" ? "3px solid var(--color-primary)" : "3px solid transparent",
              color: activeTab === "permissions" ? "var(--color-primary)" : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            <Shield size={16} /> Chức vụ & Phân quyền động
          </button>
          <button
            onClick={() => setActiveTab("turns")}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              background: "none",
              border: "none",
              borderBottom: activeTab === "turns" ? "3px solid var(--color-primary)" : "3px solid transparent",
              color: activeTab === "turns" ? "var(--color-primary)" : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            <RefreshCw size={16} /> Xoay tua thợ hôm nay
          </button>
        </div>

        {/* LOADING & GENERAL ERROR STATE */}
        {loading && activeTab !== "turns" ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
            <Loader2 className="animate-spin" size={36} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : error ? (
          <div className="card" style={{ borderLeft: "4px solid var(--color-danger)", background: "var(--color-danger-light)" }}>
            <h3
              style={{
                color: "var(--color-danger)",
                fontSize: "14px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Info size={16} /> Lỗi nạp dữ liệu
            </h3>
            <p style={{ color: "var(--color-danger)", fontSize: "13px", marginTop: "4px" }}>{error}</p>
          </div>
        ) : (
          <div
            style={{
              flexGrow: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: activeTab === "permissions" ? "hidden" : "visible",
            }}
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
      {isDragActive && activeTab === "staff" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(59, 130, 246, 0.15)",
            backdropFilter: "blur(4px)",
            border: "4px dashed var(--color-primary)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-primary)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "32px 48px",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Upload size={48} className="animate-bounce" />
            <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Thả file Excel/CSV vào đây để nhập nhân sự</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Hệ thống sẽ tự động phân tích và đối chiếu cột dữ liệu bằng AI.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

