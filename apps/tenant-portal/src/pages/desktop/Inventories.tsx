import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { formatCurrencyVND } from "@salon/shared-utils";
import { Package, Plus, Edit2, Trash2, Loader2, X, Search, AlertTriangle, ArrowUpRight, ArrowDownLeft, Image as ImageIcon } from "lucide-react";
import { ExcelInput, PriceInputWithSuggestion } from "../../components/desktop/TableComponents";

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

  // Inline editing helper states & functions
  const [inlineEdits, setInlineEdits] = useState<Record<string, Partial<InventoryItem>>>({});

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "adjust">("create");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState<string>("0");
  const [sellPrice, setSellPrice] = useState<string>("0");
  const [discountPrice, setDiscountPrice] = useState<string>("0");
  const [quantity, setQuantity] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState("");
  const [dragging, setDragging] = useState(false);

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

  // Adjustment Fields
  const [adjustType, setAdjustType] = useState<"import" | "export">("import");
  const [adjustQuantity, setAdjustQuantity] = useState<number>(1);

  const formatNumber = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === "") return "";
    const cleaned = String(val).replace(/\D/g, "");
    if (!cleaned) return "";
    return new Intl.NumberFormat("en-US").format(parseInt(cleaned, 10));
  };

  const handlePriceChange = (itemId: string, field: "costPrice" | "sellPrice" | "quantity", valStr: string) => {
    const cleaned = valStr.replace(/\D/g, "");
    if (cleaned === "") {
      handleInlineChange(itemId, field, 0);
    } else {
      handleInlineChange(itemId, field, parseInt(cleaned, 10));
    }
  };

  const handleInlineChange = (itemId: string, field: keyof InventoryItem, value: any) => {
    setInlineEdits(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const getInlineValue = (item: InventoryItem, field: keyof InventoryItem) => {
    if (inlineEdits[item.id] && inlineEdits[item.id][field] !== undefined) {
      return inlineEdits[item.id][field];
    }
    return item[field];
  };

  const handleAutoSave = async (itemId: string, updatedFields: Partial<InventoryItem>) => {
    const originalItem = items.find(i => i.id === itemId);
    if (!originalItem) return;

    const mergedEdits = {
      ...inlineEdits[itemId],
      ...updatedFields
    };

    const updatedItem = {
      ...originalItem,
      ...mergedEdits
    };

    // Skip save if values are identical to original
    let hasChanges = false;
    for (const key of Object.keys(updatedFields) as Array<keyof InventoryItem>) {
      if (updatedFields[key] !== originalItem[key]) {
        hasChanges = true;
        break;
      }
    }
    if (!hasChanges) return;

    const payload = {
      name: updatedItem.name,
      costPrice: Number(updatedItem.costPrice),
      sellPrice: Number(updatedItem.sellPrice),
      discountPrice: updatedItem.discountPrice !== undefined && updatedItem.discountPrice !== null ? Number(updatedItem.discountPrice) : Number(updatedItem.sellPrice),
      quantity: Number(updatedItem.quantity),
      imageUrl: updatedItem.imageUrl || null,
      branchId: updatedItem.branchId || null
    };

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/inventories/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Lỗi khi tự động lưu");

      // Clear inlineEdits for this item
      setInlineEdits(prev => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });

      // Refresh list silently
      fetchInventory(true);
    } catch (err: any) {
      console.error("Auto save failed:", err);
    }
  };

  const fetchInventory = async (silent = false) => {
    if (!currentTenantId) return;
    if (!silent) setLoading(true);
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
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [currentTenantId, currentBranchId]);

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setName("");
    setCostPrice("50000");
    setSellPrice("100000");
    setDiscountPrice("100000");
    setQuantity(10);
    setImageUrl("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setModalMode("edit");
    setSelectedItemId(item.id);
    setName(item.name);
    setCostPrice(String(Number(item.costPrice)));
    setSellPrice(String(Number(item.sellPrice)));
    setDiscountPrice(String(Number(item.discountPrice ?? item.sellPrice)));
    setQuantity(item.quantity);
    setImageUrl(item.imageUrl || "");
    setIsModalOpen(true);
  };

  const handleOpenAdjustModal = (item: InventoryItem) => {
    setModalMode("adjust");
    setSelectedItemId(item.id);
    setName(item.name);
    setQuantity(item.quantity);
    setCostPrice(String(Number(item.costPrice)));
    setSellPrice(String(Number(item.sellPrice)));
    setDiscountPrice(String(Number(item.discountPrice ?? item.sellPrice)));
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

    const cleanCost = String(costPrice).replace(/,/g, "");
    const cleanSell = String(sellPrice).replace(/,/g, "");
    const cleanDiscount = String(discountPrice).replace(/,/g, "");

    const payload = {
      name,
      costPrice: parseFloat(cleanCost) || 0,
      sellPrice: parseFloat(cleanSell) || 0,
      discountPrice: parseFloat(cleanDiscount) || 0,
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

          {/* Search & Actions */}
          <div style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            width: "100%",
            maxWidth: "520px",
            marginLeft: "auto"
          }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "320px", flexShrink: 1, minWidth: "160px" }}>
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
            <button className="btn btn-primary" onClick={handleOpenCreateModal} style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", flexShrink: 0 }}>
              <Plus size={18} /> Nhập sản phẩm mới
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
        ) : filteredItems.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <Package size={48} style={{ color: "var(--text-muted)", marginBottom: "16px", marginInline: "auto" }} />
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Không tìm thấy sản phẩm</h3>
            <p style={{ color: "var(--text-secondary)" }}>Hãy thử điều chỉnh bộ lọc hoặc tạo sản phẩm mới.</p>
          </div>
        ) : (
          <div className="data-table-container" style={{ overflow: "visible" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ padding: "6px 10px", fontSize: "13px" }}>Tên sản phẩm</th>
                  <th style={{ padding: "6px 10px", fontSize: "13px", width: "160px", textAlign: "center" }}>Giá vốn (giá nhập)</th>
                  <th style={{ padding: "6px 10px", fontSize: "13px", width: "160px", textAlign: "center" }}>Giá bán lẻ</th>
                  <th style={{ padding: "6px 10px", fontSize: "13px", width: "120px", textAlign: "center" }}>Tồn kho</th>
                  <th style={{ padding: "6px 10px", fontSize: "13px", width: "140px" }}>Trạng thái</th>
                  <th style={{ padding: "6px 10px", fontSize: "13px", width: "160px", textAlign: "center" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isLowStock = item.quantity < 5;
                  const isOutOfStock = item.quantity === 0;

                  return (
                    <tr key={item.id}>
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          value={getInlineValue(item, "name") as string}
                          onChange={(val) => handleInlineChange(item.id, "name", val)}
                          onBlur={() => handleAutoSave(item.id, { name: getInlineValue(item, "name") as string })}
                          fontWeight="600"
                        />
                      </td>
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          value={formatNumber(getInlineValue(item, "costPrice") as number | string)}
                          onChange={(val) => handlePriceChange(item.id, "costPrice", val)}
                          onBlur={() => handleAutoSave(item.id, { costPrice: getInlineValue(item, "costPrice") as number })}
                          textAlign="center"
                          fontWeight="500"
                          unit="đ"
                        />
                      </td>
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          value={formatNumber(getInlineValue(item, "sellPrice") as number | string)}
                          onChange={(val) => handlePriceChange(item.id, "sellPrice", val)}
                          onBlur={() => handleAutoSave(item.id, { sellPrice: getInlineValue(item, "sellPrice") as number })}
                          textAlign="center"
                          fontWeight="500"
                          unit="đ"
                        />
                      </td>
                      <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                        <ExcelInput
                          type="number"
                          value={getInlineValue(item, "quantity") as number || 0}
                          onChange={(val) => handleInlineChange(item.id, "quantity", parseInt(val) || 0)}
                          onBlur={() => handleAutoSave(item.id, { quantity: getInlineValue(item, "quantity") as number })}
                          textAlign="center"
                          fontWeight="600"
                          textColor={isOutOfStock ? "var(--color-danger)" : isLowStock ? "var(--color-warning)" : "inherit"}
                        />
                      </td>
                      <td style={{ padding: "0 10px", verticalAlign: "middle", height: "38px" }}>
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
                      <td style={{ padding: "0 8px", verticalAlign: "middle", textAlign: "center", height: "38px" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "var(--radius-sm)" }}
                            onClick={() => handleOpenAdjustModal(item)}
                            title="Nhập / Xuất kho"
                          >
                            Nhập/Xuất
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "4px 8px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={() => handleOpenEditModal(item)}
                            title="Chỉnh sửa chi tiết"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: "4px 8px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={() => handleDelete(item.id)}
                            title="Xóa sản phẩm"
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
