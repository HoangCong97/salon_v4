import React, { useState } from "react";
import { X, ArrowUpRight, ArrowDownLeft, Image as ImageIcon } from "lucide-react";

import { PriceInputWithSuggestion } from "../../../../components/desktop/TableComponents";

import { AdjustType, ModalMode } from "../types";

import styles from "../Inventories.module.css";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalMode: ModalMode;
  name: string;
  setName: (val: string) => void;
  costPrice: string;
  setCostPrice: (val: string) => void;
  sellPrice: string;
  setSellPrice: (val: string) => void;
  discountPrice: string;
  setDiscountPrice: (val: string) => void;
  quantity: number;
  setQuantity: (val: number) => void;
  imageUrl: string;
  setImageUrl: (val: string) => void;
  adjustType: AdjustType;
  setAdjustType: (val: AdjustType) => void;
  adjustQuantity: number;
  setAdjustQuantity: (val: number) => void;
  compressAndGetBase64: (file: File) => Promise<string>;
  uploadFile: (base64Data: string, category: string, originalFilename?: string) => Promise<string>;
  handleSave: (e: React.FormEvent) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
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
  handleSave,
}) => {
  const [dragging, setDragging] = useState(false);

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div className={`card animate-fade-in ${styles.modalCard}`}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>

        <h2 className={styles.modalTitle}>
          {modalMode === "create"
            ? "Thêm sản phẩm kho mới"
            : modalMode === "edit"
              ? "Chỉnh sửa sản phẩm"
              : "Điều chỉnh kho hàng"}
        </h2>

        <form onSubmit={handleSave}>
          {modalMode !== "adjust" ? (
            <>
              <div className="form-group">
                <label className="form-label">Tên sản phẩm *</label>
                <input
                  className="form-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Sáp Vuốt Tóc HairGlow Wax"
                />
              </div>

              <div className={styles.grid2}>
                <div className="form-group">
                  <label className="form-label">Giá nhập kho (giá vốn)</label>
                  <PriceInputWithSuggestion
                    required
                    value={costPrice}
                    onChange={setCostPrice}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Số lượng ban đầu</label>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className={styles.grid2}>
                <div className="form-group">
                  <label className="form-label">Giá bán lẻ (VND) *</label>
                  <PriceInputWithSuggestion
                    required
                    value={sellPrice}
                    onChange={setSellPrice}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá KM (nếu có)</label>
                  <PriceInputWithSuggestion
                    value={discountPrice}
                    onChange={setDiscountPrice}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Hình ảnh sản phẩm</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setDragging(false);
                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) {
                      const file = files[0];
                      try {
                        const base64 = await compressAndGetBase64(file);
                        const uploadedUrl = await uploadFile(base64, "items", file.name);
                        setImageUrl(uploadedUrl);
                      } catch (err: unknown) {
                        const msg = err instanceof Error ? err.message : String(err);
                        alert("Lỗi nạp ảnh: " + msg);
                      }
                    }
                  }}
                  onClick={() => {
                    document.getElementById("product-file-upload")?.click();
                  }}
                  className={`${styles.dropzone} ${dragging ? styles.dropzoneActive : styles.dropzoneInactive}`}
                >
                  <input
                    id="product-file-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        const file = files[0];
                        try {
                          const base64 = await compressAndGetBase64(file);
                          const uploadedUrl = await uploadFile(base64, "items", file.name);
                          setImageUrl(uploadedUrl);
                        } catch (err: unknown) {
                          const msg = err instanceof Error ? err.message : String(err);
                          alert("Lỗi nạp ảnh: " + msg);
                        }
                      }
                    }}
                  />
                  {imageUrl ? (
                    <div className={styles.imagePreviewContainer}>
                      <img src={imageUrl} alt="Preview" className={styles.previewImage} />
                      <button
                        type="button"
                        className={`btn btn-danger ${styles.deleteImageButton}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageUrl("");
                        }}
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon size={24} className={styles.dropzoneIcon} />
                      <span className={styles.dropzoneTitle}>
                        Kéo thả ảnh sản phẩm hoặc click để chọn
                      </span>
                      <span className={styles.dropzoneSub}>Tự động lưu trữ và tối ưu hóa</span>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.modalAdjustContainer}>
              <div className={styles.adjustInfoCard}>
                <div className={styles.adjustInfoName}>{name}</div>
                <div className={styles.adjustInfoStock}>
                  Số lượng tồn kho hiện tại:{" "}
                  <strong style={{ color: "var(--text-primary)" }}>{quantity}</strong> sản phẩm
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Hình thức điều chỉnh</label>
                <div className={styles.adjustTypeGrid}>
                  <button
                    type="button"
                    className={`btn ${styles.adjustTypeButton} ${
                      adjustType === "import" ? styles.btnAdjustActiveSuccess : styles.btnAdjustInactive
                    }`}
                    onClick={() => setAdjustType("import")}
                  >
                    <ArrowUpRight size={16} /> Nhập kho
                  </button>
                  <button
                    type="button"
                    className={`btn ${styles.adjustTypeButton} ${
                      adjustType === "export" ? styles.btnAdjustActiveDanger : styles.btnAdjustInactive
                    }`}
                    onClick={() => setAdjustType("export")}
                  >
                    <ArrowDownLeft size={16} /> Xuất kho
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Số lượng sản phẩm</label>
                <input
                  className="form-input"
                  type="number"
                  min={1}
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          )}

          <div className={styles.buttonFooter}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {modalMode === "adjust" ? "Cập nhật số lượng" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

