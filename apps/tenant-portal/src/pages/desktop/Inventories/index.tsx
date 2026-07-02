import React, { useState, useMemo } from "react";
import { Package } from "lucide-react";

import { InventoryHeader } from "./components/InventoryHeader";
import { InventoryTable } from "./components/InventoryTable";
import { InventoryModal } from "./components/InventoryModal";
import { EmptyState } from "../../../components/desktop/ui/EmptyState";
import { LoadingState } from "../../../components/desktop/ui/LoadingState";
import { ErrorState } from "../../../components/desktop/ui/ErrorState";
import { ImportWizardModal } from "../../../components/desktop/ImportWizard/ImportWizardModal";
import { DragOverlay } from "../../../components/desktop/ui/DragOverlay";

import { useInventories } from "./useInventories";
import { useAuthStore } from "../../../store/useAuthStore";
import { useFileDragAndDrop } from "../../../hooks/useFileDragAndDrop";
import { TargetField } from "../../../hooks/useImportWizard";
import { ExportColumnMapping } from "../../../utils/exportData";

import styles from "./Inventories.module.css";

export default function Inventories() {
  const { hasPermission } = useAuthStore();
  const canManage = hasPermission("inventory.manage");

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
    fetchInventory,
  } = useInventories();

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  // File Drag-and-Drop Hook
  const { isDragActive } = useFileDragAndDrop((file) => {
    if (canManage) {
      setDroppedFile(file);
      setIsImportModalOpen(true);
    }
  });

  // Schema definition for importing products
  const inventorySchema = useMemo<TargetField[]>(() => [
    { field: "name", label: "Tên sản phẩm", type: "string", required: true, description: "Tên hiển thị của sản phẩm/hàng hóa" },
    { field: "sellPrice", label: "Giá bán", type: "number", required: true, description: "Giá niêm yết bán ra (VND)" },
    { field: "costPrice", label: "Giá vốn", type: "number", required: false, description: "Giá nhập kho (VND)" },
    { field: "discountPrice", label: "Giá khuyến mãi", type: "number", required: false, description: "Giá khuyến mãi bán ra (VND)" },
    { field: "quantity", label: "Số lượng", type: "number", required: false, description: "Số lượng tồn kho ban đầu" }
  ], []);

  // Column mapping for exporting products
  const inventoryExportColumns = useMemo<ExportColumnMapping[]>(() => [
    { key: "name", header: "Tên sản phẩm" },
    { key: "costPrice", header: "Giá vốn (VND)", transform: (val) => Number(val) },
    { key: "sellPrice", header: "Giá bán (VND)", transform: (val) => Number(val) },
    { key: "discountPrice", header: "Giá khuyến mãi (VND)", transform: (val) => val !== null && val !== undefined ? Number(val) : "" },
    { key: "quantity", header: "Số lượng tồn kho", transform: (val) => Number(val) }
  ], []);

  return (
    <>
      <div className={`animate-fade-in ${styles.container}`}>
        {/* Header filter controls */}
        <InventoryHeader
          showLowStockOnly={showLowStockOnly}
          setShowLowStockOnly={setShowLowStockOnly}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onOpenCreateModal={handleOpenCreateModal}
          onOpenImportModal={() => {
            setDroppedFile(null);
            setIsImportModalOpen(true);
          }}
          filteredItems={filteredItems}
          exportColumns={inventoryExportColumns}
          canManage={canManage}
        />

        {/* Main Content */}
        {loading ? (
          <LoadingState text="Đang tải danh sách sản phẩm..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="Không tìm thấy sản phẩm"
            description="Hãy thử điều chỉnh bộ lọc hoặc tạo sản phẩm mới."
            icon={<Package size={48} />}
          />
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

      {/* Import Wizard Modal */}
      <ImportWizardModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setDroppedFile(null);
        }}
        onSuccess={() => {
          fetchInventory();
        }}
        entity="inventory"
        entityLabel="Sản phẩm"
        targetSchema={inventorySchema}
        droppedFile={droppedFile}
      />

      {/* Global Drag-and-Drop Overlay */}
      <DragOverlay
        isActive={isDragActive && canManage}
        title="Thả file Excel/CSV vào đây để nhập sản phẩm"
      />
    </>
  );
}

