/**
 * Chuẩn bảng màu tài chính hệ thống Salon
 * -------------------------------------------------------------
 * Chỉ số          | Màu        | Mã HEX   | Ý nghĩa
 * ----------------|------------|----------|----------------------------------------
 * Doanh thu       | 🔵 Blue    | #2563EB  | Giá trị kinh doanh / tổng doanh số
 * Tiền thực tế    | 🌊 Cyan    | #0891B2  | Tiền thực tế thu được / dòng tiền
 * Chi phí         | 🔴 Red     | #DC2626  | Tiền đi ra
 * Lợi nhuận       | 🟣 Purple  | #7C3AED  | Giá trị sau khi trừ chi phí
 * Chưa thu        | 🟠 Orange  | #EA580C  | Khoản cần thu / công nợ
 */

export const FINANCIAL_COLORS = {
  /** Doanh thu: Giá trị kinh doanh / tổng doanh số */
  REVENUE: {
    hex: "#2563EB",
    rgb: "37, 99, 235",
    label: "Doanh thu",
    description: "Giá trị kinh doanh / tổng doanh số",
    textClass: "text-blue-600",
    bgClass: "bg-blue-600",
    bgLightClass: "bg-blue-50",
    borderClass: "border-blue-200",
  },
  /** Tiền thực tế: Tiền thực tế thu được / dòng tiền (Cyan) */
  NET_AMOUNT: {
    hex: "#0891B2",
    rgb: "8, 145, 178",
    label: "Tiền thực tế",
    subLabel: "Thu thực tế",
    description: "Tiền thực tế thu được / dòng tiền",
    textClass: "text-cyan-700",
    bgClass: "bg-cyan-600",
    bgLightClass: "bg-cyan-50",
    borderClass: "border-cyan-200",
  },
  /** Chi phí: Tiền đi ra */
  EXPENSE: {
    hex: "#DC2626",
    rgb: "220, 38, 38",
    label: "Chi phí",
    description: "Tiền đi ra",
    textClass: "text-red-600",
    bgClass: "bg-red-600",
    bgLightClass: "bg-red-50",
    borderClass: "border-red-200",
  },
  /** Lợi nhuận: Giá trị sau khi trừ chi phí */
  PROFIT: {
    hex: "#7C3AED",
    rgb: "124, 58, 237",
    label: "Lợi nhuận",
    description: "Giá trị sau khi trừ chi phí",
    textClass: "text-purple-600",
    bgClass: "bg-purple-600",
    bgLightClass: "bg-purple-50",
    borderClass: "border-purple-200",
  },
  /** Chưa thu: Khoản cần thu */
  PENDING: {
    hex: "#EA580C",
    rgb: "234, 88, 12",
    label: "Chưa thu",
    description: "Khoản cần thu",
    textClass: "text-orange-600",
    bgClass: "bg-orange-600",
    bgLightClass: "bg-orange-50",
    borderClass: "border-orange-200",
  },
} as const;

/** Mã hex trực tiếp để gọi nhanh */
export const FINANCIAL_HEX = {
  REVENUE: "#2563EB",
  NET_AMOUNT: "#0891B2",
  EXPENSE: "#DC2626",
  PROFIT: "#7C3AED",
  PENDING: "#EA580C",
} as const;

export type FinancialColorKey = keyof typeof FINANCIAL_COLORS;
