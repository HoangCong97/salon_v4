import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { CustomNumberInput } from "./CustomNumberInput";
import { ServiceCategory, COLOR_PRESETS, getColorStyle } from "./types";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ServiceCategory[];
  categoriesLoading: boolean;
  fetchCategories: (silent?: boolean) => Promise<void>;
  fetchServices: (silent?: boolean) => Promise<void>;
  currentTenantId: string | null;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  categoriesLoading,
  fetchCategories,
  fetchServices,
  currentTenantId,
}) => {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("blue");
  const [categoryCommission, setCategoryCommission] = useState<number>(0);

  if (!isOpen) return null;

  const handleSaveCategory = async () => {
    if (!categoryName.trim() || !currentTenantId) return;

    const payload = {
      name: categoryName,
      color: categoryColor,
      defaultCommission: categoryCommission,
    };

    try {
      let res;
      if (editingCategoryId) {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories/${editingCategoryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Lỗi khi lưu phân loại");

      setCategoryName("");
      setCategoryColor("blue");
      setCategoryCommission(0);
      setEditingCategoryId(null);
      await fetchCategories();
      await fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!currentTenantId) return;
    if (!confirm("Bạn có chắc chắn muốn xóa phân loại này? Các dịch vụ thuộc phân loại này sẽ không còn phân loại.")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories/${catId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Lỗi khi xóa phân loại");

      await fetchCategories();
      await fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setCategoryName("");
    setCategoryColor("blue");
    setCategoryCommission(0);
  };

  return (
    <div
      style={{
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
        zIndex: 1000,
      }}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "720px",
          position: "relative",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          padding: "24px",
        }}
      >
        <button
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>Quản lý phân loại</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px", overflowY: "auto", flex: 1 }}>
          {/* Left Side: Category List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderRight: "1px solid hsl(210, 40%, 90%)", paddingRight: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Danh sách phân loại</h3>

            {categoriesLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
              </div>
            ) : categories.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "13px", fontStyle: "italic" }}>
                Chưa có phân loại nào. Hãy tạo một phân loại ở biểu mẫu bên cạnh.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", paddingRight: "4px" }}>
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 12px",
                      backgroundColor: "hsl(210, 40%, 98%)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid hsl(210, 40%, 92%)",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span className="badge" style={{ ...getColorStyle(cat.color), width: "fit-content", textTransform: "none" }}>
                        {cat.name}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        Hoa hồng mặc định: <strong>{cat.defaultCommission}%</strong>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "11px" }}
                        onClick={() => {
                          setEditingCategoryId(cat.id);
                          setCategoryName(cat.name);
                          setCategoryColor(cat.color);
                          setCategoryCommission(Number(cat.defaultCommission));
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: "4px 8px", fontSize: "11px" }}
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Form (Add or Edit) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>
              {editingCategoryId ? "Chỉnh sửa phân loại" : "Thêm phân loại mới"}
            </h3>

            <div className="form-group">
              <label className="form-label">Tên phân loại *</label>
              <input
                className="form-input"
                type="text"
                required
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ví dụ: Uốn & Nhuộm"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Màu sắc đại diện *</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                {COLOR_PRESETS.map((colorObj) => {
                  const isActive = categoryColor === colorObj.value;
                  return (
                    <button
                      key={colorObj.value}
                      type="button"
                      onClick={() => setCategoryColor(colorObj.value)}
                      style={{
                        padding: "8px 6px",
                        borderRadius: "var(--radius-sm)",
                        border: isActive ? `2px solid var(--color-primary)` : "1px solid hsl(210, 40%, 88%)",
                        backgroundColor: colorObj.bg,
                        color: colorObj.text,
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {colorObj.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Hoa hồng thợ mặc định (%)</label>
              <CustomNumberInput min={0} max={100} step={1} value={categoryCommission} onChange={setCategoryCommission} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
              {editingCategoryId && (
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                  Hủy
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveCategory}
                disabled={!categoryName.trim()}
              >
                {editingCategoryId ? "Lưu thay đổi" : "Tạo phân loại"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
