import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { formatCurrencyVND } from "@salon/shared-utils";
import { Layers, Plus, Edit2, Trash2, Loader2, X, Search, Clock, Image as ImageIcon, ChevronUp, ChevronDown, Check, Save } from "lucide-react";
import { ExcelInput, ExcelSelect, PriceInputWithSuggestion } from "../../components/desktop/TableComponents";

interface ServiceCategory {
  id: string;
  name: string;
  color: string;
  defaultCommission: number;
}

interface Service {
  id: string;
  name: string;
  serviceCategory?: string;
  categoryId?: string;
  category?: ServiceCategory;
  price: number;
  discountPrice?: number;
  duration?: number;
  imageUrl?: string;
  branchId?: string;
  commission?: number;
}

const COLOR_PRESETS = [
  { value: "blue", label: "Xanh dương", bg: "hsl(210, 100%, 96%)", text: "hsl(210, 100%, 45%)", border: "hsl(210, 100%, 90%)" },
  { value: "green", label: "Xanh lá", bg: "hsl(142, 70%, 95%)", text: "hsl(142, 72%, 29%)", border: "hsl(142, 70%, 88%)" },
  { value: "orange", label: "Cam", bg: "hsl(30, 100%, 95%)", text: "hsl(30, 100%, 40%)", border: "hsl(30, 100%, 90%)" },
  { value: "red", label: "Đỏ", bg: "hsl(0, 100%, 96%)", text: "hsl(0, 100%, 45%)", border: "hsl(0, 100%, 90%)" },
  { value: "sky", label: "Xanh trời", bg: "hsl(193, 90%, 95%)", text: "hsl(193, 90%, 35%)", border: "hsl(193, 90%, 88%)" },
  { value: "purple", label: "Tím", bg: "hsl(270, 80%, 96%)", text: "hsl(270, 80%, 45%)", border: "hsl(270, 80%, 90%)" },
  { value: "pink", label: "Hồng", bg: "hsl(330, 80%, 96%)", text: "hsl(330, 80%, 45%)", border: "hsl(330, 80%, 90%)" },
  { value: "indigo", label: "Chàm", bg: "hsl(235, 80%, 96%)", text: "hsl(235, 80%, 45%)", border: "hsl(235, 80%, 90%)" },
  { value: "lime", label: "Chanh", bg: "hsl(80, 80%, 94%)", text: "hsl(80, 80%, 30%)", border: "hsl(80, 80%, 85%)" },
  { value: "teal", label: "Mòng két", bg: "hsl(170, 80%, 94%)", text: "hsl(170, 80%, 30%)", border: "hsl(170, 80%, 85%)" }
];

const getColorStyle = (colorName: string) => {
  const preset = COLOR_PRESETS.find(c => c.value === colorName);
  if (preset) {
    return {
      backgroundColor: preset.bg,
      color: preset.text,
      borderColor: preset.border,
      borderWidth: "1px",
      borderStyle: "solid"
    };
  }
  return {
    backgroundColor: "hsl(210, 40%, 96%)",
    color: "var(--text-secondary)",
    borderColor: "hsl(210, 40%, 90%)",
    borderWidth: "1px",
    borderStyle: "solid"
  };
};

const compressAndGetBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

