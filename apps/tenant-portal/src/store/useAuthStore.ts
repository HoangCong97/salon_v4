import { create } from "zustand";

export type UserRole = "ADMIN" | "MANAGER" | "CASHIER" | "EMPLOYEE";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  tenantId?: string;
}

export interface BranchInfo {
  id: string;
  name: string;
  address: string;
}

export interface TenantInfo {
  id: string;
  name: string;
  status: string;
}

interface AuthState {
  user: UserSession | null;
  tenants: TenantInfo[];
  currentTenantId: string | null;
  branches: BranchInfo[];
  currentBranchId: string | null;
  brandName: string | null;
  logoUrl: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setRole: (role: UserRole) => void;
  setBranch: (branchId: string) => void;
  setTenant: (tenantId: string) => Promise<void>;
  initializeSession: () => Promise<void>;
  setBrandInfo: (brandName: string | null, logoUrl: string | null) => void;
  fetchBrandInfo: () => Promise<void>;
}

// Initial mock data to make testing easier immediately
const MOCK_BRANCHES: BranchInfo[] = [
  { id: "b1", name: "Chi nhánh Quận 1 - Hồ Chí Minh", address: "123 Nguyễn Huệ, Bến Nghé, Quận 1" },
  { id: "b2", name: "Chi nhánh Quận 3 - Hồ Chí Minh", address: "456 Nguyễn Đình Chiểu, Phường 5, Quận 3" },
  { id: "b3", name: "Chi nhánh Cầu Giấy - Hà Nội", address: "789 Cầu Giấy, Quan Hoa, Cầu Giấy" },
];

const MOCK_TENANTS: TenantInfo[] = [
  { id: "t1", name: "HairStar Beauty Salon", status: "ACTIVE" },
  { id: "t2", name: "BarberShop House", status: "ACTIVE" }
];

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, // Null on startup to show login screen
  tenants: MOCK_TENANTS,
  currentTenantId: null,
  branches: [],
  currentBranchId: null,
  brandName: null,
  logoUrl: null,
  isLoading: false,
  
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Tài khoản hoặc mật khẩu không chính xác");
      }

      const userData = await res.json();
      set({ user: userData, currentTenantId: userData.tenantId });

      // Fetch branches for logged in tenant
      const branchesRes = await fetch(`http://localhost:3000/api/tenants/${userData.tenantId}/branches`);
      if (branchesRes.ok) {
        const branchData = await branchesRes.json();
        if (Array.isArray(branchData) && branchData.length > 0) {
          const mappedBranches = branchData.map((b: any) => ({
            id: b.id,
            name: b.name,
            address: b.address || ""
          }));
          set({
            branches: mappedBranches,
            currentBranchId: mappedBranches[0].id,
            isLoading: false
          });
          await get().fetchBrandInfo();
          return true;
        }
      }
      
      set({
        branches: MOCK_BRANCHES,
        currentBranchId: MOCK_BRANCHES[0].id,
        isLoading: false
      });
      return true;
    } catch (e: any) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: () => set({ user: null, currentBranchId: null, currentTenantId: null, branches: [] }),
  setRole: (role) => set((state) => ({
    user: state.user ? { ...state.user, role } : null
  })),
  setBranch: (currentBranchId) => set({ currentBranchId }),
  
  setTenant: async (tenantId) => {
    set({ currentTenantId: tenantId, isLoading: true });
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${tenantId}/branches`);
      if (res.ok) {
        const branchData = await res.json();
        if (Array.isArray(branchData) && branchData.length > 0) {
          const mappedBranches = branchData.map((b: any) => ({
            id: b.id,
            name: b.name,
            address: b.address || ""
          }));
          set({
            branches: mappedBranches,
            currentBranchId: mappedBranches[0].id,
            isLoading: false
          });
          await get().fetchBrandInfo();
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch branches for tenant, using mock", e);
    }
    // Fallback if no backend or empty branches
    set({
      branches: MOCK_BRANCHES,
      currentBranchId: MOCK_BRANCHES[0].id,
      isLoading: false
    });
  },

  initializeSession: async () => {
    set({ isLoading: true });
    try {
      const tenantsRes = await fetch("http://localhost:3000/api/super-admin/tenants");
      if (tenantsRes.ok) {
        const tenantData = await tenantsRes.json();
        if (Array.isArray(tenantData) && tenantData.length > 0) {
          const mappedTenants = tenantData.map((t: any) => ({
            id: t.id,
            name: t.name,
            status: t.status
          }));
          
          // Try to select first ACTIVE tenant, or fallback to first tenant
          const activeTenant = mappedTenants.find((t) => t.status === "ACTIVE") || mappedTenants[0];
          
          set({
            tenants: mappedTenants,
            currentTenantId: activeTenant.id
          });

          // Fetch branches for selected tenant
          const branchesRes = await fetch(`http://localhost:3000/api/tenants/${activeTenant.id}/branches`);
          if (branchesRes.ok) {
            const branchData = await branchesRes.json();
            if (Array.isArray(branchData) && branchData.length > 0) {
              const mappedBranches = branchData.map((b: any) => ({
                id: b.id,
                name: b.name,
                address: b.address || ""
              }));
              set({
                branches: mappedBranches,
                currentBranchId: mappedBranches[0].id,
                isLoading: false
              });
              await get().fetchBrandInfo();
              return;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to initialize session from backend, using default mock data", e);
    }
    
    // Default fallback
    set({
      tenants: MOCK_TENANTS,
      currentTenantId: "t1",
      branches: MOCK_BRANCHES,
      currentBranchId: "b1",
      isLoading: false
    });
    await get().fetchBrandInfo();
  },

  setBrandInfo: (brandName, logoUrl) => set({ brandName, logoUrl }),

  fetchBrandInfo: async () => {
    const { currentTenantId } = get();
    if (!currentTenantId) return;
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}`);
      if (res.ok) {
        const data = await res.json();
        set({
          brandName: data.brandName || data.name,
          logoUrl: data.logoUrl || null
        });
      }
    } catch (e) {
      console.warn("Failed to fetch brand info, using mock", e);
      if (currentTenantId === "t1") {
        set({ brandName: "HairStar Beauty Salon", logoUrl: null });
      } else if (currentTenantId === "t2") {
        set({ brandName: "BarberShop House", logoUrl: null });
      } else {
        set({ brandName: "SALON Portal", logoUrl: null });
      }
    }
  }
}));
