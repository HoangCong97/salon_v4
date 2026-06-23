import { create } from "zustand";

export type UserRole = "ADMIN" | "MANAGER" | "CASHIER" | "EMPLOYEE";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface BranchInfo {
  id: string;
  name: string;
  address: string;
}

interface AuthState {
  user: UserSession | null;
  branches: BranchInfo[];
  currentBranchId: string | null;
  login: (user: UserSession) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  setBranch: (branchId: string) => void;
}

// Initial mock data to make testing easier immediately
const MOCK_BRANCHES: BranchInfo[] = [
  { id: "b1", name: "Chi nhánh Quận 1 - Hồ Chí Minh", address: "123 Nguyễn Huệ, Bến Nghé, Quận 1" },
  { id: "b2", name: "Chi nhánh Quận 3 - Hồ Chí Minh", address: "456 Nguyễn Đình Chiểu, Phường 5, Quận 3" },
  { id: "b3", name: "Chi nhánh Cầu Giấy - Hà Nội", address: "789 Cầu Giấy, Quan Hoa, Cầu Giấy" },
];

const MOCK_USER: UserSession = {
  id: "u1",
  name: "Hoàng Công",
  email: "hoangcong@salon.com",
  role: "ADMIN", // Default role
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
};

export const useAuthStore = create<AuthState>((set) => ({
  user: MOCK_USER,
  branches: MOCK_BRANCHES,
  currentBranchId: "b1",
  
  login: (user) => set({ user }),
  logout: () => set({ user: null, currentBranchId: null }),
  setRole: (role) => set((state) => ({
    user: state.user ? { ...state.user, role } : null
  })),
  setBranch: (currentBranchId) => set({ currentBranchId }),
}));