interface CustomNumberInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  placeholder,
  className,
  style,
}) => {
  const handleIncrement = () => {
    if (disabled) return;
    const currentVal = value !== undefined && value !== null && !isNaN(value) ? value : (min !== undefined ? min : 0);
    let nextVal = currentVal + step;
    if (max !== undefined && nextVal > max) nextVal = max;
    onChange(nextVal);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const currentVal = value !== undefined && value !== null && !isNaN(value) ? value : (min !== undefined ? min : 0);
    let nextVal = currentVal - step;
    if (min !== undefined && nextVal < min) nextVal = min;
    onChange(nextVal);
  };

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
      <input
        className={`form-input custom-number-input ${className || ""}`}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          onChange(isNaN(val) ? 0 : val);
        }}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          ...style,
          width: "100%",
          paddingRight: "44px",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "1px",
          top: "1px",
          bottom: "1px",
          width: "36px",
          display: "flex",
          flexDirection: "column",
          gap: "1px",
          zIndex: 5,
        }}
      >
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "hsl(210, 40%, 96%)",
            border: "none",
            borderLeft: "1px solid hsl(210, 40%, 90%)",
            borderTopRightRadius: "var(--radius-sm)",
            cursor: disabled ? "not-allowed" : "pointer",
            color: "var(--text-secondary)",
            padding: 0,
            transition: "background 0.15s ease",
            outline: "none",
            height: "50%",
          }}
          onMouseEnter={(e) => !disabled && (e.currentTarget.style.backgroundColor = "hsl(210, 40%, 90%)")}
          onMouseLeave={(e) => !disabled && (e.currentTarget.style.backgroundColor = "hsl(210, 40%, 96%)")}
        >
          <ChevronUp size={16} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "hsl(210, 40%, 96%)",
            border: "none",
            borderLeft: "1px solid hsl(210, 40%, 90%)",
            borderBottomRightRadius: "var(--radius-sm)",
            cursor: disabled ? "not-allowed" : "pointer",
            color: "var(--text-secondary)",
            padding: 0,
            transition: "background 0.15s ease",
            outline: "none",
            height: "50%",
          }}
          onMouseEnter={(e) => !disabled && (e.currentTarget.style.backgroundColor = "hsl(210, 40%, 90%)")}
          onMouseLeave={(e) => !disabled && (e.currentTarget.style.backgroundColor = "hsl(210, 40%, 96%)")}
        >
          <ChevronDown size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

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

  // Service Form Fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [commissionInput, setCommissionInput] = useState<number>(0);
  const [priceInput, setPriceInput] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [imageUrl, setImageUrl] = useState("");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountDeduction, setDiscountDeduction] = useState<number>(0);
  const [dragging, setDragging] = useState(false);

  // Category Modal State & Sub-form State (for inline category config)
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [showCategorySubForm, setShowCategorySubForm] = useState(false);
  const [subFormMode, setSubFormMode] = useState<"create" | "edit">("create");
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("blue");
  const [categoryCommission, setCategoryCommission] = useState<number>(0);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Custom Category Dropdown State
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const catDropdownRef = React.useRef<HTMLDivElement>(null);

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

  const handleMouseDownSelectAll = (e: React.MouseEvent<HTMLInputElement>) => {
    if (document.activeElement !== e.currentTarget) {
      e.currentTarget.focus();
      e.preventDefault();
    }
  };

  const handleCommissionAutoSave = async (serviceId: string, commissionVal: number) => {
    const service = services.find(s => s.id === serviceId);
    if (!service || !service.categoryId) return;
    const category = categories.find(c => c.id === service.categoryId);
    if (!category) return;
    
    if (Number(category.defaultCommission) === commissionVal) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories/${service.categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: category.name,
          color: category.color,
          defaultCommission: commissionVal
        })
      });

      if (!res.ok) throw new Error("Lỗi khi tự động lưu hoa hồng");

      setInlineEdits(prev => {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      });

      fetchCategories(true);
      fetchServices(true);
    } catch (err: any) {
      console.error("Commission auto save failed:", err);
    }
  };

  const handleInlineChange = (serviceId: string, field: keyof Service, value: any) => {
    setInlineEdits(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: value
      }
    }));
  };

  const getInlineValue = (service: Service, field: keyof Service) => {
    if (inlineEdits[service.id] && inlineEdits[service.id][field] !== undefined) {
      return inlineEdits[service.id][field];
    }
    return service[field];
  };

  const handleAutoSave = async (serviceId: string, updatedFields: Partial<Service>) => {
    const originalService = services.find(s => s.id === serviceId);
    if (!originalService) return;

    // Merge original service with any existing pending edits and the newly updated fields
    const mergedEdits = {
      ...inlineEdits[serviceId],
      ...updatedFields
    };

    const updatedService = {
      ...originalService,
      ...mergedEdits
    };

    // Skip save if values are identical to original
    let hasChanges = false;
    for (const key of Object.keys(updatedFields) as Array<keyof Service>) {
      if (updatedFields[key] !== originalService[key]) {
        hasChanges = true;
        break;
      }
    }
    if (!hasChanges) return;

    // Dynamically calculate the serviceCategory short string from database/fallback
    const selectedCatObj = categories.find(c => c.id === updatedService.categoryId);
    const existingService = services.find(s => s.categoryId === updatedService.categoryId && s.id !== serviceId && s.serviceCategory);
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

    const payload = {
      name: updatedService.name,
      categoryId: updatedService.categoryId || null,
      serviceCategory: serviceCategory || null,
      price: Number(updatedService.price),
      discountPrice: updatedService.discountPrice !== undefined && updatedService.discountPrice !== null ? Number(updatedService.discountPrice) : Number(updatedService.price),
      duration: Number(updatedService.duration),
      imageUrl: updatedService.imageUrl || null,
      branchId: updatedService.branchId || null
    };

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/services/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Lỗi khi tự động lưu");

      // Clear inlineEdits for this service
      setInlineEdits(prev => {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      });

      // Refresh list
      fetchServices(true);
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target as Node)) {
        setIsCatDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Service Handlers
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setName("");
    setCategoryId("");
    setCommissionInput(0);
    setPriceInput("100000");
    setHasDiscount(false);
    setDiscountDeduction(0);
    setDuration(45);
    setImageUrl("");
    setShowCategorySubForm(false);
    setIsCatDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setModalMode("edit");
    setSelectedServiceId(service.id);
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
    setShowCategorySubForm(false);
    setIsCatDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Check if commission was modified from the category default, update category first if so
    if (categoryId) {
      const selectedCat = categories.find(c => c.id === categoryId);
      if (selectedCat && Number(selectedCat.defaultCommission) !== commissionInput) {
        try {
          await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories/${categoryId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: selectedCat.name,
              color: selectedCat.color,
              defaultCommission: commissionInput
            })
          });
          await fetchCategories();
        } catch (err) {
          console.error("Failed to update default commission", err);
        }
      }
    }

    const selectedCatObj = categories.find(c => c.id === categoryId);
    const existingService = services.find(s => s.categoryId === categoryId && s.serviceCategory);
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

    const priceList = priceInput
      .split(",")
      .map(p => parseFloat(p.trim()))
      .filter(p => !isNaN(p));

    if (priceList.length === 0) {
      alert("Vui lòng nhập giá gốc hợp lệ");
      return;
    }

    try {
      if (modalMode === "create") {
        for (let i = 0; i < priceList.length; i++) {
          const currentPrice = priceList[i];
          const calculatedDiscountPrice = hasDiscount ? Math.max(0, currentPrice - discountDeduction) : currentPrice;

          const serviceName = priceList.length > 1
            ? `${name} (${formatCurrencyVND(currentPrice)})`
            : name;

          const payload = {
            name: serviceName,
            categoryId: categoryId || null,
            serviceCategory: serviceCategory || null,
            price: currentPrice,
            discountPrice: calculatedDiscountPrice,
            duration,
            imageUrl: imageUrl || null,
            branchId: currentBranchId || null
          };

          const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/services`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (!res.ok) throw new Error("Lỗi khi lưu thông tin dịch vụ");
        }
      } else {
        const currentPrice = priceList[0];
        const calculatedDiscountPrice = hasDiscount ? Math.max(0, currentPrice - discountDeduction) : currentPrice;

        const payload = {
          name,
          categoryId: categoryId || null,
          serviceCategory: serviceCategory || null,
          price: currentPrice,
          discountPrice: calculatedDiscountPrice,
          duration,
          imageUrl: imageUrl || null,
          branchId: currentBranchId || null
        };

        const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/services/${selectedServiceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Lỗi khi lưu thông tin dịch vụ");
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/services/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Lỗi khi xóa dịch vụ");

      fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Category Handlers
  const handleOpenCategoriesModal = () => {
    setEditingCategoryId(null);
    setCategoryName("");
    setCategoryColor("blue");
    setCategoryCommission(0);
    setIsCategoriesModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim() || !currentTenantId) return;

    const payload = {
      name: categoryName,
      color: categoryColor,
      defaultCommission: categoryCommission
    };

    try {
      let res;
      if (editingCategoryId) {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories/${editingCategoryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error("Lỗi khi lưu phân loại");

      setCategoryName("");
      setCategoryColor("blue");
      setCategoryCommission(0);
      setEditingCategoryId(null);
      fetchCategories();
      fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!currentTenantId) return;
    if (!confirm("Bạn có chắc chắn muốn xóa phân loại này? Các dịch vụ thuộc phân loại này sẽ không còn phân loại.")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories/${catId}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Lỗi khi xóa phân loại");

      fetchCategories();
      fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter Logic
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tất cả" ||
      service.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });



  return (
    <>
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Filter, Actions and Search Bar */}
        <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between", padding: "16px" }}>
          {/* Category Tabs */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
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
                transition: "all 0.15s ease"
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
                  transition: "all 0.15s ease"
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Actions & Search */}
          <div style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "nowrap",
            justifyContent: "flex-end",
            marginLeft: "auto"
          }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "320px", flexShrink: 1, minWidth: "160px" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                className="form-input"
                placeholder="Tìm kiếm dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "36px" }}
              />
            </div>
            <button className="btn btn-secondary" onClick={handleOpenCategoriesModal} style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", flexShrink: 0 }}>
              <Layers size={18} /> Phân loại
            </button>
            <button className="btn btn-primary" onClick={handleOpenCreateModal} style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", flexShrink: 0 }}>
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
          <div className="data-table-container" style={{ overflow: "visible" }}>
            <style>{`
              .excel-input {
                transition: all 0.15s ease;
                border-radius: 0 !important;
                border: none !important;
                background: transparent;
                width: 100%;
                height: 38px;
                box-sizing: border-box;
              }
              .excel-input:hover {
                background-color: hsl(210, 40%, 96%) !important;
              }
              .excel-input:focus {
                background-color: white !important;
                outline: 2px solid var(--color-primary) !important;
                outline-offset: -2px;
                box-shadow: none !important;
                z-index: 10;
                position: relative;
              }
              .excel-select {
                transition: all 0.15s ease;
                border-radius: 6px !important;
                border: none !important;
                box-sizing: border-box;
              }
              .excel-select:hover {
                opacity: 0.9;
              }
              .excel-select:focus {
                background-color: white !important;
                color: var(--text-primary) !important;
                outline: 2px solid var(--color-primary) !important;
                outline-offset: -1px;
                z-index: 10;
                position: relative;
              }
              /* Remove default arrows for number input */
              .excel-input[type=number]::-webkit-inner-spin-button, 
              .excel-input[type=number]::-webkit-outer-spin-button { 
                -webkit-appearance: none; 
                margin: 0; 
              }
              .excel-input[type=number] {
                -moz-appearance: textfield;
              }
            `}</style>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding: "6px 10px", fontSize: "13px" }}>Tên dịch vụ</th>
                  <th style={{ padding: "6px 10px", fontSize: "13px", width: "180px" }}>Phân loại</th>
                  <th style={{ padding: "6px 10px", fontSize: "13px", width: "100px", textAlign: "center" }}>Thời lượng</th>
                  <th style={{ padding: "6px 10px", fontSize: "13px", width: "140px", textAlign: "center" }}>Giá bán</th>
                  <th style={{ padding: "6px 10px", fontSize: "13px", width: "140px", textAlign: "center" }}>Giá KM</th>
                  <th style={{ padding: "6px 10px", fontSize: "13px", width: "100px", textAlign: "center" }}>Hoa hồng (%)</th>
                  <th style={{ padding: "6px 10px", fontSize: "13px", width: "100px", textAlign: "center" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => {
                  const currentCategoryId = getInlineValue(service, "categoryId") as string || "";
                  const currentCategoryObj = categories.find(c => c.id === currentCategoryId);

                  // Calculate discount values to only show if active and less than original price
                  const hasInlineDiscount = inlineEdits[service.id] && inlineEdits[service.id].hasOwnProperty("discountPrice");
                  const isDiscountActive = hasInlineDiscount 
                    ? (inlineEdits[service.id].discountPrice !== null) 
                    : (service.discountPrice !== undefined && service.discountPrice !== null && service.discountPrice < service.price);
                  const displayDiscountVal = isDiscountActive 
                    ? (hasInlineDiscount ? inlineEdits[service.id].discountPrice : service.discountPrice) 
                    : null;

                  return (
                    <tr key={service.id}>
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          value={getInlineValue(service, "name") as string}
                          onChange={(val) => handleInlineChange(service.id, "name", val)}
                          onBlur={() => handleAutoSave(service.id, { name: getInlineValue(service, "name") as string })}
                          fontWeight="600"
                        />
                      </td>
                      <td style={{ padding: "3px 6px", verticalAlign: "middle", height: "38px", boxSizing: "border-box" }}>
                        <ExcelSelect
                          value={currentCategoryId}
                          onChange={(newCatId) => {
                            handleInlineChange(service.id, "categoryId", newCatId);
                            handleAutoSave(service.id, { categoryId: newCatId });
                          }}
                          options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                          colorStyle={getColorStyle(currentCategoryObj?.color || "")}
                          placeholder="-- Chưa phân loại --"
                        />
                      </td>
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          type="number"
                          value={getInlineValue(service, "duration") as number || 0}
                          onChange={(val) => handleInlineChange(service.id, "duration", parseInt(val) || 0)}
                          onBlur={() => handleAutoSave(service.id, { duration: getInlineValue(service, "duration") as number })}
                          textAlign="center"
                          unit="phút"
                        />
                      </td>
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          value={formatNumber(getInlineValue(service, "price") as number | string)}
                          onChange={(val) => handlePriceChange(service.id, "price", val)}
                          onBlur={() => handleAutoSave(service.id, { price: getInlineValue(service, "price") as number })}
                          textAlign="center"
                          fontWeight="500"
                          unit="đ"
                        />
                      </td>
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          value={displayDiscountVal !== null ? formatNumber(displayDiscountVal) : ""}
                          onChange={(val) => handlePriceChange(service.id, "discountPrice", val)}
                          onBlur={() => handleAutoSave(service.id, { discountPrice: getInlineValue(service, "discountPrice") as number })}
                          placeholder="--"
                          textAlign="center"
                          fontWeight="600"
                          textColor="var(--color-success)"
                          unit="đ"
                          showUnit={displayDiscountVal !== null}
                        />
                      </td>
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        {currentCategoryObj ? (
                          <ExcelInput
                            type="number"
                            value={getInlineValue(service, "commission") !== undefined 
                              ? (getInlineValue(service, "commission") as number) 
                              : (currentCategoryObj.defaultCommission || 0)}
                            onChange={(val) => handleInlineChange(service.id, "commission", parseInt(val) || 0)}
                            onBlur={() => handleCommissionAutoSave(service.id, (getInlineValue(service, "commission") !== undefined 
                              ? (getInlineValue(service, "commission") as number) 
                              : currentCategoryObj.defaultCommission))}
                            textAlign="center"
                            fontWeight="600"
                            textColor="var(--text-secondary)"
                            unit="%"
                          />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: "13px" }}>
                            --
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0 8px", verticalAlign: "middle", textAlign: "center", height: "38px" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "4px 8px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={() => handleOpenEditModal(service)}
                            title="Chỉnh sửa chi tiết"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: "4px 8px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={() => handleDelete(service.id)}
                            title="Xóa dịch vụ"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Categories Management Modal */}
      {isCategoriesModalOpen && (
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
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "720px", position: "relative", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: "24px" }}>
            <button
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
              onClick={() => setIsCategoriesModalOpen(false)}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>
              Quản lý phân loại
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px", overflowY: "auto", flex: 1 }}>
              {/* Left Side: Category List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderRight: "1px solid hsl(210, 40%, 90%)", paddingRight: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Danh sách phân loại</h3>

                {categoriesLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                    <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
                  </div>
                ) : categories.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", fontStyle: "italic" }}>Chưa có phân loại nào. Hãy tạo một phân loại ở biểu mẫu bên cạnh.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", paddingRight: "4px" }}>
                    {categories.map((cat) => (
                      <div key={cat.id} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        backgroundColor: "hsl(210, 40%, 98%)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid hsl(210, 40%, 92%)"
                      }}>
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
                            transition: "all 0.15s ease"
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
                  <CustomNumberInput
                    min={0}
                    max={100}
                    step={1}
                    value={categoryCommission}
                    onChange={setCategoryCommission}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                  {editingCategoryId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingCategoryId(null);
                        setCategoryName("");
                        setCategoryColor("blue");
                        setCategoryCommission(0);
                      }}
                    >
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
      )}

      {/* Service Details Create/Edit Modal */}
      {isModalOpen && (
        <div style={{
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
          padding: "20px"
        }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "680px", position: "relative", display: "flex", flexDirection: "column", gap: "16px", margin: "auto 0" }}>
            <button
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
              onClick={() => setIsModalOpen(false)}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
              {modalMode === "create" ? "Thêm dịch vụ mới" : "Chỉnh sửa dịch vụ"}
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
                      height: "38px"
                    }}
                    onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                  >
                    {categoryId ? (
                      <span className="badge" style={{ ...getColorStyle(categories.find(c => c.id === categoryId)?.color || ""), textTransform: "none" }}>
                        {categories.find(c => c.id === categoryId)?.name}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>-- Chọn phân loại --</span>
                    )}
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>▼</span>
                  </button>

                  {isCatDropdownOpen && (
                    <div style={{
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
                      padding: "4px"
                    }}>
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
                              lineHeight: "1"
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
                          fontSize: "13px"
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
                  <CustomNumberInput
                    min={0}
                    max={100}
                    step={1}
                    value={commissionInput}
                    onChange={setCommissionInput}
                  />
                </div>
              </div>

              {/* Inline Category Subform */}
              {showCategorySubForm && (
                <div style={{
                  padding: "16px",
                  backgroundColor: "hsl(210, 40%, 97%)",
                  border: "1px solid hsl(210, 40%, 90%)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginTop: "-8px"
                }}>
                  <h4 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>
                    {subFormMode === "create" ? "➕ Thêm phân loại mới" : "✏️ Chỉnh sửa phân loại"}
                  </h4>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "11px" }}>Tên phân loại *</label>
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
                    <label className="form-label" style={{ fontSize: "11px" }}>Màu sắc đại diện *</label>
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
                              border: isActive ? `2px solid var(--color-primary)` : "1px solid hsl(210, 40%, 88%)",
                              backgroundColor: colorObj.bg,
                              color: colorObj.text,
                              cursor: "pointer",
                              fontWeight: "600",
                              fontSize: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {colorObj.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "11px" }}>Hoa hồng mặc định (%)</label>
                    <CustomNumberInput
                      min={0}
                      max={100}
                      step={1}
                      value={categoryCommission}
                      onChange={setCategoryCommission}
                      style={{ padding: "6px 10px", fontSize: "13px" }}
                    />
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
                          defaultCommission: categoryCommission
                        };
                        try {
                          let res;
                          if (subFormMode === "edit" && categoryId) {
                            res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories/${categoryId}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(payload)
                            });
                          } else {
                            res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(payload)
                            });
                          }
                          if (!res.ok) throw new Error("Lỗi khi lưu phân loại");
                          const savedCat = await res.json();
                          await fetchCategories();
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

              {/* Row 2: Thời lượng chọn nhanh + Số phút thực tế (Số, không có nút +/-) */}
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
                          color: duration === t ? "white" : ""
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
                  <CustomNumberInput
                    min={5}
                    step={5}
                    value={duration}
                    onChange={setDuration}
                  />
                </div>
              </div>

              {/* Row 3: Giá bán + Áp dụng khuyến mãi + Số tiền giảm trừ */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: "16px", alignItems: "flex-end" }}>
                {/* Price input with custom autocompletion and comma-separated loops */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Giá bán gốc (VND) *</label>
                  <PriceInputWithSuggestion
                    required
                    value={priceInput}
                    onChange={setPriceInput}
                    multiSegment={true}
                    placeholder="Ví dụ: 150000 hoặc 100000, 150000"
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
                        justifyContent: "center"
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
                        justifyContent: "center"
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
                      color: !hasDiscount ? "var(--text-muted)" : "var(--text-primary)"
                    }}
                  />
                </div>
              </div>

              {hasDiscount && priceInput && !priceInput.includes(",") && (
                <div style={{ fontSize: "12px", color: "var(--color-success)", fontWeight: "600", marginTop: "-12px" }}>
                  Giá bán thực tế sau giảm: {formatCurrencyVND(Math.max(0, (parseFloat(priceInput) || 0) - discountDeduction))}
                </div>
              )}

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
                        setImageUrl(base64);
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
                    minHeight: "120px"
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
                          setImageUrl(base64);
                        } catch (err) {
                          alert("Lỗi nạp ảnh: " + (err as any).message);
                        }
                      }
                    }}
                  />
                  {imageUrl ? (
                    <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
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
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" style={{ cursor: "pointer" }}>
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
