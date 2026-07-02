export interface InventoryItem {
  id: string;
  name: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;
  discountPrice?: number;
  imageUrl?: string;
  branchId?: string;
}

export type AdjustType = "import" | "export";
export type ModalMode = "create" | "edit" | "adjust";
