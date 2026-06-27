import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { formatCurrencyVND } from "@salon/shared-utils";
import { Package, Loader2 } from "lucide-react";
import { useConfirm } from "../../../components/desktop/ConfirmDialog";

import { InventoryItem } from "./types";
import { InventoryHeader } from "./components/InventoryHeader";
import { InventoryTable } from "./components/InventoryTable";
import { InventoryModal } from "./components/InventoryModal";

export default function Inventories() {
  const { currentTenantId, currentBranchId } = useAuthStore();
  const confirm = useConfirm();

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

  // Adjustment Fields
  const [adjustType, setAdjustType] = useState<"import" | "export">("import");
  const [adjustQuantity, setAdjustQuantity] = useState<number>(1);

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
    if (
      !(await confirm({
        title: "Xóa sản phẩm",
        message: "Bạn có chắc chắn muốn xóa sản phẩm này khỏi kho?",
        type: "danger",
        confirmText: "Xóa",
      }))
    )
      return;

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
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header filter controls */}
      <InventoryHeader
        showLowStockOnly={showLowStockOnly}
        setShowLowStockOnly={setShowLowStockOnly}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenCreateModal={handleOpenCreateModal}
      />

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
        <InventoryTable
          filteredItems={filteredItems}
          getInlineValue={getInlineValue}
          handleInlineChange={handleInlineChange}
          handlePriceChange={handlePriceChange}
          handleAutoSave={handleAutoSave}
          formatNumber={formatNumber}
          onOpenAdjustModal={handleOpenAdjustModal}
          onOpenEditModal={handleOpenEditModal}
          onDelete={handleDelete}
        />
      )}

      {/* Modal Dialog */}
      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalMode={modalMode}
        name={name}
        setName={setName}
        costPrice={costPrice}
        setCostPrice={setCostPrice}
        sellPrice={sellPrice}
        setSellPrice={setSellPrice}
        discountPrice={discountPrice}
        setDiscountPrice={setDiscountPrice}
        quantity={quantity}
        setQuantity={setQuantity}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        adjustType={adjustType}
        setAdjustType={setAdjustType}
        adjustQuantity={adjustQuantity}
        setAdjustQuantity={setAdjustQuantity}
        compressAndGetBase64={compressAndGetBase64}
        uploadFile={uploadFile}
        handleSave={handleSave}
      />
    </div>
  );
}
