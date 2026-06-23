import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { formatCurrencyVND } from "@salon/shared-utils";
import { Layers, Plus, Edit2, Trash2, Loader2, X, Search, Clock, Image as ImageIcon } from "lucide-react";

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
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30);
  const [imageUrl, setImageUrl] = useState("");

  // Category Modal State
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("blue");
  const [categoryCommission, setCategoryCommission] = useState<number>(0);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const fetchServices = async () => {
    if (!currentTenantId) return;
    setLoading(true);
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
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!currentTenantId) return;
    setCategoriesLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories`);
      if (!res.ok) throw new Error("Không thể tải danh sách nhóm dịch vụ");
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      console.error("Lỗi tải danh mục:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (currentTenantId) {
      fetchServices();
      fetchCategories();
    }
  }, [currentTenantId, currentBranchId]);

  // Service Handlers
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setName("");
    setCategoryId("");
    setPrice(100000);
    setDiscountPrice(100000);
    setDuration(45);
    setImageUrl("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setModalMode("edit");
    setSelectedServiceId(service.id);
    setName(service.name);
    setCategoryId(service.categoryId || "");
    setPrice(Number(service.price));
    setDiscountPrice(Number(service.discountPrice ?? service.price));
    setDuration(service.duration || 30);
    setImageUrl(service.imageUrl || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Support old serviceCategory field for backward compatibility
    const selectedCatObj = categories.find(c => c.id === categoryId);
    const serviceCategory = selectedCatObj ? selectedCatObj.name : "";

    const payload = {
      name,
      categoryId: categoryId || null,
      serviceCategory: serviceCategory || null,
      price,
      discountPrice,
      duration,
      imageUrl: imageUrl || null,
      branchId: currentBranchId || null
    };

    try {
      let res;
      if (modalMode === "create") {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/services/${selectedServiceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error("Lỗi khi lưu thông tin dịch vụ");

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

      if (!res.ok) throw new Error("Lỗi khi lưu nhóm dịch vụ");

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
    if (!confirm("Bạn có chắc chắn muốn xóa nhóm dịch vụ này? Các dịch vụ thuộc nhóm này sẽ không còn phân loại.")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/service-categories/${catId}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Lỗi khi xóa nhóm dịch vụ");

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
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>
              Danh mục dịch vụ
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Thiết lập dịch vụ lẻ, combo đa dịch vụ, định giá và thời gian thực hiện.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn btn-secondary" onClick={handleOpenCategoriesModal}>
              <Layers size={18} /> Quản lý nhóm dịch vụ
            </button>
            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={18} /> Thêm dịch vụ mới
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
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

          {/* Search Input */}
          <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
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
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>Ảnh</th>
                  <th>Tên dịch vụ</th>
                  <th>Phân loại</th>
                  <th>Thời lượng</th>
                  <th>Giá bán</th>
                  <th>Giá khuyến mãi</th>
                  <th style={{ width: "200px", textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td>
                      {service.imageUrl ? (
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          style={{ width: "48px", height: "48px", borderRadius: "var(--radius-sm)", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-sm)", backgroundColor: "hsl(210, 40%, 94%)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </td>
                    <td>
                      <strong style={{ fontSize: "15px" }}>{service.name}</strong>
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={getColorStyle(service.category?.color || "")}
                      >
                        {service.category?.name || service.serviceCategory || "Chưa phân loại"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                        <Clock size={14} />
                        <span>{service.duration || "--"} phút</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: "500" }}>{formatCurrencyVND(service.price)}</span>
                    </td>
                    <td>
                      {service.discountPrice && Number(service.discountPrice) < Number(service.price) ? (
                        <span style={{ color: "var(--color-success)", fontWeight: "600" }}>
                          {formatCurrencyVND(service.discountPrice)}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>--</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => handleOpenEditModal(service)}
                        >
                          <Edit2 size={14} /> Sửa
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => handleDelete(service.id)}
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              Quản lý nhóm dịch vụ
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px", overflowY: "auto", flex: 1 }}>
              {/* Left Side: Category List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderRight: "1px solid hsl(210, 40%, 90%)", paddingRight: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Danh sách nhóm dịch vụ</h3>
                
                {categoriesLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                    <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
                  </div>
                ) : categories.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", fontStyle: "italic" }}>Chưa có nhóm nào. Hãy tạo một nhóm ở biểu mẫu bên cạnh.</p>
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
                  {editingCategoryId ? "Chỉnh sửa nhóm" : "Thêm nhóm mới"}
                </h3>

                <div className="form-group">
                  <label className="form-label">Tên nhóm *</label>
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
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={categoryCommission}
                    onChange={(e) => setCategoryCommission(parseFloat(e.target.value) || 0)}
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
                    {editingCategoryId ? "Lưu thay đổi" : "Tạo nhóm"}
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
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "520px", position: "relative" }}>
            <button
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
              onClick={() => setIsModalOpen(false)}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>
              {modalMode === "create" ? "Thêm dịch vụ mới" : "Chỉnh sửa dịch vụ"}
            </h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Nhóm dịch vụ *</label>
                  <select
                    className="form-input"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn nhóm dịch vụ --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Thời lượng (phút)</label>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {categoryId && (
                <div style={{
                  marginBottom: "16px",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "hsl(210, 40%, 97%)",
                  border: "1px solid hsl(210, 40%, 90%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "13px"
                }}>
                  <span style={{ color: "var(--text-secondary)" }}>Hoa hồng thợ mặc định (theo nhóm):</span>
                  <strong style={{ color: "var(--color-primary)" }}>
                    {categories.find(c => c.id === categoryId)?.defaultCommission || 0}%
                  </strong>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Giá bán gốc (VND) *</label>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá khuyến mãi (VND)</label>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">URL Hình ảnh</label>
                <input
                  className="form-input"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Link ảnh minh họa..."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
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
