import { create } from "zustand";

export type UserRole = "ADMIN" | "MANAGER" | "CASHIER" | "EMPLOYEE";

export interface UserSession {
  id: string;
  name: string;
  email?: string;
  loginId: string;
  role: UserRole;
  avatar?: string;
  tenantId?: string;
  permissions?: string[];
  status?: string;
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

  login: (
    tenantRef: string,
    loginId: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<boolean>;
  logout: () => void;
  setRole: (role: UserRole) => void | Promise<void>;
  setBranch: (branchId: string) => void;
  setTenant: (tenantId: string) => Promise<void>;
  initializeSession: () => Promise<void>;
  setBrandInfo: (brandName: string | null, logoUrl: string | null) => void;
  fetchBrandInfo: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const getApiBaseUrl = () => {
  const host =
    typeof window !== "undefined" && window.location.hostname
      ? window.location.hostname
      : "localhost";
  return `http://${host}:3000/api`;
};

// Synchronous session helper to prevent screen flicker or login bounce on app resume
const getStoredItem = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const getInitialUser = (): UserSession | null => {
  const raw = getStoredItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getInitialBranches = (): BranchInfo[] => {
  const raw = getStoredItem("branches");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const initialUser = getInitialUser();
const initialTenantId = getStoredItem("tenantId") || initialUser?.tenantId || null;
const initialBranches = getInitialBranches();
const initialBranchId =
  getStoredItem("branchId") ||
  (initialBranches.length > 0 ? initialBranches[0].id : null);

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  tenants: [],
  currentTenantId: initialTenantId,
  branches: initialBranches,
  currentBranchId: initialBranchId,
  brandName: getStoredItem("brandName") || null,
  logoUrl: getStoredItem("logoUrl") || null,
  isLoading: false,

  // Subscription states
  subscription: null,
  subscriptionLoading: false,
  fetchSubscription: async () => {
    const { currentTenantId } = get();
    if (!currentTenantId) return;
    set({ subscriptionLoading: true });
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/tenants/${currentTenantId}/subscription`,
      );
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
      const res = await fetch(`${getApiBaseUrl()}/tenants/plans`);
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
      const res = await fetch(
        `${getApiBaseUrl()}/tenants/${currentTenantId}/buy-plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planCode }),
        },
      );
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

