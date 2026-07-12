import React, { useState } from "react";
import { X, Loader2, Layers } from "lucide-react";

import { CustomNumberInput } from "./CustomNumberInput";
import { Button } from "../../../components/desktop/ui/Button";

import { useConfirm } from "../../../components/desktop/ConfirmDialog";
import { useToast } from "../../../components/desktop/ToastProvider";

import { api } from "../../../utils/apiClient";

import { ServiceCategory, COLOR_PRESETS, getColorStyle } from "./types";

import styles from "./Services.module.css";

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
  const confirm = useConfirm();
  const toast = useToast();
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("blue");
  const [categoryCommission, setCategoryCommission] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);

  if (!isOpen) return null;

  const handleSaveCategory = async () => {
    if (!categoryName.trim() || !currentTenantId) return;

    const payload = {
      name: categoryName,
      color: categoryColor,
      defaultCommission: categoryCommission,
    };

    setIsSaving(true);
    try {
      let savedCat;
      const isNew = editingCategoryId === "new";
      if (editingCategoryId && !isNew) {
        savedCat = await api.put<{
          id: string;
          name: string;
          color: string;
          defaultCommission: number;
        }>(
          `/tenants/${currentTenantId}/service-categories/${editingCategoryId}`,
          payload,
        );
      } else {
        savedCat = await api.post<{
          id: string;
          name: string;
          color: string;
          defaultCommission: number;
        }>(`/tenants/${currentTenantId}/service-categories`, payload);
      }

      toast.success("Lưu phân loại thành công!");
      await fetchCategories();
      await fetchServices();

      if (isNew && savedCat) {
        setEditingCategoryId(savedCat.id);
        setCategoryName(savedCat.name);
        setCategoryColor(savedCat.color);
        setCategoryCommission(Number(savedCat.defaultCommission));
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu phân loại");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!currentTenantId) return;
    if (
      !(await confirm({
        title: "Xóa phân loại",
        message:
          "Bạn có chắc chắn muốn xóa phân loại này? Các dịch vụ thuộc phân loại này sẽ không còn phân loại.",
        type: "danger",
        confirmText: "Xóa",
      }))
    )
      return;

    try {
      await api.delete(
        `/tenants/${currentTenantId}/service-categories/${catId}`,
      );
      toast.success("Đã xóa phân loại thành công!");
      await fetchCategories();
      await fetchServices();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa phân loại");
    }
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setCategoryName("");
    setCategoryColor("blue");
    setCategoryCommission(0);
  };

  const handleBulkApplyCommission = async () => {
    if (!editingCategoryId || editingCategoryId === "new" || !currentTenantId)
      return;

    setIsApplyingBulk(true);
    try {
      await api.put(
        `/tenants/${currentTenantId}/service-categories/${editingCategoryId}`,
        {
          name: categoryName,
          color: categoryColor,
          defaultCommission: categoryCommission,
          bulkApplyCommission: true,
        },
      );

      await fetchCategories();
      await fetchServices();
      toast.success(
        `Đã áp dụng hoa hồng mặc định ${categoryCommission}% cho tất cả dịch vụ thuộc phân loại này.`,
      );
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi áp dụng hoa hồng");
    } finally {
      setIsApplyingBulk(false);
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
    <div className={styles.modalOverlay}>
      <div
        className={`card animate-fade-in ${styles.modalCard}`}
        style={{
          maxWidth: "760px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          padding: "24px",
        }}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>
        <h2
          style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}
        >
          Quản lý phân loại
        </h2>

        <div className={styles.categoryGrid}>
          {/* Left Side: Category List */}
          <div
            className={styles.viewContainer}
            style={{
              gap: "12px",
              borderRight: "1px solid hsl(210, 40%, 90%)",
              paddingRight: "24px",
              height: "100%",
              minHeight: 0,
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-secondary)",
              }}
            >
              Danh sách phân loại
            </h3>

            {categoriesLoading ? (
              <div
                className={styles.loadingWrapper}
                style={{ padding: "40px 0" }}
              >
                <Loader2
                  className="animate-spin"
                  size={24}
                  style={{ color: "var(--color-primary)" }}
                />
              </div>
            ) : (
              <div className={styles.categoryListBody}>
                {categories.length === 0 && (
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "13px",
                      fontStyle: "italic",
                      marginBottom: "8px",
                    }}
                  >
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
                      className={`${styles.categoryItem} ${isEditing ? styles.categoryItemActive : ""}`}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <span
                          className="badge"
                          style={{
                            ...getColorStyle(cat.color),
                            width: "fit-content",
                            textTransform: "none",
                          }}
                        >
                          {cat.name}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                          }}
                        >
                          Hoa hồng mặc định:{" "}
                          <strong>{cat.defaultCommission}%</strong>
                        </span>
                      </div>
                      <div className={styles.categoryItemActions}>
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
                    backgroundColor:
                      editingCategoryId === "new"
                        ? "hsl(210, 100%, 98%)"
                        : "transparent",
                    borderRadius: "var(--radius-sm)",
                    border:
                      editingCategoryId === "new"
                        ? "1px solid var(--color-primary)"
                        : "1px dashed hsl(210, 40%, 80%)",
                    color: "var(--color-primary)",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                    transition: "all 0.15s ease",
                    marginTop: "4px",
                    flexShrink: 0,
                  }}
                >
                  ➕ Tạo phân loại mới
                </button>
              </div>
            )}
          </div>

          {/* Right Side: Form (Add or Edit) / Placeholder */}
          {!editingCategoryId ? (
            <div
              style={{
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
              }}
            >
              <Layers
                size={40}
                style={{ color: "hsl(210, 30%, 80%)", marginBottom: "12px" }}
              />
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                Chi tiết phân loại
              </h4>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  maxWidth: "240px",
                  lineHeight: "1.5",
                }}
              >
                Chọn một phân loại từ danh sách hoặc nhấn tạo mới để chỉnh sửa
                thông tin.
              </p>
            </div>
          ) : (
            <div
              className="animate-fade-in"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                height: "100%",
                overflowY: "auto",
                paddingRight: "4px",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-secondary)",
                }}
              >
                {editingCategoryId === "new"
                  ? "Thêm phân loại mới"
                  : "Chỉnh sửa phân loại"}
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
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <div style={{ flex: 1 }}>
                    <CustomNumberInput
                      min={0}
                      max={100}
                      step={1}
                      value={categoryCommission}
                      onChange={setCategoryCommission}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!editingCategoryId || editingCategoryId === "new"}
                    loading={isApplyingBulk}
                    onClick={handleBulkApplyCommission}
                    style={{
                      height: "38px",
                      whiteSpace: "nowrap",
                    }}
                    title={
                      editingCategoryId && editingCategoryId !== "new"
                        ? "Áp dụng mức hoa hồng này cho tất cả dịch vụ thuộc phân loại này"
                        : "Hãy chọn một phân loại để áp dụng hàng loạt"
                    }
                  >
                    Áp dụng hàng loạt
                  </Button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Màu sắc đại diện *</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "8px",
                  }}
                >
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
                          border: isActive
                            ? `1px solid var(--color-primary)`
                            : "1px solid hsl(210, 40%, 88%)",
                          boxShadow: isActive
                            ? "inset 0 0 0 1px var(--color-primary)"
                            : "none",
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

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "auto",
                  paddingTop: "12px",
                  borderTop: "1px solid hsl(210, 40%, 92%)",
                }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                  disabled={editingCategoryId !== "new" && !isChanged}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSaveCategory}
                  disabled={!isChanged || !categoryName.trim()}
                  loading={isSaving}
                >
                  {editingCategoryId === "new"
                    ? "Lưu phân loại"
                    : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
