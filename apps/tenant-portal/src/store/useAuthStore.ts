import { create } from "zustand";

export type UserRole = "ADMIN" | "MANAGER" | "CASHIER" | "EMPLOYEE";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  tenantId?: string;
  permissions?: string[];
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

export interface SubscriptionData {
  tenantId: string;
  tenantName: string;
  planId: string | null;
  planName: string;
  planCode: string;
  planPrice: number;
  planStartedAt: string | null;
  planExpiresAt: string | null;
  planStatus: string;
  maxBranches: number;
  maxStaff: number;
  currentBranchesCount: number;
  currentStaffCount: number;
  features: string[];
}

export interface SaasPlan {
  id: string;
  name: string;
  code: string;
  price: number;
  maxBranches: number;
  maxStaff: number;
  features: string[];
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
  
  // Subscription states
  subscription: SubscriptionData | null;
  subscriptionLoading: boolean;
  fetchSubscription: () => Promise<void>;
  
  // Pricing Modal states
  isPricingModalOpen: boolean;
  setIsPricingModalOpen: (isOpen: boolean) => void;
  plans: SaasPlan[];
  plansLoading: boolean;
  fetchPlans: () => Promise<void>;
  checkoutInvoice: any;
  setCheckoutInvoice: (invoice: any) => void;
  isBuying: boolean;
  handleBuyPlan: (planCode: string) => Promise<void>;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setRole: (role: UserRole) => void | Promise<void>;
  setBranch: (branchId: string) => void;
  setTenant: (tenantId: string) => Promise<void>;
  initializeSession: () => Promise<void>;
  setBrandInfo: (brandName: string | null, logoUrl: string | null) => void;
  fetchBrandInfo: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, // Null on startup to show login screen
  tenants: [],
  currentTenantId: null,
  branches: [],
  currentBranchId: null,
  brandName: null,
  logoUrl: null,
  isLoading: false,

  // Subscription states
  subscription: null,
  subscriptionLoading: false,
  fetchSubscription: async () => {
    const { currentTenantId } = get();
    if (!currentTenantId) return;
    set({ subscriptionLoading: true });
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/subscription`);
      if (res.ok) {
        const data = await res.json();
        set({ subscription: data });
      }
    } catch (e) {
      console.error("Failed to fetch subscription status:", e);
    } finally {
      set({ subscriptionLoading: false });
    }
  },

  // Pricing Modal states
  isPricingModalOpen: false,
  setIsPricingModalOpen: (isOpen) => {
    set({ isPricingModalOpen: isOpen });
    if (isOpen && get().plans.length === 0) {
      get().fetchPlans();
    }
  },
  plans: [],
  plansLoading: false,
  fetchPlans: async () => {
    set({ plansLoading: true });
    try {
      const res = await fetch("http://localhost:3000/api/tenants/plans");
      if (res.ok) {
        const data = await res.json();
        set({ plans: data });
      }
    } catch (e) {
      console.error("Failed to fetch plans list:", e);
    } finally {
      set({ plansLoading: false });
    }
  },
  checkoutInvoice: null,
  setCheckoutInvoice: (checkoutInvoice) => set({ checkoutInvoice }),
  isBuying: false,
  handleBuyPlan: async (planCode: string) => {
    const { currentTenantId } = get();
    if (!currentTenantId) return;
    set({ isBuying: true });
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/buy-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode })
      });
      if (res.ok) {
        const data = await res.json();
        set({ checkoutInvoice: data });
      } else {
        const err = await res.json();
        alert(err.message || "Không thể khởi tạo yêu cầu mua gói");
      }
    } catch (e: any) {
      alert("Đã xảy ra lỗi: " + e.message);
    } finally {
      set({ isBuying: false });
    }
  },
  
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
          await get().fetchSubscription();
          return true;
        }
      }
      
      set({
        branches: [],
        currentBranchId: null,
        isLoading: false
      });
      return false;
    } catch (e: any) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: () => set({ user: null, currentBranchId: null, currentTenantId: null, branches: [] }),
  setRole: async (role) => {
    const tenantId = get().currentTenantId;
    if (!tenantId || !get().user) return;

    try {
      // 1. Fetch all roles of the tenant
      const rolesRes = await fetch(`http://localhost:3000/api/tenants/${tenantId}/roles`);
      if (!rolesRes.ok) throw new Error();
      const roles = await rolesRes.json();

      // Find matching role case-insensitively
      const matchedRole = roles.find((r: any) => r.name.toLowerCase() === role.toLowerCase());
      if (matchedRole) {
        // 2. Fetch role permission IDs
        const rolePermsRes = await fetch(`http://localhost:3000/api/tenants/${tenantId}/roles/${matchedRole.id}/permissions`);
        // 3. Fetch all system permissions (to map IDs to slugs)
        const allPermsRes = await fetch(`http://localhost:3000/api/tenants/${tenantId}/permissions`);

        if (rolePermsRes.ok && allPermsRes.ok) {
          const assignedIds: string[] = await rolePermsRes.json();
          const allPerms: any[] = await allPermsRes.json();

          // Map assigned IDs to slugs
          const permissionSlugs = allPerms
            .filter((p: any) => assignedIds.includes(p.id))
            .map((p: any) => p.slug);

          set((state) => ({
            user: state.user ? {
              ...state.user,
              role,
              permissions: permissionSlugs
            } : null
          }));
          return;
        }
      }
    } catch (e) {
      console.error("Failed to fetch role permissions dynamically", e);
      set((state) => ({
        user: state.user ? {
          ...state.user,
          role,
          permissions: []
        } : null
      }));
    }
  },
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
          await get().fetchSubscription();
          return;
        }
      }
    } catch (e) {
      console.error("Failed to fetch branches for tenant", e);
      set({
        branches: [],
        currentBranchId: null,
        isLoading: false
      });
    }
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
              await get().fetchSubscription();
              return;
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to initialize session from backend", e);
      set({
        tenants: [],
        currentTenantId: null,
        branches: [],
        currentBranchId: null,
        isLoading: false
      });
    }
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
      console.error("Failed to fetch brand info", e);
      set({ brandName: "SALON Portal", logoUrl: null });
    }
  },

  hasPermission: (permission) => {
    const user = get().user;
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    return user.permissions?.includes(permission) || false;
  }
}));
