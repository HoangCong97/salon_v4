import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus, Loader2, Search, Upload, Download } from "lucide-react";

import { ServiceTable } from "./ServiceTable";
import { CategoryModal } from "./CategoryModal";
import { ServiceFormModal } from "./ServiceFormModal";
import { ImportWizardModal } from "../../../components/desktop/ImportWizard/ImportWizardModal";
import { ExportButton } from "../../../components/desktop/ExportButton";

import { useAuthStore } from "../../../store/useAuthStore";
import { useFileDragAndDrop } from "../../../hooks/useFileDragAndDrop";
import { useConfirm } from "../../../components/desktop/ConfirmDialog";
import { useToast } from "../../../components/desktop/ToastProvider";

import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";
import { ExportColumnMapping } from "../../../utils/exportData";

import { Service, ServiceCategory, getColorStyle } from "./types";
import { TargetField } from "../../../hooks/useImportWizard";

import styles from "./Services.module.css";

export default function Services() {
  const { currentTenantId, currentBranchId, hasPermission } = useAuthStore();
  const canManage = hasPermission("service.manage");
  const confirm = useConfirm();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Data State — useQuery (stale-while-revalidate cache)
  const { data: services = [], isLoading: servicesLoading, error: servicesError } = useQuery<Service[]>({
    queryKey: queryKeys.services.list(currentTenantId!, currentBranchId),
    queryFn: () => {
      const url = currentBranchId
        ? `/tenants/${currentTenantId}/services?branchId=${currentBranchId}`
        : `/tenants/${currentTenantId}/services`;
      return api.get(url);
    },
    enabled: !!currentTenantId,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<ServiceCategory[]>({
    queryKey: queryKeys.serviceCategories.list(currentTenantId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/service-categories`),
    enabled: !!currentTenantId,
  });

  const loading = servicesLoading;
  const error = servicesError ? (servicesError as Error).message : null;

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  // Service Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Category Modal State
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  const { isDragActive } = useFileDragAndDrop((file) => {
    if (canManage) {
      setDroppedFile(file);
      setIsImportModalOpen(true);
    }
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
      await api.put(`/tenants/${currentTenantId}/service-categories/${service.categoryId}`, {
        name: category.name,
        color: category.color,
        defaultCommission: commissionVal,
      });

      setInlineEdits((prev) => {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.serviceCategories.all(currentTenantId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all(currentTenantId!) });
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
      await api.put(`/tenants/${currentTenantId}/services/${serviceId}`, payload);

      setInlineEdits((prev) => {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.services.all(currentTenantId!) });
    } catch (err: any) {
      console.error("Auto save failed:", err);
    }
  };

  /** Backward-compatible invalidation helpers cho modals con */
  const fetchServices = useCallback(
    async (silent?: boolean) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.services.all(currentTenantId!) });
    },
    [queryClient, currentTenantId]
  );

  const fetchCategories = useCallback(
    async (silent?: boolean) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.serviceCategories.all(currentTenantId!) });
    },
    [queryClient, currentTenantId]
  );

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
    if (
      !(await confirm({
        title: "Xóa dịch vụ",
        message: "Bạn có chắc chắn muốn xóa dịch vụ này?",
        type: "danger",
        confirmText: "Xóa",
      }))
    )
      return;

    try {
      await api.delete(`/tenants/${currentTenantId}/services/${id}`);
      toast.success("Đã xóa dịch vụ thành công!");
      await fetchServices();
    } catch (err: any) {
      toast.error(err.message);
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
      <div className={`animate-fade-in ${styles.container}`}>
        {/* Filter, Actions and Search Bar */}
        <div className={`card ${styles.filterCard}`}>
          {/* Category Tabs */}
          <div className={styles.categoriesList}>
            {canManage && (
              <button
                className={`btn btn-secondary ${styles.categoryBtn}`}
                onClick={handleOpenCategoriesModal}
              >
                <Layers size={16} /> Phân loại
              </button>
            )}
            <button
              onClick={() => setSelectedCategory("Tất cả")}
              className={styles.tabButton}
              style={{
                backgroundColor: selectedCategory === "Tất cả" ? "var(--color-primary)" : "hsl(210, 40%, 94%)",
                color: selectedCategory === "Tất cả" ? "white" : "var(--text-secondary)",
              }}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={styles.tabButton}
                style={{
                  backgroundColor: selectedCategory === cat.id ? "var(--color-primary)" : "hsl(210, 40%, 94%)",
                  color: selectedCategory === cat.id ? "white" : "var(--text-secondary)",
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Actions & Search */}
          <div className={styles.actionsWrapper}>
            <div className={styles.searchContainer}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                className={`form-input ${styles.searchInput}`}
                placeholder="Tìm kiếm dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {canManage && (
              <button
                className={`btn btn-secondary ${styles.importBtn}`}
                onClick={() => {
                  setDroppedFile(null);
                  setIsImportModalOpen(true);
                }}
              >
                <Download size={16} /> Nhập dữ liệu
              </button>
            )}

            <ExportButton
              data={filteredServices}
              fileName="danh_sach_dich_vu"
              columns={serviceExportColumns}
            />

            {canManage && (
              <button
                className={`btn btn-primary ${styles.addServiceBtn}`}
                onClick={handleOpenCreateModal}
              >
                <Plus size={18} /> Thêm dịch vụ
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className={styles.loadingWrapper}>
            <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : error ? (
          <div className={`card ${styles.errorCard}`}>
            <p className={styles.errorText}>{error}</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className={`card ${styles.emptyCard}`}>
            <Layers size={48} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>Không tìm thấy dịch vụ nào</h3>
            <p className={styles.emptyDesc}>Hãy thử điều chỉnh bộ lọc hoặc thêm dịch vụ mới.</p>
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
      {isDragActive && canManage && (
        <div className={styles.dragOverlay}>
          <div className={styles.dragCard}>
            <Upload size={48} className="animate-bounce" />
            <h3 className={styles.dragTitle}>Thả file Excel/CSV vào đây để nhập dịch vụ</h3>
            <p className={styles.dragDesc}>
              Hệ thống sẽ tự động phân tích và đối chiếu cột dữ liệu bằng AI.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
