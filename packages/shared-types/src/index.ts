export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface UserSession {
  userId: string;
  tenantId: string;
  role: string;
  permissions: string[];
}
