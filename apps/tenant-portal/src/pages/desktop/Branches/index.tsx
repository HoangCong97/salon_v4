import React from "react";
import { Plus, Loader2, Building2 } from "lucide-react";

import BrandCard from "./BrandCard";
import BrandModal from "./BrandModal";
import BranchCard from "./BranchCard";
import BranchModal from "./BranchModal";

import { useBranches } from "./useBranches";

import styles from "./Branches.module.css";

export default function Branches() {
  const {
    tenantInfo,
    branches,
    loading,
    error,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    selectedBranch,
    isBrandModalOpen,
    setIsBrandModalOpen,
    handleOpenBrandModal,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveBrand,
    handleSaveBranch,
    handleDeleteBranch,
    updateTenantField,
    handleUploadTenantBanner,
    handleUploadTenantLogo,
    updateBranchField,
    handleUploadBranchBanner,
    handleUploadBranchLogo,
  } = useBranches();

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      {/* Brand Card Summary */}
      <BrandCard
        tenantInfo={tenantInfo}
        onOpenBrandModal={handleOpenBrandModal}
        onUploadLogo={handleUploadTenantLogo}
        onUploadBanner={handleUploadTenantBanner}
        onRemoveLogo={() => updateTenantField({ logoUrl: "" })}
        onRemoveBanner={() => updateTenantField({ bannerUrl: "" })}
      />

      {/* Header List */}
      <div className={styles.brandDividerHeader}>
        <h2 className={styles.brandDividerTitle}>Danh sách chi nhánh</h2>
        <button
          className="btn btn-primary"
          onClick={handleOpenCreateModal}
          style={{ height: "38px" }}
        >
          <Plus size={18} /> Thêm chi nhánh
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className={styles.loadingWrapper}>
          <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
        </div>
      ) : error ? (
        <div className={`card ${styles.errorCard}`}>
          <p className={styles.errorText}>{error}</p>
        </div>
      ) : branches.length === 0 ? (
        <div className={`card ${styles.emptyCard}`}>
          <Building2 size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Chưa có chi nhánh nào</h3>
          <p className={styles.emptyDesc}>Hãy bắt đầu thêm chi nhánh đầu tiên của bạn.</p>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={18} /> Thêm chi nhánh
          </button>
        </div>
      ) : (
        <div className={styles.gridArea}>
          {branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              tenantInfo={tenantInfo}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteBranch}
              onUploadLogo={handleUploadBranchLogo}
              onUploadBanner={handleUploadBranchBanner}
              onResetLogo={(b) => updateBranchField(b, { logoUrl: "" })}
              onResetBanner={(b) => updateBranchField(b, { bannerUrl: "" })}
            />
          ))}
        </div>
      )}

      {/* Brand Modal Dialog */}
      <BrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        tenantInfo={tenantInfo}
        onSave={handleSaveBrand}
      />

      {/* Branch Modal Dialog */}
      <BranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        branch={selectedBranch}
        tenantInfo={tenantInfo}
        onSave={handleSaveBranch}
      />
    </div>
  );
}

