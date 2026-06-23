import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { formatCurrencyVND } from "@salon/shared-utils";
import { Package, Plus, Edit2, Trash2, Loader2, X, Search, AlertTriangle, ArrowUpRight, ArrowDownLeft, Image as ImageIcon } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;
  discountPrice?: number;
  imageUrl?: string;
  branchId?: string;
}

export default function Inventories() {
  const { currentTenantId, currentBranchId } = useAuthStore();

  // Data State
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "adjust">("create");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState("");

  // Adjustment Fields
  const [adjustType, setAdjustType] = useState<"import" | "export">("import");
  const [adjustQuantity, setAdjustQuantity] = useState<number>(1);

  const fetchInventory = async () => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const url = currentBranchId 
        ? `http://localhost:3000/api/tenants/${currentTenantId}/inventories?branchId=${currentBranchId}`
        : `http://localhost:3000/api/tenants/${currentTenantId}/inventories`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm trong kho");
      const data = await res.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [currentTenantId, currentBranchId]);

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setName("");
    setCostPrice(50000);
    setSellPrice(100000);
    setDiscountPrice(100000);
    setQuantity(10);
    setImageUrl("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setModalMode("edit");
    setSelectedItemId(item.id);
    setName(item.name);
    setCostPrice(Number(item.costPrice));
    setSellPrice(Number(item.sellPrice));
    setDiscountPrice(Number(item.discountPrice ?? item.sellPrice));
    setQuantity(item.quantity);
    setImageUrl(item.imageUrl || "");
    setIsModalOpen(true);
  };

  const handleOpenAdjustModal = (item: InventoryItem) => {
    setModalMode("adjust");
    setSelectedItemId(item.id);
    setName(item.name);
    setQuantity(item.quantity);
    setCostPrice(Number(item.costPrice));
    setSellPrice(Number(item.sellPrice));
    setDiscountPrice(Number(item.discountPrice ?? item.sellPrice));
    setImageUrl(item.imageUrl || "");
    setAdjustType("import");
    setAdjustQuantity(1);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalQuantity = quantity;
    if (modalMode === "adjust") {
      finalQuantity = adjustType === "import" 
        ? quantity + adjustQuantity 
        : Math.max(0, quantity - adjustQuantity);
    }

    const payload = {
      name,
      costPrice,
      sellPrice,
      discountPrice,
      quantity: finalQuantity,
      imageUrl: imageUrl || null,
      branchId: currentBranchId || null
    };

    try {
      let res;
      if (modalMode === "create") {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/inventories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/inventories/${selectedItemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error("Lỗi khi lưu thông tin sản phẩm");

      setIsModalOpen(false);
      fetchInventory();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi kho?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/inventories/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Lỗi khi xóa sản phẩm");

      fetchInventory();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter Logic
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = !showLowStockOnly || item.quantity < 5;
    return matchesSearch && matchesLowStock;
  });

  return (
    <>
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>
              Quản lý kho hàng
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Nhập/Xuất kho hàng, quản lý giá vốn, giá bán lẻ và mức cảnh báo sản phẩm sắp hết.
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={18} /> Nhập sản phẩm mới
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between", padding: "16px" }}>
          {/* Toggle Option */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "600", color: "var(--text-primary)" }}>
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                style={{
                  width: "16px",
                  height: "16px",
                  cursor: "pointer"
                }}
              />
              <span style={{ display: "flex", alignItems: "center", gap: "4px", color: showLowStockOnly ? "var(--color-danger)" : "inherit" }}>
                {showLowStockOnly && <AlertTriangle size={16} />}
                Sản phẩm sắp hết hàng (&lt; 5)
              </span>
            </label>
          </div>

          {/* Search Input */}
          <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              className="form-input"
              placeholder="Tìm kiếm sản phẩm..."
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
        ) : filteredItems.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <Package size={48} style={{ color: "var(--text-muted)", marginBottom: "16px", marginInline: "auto" }} />
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Không tìm thấy sản phẩm</h3>
            <p style={{ color: "var(--text-secondary)" }}>Hãy thử điều chỉnh bộ lọc hoặc tạo sản phẩm mới.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Giá vốn (giá nhập)</th>
                  <th>Giá bán lẻ</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th style={{ width: "240px", textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isLowStock = item.quantity < 5;
                  const isOutOfStock = item.quantity === 0;

                  return (
                    <tr key={item.id}>
                      <td>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            style={{ width: "48px", height: "48px", borderRadius: "var(--radius-sm)", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-sm)", backgroundColor: "hsl(210, 40%, 94%)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ fontSize: "15px" }}>{item.name}</strong>
                      </td>
                      <td>
                        <span>{formatCurrencyVND(item.costPrice)}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: "500" }}>{formatCurrencyVND(item.sellPrice)}</span>
                      </td>
                      <td>
                        <strong style={{ color: isOutOfStock ? "var(--color-danger)" : isLowStock ? "var(--color-warning)" : "inherit" }}>
                          {item.quantity}
                        </strong>
                      </td>
                      <td>
                        {isOutOfStock ? (
                          <span className="badge badge-danger">Hết hàng</span>
                        ) : isLowStock ? (
                          <span className="badge badge-warning" style={{ gap: "4px" }}>
                            <AlertTriangle size={12} /> Sắp hết hàng
                          </span>
                        ) : (
                          <span className="badge badge-success">Còn hàng</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "12px", gap: "4px" }}
                            onClick={() => handleOpenAdjustModal(item)}
                          >
                            Nhập/Xuất
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => handleOpenEditModal(item)}
                          >
                            <Edit2 size={14} /> Sửa
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 size={14} /> Xóa
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

      {/* Modal Dialog - Renders relative to viewport for perfect centering */}
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
                      <input
                        className="form-input"
                        type="number"
                        min={0}
                        required
                        value={costPrice}
                        onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
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
                      <input
                        className="form-input"
                        type="number"
                        min={0}
                        required
                        value={sellPrice}
                        onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Giá KM (nếu có)</label>
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
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === "adjust" ? "Cập nhật số lượng" : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
