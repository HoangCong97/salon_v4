export interface Branch {
  id: string;
  name: string;
}

export interface Staff {
  id: string;
  name: string;
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
}

export interface SimpleItem {
  id: string;
  name: string;
}

export type ItemType = "SERVICE" | "PRODUCT" | "PACKAGE";
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "ALL";
export type OrderSource = "WALK_IN" | "BOOKING" | "ALL";

export interface InvoiceItem {
  itemId: string;
  itemType: ItemType;
  name?: string;
  price: number;
  quantity: number;
  staffId?: string;
  stylist?: {
    id: string;
    name: string;
  };
}

export interface Invoice {
  id: string;
  tenantId: string;
  branchId: string;
  customerId?: string;
  customer?: {
    name: string;
    phone?: string;
  };
  cashierId?: string;
  cashier?: {
    name: string;
  };
  paymentMethod: "CASH" | "BANK_TRANSFER";
  orderSource: "WALK_IN" | "BOOKING";
  totalPrice?: number;
  discountAmount: number;
  finalAmount: number;
  createdAt: string;
  items: InvoiceItem[];
}
