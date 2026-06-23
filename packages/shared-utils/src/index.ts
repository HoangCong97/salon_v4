import { z } from "zod";

/**
 * Format number to VND Currency format (e.g. 150,000 đ)
 */
export function formatCurrencyVND(amount: number | string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(value)) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

/**
 * Format Date to Vietnamese format (e.g. 23/06/2026 17:30)
 */
export function formatDateVN(date: Date | string | number, includeTime = true): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.hour12 = false;
  }

  return new Intl.DateTimeFormat("vi-VN", options).format(d);
}

/**
 * Login validation schema
 */
export const LoginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự"),
});
