import React, { useState } from "react";
import { X, ArrowUpRight, ArrowDownLeft, Image as ImageIcon } from "lucide-react";
import { PriceInputWithSuggestion } from "../../../../components/desktop/TableComponents";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalMode: "create" | "edit" | "adjust";
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
  adjustType: "import" | "export";
  setAdjustType: (val: "import" | "export") => void;
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
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(15, 23, 42, 0.4)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "520px", position: "relative" }}>
        <button
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
          onClick={onClose}
        >
          <X size={20} />
        </button>
        
        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>
          {modalMode === "create" ? "Thêm sản phẩm kho mới" : 
           modalMode === "edit" ? "Chỉnh sửa sản phẩm" : "Điều chỉnh kho hàng"}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
                      } catch (err: any) {
                        alert("Lỗi nạp ảnh: " + err.message);
                      }
                    }
                  }}
                  onClick={() => {
                    document.getElementById("product-file-upload")?.click();
                  }}
                  style={{
                    border: dragging ? "2px dashed var(--color-primary)" : "2px dashed hsl(210, 40%, 85%)",
                    borderRadius: "var(--radius-sm)",
                    padding: "16px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: dragging ? "hsl(210, 100%, 98%)" : "hsl(210, 40%, 98%)",
                    transition: "all 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100px",
                  }}
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
                        } catch (err: any) {
                          alert("Lỗi nạp ảnh: " + err.message);
                        }
                      }
                    }}
                  />
                  {imageUrl ? (
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt="Preview"
                        style={{ maxWidth: "100px", maxHeight: "100px", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: "2px 8px", fontSize: "10.5px", cursor: "pointer" }}
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
                      <ImageIcon size={24} style={{ color: "var(--text-muted)", marginBottom: "6px" }} />
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)" }}>
                        Kéo thả ảnh sản phẩm hoặc click để chọn
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "2px" }}>
                        Tự động lưu trữ và tối ưu hóa
                      </span>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ padding: "12px", background: "hsl(210, 40%, 96%)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontWeight: "600", fontSize: "15px" }}>{name}</div>
                <div style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
                  Số lượng tồn kho hiện tại: <strong style={{ color: "var(--text-primary)" }}>{quantity}</strong> sản phẩm
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Hình thức điều chỉnh</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setAdjustType("import")}
                    style={{
                      backgroundColor: adjustType === "import" ? "var(--color-success-light)" : "white",
                      borderColor: adjustType === "import" ? "var(--color-success)" : "var(--border-color)",
                      color: adjustType === "import" ? "var(--color-success)" : "var(--text-secondary)",
                      display: "flex", gap: "8px"
                    }}
                  >
                    <ArrowUpRight size={16} /> Nhập kho
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setAdjustType("export")}
                    style={{
                      backgroundColor: adjustType === "export" ? "var(--color-danger-light)" : "white",
                      borderColor: adjustType === "export" ? "var(--color-danger)" : "var(--border-color)",
                      color: adjustType === "export" ? "var(--color-danger)" : "var(--text-secondary)",
                      display: "flex", gap: "8px"
                    }}
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

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
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
