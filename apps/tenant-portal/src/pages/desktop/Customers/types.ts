export interface Customer {
  id: string;
  tenantId: string;
  branchId?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  password?: string | null;
  credibilityScore: number;
  createdAt: string;
  updatedAt: string;
}
