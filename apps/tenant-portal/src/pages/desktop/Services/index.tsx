import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { Layers, Plus, Loader2, Search, Upload, Download } from "lucide-react";
import { Service, ServiceCategory, getColorStyle } from "./types";
import { ServiceTable } from "./ServiceTable";
import { CategoryModal } from "./CategoryModal";
import { ServiceFormModal } from "./ServiceFormModal";
import { ImportWizardModal } from "../../../components/desktop/ImportWizard/ImportWizardModal";
import { TargetField } from "../../../hooks/useImportWizard";
import { useFileDragAndDrop } from "../../../hooks/useFileDragAndDrop";
import { ExportButton } from "../../../components/desktop/ExportButton";
import { ExportColumnMapping } from "../../../utils/exportData";

export default function Services() {
  const { currentTenantId, currentBranchId } = useAuthStore();

  // Data State
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  // Service Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Category Modal State
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  const { isDragActive } = useFileDragAndDrop((file) => {
    setDroppedFile(file);
    setIsImportModalOpen(true);
  });

  // Dynamic Service Schema for Import Matcher
  const serviceSchema = useMemo<TargetField[]>(() => [
    { field: "name", label: "Tên dịch vụ", type: "string", required: true, description: "Tên hiển thị của dịch vụ" },
    { field: "price", label: "Giá bán", type: "number", required: true, description: "Giá gốc của dịch vụ (VND)" },
    { field: "discountPrice", label: "Giá khuyến mãi", type: "number", required: false, description: "Giá bán thực tế sau giảm giá (VND)" },
    { field: "discountAmount", label: "Mức giảm giá", type: "number", required: false, description: "Số tiền giảm giá (VND)" },
    { field: "duration", label: "Thời lượng (phút)", type: "number", required: true, description: "Thời gian thực hiện dịch vụ" },
    {
      field: "categoryId",
      label: "Nhóm dịch vụ",
      type: "select",
      required: false,
      options: categories.map((c) => ({ value: c.id, label: c.name })),
      description: "Nhóm phân loại dịch vụ. Nếu không có sẵn, AI sẽ tự động map hoặc tạo mới dựa trên tên nhóm."
    }
  ], [categories]);

  // Export Columns Mapping for Services
  const serviceExportColumns = useMemo<ExportColumnMapping[]>(() => [
    { key: "name", header: "Tên dịch vụ" },
    { key: "price", header: "Giá bán (VND)", transform: (val) => Number(val) },
    { key: "discountPrice", header: "Giá khuyến mãi (VND)", transform: (val) => val !== null && val !== undefined ? Number(val) : "" },
    { key: "discountAmount", header: "Mức giảm giá (VND)", transform: (val) => val !== null && val !== undefined ? Number(val) : "" },
    { key: "duration", header: "Thời lượng (phút)", transform: (val) => val ? Number(val) : "" },
    { 
      key: "categoryId", 
      header: "Nhóm dịch vụ", 
      transform: (val) => {
        const cat = categories.find((c) => c.id === val);
        return cat ? cat.name : "";
      }
    }
  ], [categories]);

  // Inline editing helper functions
  const [inlineEdits, setInlineEdits] = useState<Record<string, Partial<Service>>>({});

  const formatNumber = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === "") return "";
    const cleaned = String(val).replace(/\D/g, "");
    if (!cleaned) return "";
    return new Intl.NumberFormat("en-US").format(parseInt(cleaned, 10));
  };

  const handlePriceChange = (serviceId: string, field: "price" | "discountPrice", valStr: string) => {
    const cleaned = valStr.replace(/\D/g, "");
    if (cleaned === "") {
      handleInlineChange(serviceId, field, field === "discountPrice" ? null : 0);
    } else {
      handleInlineChange(serviceId, field, parseInt(cleaned, 10));
    }
  };

  const handleCommissionAutoSave = async (serviceId: string, commissionVal: number) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service || !service.categoryId) return;
    const category = categories.find((c) => c.id === service.categoryId);
    if (!category) return;

    if (Number(category.defaultCommission) === commissionVal) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories/${service.categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: category.name,
          color: category.color,
          defaultCommission: commissionVal,
        }),
      });

      if (!res.ok) throw new Error("Lỗi khi tự động lưu hoa hồng");

      setInlineEdits((prev) => {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      });

      await fetchCategories(true);
      await fetchServices(true);
    } catch (err: any) {
      console.error("Commission auto save failed:", err);
    }
  };

  const handleInlineChange = (serviceId: string, field: keyof Service, value: any) => {
    setInlineEdits((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: value,
      },
    }));
  };

  const getInlineValue = (service: Service, field: keyof Service) => {
    if (inlineEdits[service.id] && inlineEdits[service.id][field] !== undefined) {
      return inlineEdits[service.id][field];
    }
    return service[field];
  };

  const handleAutoSave = async (serviceId: string, updatedFields: Partial<Service>) => {
    const originalService = services.find((s) => s.id === serviceId);
    if (!originalService) return;

    const mergedEdits = {
      ...inlineEdits[serviceId],
      ...updatedFields,
    };

    const updatedService = {
      ...originalService,
      ...mergedEdits,
    };

    let hasChanges = false;
    for (const key of Object.keys(updatedFields) as Array<keyof Service>) {
      if (updatedFields[key] !== originalService[key]) {
        hasChanges = true;
        break;
      }
    }
    if (!hasChanges) return;

    const selectedCatObj = categories.find((c) => c.id === updatedService.categoryId);
    const existingService = services.find(
      (s) => s.categoryId === updatedService.categoryId && s.id !== serviceId && s.serviceCategory
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

    const priceVal = Number(updatedService.price);
    const promoPriceVal =
      updatedService.discountPrice !== undefined && updatedService.discountPrice !== null
        ? Number(updatedService.discountPrice)
        : priceVal;
    const discountAmountVal = Math.max(0, priceVal - promoPriceVal);

    const payload = {
      name: updatedService.name,
      categoryId: updatedService.categoryId || null,
      serviceCategory: serviceCategory || null,
      price: priceVal,
      discountPrice: promoPriceVal,
      discountAmount: discountAmountVal,
      duration: Number(updatedService.duration),
      imageUrl: updatedService.imageUrl || null,
      branchId: updatedService.branchId || null,
      additionalPrices: updatedService.additionalPrices ? updatedService.additionalPrices.map(Number) : [],
    };

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/services/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Lỗi khi tự động lưu");

      setInlineEdits((prev) => {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      });

      await fetchServices(true);
    } catch (err: any) {
      console.error("Auto save failed:", err);
    }
  };

  const fetchServices = async (silent = false) => {
    if (!currentTenantId) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const url = currentBranchId
        ? `http://localhost:3000/api/tenants/${currentTenantId}/services?branchId=${currentBranchId}`
        : `http://localhost:3000/api/tenants/${currentTenantId}/services`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Không thể tải danh mục dịch vụ");
      const data = await res.json();
      setServices(data);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchCategories = async (silent = false) => {
    if (!currentTenantId) return;
    if (!silent) setCategoriesLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories`);
      if (!res.ok) throw new Error("Không thể tải danh sách nhóm dịch vụ");
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      console.error("Lỗi tải danh mục:", err);
    } finally {
      if (!silent) setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (currentTenantId) {
      fetchServices();
      fetchCategories();
    }
  }, [currentTenantId, currentBranchId]);

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setSelectedServiceId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setModalMode("edit");
    setSelectedServiceId(service.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/services/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Lỗi khi xóa dịch vụ");

      await fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenCategoriesModal = () => {
    setIsCategoriesModalOpen(true);
  };

  // Filter Logic
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tất cả" || service.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div
        className="animate-fade-in"
        style={{ display: "flex", flexDirection: "column", gap: "24px", minHeight: "100%" }}
      >
        {/* Filter, Actions and Search Bar */}
        <div
          className="card"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", alignItems: "center" }}>
            <button
              className="btn btn-secondary"
              onClick={handleOpenCategoriesModal}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                fontSize: "13px",
                fontWeight: "600",
                whiteSpace: "nowrap",
                flexShrink: 0,
                height: "36px",
              }}
            >
              <Layers size={16} /> Phân loại
            </button>
            <button
              onClick={() => setSelectedCategory("Tất cả")}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
                backgroundColor: selectedCategory === "Tất cả" ? "var(--color-primary)" : "hsl(210, 40%, 94%)",
                color: selectedCategory === "Tất cả" ? "white" : "var(--text-secondary)",
                transition: "all 0.15s ease",
              }}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                  backgroundColor: selectedCategory === cat.id ? "var(--color-primary)" : "hsl(210, 40%, 94%)",
                  color: selectedCategory === cat.id ? "white" : "var(--text-secondary)",
                  transition: "all 0.15s ease",
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Actions & Search */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "nowrap",
              justifyContent: "flex-end",
              marginLeft: "auto",
            }}
          >
            <div style={{ position: "relative", width: "100%", maxWidth: "320px", flexShrink: 1, minWidth: "160px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Tìm kiếm dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "36px" }}
              />
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => {
                setDroppedFile(null);
                setIsImportModalOpen(true);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
                flexShrink: 0,
                borderColor: "hsl(142, 76%, 36%)",
                color: "hsl(142, 76%, 36%)",
                backgroundColor: "hsl(142, 76%, 97%)",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "hsl(142, 76%, 92%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "hsl(142, 76%, 97%)";
              }}
            >
              <Download size={16} /> Nhập dữ liệu
            </button>

            <ExportButton
              data={filteredServices}
              fileName="danh_sach_dich_vu"
              columns={serviceExportColumns}
            />

            <button
              className="btn btn-primary"
              onClick={handleOpenCreateModal}
              style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", flexShrink: 0 }}
            >
              <Plus size={18} /> Thêm dịch vụ
            </button>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : error ? (
          <div className="card" style={{ borderLeft: "4px solid var(--color-danger)", background: "var(--color-danger-light)" }}>
            <p style={{ color: "var(--color-danger)", fontWeight: "500" }}>{error}</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <Layers size={48} style={{ color: "var(--text-muted)", marginBottom: "16px", marginInline: "auto" }} />
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Không tìm thấy dịch vụ nào</h3>
            <p style={{ color: "var(--text-secondary)" }}>Hãy thử điều chỉnh bộ lọc hoặc thêm dịch vụ mới.</p>
          </div>
        ) : (
          <ServiceTable
            filteredServices={filteredServices}
            categories={categories}
            inlineEdits={inlineEdits}
            handleInlineChange={handleInlineChange}
            handlePriceChange={handlePriceChange}
            handleAutoSave={handleAutoSave}
            handleCommissionAutoSave={handleCommissionAutoSave}
            handleOpenEditModal={handleOpenEditModal}
            handleDelete={handleDelete}
            getInlineValue={getInlineValue}
            formatNumber={formatNumber}
            getColorStyle={getColorStyle}
          />
        )}
      </div>

      {/* Categories Management Modal */}
      <CategoryModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
        categoriesLoading={categoriesLoading}
        fetchCategories={fetchCategories}
        fetchServices={fetchServices}
        currentTenantId={currentTenantId}
      />

      {/* Service Details Create/Edit Modal */}
      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        selectedServiceId={selectedServiceId}
        services={services}
        categories={categories}
        fetchServices={fetchServices}
        fetchCategories={fetchCategories}
        currentTenantId={currentTenantId}
        currentBranchId={currentBranchId}
      />

      {/* Import Excel/CSV Wizard Modal */}
      <ImportWizardModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setDroppedFile(null);
        }}
        onSuccess={() => {
          fetchServices(true);
          fetchCategories(true);
        }}
        entity="service"
        entityLabel="Dịch vụ"
        targetSchema={serviceSchema}
        droppedFile={droppedFile}
      />

      {/* Global Drag-and-Drop Overlay */}
      {isDragActive && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(59, 130, 246, 0.15)",
            backdropFilter: "blur(4px)",
            border: "4px dashed var(--color-primary)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-primary)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "32px 48px",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Upload size={48} className="animate-bounce" />
            <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Thả file Excel/CSV vào đây để nhập dịch vụ</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Hệ thống sẽ tự động phân tích và đối chiếu cột dữ liệu bằng AI.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
