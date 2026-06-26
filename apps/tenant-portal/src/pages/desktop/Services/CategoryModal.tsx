import React, { useState } from "react";
import { X, Loader2, Layers } from "lucide-react";
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
      const isNew = editingCategoryId === "new";
      if (editingCategoryId && !isNew) {
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

      await fetchCategories();
      await fetchServices();

      if (isNew) {
        const savedCat = await res.json();
        setEditingCategoryId(savedCat.id);
        setCategoryName(savedCat.name);
        setCategoryColor(savedCat.color);
        setCategoryCommission(Number(savedCat.defaultCommission));
      }
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

  const handleBulkApplyCommission = async () => {
    if (!editingCategoryId || editingCategoryId === "new" || !currentTenantId) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories/${editingCategoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: categoryName,
          color: categoryColor,
          defaultCommission: categoryCommission,
        }),
      });

      if (!res.ok) throw new Error("Lỗi khi áp dụng hoa hồng");

      await fetchCategories();
      await fetchServices();
      alert(`Đã áp dụng hoa hồng mặc định ${categoryCommission}% cho tất cả dịch vụ thuộc phân loại này.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isChanged = (() => {
    if (editingCategoryId === "new") {
      return categoryName.trim() !== "";
    }
    const originalCat = categories.find((c) => c.id === editingCategoryId);
    if (!originalCat) return false;
    return (
      categoryName !== originalCat.name ||
      categoryColor !== originalCat.color ||
      categoryCommission !== Number(originalCat.defaultCommission)
    );
  })();

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
      <style>{`
        .category-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          height: 64px;
          box-sizing: border-box;
          background-color: hsl(210, 40%, 98%);
          border-radius: var(--radius-sm);
          border: 1px solid hsl(210, 40%, 92%);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .category-item:hover {
          background-color: hsl(210, 40%, 95%) !important;
          border-color: hsl(210, 40%, 86%) !important;
        }
        .category-item.active {
          background-color: hsl(210, 100%, 98%) !important;
          border-color: var(--color-primary) !important;
        }
      `}</style>
      <div
        className="card animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "760px",
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

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          overflowY: "hidden",
          flex: 1,
        }}>
          {/* Left Side: Category List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderRight: "1px solid hsl(210, 40%, 90%)", paddingRight: "24px", height: "100%", minHeight: 0 }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Danh sách phân loại</h3>

            {categoriesLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", paddingRight: "4px", flex: 1 }}>
                {categories.length === 0 && (
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", fontStyle: "italic", marginBottom: "8px" }}>
                    Chưa có phân loại nào.
                  </p>
                )}
                {categories.map((cat) => {
                  const isEditing = editingCategoryId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        if (isEditing) {
                          handleCancelEdit();
                        } else {
                          setEditingCategoryId(cat.id);
                          setCategoryName(cat.name);
                          setCategoryColor(cat.color);
                          setCategoryCommission(Number(cat.defaultCommission));
                        }
                      }}
                      className={isEditing ? "category-item active" : "category-item"}
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
                          className="btn btn-danger"
                          style={{ padding: "4px 8px", fontSize: "11px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (editingCategoryId === cat.id) {
                              handleCancelEdit();
                            }
                            handleDeleteCategory(cat.id);
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Create Category button inline at the bottom of the list */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategoryId("new");
                    setCategoryName("");
                    setCategoryColor("blue");
                    setCategoryCommission(0);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "10px 12px",
                    backgroundColor: editingCategoryId === "new" ? "hsl(210, 100%, 98%)" : "transparent",
                    borderRadius: "var(--radius-sm)",
                    border: editingCategoryId === "new" ? "1px solid var(--color-primary)" : "1px dashed hsl(210, 40%, 80%)",
                    color: "var(--color-primary)",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                    transition: "all 0.15s ease",
                    marginTop: "4px",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (editingCategoryId !== "new") {
                      e.currentTarget.style.backgroundColor = "hsl(210, 40%, 96%)";
                      e.currentTarget.style.borderColor = "var(--color-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (editingCategoryId !== "new") {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "hsl(210, 40%, 80%)";
                    }
                  }}
                >
                  ➕ Tạo phân loại mới
                </button>
              </div>
            )}
          </div>

          {/* Right Side: Form (Add or Edit) / Placeholder */}
          {!editingCategoryId ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px 16px",
              textAlign: "center",
              color: "var(--text-muted)",
              height: "100%",
              minHeight: "280px",
              backgroundColor: "hsl(210, 40%, 99%)",
              borderRadius: "var(--radius-sm)",
              border: "1px dashed hsl(210, 40%, 88%)",
            }}>
              <Layers size={40} style={{ color: "hsl(210, 30%, 80%)", marginBottom: "12px" }} />
              <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Chi tiết phân loại
              </h4>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", maxWidth: "240px", lineHeight: "1.5" }}>
                Chọn một phân loại từ danh sách hoặc nhấn tạo mới để chỉnh sửa thông tin.
              </p>
            </div>
          ) : (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%", overflowY: "auto", paddingRight: "4px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>
                {editingCategoryId === "new" ? "Thêm phân loại mới" : "Chỉnh sửa phân loại"}
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
                <label className="form-label">Hoa hồng thợ mặc định (%)</label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <CustomNumberInput min={0} max={100} step={1} value={categoryCommission} onChange={setCategoryCommission} />
                  </div>
                  <button
                    type="button"
                    className="btn"
                    disabled={!editingCategoryId || editingCategoryId === "new"}
                    onClick={handleBulkApplyCommission}
                    style={{
                      padding: "8px 12px",
                      fontSize: "12px",
                      height: "38px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      whiteSpace: "nowrap",
                      backgroundColor: (!editingCategoryId || editingCategoryId === "new") ? "hsl(210, 15%, 85%)" : "var(--color-primary)",
                      color: (!editingCategoryId || editingCategoryId === "new") ? "var(--text-muted)" : "white",
                      cursor: (!editingCategoryId || editingCategoryId === "new") ? "not-allowed" : "pointer",
                      border: "none",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (editingCategoryId && editingCategoryId !== "new") {
                        e.currentTarget.style.backgroundColor = "var(--color-primary-hover)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (editingCategoryId && editingCategoryId !== "new") {
                        e.currentTarget.style.backgroundColor = "var(--color-primary)";
                      }
                    }}
                    title={editingCategoryId && editingCategoryId !== "new" ? "Áp dụng mức hoa hồng này cho tất cả dịch vụ thuộc phân loại này" : "Hãy chọn một phân loại để áp dụng hàng loạt"}
                  >
                    Áp dụng hàng loạt
                  </button>
                </div>
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
                          border: isActive ? `1px solid var(--color-primary)` : "1px solid hsl(210, 40%, 88%)",
                          boxShadow: isActive ? "inset 0 0 0 1px var(--color-primary)" : "none",
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

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid hsl(210, 40%, 92%)" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={editingCategoryId !== "new" && !isChanged}
                  style={{
                    opacity: (editingCategoryId !== "new" && !isChanged) ? 0.5 : 1,
                    cursor: (editingCategoryId !== "new" && !isChanged) ? "not-allowed" : "pointer",
                    pointerEvents: (editingCategoryId !== "new" && !isChanged) ? "none" : "auto",
                  }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveCategory}
                  disabled={!isChanged || !categoryName.trim()}
                  style={{
                    backgroundColor: (!isChanged || !categoryName.trim()) ? "hsl(210, 15%, 85%)" : "var(--color-primary)",
                    color: (!isChanged || !categoryName.trim()) ? "var(--text-muted)" : "white",
                    cursor: (!isChanged || !categoryName.trim()) ? "not-allowed" : "pointer",
                    border: "none",
                  }}
                >
                  {editingCategoryId === "new" ? "Lưu phân loại" : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
