import React from "react";
import { Plus, Search, Upload } from "lucide-react";

import { CustomerTable } from "./CustomerTable";
import { CustomerFormModal } from "./CustomerFormModal";
import { ImportWizardModal } from "../../../components/desktop/ImportWizard/ImportWizardModal";
import { ExportButton } from "../../../components/desktop/ExportButton";
import { ImportButton } from "../../../components/desktop/ImportButton";
import { DragOverlay } from "../../../components/desktop/ui/DragOverlay";
import { LoadingState } from "../../../components/desktop/ui/LoadingState";
import { ErrorState } from "../../../components/desktop/ui/ErrorState";

import { useCustomers } from "./useCustomers";

import styles from "./Customers.module.css";

export default function Customers() {
  const {
    currentTenantId,
    currentBranchId,
    canManage,
    loading,
    error,
    customers,
    filteredCustomers,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    selectedCustomerId,
    isImportModalOpen,
    setIsImportModalOpen,
    droppedFile,
    setDroppedFile,
    isDragActive,
    customerSchema,
    customerExportColumns,
    inlineEdits,
    handleInlineChange,
    getInlineValue,
    handleAutoSave,
    fetchCustomers,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleDelete,
  } = useCustomers();

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      {/* Main Grid View */}
      <div className={`card ${styles.cardContent}`}>
        {/* Filters bar */}
        <div className={styles.filtersBar}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flexGrow: 1 }}>
            {/* Search box */}
            <div className={styles.searchWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Tìm theo tên, SĐT hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.searchResultCount}>
              Tìm thấy <strong>{filteredCustomers.length}</strong> khách hàng
            </div>
          </div>

          {/* Action buttons */}
          <div className={styles.actionsWrapper}>
            {canManage && (
              <ImportButton
                onClick={() => {
                  setDroppedFile(null);
                  setIsImportModalOpen(true);
                }}
              />
            )}

            <ExportButton
              data={filteredCustomers}
              fileName="danh_sach_khach_hang"
              columns={customerExportColumns}
            />

            {canManage && (
              <button
                className={`btn btn-primary ${styles.btnHeader}`}
                onClick={handleOpenCreateModal}
              >
                <Plus size={16} /> Thêm khách hàng
              </button>
            )}
          </div>
        </div>

        {/* Content Table / Loading / Error states */}
        {loading ? (
          <LoadingState text="Đang tải danh sách khách hàng..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <div className={styles.tableWrapper}>
            <CustomerTable
              filteredCustomers={filteredCustomers}
              inlineEdits={inlineEdits}
              handleInlineChange={handleInlineChange}
              handleAutoSave={handleAutoSave}
              handleOpenEditModal={handleOpenEditModal}
              handleDelete={handleDelete}
              getInlineValue={getInlineValue}
            />
          </div>
        )}
      </div>

      {/* Drag & Drop Visual Overlay */}
      <DragOverlay
        isActive={isDragActive && canManage}
        title="Kéo thả file Excel/CSV vào đây để nhập khách hàng"
      />

      {/* Customer Create/Edit Modal */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        selectedCustomerId={selectedCustomerId}
        customers={customers}
        fetchCustomers={fetchCustomers}
        currentTenantId={currentTenantId}
        currentBranchId={currentBranchId}
      />

      {/* Import Wizard Modal */}
      <ImportWizardModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setDroppedFile(null);
        }}
        onSuccess={async () => {
          await fetchCustomers(true);
        }}
        entity="customer"
        entityLabel="Khách hàng"
        targetSchema={customerSchema}
        droppedFile={droppedFile}
      />
    </div>
  );
}