  login: async (tenantRef, loginId, password, rememberMe = true) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantRef, loginId, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Tài khoản hoặc mật khẩu không chính xác",
        );
      }

      const userData = await res.json();
      set({ user: userData, currentTenantId: userData.tenantId });

      // Fetch branches for logged in tenant
      const branchesRes = await fetch(
        `${getApiBaseUrl()}/tenants/${userData.tenantId}/branches`,
      );
      let mappedBranches: BranchInfo[] = [];
      let currentBranchId: string | null = null;

      if (branchesRes.ok) {
        const branchData = await branchesRes.json();
        if (Array.isArray(branchData) && branchData.length > 0) {
          mappedBranches = branchData.map((b: any) => ({
            id: b.id,
            name: b.name,
            address: b.address || "",
          }));
          currentBranchId = mappedBranches[0].id;
        }
      }

      set({
        branches: mappedBranches,
        currentBranchId,
        isLoading: false,
      });

      await get().fetchBrandInfo();
      await get().fetchSubscription();

      // Duy trì đăng nhập (Always persist in localStorage for mobile/PWA resilience)
      localStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.setItem("user", JSON.stringify(userData));
      if (userData.tenantId) {
        localStorage.setItem("tenantId", userData.tenantId);
        sessionStorage.setItem("tenantId", userData.tenantId);
      }
      if (currentBranchId) {
        localStorage.setItem("branchId", currentBranchId);
        sessionStorage.setItem("branchId", currentBranchId);
      }
      localStorage.setItem("branches", JSON.stringify(mappedBranches));
      sessionStorage.setItem("branches", JSON.stringify(mappedBranches));
      localStorage.setItem("rememberMe", String(rememberMe));
      sessionStorage.setItem("rememberMe", String(rememberMe));

      return true;
    } catch (e: any) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("tenantId");
    localStorage.removeItem("branchId");
    localStorage.removeItem("branches");
    localStorage.removeItem("brandName");
    localStorage.removeItem("logoUrl");
    localStorage.removeItem("rememberMe");

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("tenantId");
    sessionStorage.removeItem("branchId");
    sessionStorage.removeItem("branches");
    sessionStorage.removeItem("brandName");
    sessionStorage.removeItem("logoUrl");
    sessionStorage.removeItem("rememberMe");

    set({
      user: null,
      currentBranchId: null,
      currentTenantId: null,
      branches: [],
      brandName: null,
      logoUrl: null,
    });
  },
  setRole: async (role) => {
    const tenantId = get().currentTenantId;
    if (!tenantId || !get().user) return;

    try {
      // 1. Fetch all roles of the tenant
      const rolesRes = await fetch(
        `${getApiBaseUrl()}/tenants/${tenantId}/roles`,
      );
      if (!rolesRes.ok) throw new Error();
      const roles = await rolesRes.json();

      // Find matching role case-insensitively
      const matchedRole = roles.find(
        (r: any) => r.name.toLowerCase() === role.toLowerCase(),
      );
      if (matchedRole) {
        // 2. Fetch role permission IDs
        const rolePermsRes = await fetch(
          `${getApiBaseUrl()}/tenants/${tenantId}/roles/${matchedRole.id}/permissions`,
        );
        // 3. Fetch all system permissions (to map IDs to slugs)
        const allPermsRes = await fetch(
          `${getApiBaseUrl()}/tenants/${tenantId}/permissions`,
        );

        if (rolePermsRes.ok && allPermsRes.ok) {
          const assignedIds: string[] = await rolePermsRes.json();
          const allPerms: any[] = await allPermsRes.json();

          // Map assigned IDs to slugs
          const permissionSlugs = allPerms
            .filter((p: any) => assignedIds.includes(p.id))
            .map((p: any) => p.slug);

          const updatedUser = get().user
            ? {
                ...get().user!,
                role,
                permissions: permissionSlugs,
              }
            : null;

          if (updatedUser) {
            localStorage.setItem("user", JSON.stringify(updatedUser));
            sessionStorage.setItem("user", JSON.stringify(updatedUser));
          }

          set({ user: updatedUser });
          return;
        }
      }
    } catch (e) {
      console.error("Failed to fetch role permissions dynamically", e);
      const updatedUser = get().user
        ? {
            ...get().user!,
            role,
            permissions: [],
          }
        : null;

      if (updatedUser) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      }

      set({ user: updatedUser });
    }
  },
  setBranch: (currentBranchId) => {
    localStorage.setItem("branchId", currentBranchId);
    sessionStorage.setItem("branchId", currentBranchId);
    set({ currentBranchId });
  },

  setTenant: async (tenantId) => {
    set({ currentTenantId: tenantId, isLoading: true });
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/tenants/${tenantId}/branches`,
      );
      if (res.ok) {
        const branchData = await res.json();
        if (Array.isArray(branchData) && branchData.length > 0) {
          const mappedBranches = branchData.map((b: any) => ({
            id: b.id,
            name: b.name,
            address: b.address || "",
          }));
          const newBranchId = mappedBranches[0].id;
          localStorage.setItem("tenantId", tenantId);
          localStorage.setItem("branchId", newBranchId);
          localStorage.setItem("branches", JSON.stringify(mappedBranches));
          sessionStorage.setItem("tenantId", tenantId);
          sessionStorage.setItem("branchId", newBranchId);
          sessionStorage.setItem("branches", JSON.stringify(mappedBranches));

          set({
            branches: mappedBranches,
            currentBranchId: newBranchId,
            isLoading: false,
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
        isLoading: false,
      });
    }
  },

  initializeSession: async () => {
    try {
      // 1. Check if there is stored session
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const storedTenantId =
        localStorage.getItem("tenantId") || sessionStorage.getItem("tenantId");
      const storedBranchId =
        localStorage.getItem("branchId") || sessionStorage.getItem("branchId");
      const storedBranches =
        localStorage.getItem("branches") || sessionStorage.getItem("branches");

      if (storedUser) {
        let parsedBranches: BranchInfo[] = [];
        try {
          parsedBranches = storedBranches ? JSON.parse(storedBranches) : [];
        } catch {}

        let parsedUser: UserSession | null = null;
        try {
          parsedUser = JSON.parse(storedUser);
        } catch {}

        if (parsedUser) {
          set({
            user: parsedUser,
            currentTenantId: storedTenantId || parsedUser.tenantId || null,
            currentBranchId:
              storedBranchId ||
              (parsedBranches.length > 0 ? parsedBranches[0].id : null),
            branches: parsedBranches,
            isLoading: false,
          });

          // Fetch brand info and subscription gracefully in the background without clearing session on error
          try {
            await get().fetchBrandInfo();
          } catch (e) {
            console.warn("Background fetchBrandInfo non-critical error:", e);
          }

          try {
            await get().fetchSubscription();
          } catch (e) {
            console.warn("Background fetchSubscription non-critical error:", e);
          }
          return;
        }
      }

      // If no stored user, do default tenant list fetch
      set({ isLoading: true });
      const tenantsRes = await fetch(
        `${getApiBaseUrl()}/super-admin/tenants`,
      );
      if (tenantsRes.ok) {
        const tenantData = await tenantsRes.json();
        if (Array.isArray(tenantData) && tenantData.length > 0) {
          const mappedTenants = tenantData.map((t: any) => ({
            id: t.id,
            name: t.name,
            status: t.status,
          }));

          // Try to select first ACTIVE tenant, or fallback to first tenant
          const activeTenant =
            mappedTenants.find((t) => t.status === "ACTIVE") ||
            mappedTenants[0];

          set({
            tenants: mappedTenants,
            currentTenantId: activeTenant.id,
          });

          // Fetch branches for selected tenant
          const branchesRes = await fetch(
            `${getApiBaseUrl()}/tenants/${activeTenant.id}/branches`,
          );
          if (branchesRes.ok) {
            const branchData = await branchesRes.json();
            if (Array.isArray(branchData) && branchData.length > 0) {
              const mappedBranches = branchData.map((b: any) => ({
                id: b.id,
                name: b.name,
                address: b.address || "",
              }));
              set({
                branches: mappedBranches,
                currentBranchId: mappedBranches[0].id,
                isLoading: false,
              });
              try {
                await get().fetchBrandInfo();
                await get().fetchSubscription();
              } catch {}
              return;
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to initialize session from backend", e);
      if (!get().user) {
        set({
          tenants: [],
          currentTenantId: null,
          branches: [],
          currentBranchId: null,
          isLoading: false,
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setBrandInfo: (brandName, logoUrl) => set({ brandName, logoUrl }),

  fetchBrandInfo: async () => {
    const { currentTenantId } = get();
    if (!currentTenantId) return;
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/tenants/${currentTenantId}`,
      );
      if (res.ok) {
        const data = await res.json();
        set({
          brandName: data.brandName || data.name,
          logoUrl: data.logoUrl || null,
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
    // Suspended users can ONLY view (read-only), so any non-view permission is blocked
    if (user.status === "SUSPENDED" && !permission.endsWith(".view")) {
      return false;
    }
    if (user.role === "ADMIN") return true;
    return user.permissions?.includes(permission) || false;
  },
}));
