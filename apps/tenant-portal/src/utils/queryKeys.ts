/**
 * Query Key Factory
 * ---
 * Quản lý tập trung tất cả query keys cho TanStack Query.
 * Pattern: [entity, tenantId, ...params] để đảm bảo invalidation chính xác.
 * 
 * Quy ước:
 * - `.all(tenantId)`: Invalidate TẤT CẢ queries của entity đó cho tenant
 * - `.list(tenantId)`: Query key cho danh sách
 * - `.detail(tenantId, id)`: Query key cho chi tiết 1 item
 */

export const queryKeys = {
  /** Nhân viên */
  staff: {
    all: (tenantId: string) => ["staff", tenantId] as const,
    list: (tenantId: string) => ["staff", tenantId, "list"] as const,
  },

  /** Chức vụ (Roles) */
  roles: {
    all: (tenantId: string) => ["roles", tenantId] as const,
    list: (tenantId: string) => ["roles", tenantId, "list"] as const,
    permissions: (tenantId: string, roleId: string) =>
      ["roles", tenantId, roleId, "permissions"] as const,
  },

  /** Chi nhánh (Branches) */
  branches: {
    all: (tenantId: string) => ["branches", tenantId] as const,
    list: (tenantId: string) => ["branches", tenantId, "list"] as const,
  },

  /** Quyền hệ thống (Permissions) */
  permissions: {
    all: (tenantId: string) => ["permissions", tenantId] as const,
    list: (tenantId: string) => ["permissions", tenantId, "list"] as const,
  },

  /** Xoay tua thợ hàng ngày (Daily Turns) */
  dailyTurns: {
    all: (tenantId: string, branchId: string) =>
      ["daily-turns", tenantId, branchId] as const,
    list: (tenantId: string, branchId: string) =>
      ["daily-turns", tenantId, branchId, "list"] as const,
  },

  /** Dịch vụ (Services) */
  services: {
    all: (tenantId: string) => ["services", tenantId] as const,
    list: (tenantId: string, branchId?: string | null) =>
      ["services", tenantId, "list", branchId ?? "all"] as const,
  },

  /** Nhóm dịch vụ (Service Categories) */
  serviceCategories: {
    all: (tenantId: string) => ["service-categories", tenantId] as const,
    list: (tenantId: string) => ["service-categories", tenantId, "list"] as const,
  },

  /** Khách hàng (Customers) */
  customers: {
    all: (tenantId: string) => ["customers", tenantId] as const,
    list: (tenantId: string, branchId?: string | null) =>
      ["customers", tenantId, "list", branchId ?? "all"] as const,
  },

  /** Hóa đơn (Invoices) */
  invoices: {
    all: (tenantId: string, branchId: string) =>
      ["invoices", tenantId, branchId] as const,
    list: (tenantId: string, branchId: string) =>
      ["invoices", tenantId, branchId, "list"] as const,
  },

  /** Ca trực (Shifts) */
  shifts: {
    all: (tenantId: string, branchId: string) =>
      ["shifts", tenantId, branchId] as const,
    list: (tenantId: string, branchId: string, startDate: string, endDate: string) =>
      ["shifts", tenantId, branchId, startDate, endDate] as const,
    staff: (tenantId: string, branchId: string) =>
      ["shifts", tenantId, branchId, "staff"] as const,
  },

  /** Thương hiệu / Tenant Info */
  tenant: {
    info: (tenantId: string) => ["tenant", tenantId, "info"] as const,
  },

  /** Kho hàng (Inventories) */
  inventories: {
    all: (tenantId: string) => ["inventories", tenantId] as const,
    list: (tenantId: string, branchId?: string | null) =>
      ["inventories", tenantId, "list", branchId ?? "all"] as const,
  },

  /** Bảng lương (Payroll) */
  payrolls: {
    all: (tenantId: string) => ["payrolls", tenantId] as const,
    list: (tenantId: string, branchId: string, period: string) =>
      ["payrolls", tenantId, branchId, period] as const,
    attendances: (tenantId: string, branchId: string) =>
      ["payrolls", tenantId, branchId, "attendances"] as const,
    advances: (tenantId: string, branchId: string) =>
      ["payrolls", tenantId, branchId, "advances"] as const,
  },

  /** Lịch hẹn (Appointments) */
  appointments: {
    all: (tenantId: string) => ["appointments", tenantId] as const,
    list: (tenantId: string, branchId: string) =>
      ["appointments", tenantId, branchId, "list"] as const,
  },

  /** Gói combo (Service Packages) */
  servicePackages: {
    list: (tenantId: string, branchId?: string | null) =>
      ["service-packages", tenantId, "list", branchId ?? "all"] as const,
  },
};
