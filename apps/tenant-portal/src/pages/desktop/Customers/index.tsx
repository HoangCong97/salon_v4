import React from "react";
import { Users, Plus, Loader2, Search, Upload } from "lucide-react";

import { CustomerTable } from "./CustomerTable";
import { CustomerFormModal } from "./CustomerFormModal";
import { ImportWizardModal } from "../../../components/desktop/ImportWizard/ImportWizardModal";
import { ExportButton } from "../../../components/desktop/ExportButton";

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
      {/* Header Row */}
      <div className={styles.headerRow}>
        <div className={styles.headerTitleWrapper}>
          <div className={styles.headerIconBg}>
            <Users size={20} />
          </div>
          <div>
            <h2 className={styles.headerTitle}>QUẢN LÝ KHÁCH HÀNG</h2>
            <span className={styles.headerSubtitle}>
              Danh sách và hồ sơ khách hàng thành viên của salon
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className={styles.actionsWrapper}>
          {canManage && (
            <button
              className={`btn btn-secondary ${styles.btnHeader}`}
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload size={14} /> Nhập Excel/CSV
            </button>
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

      {/* Main Grid View */}
      <div className={`card ${styles.cardContent}`}>
        {/* Filters bar */}
        <div className={styles.filtersBar}>
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

        {/* Content Table / Loading / Error states */}
        {loading ? (
          <div className={styles.loadingWrapper}>
            <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
            <span className={styles.loadingText}>Đang tải danh sách khách hàng...</span>
          </div>
        ) : error ? (
          <div className={styles.errorText}>⚠️ {error}</div>
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
      {isDragActive && canManage && (
        <div className={styles.dragOverlay}>
          <div className={styles.dragIconBg}>
            <Upload size={32} color="var(--color-primary)" />
          </div>
          <span className={styles.dragText}>
            Kéo thả file Excel/CSV vào đây để nhập khách hàng
          </span>
        </div>
      )}

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

