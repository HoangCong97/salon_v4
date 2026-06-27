export interface TenantData {
  id: string;
  name: string;
  owner: string; // maps to ownerName in database
  phone: string;
  email: string;
  plan: string; // plan code (e.g. "FREE", "BASIC", "PLUS", "PREMIUM")
  branchesCount: number;
  createdAt: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  address: string;
}

export interface PlanData {
  id: string;
  name: string;
  code: string;
  price: number;
  maxBranches: number;
  maxStaff: number;
  features: string[];
}
