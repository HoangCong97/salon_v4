export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface Branch {
  id: string;
  name: string;
}

export interface StaffMember {
  id: string;
  name: string;
  loginId: string;
  email?: string;
  password?: string;
  phone: string;
  sex: string;
  baseSalary: number;
  status: string;
  note: string;
  avatar?: string;
  role: { id: string; name: string } | null;
  branches: Branch[];
  isAdmin?: boolean;
  createdAt?: string;
}

export interface SystemPermission {
  id: string;
  slug: string;
  groupName: string;
  name: string;
  description: string;
}

export interface DailyTurn {
  id: string;
  queueNumber: number;
  staffId: string;
  staffName: string;
  role: string;
  totalWalkinCount: number;
  totalBookedCount: number;
  totalCustomersToday: number;
  lastAssignedAt: string | null;
}

export const getRoleColorStyle = (roleName: string) => {
  const name = (roleName || "").toUpperCase();
  if (name.includes("ADMIN")) {
    return { backgroundColor: "var(--color-danger-light)", color: "var(--color-danger)", border: "none" };
  } else if (name.includes("MANAGER")) {
    return { backgroundColor: "var(--color-warning-light)", color: "var(--color-warning)", border: "none" };
  } else if (name.includes("CASHIER")) {
    return { backgroundColor: "var(--color-info-light)", color: "var(--color-info)", border: "none" };
  } else {
    return { backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", border: "none" };
  }
};

export const getStatusColorStyle = (status: string) => {
  if (status === "ACTIVE") {
    return { backgroundColor: "var(--color-success-light)", color: "var(--color-success)", border: "none" };
  }
  return { backgroundColor: "var(--color-danger-light)", color: "var(--color-danger)", border: "none" };
};

export const getAdminUser = (staffList: StaffMember[]): StaffMember | null => {
  return staffList.reduce<StaffMember | null>((oldest, current) => {
    if (current.isAdmin) return current;
    if (oldest?.isAdmin) return oldest;
    if (!oldest) return current;
    if (!current.createdAt) return oldest;
    if (!oldest.createdAt) return current;
    return new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest;
  }, null);
};

