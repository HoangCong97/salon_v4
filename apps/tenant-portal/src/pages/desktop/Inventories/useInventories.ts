import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/useAuthStore";
import { useConfirm } from "../../../components/desktop/ConfirmDialog";
import { useToast } from "../../../components/desktop/ToastProvider";
import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";
import { InventoryItem, AdjustType, ModalMode } from "./types";

export function useInventories() {
  const { currentTenantId, currentBranchId } = useAuthStore();
  const confirm = useConfirm();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Data State — useQuery
  const {
    data: items = [],
    isLoading: loading,
    error: queryError,
  } = useQuery<InventoryItem[]>({
    queryKey: queryKeys.inventories.list(currentTenantId!, currentBranchId),
    queryFn: () => {
      const url = currentBranchId
        ? `/tenants/${currentTenantId}/inventories?branchId=${currentBranchId}`
        : `/tenants/${currentTenantId}/inventories`;
      return api.get(url);
    },
    enabled: !!currentTenantId,
  });

  const error = queryError ? (queryError as Error).message : null;

  const fetchInventory = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.inventories.list(currentTenantId!, currentBranchId),
    });
  }, [queryClient, currentTenantId, currentBranchId]);

  // Inline editing helper states & functions
  const [inlineEdits, setInlineEdits] = useState<
    Record<string, Partial<InventoryItem>>
  >({});

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState<string>("0");
  const [sellPrice, setSellPrice] = useState<string>("0");
  const [discountPrice, setDiscountPrice] = useState<string>("0");
  const [quantity, setQuantity] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState("");

  // Adjustment Fields
  const [adjustType, setAdjustType] = useState<AdjustType>("import");
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

  const uploadFile = async (
    base64Data: string,
    category: string,
    originalFilename?: string
  ): Promise<string> => {
    const data = await api.post<{ url: string }>(
      `/tenants/${currentTenantId}/upload`,
      {
        file: base64Data,
        category,
        filename: originalFilename,
      }
    );
    return data.url;
  };

  const formatNumber = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === "") return "";
    const cleaned = String(val).replace(/\D/g, "");
    if (!cleaned) return "";
    return new Intl.NumberFormat("en-US").format(parseInt(cleaned, 10));
  };

  const handlePriceChange = (
    itemId: string,
    field: "costPrice" | "sellPrice" | "quantity",
    valStr: string
  ) => {
    const cleaned = valStr.replace(/\D/g, "");
    if (cleaned === "") {
      handleInlineChange(itemId, field, 0);
    } else {
      handleInlineChange(itemId, field, parseInt(cleaned, 10));
    }
  };

  const handleInlineChange = (
    itemId: string,
    field: keyof InventoryItem,
    value: string | number | undefined | null
  ) => {
    setInlineEdits((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const getInlineValue = (item: InventoryItem, field: keyof InventoryItem) => {
    if (inlineEdits[item.id] && inlineEdits[item.id][field] !== undefined) {
      return inlineEdits[item.id][field];
    }
    return item[field];
  };

  const handleAutoSave = async (
    itemId: string,
    updatedFields: Partial<InventoryItem>
  ) => {
    const originalItem = items.find((i) => i.id === itemId);
    if (!originalItem) return;

    const mergedEdits = {
      ...inlineEdits[itemId],
      ...updatedFields,
    };

    const updatedItem = {
      ...originalItem,
      ...mergedEdits,
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
      discountPrice:
        updatedItem.discountPrice !== undefined &&
        updatedItem.discountPrice !== null
          ? Number(updatedItem.discountPrice)
          : Number(updatedItem.sellPrice),
      quantity: Number(updatedItem.quantity),
      imageUrl: updatedItem.imageUrl || null,
      branchId: updatedItem.branchId || null,
    };

    try {
      await api.put(
        `/tenants/${currentTenantId}/inventories/${itemId}`,
        payload
      );

      // Clear inlineEdits for this item
      setInlineEdits((prev) => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });

      toast.success("Lưu tự động thành công!");
      await fetchInventory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Lỗi tự động lưu: " + msg);
    }
  };

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
      finalQuantity =
        adjustType === "import"
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
      branchId: currentBranchId || null,
    };

    try {
      if (modalMode === "create") {
        await api.post(`/tenants/${currentTenantId}/inventories`, payload);
        toast.success("Tạo sản phẩm thành công!");
      } else {
        await api.put(
          `/tenants/${currentTenantId}/inventories/${selectedItemId}`,
          payload
        );
        toast.success("Cập nhật sản phẩm thành công!");
      }

      setIsModalOpen(false);
      await fetchInventory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg);
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
      await api.delete(`/tenants/${currentTenantId}/inventories/${id}`);
      toast.success("Đã xóa sản phẩm thành công!");
      await fetchInventory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg);
    }
  };

  // Filter Logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesLowStock = !showLowStockOnly || item.quantity < 5;
      return matchesSearch && matchesLowStock;
    });
  }, [items, searchTerm, showLowStockOnly]);

  return {
    loading,
    error,
    filteredItems,
    searchTerm,
    setSearchTerm,
    showLowStockOnly,
    setShowLowStockOnly,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    name,
    setName,
    costPrice,
    setCostPrice,
    sellPrice,
    setSellPrice,
    discountPrice,
    setDiscountPrice,
    quantity,
    setQuantity,
    imageUrl,
    setImageUrl,
    adjustType,
    setAdjustType,
    adjustQuantity,
    setAdjustQuantity,
    compressAndGetBase64,
    uploadFile,
    formatNumber,
    handlePriceChange,
    handleInlineChange,
    getInlineValue,
    handleAutoSave,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleOpenAdjustModal,
    handleSave,
    handleDelete,
  };
}
