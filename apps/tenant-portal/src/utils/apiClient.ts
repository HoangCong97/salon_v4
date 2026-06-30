/**
 * API Client Wrapper
 * ---
 * Chuẩn hóa tất cả API calls trong tenant-portal.
 * - Base URL từ env variable VITE_API_URL
 * - Tự động handle JSON parse/stringify
 * - Throw structured error message
 * - Hỗ trợ GET, POST, PUT, DELETE
 */

const API_BASE = "http://localhost:3000/api";

interface ApiError extends Error {
  status: number;
  data?: any;
}

/**
 * Gọi API endpoint và trả về dữ liệu đã parse JSON.
 * @param endpoint - API path (ví dụ: `/tenants/123/staff`)
 * @param options - Fetch options (method, body, headers, etc.)
 * @throws {ApiError} Nếu response status không OK
 */
export async function apiClient<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const error = new Error(
      errData.message || `API Error: ${res.status} ${res.statusText}`
    ) as ApiError;
    error.status = res.status;
    error.data = errData;
    throw error;
  }

  // Một số endpoint DELETE trả về 204 No Content
  const text = await res.text();
  if (!text) return undefined as T;

  return JSON.parse(text) as T;
}

/**
 * Shorthand helpers cho các HTTP methods phổ biến
 */
export const api = {
  get: <T = any>(endpoint: string) => apiClient<T>(endpoint),

  post: <T = any>(endpoint: string, body?: any) =>
    apiClient<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any) =>
    apiClient<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string) =>
    apiClient<T>(endpoint, { method: "DELETE" }),
};
