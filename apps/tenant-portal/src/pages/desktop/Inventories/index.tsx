import React from "react";
import { Package, Loader2 } from "lucide-react";

import { InventoryHeader } from "./components/InventoryHeader";
import { InventoryTable } from "./components/InventoryTable";
import { InventoryModal } from "./components/InventoryModal";

import { useInventories } from "./useInventories";

import styles from "./Inventories.module.css";

export default function Inventories() {
  const {
    loading,
    error,
    filteredItems,
    searchTerm,
    setSearchTerm,
    showLowStockOnly,
    setShowLowStockOnly,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    name,
    setName,
    costPrice,
    setCostPrice,
    sellPrice,
    setSellPrice,
    discountPrice,
    setDiscountPrice,
    quantity,
    setQuantity,
    imageUrl,
    setImageUrl,
    adjustType,
    setAdjustType,
    adjustQuantity,
    setAdjustQuantity,
    compressAndGetBase64,
    uploadFile,
    formatNumber,
    handlePriceChange,
    handleInlineChange,
    getInlineValue,
    handleAutoSave,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleOpenAdjustModal,
    handleSave,
    handleDelete,
  } = useInventories();

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      {/* Header filter controls */}
      <InventoryHeader
        showLowStockOnly={showLowStockOnly}
        setShowLowStockOnly={setShowLowStockOnly}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {/* Main Content */}
      {loading ? (
        <div className={styles.loadingWrapper}>
          <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
        </div>
      ) : error ? (
        <div className={styles.errorCard}>
          <p className={styles.errorText}>{error}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className={`card ${styles.emptyCard}`}>
          <Package size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Không tìm thấy sản phẩm</h3>
          <p className={styles.emptyText}>Hãy thử điều chỉnh bộ lọc hoặc tạo sản phẩm mới.</p>
        </div>
      ) : (
        <InventoryTable
          filteredItems={filteredItems}
          getInlineValue={getInlineValue}
          handleInlineChange={handleInlineChange}
          handlePriceChange={handlePriceChange}
          handleAutoSave={handleAutoSave}
          formatNumber={formatNumber}
          onOpenAdjustModal={handleOpenAdjustModal}
          onOpenEditModal={handleOpenEditModal}
          onDelete={handleDelete}
        />
      )}

      {/* Modal Dialog */}
      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalMode={modalMode}
        name={name}
        setName={setName}
        costPrice={costPrice}
        setCostPrice={setCostPrice}
        sellPrice={sellPrice}
        setSellPrice={setSellPrice}
        discountPrice={discountPrice}
        setDiscountPrice={setDiscountPrice}
        quantity={quantity}
        setQuantity={setQuantity}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        adjustType={adjustType}
        setAdjustType={setAdjustType}
        adjustQuantity={adjustQuantity}
        setAdjustQuantity={setAdjustQuantity}
        compressAndGetBase64={compressAndGetBase64}
        uploadFile={uploadFile}
        handleSave={handleSave}
      />
    </div>
  );
}

