import React, { useState, useEffect, useRef } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { formatCurrencyVND } from "@salon/shared-utils";
import { PriceInputWithSuggestion, ExcelChipsInput } from "../../../components/desktop/TableComponents";
import { CustomNumberInput } from "./CustomNumberInput";
import { Service, ServiceCategory, getColorStyle, COLOR_PRESETS, compressAndGetBase64 } from "./types";

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selectedServiceId: string | null;
  services: Service[];
  categories: ServiceCategory[];
  fetchServices: (silent?: boolean) => Promise<void>;
  fetchCategories: (silent?: boolean) => Promise<void>;
  currentTenantId: string | null;
  currentBranchId: string | null;
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  selectedServiceId,
  services,
  categories,
  fetchServices,
  fetchCategories,
  currentTenantId,
  currentBranchId,
}) => {
  // Service Form Fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [commissionInput, setCommissionInput] = useState<number>(0);
  const [priceInput, setPriceInput] = useState("");
  const [additionalPrices, setAdditionalPrices] = useState<number[]>([]);
  const [isAltPriceFocused, setIsAltPriceFocused] = useState(false);
  const [duration, setDuration] = useState<number>(30);
  const [imageUrl, setImageUrl] = useState("");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountDeduction, setDiscountDeduction] = useState<number>(0);
  const [dragging, setDragging] = useState(false);

  const uploadFile = async (base64Data: string, category: string, originalFilename?: string): Promise<string> => {
    const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: base64Data,
        category,
        filename: originalFilename
      })
    });
    if (!res.ok) {
      throw new Error("Lỗi khi tải ảnh lên máy chủ");
    }
    const data = await res.json();
    return data.url;
  };

  // Custom Category Dropdown State
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const catDropdownRef = useRef<HTMLDivElement>(null);

  // Inline Category Sub-form State
  const [showCategorySubForm, setShowCategorySubForm] = useState(false);
  const [subFormMode, setSubFormMode] = useState<"create" | "edit">("create");
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("blue");
  const [categoryCommission, setCategoryCommission] = useState<number>(0);

  // Initialize fields on open or change
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && selectedServiceId) {
        const service = services.find((s) => s.id === selectedServiceId);
        if (service) {
          setName(service.name);
          setCategoryId(service.categoryId || "");
          setCommissionInput(service.category ? Number(service.category.defaultCommission) : 0);
          setPriceInput(String(Number(service.price)));

          const calculatedDeduction = Number(service.price) - Number(service.discountPrice ?? service.price);
          if (calculatedDeduction > 0) {
            setHasDiscount(true);
            setDiscountDeduction(calculatedDeduction);
          } else {
            setHasDiscount(false);
            setDiscountDeduction(0);
          }

          setDuration(service.duration || 30);
          setImageUrl(service.imageUrl || "");
          setAdditionalPrices(service.additionalPrices ? service.additionalPrices.map(Number) : []);
        }
      } else {
        // Create mode defaults
        setName("");
        setCategoryId("");
        setCommissionInput(0);
        setPriceInput("100000");
        setHasDiscount(false);
        setDiscountDeduction(0);
        setDuration(45);
        setImageUrl("");
        setAdditionalPrices([]);
      }
      setShowCategorySubForm(false);
      setIsCatDropdownOpen(false);
    }
  }, [isOpen, mode, selectedServiceId, services]);

  // Click outside to close custom dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target as Node)) {
        setIsCatDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Check if commission was modified from the category default, update category first if so
    if (categoryId) {
      const selectedCat = categories.find((c) => c.id === categoryId);
      if (selectedCat && Number(selectedCat.defaultCommission) !== commissionInput) {
        try {
          await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories/${categoryId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: selectedCat.name,
              color: selectedCat.color,
              defaultCommission: commissionInput,
            }),
          });
          await fetchCategories(true);
        } catch (err) {
          console.error("Failed to update default commission", err);
        }
      }
    }

    const selectedCatObj = categories.find((c) => c.id === categoryId);
    const existingService = services.find(
      (s) => s.categoryId === categoryId && s.id !== selectedServiceId && s.serviceCategory
    );
    let serviceCategory = existingService ? existingService.serviceCategory : "";

    if (!serviceCategory && selectedCatObj) {
      const name = selectedCatObj.name;
      if (name.includes("Cắt Tóc")) {
        serviceCategory = "Cắt Tóc";
      } else if (name.includes("Hóa Chất")) {
        serviceCategory = "Hóa Chất";
      } else if (name.includes("Gội Đầu")) {
        serviceCategory = "Gội Đầu";
      } else if (name.includes(" & ")) {
        serviceCategory = name.split(" & ")[0].trim();
      } else if (name.includes(" (")) {
        serviceCategory = name.split(" (")[0].trim();
      } else {
        serviceCategory = name;
      }
    }

    const basePrice = parseFloat(priceInput.replace(/\D/g, ""));
    if (isNaN(basePrice)) {
      alert("Vui lòng nhập giá gốc hợp lệ");
      return;
    }

    const calculatedDiscountPrice = hasDiscount ? Math.max(0, basePrice - discountDeduction) : basePrice;
    const discountAmount = hasDiscount ? discountDeduction : 0;

    const payload = {
      name,
      categoryId: categoryId || null,
      serviceCategory: serviceCategory || null,
      price: basePrice,
      discountPrice: calculatedDiscountPrice,
      discountAmount,
      duration,
      imageUrl: imageUrl || null,
      branchId: currentBranchId || null,
      additionalPrices: additionalPrices.map(Number),
    };

    try {
      let res;
      if (mode === "create") {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/services/${selectedServiceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Lỗi khi lưu thông tin dịch vụ");

      onClose();
      await fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
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
        justifyContent: "center",
        zIndex: 1000,
        overflowY: "auto",
        padding: "20px",
      }}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "680px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          margin: "auto 0",
        }}
      >
        <button
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
          {mode === "create" ? "Thêm dịch vụ mới" : "Chỉnh sửa dịch vụ"}
        </h2>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2.5fr 2fr 1.2fr", gap: "16px", alignItems: "flex-end" }}>
            <style>{`
              /* Hide browser default number input spin buttons */
              input.custom-number-input::-webkit-outer-spin-button,
              input.custom-number-input::-webkit-inner-spin-button {
                -webkit-appearance: none !important;
                margin: 0 !important;
              }
              input.custom-number-input {
                -moz-appearance: textfield !important;
              }
            `}</style>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tên dịch vụ *</label>
              <input
                className="form-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Cắt Tóc Nam Premium"
              />
            </div>

            {/* Custom Category Dropdown */}
            <div ref={catDropdownRef} className="form-group" style={{ margin: 0, position: "relative" }}>
              <label className="form-label">Phân loại *</label>
              <button
                type="button"
                className="form-input"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textAlign: "left",
                  width: "100%",
                  cursor: "pointer",
                  background: "white",
                  height: "38px",
                }}
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
              >
                {categoryId ? (
                  <span
                    className="badge"
                    style={{ ...getColorStyle(categories.find((c) => c.id === categoryId)?.color || ""), textTransform: "none" }}
                  >
                    {categories.find((c) => c.id === categoryId)?.name}
                  </span>
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>-- Chọn phân loại --</span>
                )}
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>▼</span>
              </button>

              {isCatDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    backgroundColor: "white",
                    border: "1px solid hsl(210, 40%, 85%)",
                    borderRadius: "var(--radius-sm)",
                    boxShadow: "var(--shadow-lg)",
                    zIndex: 1100,
                    maxHeight: "220px",
                    overflowY: "auto",
                    marginTop: "4px",
                    padding: "4px",
                  }}
                >
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 10px",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                      onClick={() => {
                        setCategoryId(cat.id);
                        setCommissionInput(Number(cat.defaultCommission));
                        setIsCatDropdownOpen(false);
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(210, 40%, 96%)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <span className="badge" style={{ ...getColorStyle(cat.color), textTransform: "none" }}>
                        {cat.name}
                      </span>
                      <button
                        type="button"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                          fontSize: "12px",
                          lineHeight: "1",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSubFormMode("edit");
                          setCategoryId(cat.id);
                          setCategoryName(cat.name);
                          setCategoryColor(cat.color);
                          setCategoryCommission(Number(cat.defaultCommission));
                          setShowCategorySubForm(true);
                          setIsCatDropdownOpen(false);
                        }}
                        title="Sửa phân loại"
                      >
                        ✏️
                      </button>
                    </div>
                  ))}
                  <div style={{ height: "1px", backgroundColor: "hsl(210, 40%, 92%)", margin: "4px 0" }}></div>
                  <div
                    style={{
                      padding: "8px 10px",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      fontWeight: "600",
                      color: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                    }}
                    onClick={() => {
                      setSubFormMode("create");
                      setCategoryName("");
                      setCategoryColor("blue");
                      setCategoryCommission(0);
                      setShowCategorySubForm(true);
                      setIsCatDropdownOpen(false);
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(210, 40%, 96%)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <span>➕ Tạo nhóm mới</span>
                  </div>
                </div>
              )}
            </div>

            {/* Editable Default Commission */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Hoa hồng (%)</label>
              <CustomNumberInput min={0} max={100} step={1} value={commissionInput} onChange={setCommissionInput} />
            </div>
          </div>

          {/* Inline Category Subform */}
          {showCategorySubForm && (
            <div
              style={{
                padding: "16px",
                backgroundColor: "hsl(210, 40%, 97%)",
                border: "1px solid hsl(210, 40%, 90%)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "-8px",
              }}
            >
              <h4 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>
                {subFormMode === "create" ? "➕ Thêm phân loại mới" : "✏️ Chỉnh sửa phân loại"}
              </h4>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "11px" }}>
                  Tên phân loại *
                </label>
                <input
                  className="form-input"
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ví dụ: Dịch vụ VIP"
                  style={{ padding: "6px 10px", fontSize: "13px" }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "11px" }}>
                  Hoa hồng mặc định (%)
                </label>
                <CustomNumberInput
                  min={0}
                  max={100}
                  step={1}
                  value={categoryCommission}
                  onChange={setCategoryCommission}
                  style={{ padding: "6px 10px", fontSize: "13px" }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "11px" }}>
                  Màu sắc đại diện *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
                  {COLOR_PRESETS.map((colorObj) => {
                    const isActive = categoryColor === colorObj.value;
                    return (
                      <button
                        key={colorObj.value}
                        type="button"
                        onClick={() => setCategoryColor(colorObj.value)}
                        style={{
                          padding: "6px 2px",
                          borderRadius: "var(--radius-sm)",
                          border: isActive ? `1px solid var(--color-primary)` : "1px solid hsl(210, 40%, 88%)",
                          boxShadow: isActive ? "inset 0 0 0 1px var(--color-primary)" : "none",
                          backgroundColor: colorObj.bg,
                          color: colorObj.text,
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {colorObj.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                  onClick={() => setShowCategorySubForm(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                  disabled={!categoryName.trim()}
                  onClick={async () => {
                    const payload = {
                      name: categoryName,
                      color: categoryColor,
                      defaultCommission: categoryCommission,
                    };
                    try {
                      let res;
                      if (subFormMode === "edit" && categoryId) {
                        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories/${categoryId}`, {
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
                      const savedCat = await res.json();
                      await fetchCategories(true);
                      if (subFormMode === "create") {
                        setCategoryId(savedCat.id);
                        setCommissionInput(Number(savedCat.defaultCommission));
                      } else {
                        setCommissionInput(categoryCommission);
                      }
                      setShowCategorySubForm(false);
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }}
                >
                  Lưu phân loại
                </button>
              </div>
            </div>
          )}

          {/* Row 2: Thời lượng chọn nhanh + Số phút thực tế */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", alignItems: "flex-end" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Thời lượng (chọn nhanh)</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[15, 30, 45, 60].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      fontSize: "12px",
                      fontWeight: duration === t ? "700" : "500",
                      backgroundColor: duration === t ? "var(--color-primary)" : "",
                      color: duration === t ? "white" : "",
                    }}
                    onClick={() => setDuration(t)}
                  >
                    {t} phút
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Số phút thực tế</label>
              <CustomNumberInput min={5} step={5} value={duration} onChange={setDuration} />
            </div>
          </div>

          {/* Row 3: Giá bán + Áp dụng khuyến mãi + Số tiền giảm trừ */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: "16px", alignItems: "flex-end" }}>
            {/* Price input with custom autocompletion */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Giá bán mặc định (VND) *</label>
              <PriceInputWithSuggestion
                required
                value={priceInput}
                onChange={setPriceInput}
                multiSegment={false}
                placeholder="Ví dụ: 150000"
              />
            </div>

            {/* Smaller Discount toggle */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Khuyến mãi?</label>
              <div style={{ display: "flex", gap: "4px", height: "38px" }}>
                <button
                  type="button"
                  className="btn"
                  style={{
                    flex: 1,
                    height: "100%",
                    padding: 0,
                    fontSize: "13px",
                    backgroundColor: !hasDiscount ? "hsl(210, 40%, 90%)" : "transparent",
                    border: "1px solid hsl(210, 40%, 85%)",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: !hasDiscount ? "700" : "500",
                    color: !hasDiscount ? "var(--text-primary)" : "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => {
                    setHasDiscount(false);
                    setDiscountDeduction(0);
                  }}
                >
                  Không
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{
                    flex: 1,
                    height: "100%",
                    padding: 0,
                    fontSize: "13px",
                    backgroundColor: hasDiscount ? "var(--color-primary)" : "transparent",
                    border: "1px solid hsl(210, 40%, 85%)",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: hasDiscount ? "700" : "500",
                    color: hasDiscount ? "white" : "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => setHasDiscount(true)}
                >
                  Có
                </button>
              </div>
            </div>

            {/* Discount Deduction Input (step 5000) */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tiền giảm (VND)</label>
              <CustomNumberInput
                min={0}
                step={5000}
                disabled={!hasDiscount}
                value={discountDeduction}
                onChange={setDiscountDeduction}
                placeholder={hasDiscount ? "Giảm bớt, VD: 20000" : "Tắt khuyến mãi"}
                style={{
                  backgroundColor: !hasDiscount ? "hsl(210, 40%, 96%)" : "white",
                  color: !hasDiscount ? "var(--text-muted)" : "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {hasDiscount && priceInput && !priceInput.includes(",") && (
            <div style={{ fontSize: "12px", color: "var(--color-success)", fontWeight: "600", marginTop: "-12px" }}>
              Giá bán thực tế sau giảm: {formatCurrencyVND(Math.max(0, (parseFloat(priceInput) || 0) - discountDeduction))}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Các giá bán khác (VND)</label>
            <div
              style={{
                border: isAltPriceFocused ? "1px solid var(--color-primary)" : "1px solid hsl(210, 40%, 85%)",
                boxShadow: isAltPriceFocused ? "0 0 0 2px var(--color-primary-light)" : "none",
                borderRadius: "var(--radius-sm)",
                minHeight: "38px",
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                boxSizing: "border-box",
                transition: "all 0.15s ease",
              }}
            >
              <ExcelChipsInput
                values={additionalPrices}
                onChange={setAdditionalPrices}
                placeholder="Nhập giá khác, VD: 120000"
                hasOutline={false}
                onFocus={() => setIsAltPriceFocused(true)}
                onBlur={() => setIsAltPriceFocused(false)}
              />
            </div>
          </div>

          {/* Drag & Drop Image Uploader Zone */}
          <div className="form-group">
            <label className="form-label">Hình ảnh minh họa</label>

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
                  } catch (err) {
                    alert("Lỗi nạp ảnh: " + (err as any).message);
                  }
                }
              }}
              onClick={() => {
                document.getElementById("file-upload-input")?.click();
              }}
              style={{
                border: dragging ? "2px dashed var(--color-primary)" : "2px dashed hsl(210, 40%, 85%)",
                borderRadius: "var(--radius-sm)",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: dragging ? "hsl(210, 100%, 98%)" : "hsl(210, 40%, 98%)",
                transition: "all 0.15s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "120px",
              }}
            >
              <input
                id="file-upload-input"
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
                    } catch (err) {
                      alert("Lỗi nạp ảnh: " + (err as any).message);
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
                    style={{ maxWidth: "120px", maxHeight: "120px", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                  />
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ padding: "4px 10px", fontSize: "11px", cursor: "pointer" }}
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
                  <ImageIcon size={32} style={{ color: "var(--text-muted)", marginBottom: "8px" }} />
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
                    Kéo thả ảnh vào đây hoặc nhấp để chọn tải lên
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Hỗ trợ PNG, JPG, GIF (Tự động tối ưu kích thước để lưu trữ)
                  </span>
                </>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" style={{ cursor: "pointer" }}>
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
