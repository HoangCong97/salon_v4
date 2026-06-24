import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { formatCurrencyVND } from "@salon/shared-utils";
import { 
  Users, Plus, Edit2, Trash2, Loader2, X, Search, 
  Shield, User, Phone, Mail, DollarSign, Building, Info, Check, Key,
  RefreshCw, UserPlus, Play, Award, HelpCircle
} from "lucide-react";
import { ExcelInput, ExcelSelect, PriceInputWithSuggestion } from "../../components/desktop/TableComponents";

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface Branch {
  id: string;
  name: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  sex: string;
  baseSalary: number;
  status: string;
  note: string;
  role: { id: string; name: string } | null;
  branches: Branch[];
}

interface SystemPermission {
  id: string;
  slug: string;
  groupName: string;
  name: string;
  description: string;
}

interface DailyTurn {
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

export default function StaffManagement() {
  const { currentTenantId, currentBranchId, branches } = useAuthStore();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<"staff" | "permissions" | "turns">("staff");

  // Data States
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branchList, setBranchList] = useState<Branch[]>([]);
  const [permissions, setPermissions] = useState<SystemPermission[]>([]);
  const [dailyTurns, setDailyTurns] = useState<DailyTurn[]>([]);
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search Filter State
  const [searchTerm, setSearchTerm] = useState("");

  // Inline Editing State for Staff
  const [inlineEdits, setInlineEdits] = useState<Record<string, Partial<StaffMember>>>({});

  // Inline Editing State for Turns (turns counts adjustments)
  const [turnEdits, setTurnEdits] = useState<Record<string, { walkin: number; booked: number }>>({});

  // Staff Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  // Staff Form Fields State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [sex, setSex] = useState("Nam");
  const [roleId, setRoleId] = useState("");
  const [baseSalary, setBaseSalary] = useState("0");
  const [status, setStatus] = useState("ACTIVE");
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [note, setNote] = useState("");

  // Role Permission Assignment States
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [assignedPermissionIds, setAssignedPermissionIds] = useState<string[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Custom Role Modal States
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState<"create" | "edit">("create");
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [savingRole, setSavingRole] = useState(false);

  // Manual Add Staff to Queue Modal State
  const [isAddStaffToQueueOpen, setIsAddStaffToQueueOpen] = useState(false);
  const [staffToAddId, setStaffToAddId] = useState("");

  // 1. FETCH MAIN DATA
  const fetchStaffAndRoles = async (silent = false) => {
    if (!currentTenantId) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [staffRes, rolesRes, branchesRes, permissionsRes] = await Promise.all([
        fetch(`http://localhost:3000/api/tenants/${currentTenantId}/staff`),
        fetch(`http://localhost:3000/api/tenants/${currentTenantId}/roles`),
        fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches`),
        fetch(`http://localhost:3000/api/tenants/${currentTenantId}/permissions`)
      ]);

      if (!staffRes.ok) throw new Error("Không thể tải danh sách nhân viên");
      if (!rolesRes.ok) throw new Error("Không thể tải danh sách chức vụ");
      if (!branchesRes.ok) throw new Error("Không thể tải danh sách chi nhánh");
      if (!permissionsRes.ok) throw new Error("Không thể tải danh sách quyền hệ thống");

      const staffData = await staffRes.json();
      const rolesData = await rolesRes.json();
      const branchesData = await branchesRes.json();
      const permissionsData = await permissionsRes.json();

      setStaff(staffData);
      setRoles(rolesData);
      setBranchList(branchesData);
      setPermissions(permissionsData);

      if (rolesData.length > 0 && !selectedRoleId) {
        setSelectedRoleId(rolesData[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi kết nối máy chủ API");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // FETCH TURNS DATA FOR SELECTED BRANCH
  const fetchDailyTurns = async (silent = false) => {
    if (!currentTenantId || !currentBranchId) return;
    if (!silent && activeTab === "turns") setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/daily-turns`);
      if (!res.ok) throw new Error("Không thể tải danh sách xoay tua thợ");
      const data = await res.json();
      setDailyTurns(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent && activeTab === "turns") setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffAndRoles();
  }, [currentTenantId]);

  useEffect(() => {
    if (currentBranchId) {
      fetchDailyTurns();
    }
  }, [currentTenantId, currentBranchId, activeTab]);

  // FETCH PERMISSIONS FOR SELECTED ROLE
  useEffect(() => {
    const fetchRolePermissions = async () => {
      if (!currentTenantId || !selectedRoleId) return;
      setPermissionsLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/roles/${selectedRoleId}/permissions`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setAssignedPermissionIds(data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách quyền của chức vụ", err);
      } finally {
        setPermissionsLoading(false);
      }
    };

    if (activeTab === "permissions") {
      fetchRolePermissions();
    }
  }, [selectedRoleId, activeTab, currentTenantId]);

  // 2. INLINE EDIT HANDLERS (Excel-like table patterns)
  const formatNumber = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === "") return "";
    const cleaned = String(val).replace(/\D/g, "");
    if (!cleaned) return "";
    return new Intl.NumberFormat("en-US").format(parseInt(cleaned, 10));
  };

  const handleSalaryChange = (staffId: string, valStr: string) => {
    const cleaned = valStr.replace(/\D/g, "");
    if (cleaned === "") {
      handleInlineChange(staffId, "baseSalary", 0);
    } else {
      handleInlineChange(staffId, "baseSalary", parseInt(cleaned, 10));
    }
  };

  const handleInlineChange = (staffId: string, field: keyof StaffMember, value: any) => {
    setInlineEdits(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [field]: value
      }
    }));
  };

  const getInlineValue = (item: StaffMember, field: keyof StaffMember) => {
    if (inlineEdits[item.id] && inlineEdits[item.id][field] !== undefined) {
      return inlineEdits[item.id][field];
    }
    return item[field];
  };

  const handleAutoSave = async (staffId: string, updatedFields: Partial<StaffMember>) => {
    const originalStaff = staff.find(s => s.id === staffId);
    if (!originalStaff) return;

    const mergedEdits = {
      ...inlineEdits[staffId],
      ...updatedFields
    };

    const finalFields = {
      ...originalStaff,
      ...mergedEdits
    };

    let hasChanges = false;
    for (const key of Object.keys(updatedFields) as Array<keyof StaffMember>) {
      if (updatedFields[key] !== originalStaff[key]) {
        hasChanges = true;
        break;
      }
    }
    if (!hasChanges) return;

    try {
      const roleIdToSave = finalFields.role ? finalFields.role.id : null;
      const branchIdsToSave = finalFields.branches.map(b => b.id);

      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/staff/${staffId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalFields.name,
          email: finalFields.email,
          phone: finalFields.phone,
          sex: finalFields.sex,
          baseSalary: finalFields.baseSalary,
          roleId: roleIdToSave,
          status: finalFields.status,
          note: finalFields.note,
          branchIds: branchIdsToSave
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Không thể tự động lưu");
      }

      await fetchStaffDataOnly();
      setInlineEdits(prev => {
        const next = { ...prev };
        delete next[staffId];
        return next;
      });
    } catch (err: any) {
      alert(`Lưu tự động thất bại: ${err.message}`);
      fetchStaffDataOnly();
    }
  };

  const fetchStaffDataOnly = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/staff`);
      if (res.ok) {
        const staffData = await res.json();
        setStaff(staffData);
      }
    } catch (e) {
      console.warn("Failed silent fetch staff", e);
    }
  };

  // 3. FULL MODAL OPERATIONS
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setSelectedStaffId(null);
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setSex("Nam");
    setRoleId(roles[0]?.id || "");
    setBaseSalary("0");
    setStatus("ACTIVE");
    setSelectedBranchIds(branches.length > 0 ? [branches[0].id] : []);
    setNote("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: StaffMember) => {
    setModalMode("edit");
    setSelectedStaffId(item.id);
    setName(item.name);
    setEmail(item.email);
    setPassword("");
    setPhone(item.phone || "");
    setSex(item.sex || "Nam");
    setRoleId(item.role ? item.role.id : "");
    setBaseSalary(String(item.baseSalary));
    setStatus(item.status);
    setSelectedBranchIds(item.branches.map(b => b.id));
    setNote(item.note || "");
    setIsModalOpen(true);
  };

  const handleModalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Email không đúng định dạng!");
      return;
    }

    const payload = {
      name,
      email,
      password: password.trim() ? password : undefined,
      phone,
      sex,
      baseSalary: parseInt(baseSalary.replace(/\D/g, ""), 10) || 0,
      roleId: roleId || null,
      status,
      branchIds: selectedBranchIds,
      note
    };

    try {
      let res;
      if (modalMode === "create") {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/staff`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/staff/${selectedStaffId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi khi lưu tài khoản nhân sự");
      }

      setIsModalOpen(false);
      await fetchStaffAndRoles();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản nhân viên này khỏi hệ thống?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/staff/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Lỗi khi xóa nhân viên");

      await fetchStaffAndRoles();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBranchCheckboxChange = (branchId: string) => {
    setSelectedBranchIds(prev => 
      prev.includes(branchId) 
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    );
  };

  // 4. DYNAMIC ROLES & PERMISSIONS OPERATIONS
  const handlePermissionCheckboxChange = (permissionId: string) => {
    const activeRole = roles.find(r => r.id === selectedRoleId);
    if (activeRole && activeRole.name.toUpperCase() === "ADMIN") {
      alert("Quyền hạn của chức vụ Admin là tối cao và không thể thay đổi.");
      return;
    }

    setAssignedPermissionIds(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSavingPermissions(true);
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/roles/${selectedRoleId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissionIds: assignedPermissionIds
        })
      });

      if (!res.ok) throw new Error("Không thể cập nhật phân quyền chức vụ");
      
      alert("Cập nhật phân quyền chức vụ thành công!");
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi");
    } finally {
      setSavingPermissions(false);
    }
  };

  // Create Custom Role
  const handleOpenRoleModal = (mode: "create" | "edit") => {
    setRoleModalMode(mode);
    if (mode === "create") {
      setRoleName("");
      setRoleDescription("");
    } else {
      const activeRole = roles.find(r => r.id === selectedRoleId);
      if (!activeRole) return;
      const isBuiltin = ["ADMIN", "MANAGER", "CASHIER", "EMPLOYEE"].includes(activeRole.name.toUpperCase());
      if (isBuiltin) {
        alert("Không thể sửa đổi thông tin của chức vụ hệ thống mặc định.");
        return;
      }
      setRoleName(activeRole.name);
      setRoleDescription(activeRole.description || "");
    }
    setIsRoleModalOpen(true);
  };

  const handleRoleModalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    setSavingRole(true);

    const payload = {
      name: roleName,
      description: roleDescription
    };

    try {
      let res;
      if (roleModalMode === "create") {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/roles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/roles/${selectedRoleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi khi lưu chức vụ");
      }

      const roleResult = await res.json();
      setIsRoleModalOpen(false);
      await fetchStaffAndRoles();
      if (roleModalMode === "create") {
        setSelectedRoleId(roleResult.id);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRoleId) return;
    const activeRole = roles.find(r => r.id === selectedRoleId);
    if (!activeRole) return;

    const isBuiltin = ["ADMIN", "MANAGER", "CASHIER", "EMPLOYEE"].includes(activeRole.name.toUpperCase());
    if (isBuiltin) {
      alert("Không thể xóa các chức vụ mặc định của hệ thống.");
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa chức vụ "${activeRole.name}"? Chức năng này không thể hoàn tác.`)) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/roles/${selectedRoleId}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Lỗi khi xóa vai trò");
      }

      setSelectedRoleId(roles[0]?.id || null);
      await fetchStaffAndRoles();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 5. DAILY TURNS LOGIC
  const handleAssignTurn = async (staffId: string, turnType: "walkin" | "booked") => {
    if (!currentTenantId || !currentBranchId) return;
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/daily-turns/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, turnType })
      });

      if (!res.ok) throw new Error("Không thể thực hiện gán lượt");
      
      // Reload turns queue
      await fetchDailyTurns(true);
    } catch (e: any) {
      alert(e.message || "Lỗi gán lượt");
    }
  };

  const handleResetTurns = async () => {
    if (!currentTenantId || !currentBranchId) return;
    if (!confirm("Bạn có chắc chắn muốn RESET toàn bộ lượt nhận khách hôm nay về 0?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/daily-turns/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) throw new Error();

      alert("Khởi tạo lại lượt xoay tua hôm nay thành công!");
      await fetchDailyTurns();
    } catch (e) {
      alert("Reset lượt xoay tua thất bại");
    }
  };

  const handleInlineTurnChange = (staffId: string, field: "walkin" | "booked", valueStr: string) => {
    const val = parseInt(valueStr.replace(/\D/g, ""), 10) || 0;
    
    // Get current values
    const turn = dailyTurns.find(t => t.staffId === staffId);
    if (!turn) return;

    const currentLocal = turnEdits[staffId] || {
      walkin: turn.totalWalkinCount,
      booked: turn.totalBookedCount
    };

    setTurnEdits(prev => ({
      ...prev,
      [staffId]: {
        ...currentLocal,
        [field]: val
      }
    }));
  };

  const getInlineTurnValue = (turn: DailyTurn, field: "walkin" | "booked"): number => {
    if (turnEdits[turn.staffId] && turnEdits[turn.staffId][field] !== undefined) {
      return turnEdits[turn.staffId][field];
    }
    return field === "walkin" ? turn.totalWalkinCount : turn.totalBookedCount;
  };

  const handleAutoSaveTurn = async (staffId: string, field: "walkin" | "booked") => {
    const turn = dailyTurns.find(t => t.staffId === staffId);
    if (!turn) return;

    const edits = turnEdits[staffId];
    if (!edits) return;

    // Check if changed
    const originalVal = field === "walkin" ? turn.totalWalkinCount : turn.totalBookedCount;
    const currentVal = edits[field];
    if (originalVal === currentVal) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/daily-turns/${staffId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalWalkinCount: edits.walkin,
          totalBookedCount: edits.booked
        })
      });

      if (!res.ok) throw new Error("Không thể cập nhật lượt thủ công");

      await fetchDailyTurns(true);
      // Clear edits cache
      setTurnEdits(prev => {
        const next = { ...prev };
        delete next[staffId];
        return next;
      });
    } catch (e: any) {
      alert(e.message);
      await fetchDailyTurns(true);
    }
  };

  // Add staff cover to daily turns queue
  const handleOpenAddStaffToQueue = () => {
    // Filter staff members gán chi nhánh này nhưng chưa có trong dailyTurns
    const inQueueIds = dailyTurns.map(t => t.staffId);
    const availableStaff = staff.filter(s => 
      s.branches.some(b => b.id === currentBranchId) && 
      !inQueueIds.includes(s.id)
    );

    if (availableStaff.length === 0) {
      alert("Toàn bộ nhân sự chi nhánh đã có mặt trong hàng đợi hôm nay.");
      return;
    }

    setStaffToAddId(availableStaff[0].id);
    setIsAddStaffToQueueOpen(true);
  };

  const handleAddStaffToQueueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffToAddId) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/daily-turns/add-staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: staffToAddId })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Lỗi khi thêm thợ");
      }

      setIsAddStaffToQueueOpen(false);
      await fetchDailyTurns();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 6. STYLE HELPER METHODS
  const getRoleColorStyle = (roleName: string) => {
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

  const getStatusColorStyle = (status: string) => {
    if (status === "ACTIVE") {
      return { backgroundColor: "var(--color-success-light)", color: "var(--color-success)", border: "none" };
    }
    return { backgroundColor: "var(--color-danger-light)", color: "var(--color-danger)", border: "none" };
  };

  // Filter staff based on search query
  const filteredStaff = staff.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.phone && item.phone.includes(searchTerm)) ||
    (item.role && item.role.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group system permissions by groupName
  const groupedPermissions: Record<string, SystemPermission[]> = {};
  permissions.forEach(p => {
    if (!groupedPermissions[p.groupName]) {
      groupedPermissions[p.groupName] = [];
    }
    groupedPermissions[p.groupName].push(p);
  });

  // Calculate staff list gán chi nhánh này chưa có trong turns queue
  const inQueueIds = dailyTurns.map(t => t.staffId);
  const queueAddableStaff = staff.filter(s => 
    s.branches.some(b => b.id === currentBranchId) && 
    !inQueueIds.includes(s.id)
  );

  return (
    <>
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Navigation Tabs Header */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", paddingBottom: "2px", gap: "8px" }}>
          <button
            onClick={() => setActiveTab("staff")}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              background: "none",
              border: "none",
              borderBottom: activeTab === "staff" ? "3px solid var(--color-primary)" : "3px solid transparent",
              color: activeTab === "staff" ? "var(--color-primary)" : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            <Users size={16} /> Danh sách nhân viên
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              background: "none",
              border: "none",
              borderBottom: activeTab === "permissions" ? "3px solid var(--color-primary)" : "3px solid transparent",
              color: activeTab === "permissions" ? "var(--color-primary)" : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            <Shield size={16} /> Chức vụ & Phân quyền động
          </button>
          <button
            onClick={() => setActiveTab("turns")}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              background: "none",
              border: "none",
              borderBottom: activeTab === "turns" ? "3px solid var(--color-primary)" : "3px solid transparent",
              color: activeTab === "turns" ? "var(--color-primary)" : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            <RefreshCw size={16} /> Xoay tua thợ hôm nay
          </button>
        </div>

        {/* LOADING & GENERAL ERROR STATE */}
        {loading && activeTab !== "turns" ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
            <Loader2 className="animate-spin" size={36} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : error ? (
          <div className="card" style={{ borderLeft: "4px solid var(--color-danger)", background: "var(--color-danger-light)" }}>
            <h3 style={{ color: "var(--color-danger)", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <Info size={16} /> Lỗi nạp dữ liệu
            </h3>
            <p style={{ color: "var(--color-danger)", fontSize: "13px", marginTop: "4px" }}>{error}</p>
          </div>
        ) : (
          <>
            {/* VIEW TAB 1: STAFF LIST */}
            {activeTab === "staff" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Search Bar & Action Button */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
                    <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                      className="form-input"
                      type="text"
                      placeholder="Tìm kiếm nhân viên (Tên, SĐT, Chức vụ)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: "36px" }}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                    <Plus size={18} /> Thêm nhân viên mới
                  </button>
                </div>

                {filteredStaff.length === 0 ? (
                  <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
                    <Users size={48} style={{ color: "var(--text-muted)", marginBottom: "16px", marginInline: "auto" }} />
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Không tìm thấy nhân viên</h3>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
                      {searchTerm ? "Không tìm thấy kết quả phù hợp với từ khóa." : "Salon của bạn hiện chưa có nhân viên nào."}
                    </p>
                    {!searchTerm && (
                      <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                        <Plus size={18} /> Thêm nhân viên ngay
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div className="data-table-container" style={{ border: "none", boxShadow: "none", borderRadius: 0 }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ padding: "12px 16px", fontSize: "13px", width: "220px" }}>Họ tên nhân viên</th>
                            <th style={{ padding: "12px 16px", fontSize: "13px", width: "150px" }}>Số điện thoại</th>
                            <th style={{ padding: "12px 16px", fontSize: "13px", width: "200px" }}>Email</th>
                            <th style={{ padding: "12px 16px", fontSize: "13px", width: "150px" }}>Chức vụ</th>
                            <th style={{ padding: "12px 16px", fontSize: "13px", width: "150px", textAlign: "center" }}>Lương cơ bản</th>
                            <th style={{ padding: "12px 16px", fontSize: "13px", minWidth: "220px" }}>Chi nhánh hoạt động</th>
                            <th style={{ padding: "12px 16px", fontSize: "13px", width: "140px" }}>Trạng thái</th>
                            <th style={{ padding: "12px 16px", fontSize: "13px", width: "120px", textAlign: "center" }}>Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStaff.map((item) => {
                            const inlineRoleVal = getInlineValue(item, "role") as { id: string; name: string } | null;
                            const inlineStatusVal = getInlineValue(item, "status") as string;

                            return (
                              <tr key={item.id}>
                                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                                  <ExcelInput
                                    value={getInlineValue(item, "name") as string}
                                    onChange={(val) => handleInlineChange(item.id, "name", val)}
                                    onBlur={() => handleAutoSave(item.id, { name: getInlineValue(item, "name") as string })}
                                    fontWeight="600"
                                  />
                                </td>
                                
                                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                                  <ExcelInput
                                    value={getInlineValue(item, "phone") as string}
                                    onChange={(val) => handleInlineChange(item.id, "phone", val)}
                                    onBlur={() => handleAutoSave(item.id, { phone: getInlineValue(item, "phone") as string })}
                                  />
                                </td>

                                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                                  <ExcelInput
                                    value={getInlineValue(item, "email") as string}
                                    onChange={(val) => handleInlineChange(item.id, "email", val)}
                                    onBlur={() => handleAutoSave(item.id, { email: getInlineValue(item, "email") as string })}
                                  />
                                </td>

                                <td style={{ padding: "3px 6px", verticalAlign: "middle", height: "38px" }}>
                                  <ExcelSelect
                                    value={inlineRoleVal ? inlineRoleVal.id : ""}
                                    onChange={(newRoleId) => {
                                      const foundRole = roles.find(r => r.id === newRoleId);
                                      const nextRoleObj = foundRole ? { id: foundRole.id, name: foundRole.name } : null;
                                      handleInlineChange(item.id, "role", nextRoleObj);
                                      handleAutoSave(item.id, { role: nextRoleObj });
                                    }}
                                    options={roles.map(r => ({ value: r.id, label: r.name }))}
                                    colorStyle={getRoleColorStyle(inlineRoleVal ? inlineRoleVal.name : "Employee")}
                                    placeholder="-- Chọn vai trò --"
                                  />
                                </td>

                                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                                  <ExcelInput
                                    value={formatNumber(getInlineValue(item, "baseSalary") as number | string)}
                                    onChange={(val) => handleSalaryChange(item.id, val)}
                                    onBlur={() => handleAutoSave(item.id, { baseSalary: getInlineValue(item, "baseSalary") as number })}
                                    textAlign="center"
                                    fontWeight="500"
                                    unit="đ"
                                  />
                                </td>

                                <td 
                                  style={{ padding: "0 16px", verticalAlign: "middle", height: "38px", cursor: "pointer" }}
                                  onClick={() => handleOpenEditModal(item)}
                                  title="Click để thay đổi chi nhánh hoạt động"
                                >
                                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                                    {item.branches.length === 0 ? (
                                      <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
                                        Chưa gán chi nhánh
                                      </span>
                                    ) : (
                                      item.branches.map(b => (
                                        <span 
                                          key={b.id} 
                                          style={{
                                            fontSize: "11px",
                                            padding: "2px 8px",
                                            borderRadius: "4px",
                                            background: "#f1f5f9",
                                            color: "#475569",
                                            border: "1px solid #e2e8f0"
                                          }}
                                        >
                                          {b.name.replace(/HairStar|BarberShop| - Chi nhánh/g, "").trim()}
                                        </span>
                                      ))
                                    )}
                                  </div>
                                </td>

                                <td style={{ padding: "3px 6px", verticalAlign: "middle", height: "38px" }}>
                                  <ExcelSelect
                                    value={inlineStatusVal}
                                    onChange={(newStatus) => {
                                      handleInlineChange(item.id, "status", newStatus);
                                      handleAutoSave(item.id, { status: newStatus });
                                    }}
                                    options={[
                                      { value: "ACTIVE", label: "Hoạt động" },
                                      { value: "INACTIVE", label: "Tạm khóa" }
                                    ]}
                                    colorStyle={getStatusColorStyle(inlineStatusVal)}
                                  />
                                </td>

                                <td style={{ padding: "0 8px", verticalAlign: "middle", height: "38px" }}>
                                  <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                                    <button
                                      className="btn btn-secondary"
                                      style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "var(--radius-sm)" }}
                                      onClick={() => handleOpenEditModal(item)}
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button
                                      className="btn btn-danger"
                                      style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "var(--radius-sm)" }}
                                      onClick={() => handleDeleteStaff(item.id)}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW TAB 2: DYNAMIC ROLES & PERMISSIONS */}
            {activeTab === "permissions" && (
              <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "24px" }}>
                
                {/* Left Panel: Role List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                        Danh sách vai trò
                      </span>
                      <button 
                        onClick={() => handleOpenRoleModal("create")}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "2px", fontSize: "12px", fontWeight: "600" }}
                      >
                        <Plus size={14} /> Thêm
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {roles.map(role => {
                        const isSelected = selectedRoleId === role.id;
                        const isBuiltin = ["ADMIN", "MANAGER", "CASHIER", "EMPLOYEE"].includes(role.name.toUpperCase());
                        return (
                          <div
                            key={role.id}
                            onClick={() => setSelectedRoleId(role.id)}
                            style={{
                              padding: "10px 14px",
                              borderRadius: "var(--radius-sm)",
                              backgroundColor: isSelected ? "var(--color-primary-light)" : "transparent",
                              border: isSelected ? "1px solid var(--color-primary)" : "1px solid var(--border-color)",
                              cursor: "pointer",
                              transition: "all 0.15s",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span style={{ fontSize: "13px", fontWeight: "600", color: isSelected ? "var(--color-primary)" : "var(--text-primary)" }}>
                                {role.name}
                              </span>
                              {role.description && (
                                <span style={{ fontSize: "11px", color: "var(--text-muted)", lineClamp: 1 }}>
                                  {role.description}
                                </span>
                              )}
                            </div>
                            
                            {isSelected && !isBuiltin && (
                              <div style={{ display: "flex", gap: "4px" }} onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => handleOpenRoleModal("edit")}
                                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "2px" }}
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button 
                                  onClick={handleDeleteRole}
                                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-danger)", padding: "2px" }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Panel: Permissions Setup Matrix */}
                <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "14px" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: "700" }}>
                        Thiết lập phân quyền chức vụ: <span style={{ color: "var(--color-primary)" }}>{roles.find(r => r.id === selectedRoleId)?.name || "Chức vụ"}</span>
                      </h3>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {roles.find(r => r.id === selectedRoleId)?.description || "Gán và cấu hình các quyền hạn nghiệp vụ cho chức vụ."}
                      </p>
                    </div>

                    <button 
                      className="btn btn-primary" 
                      onClick={handleSavePermissions}
                      disabled={savingPermissions || permissionsLoading}
                      style={{ minWidth: "150px" }}
                    >
                      {savingPermissions ? (
                        <>
                          <Loader2 className="animate-spin" size={16} /> Đang lưu...
                        </>
                      ) : (
                        <>
                          <Check size={16} /> Lưu phân quyền
                        </>
                      )}
                    </button>
                  </div>

                  {permissionsLoading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                      <Loader2 className="animate-spin" size={28} style={{ color: "var(--color-primary)" }} />
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                      {Object.keys(groupedPermissions).map(group => {
                        const isSystemAdminRole = roles.find(r => r.id === selectedRoleId)?.name.toUpperCase() === "ADMIN";
                        return (
                          <div key={group} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <h4 style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)", letterSpacing: "0.5px", textTransform: "uppercase", borderLeft: "3px solid var(--color-primary)", paddingLeft: "8px" }}>
                              Nghiệp vụ {group}
                            </h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                              {groupedPermissions[group].map(perm => {
                                const isChecked = isSystemAdminRole || assignedPermissionIds.includes(perm.id);
                                return (
                                  <label 
                                    key={perm.id}
                                    style={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: "10px",
                                      padding: "12px",
                                      border: "1px solid var(--border-color)",
                                      borderRadius: "var(--radius-sm)",
                                      cursor: isSystemAdminRole ? "not-allowed" : "pointer",
                                      backgroundColor: isChecked ? "var(--color-primary-light)" : "transparent",
                                      borderColor: isChecked ? "var(--border-focus)" : "var(--border-color)",
                                      transition: "all 0.15s"
                                    }}
                                  >
                                    <input 
                                      type="checkbox"
                                      checked={isChecked}
                                      disabled={isSystemAdminRole}
                                      onChange={() => handlePermissionCheckboxChange(perm.id)}
                                      style={{ marginTop: "3px", width: "16px", height: "16px" }}
                                    />
                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
                                        {perm.name}
                                      </span>
                                      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                                        {perm.description || "Chưa có mô tả chi tiết."}
                                      </span>
                                      <code style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", display: "inline-block" }}>
                                        {perm.slug}
                                      </code>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW TAB 3: DAILY TURNS QUEUE */}
            {activeTab === "turns" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Control Action buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                      Lịch xếp khách xoay tua hôm nay tại: <strong>{branches.find(b => b.id === currentBranchId)?.name || "Chi nhánh"}</strong>
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn btn-secondary" onClick={handleOpenAddStaffToQueue}>
                      <UserPlus size={16} /> Thêm thợ ngoài ca
                    </button>
                    <button className="btn btn-danger" onClick={handleResetTurns}>
                      <RefreshCw size={16} /> Reset Hàng Đợi
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                    <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
                  </div>
                ) : dailyTurns.length === 0 ? (
                  <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
                    <Info size={40} style={{ color: "var(--text-muted)", marginBottom: "12px", marginInline: "auto" }} />
                    <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "4px" }}>Hàng đợi xoay tua trống</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "16px" }}>
                      Hôm nay không có nhân viên nào có lịch trực ca hoạt động tại chi nhánh này.
                    </p>
                    <button className="btn btn-primary" onClick={handleOpenAddStaffToQueue}>
                      <UserPlus size={16} /> Thêm nhân viên vào hàng đợi
                    </button>
                  </div>
                ) : (
                  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div className="data-table-container" style={{ border: "none", boxShadow: "none", borderRadius: 0 }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ padding: "12px 16px", fontSize: "13px", width: "100px", textAlign: "center" }}>Số TT</th>
                            <th style={{ padding: "12px 16px", fontSize: "13px", width: "240px" }}>Tên thợ</th>
                            <th style={{ padding: "12px 16px", fontSize: "13px", width: "140px" }}>Chức danh</th>
                            <th style={{ padding: "12px 16px", fontSize: "13px", width: "150px", textAlign: "center" }}>Lượt Walk-in</th>
                            <th style={{ padding: "12px 16px", fontSize: "13px", width: "150px", textAlign: "center" }}>Lượt Chỉ định (Booked)</th>
                            <th style={{ padding: "12px 16px", fontSize: "13px", width: "150px", textAlign: "center" }}>Tổng số khách</th>
                            <th style={{ padding: "12px 16px", fontSize: "13px", width: "200px" }}>Lần gán khách cuối</th>
                            <th style={{ padding: "12px 16px", fontSize: "13px", width: "240px", textAlign: "center" }}>Gán khách nhanh</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyTurns.map((turn, index) => {
                            const isNext = index === 0; // First in queue gets "Lượt tiếp theo" highlight
                            const formatTime = (timeStr: string | null) => {
                              if (!timeStr) return "Chưa gán khách";
                              const d = new Date(timeStr);
                              return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                            };

                            return (
                              <tr 
                                key={turn.id}
                                style={{
                                  backgroundColor: isNext ? "var(--color-primary-light)" : "inherit"
                                }}
                              >
                                {/* 1. Queue Number / Order */}
                                <td style={{ padding: "12px 16px", verticalAlign: "middle", textAlign: "center", fontWeight: "700" }}>
                                  {isNext ? (
                                    <span 
                                      className="badge badge-primary" 
                                      style={{ 
                                        fontWeight: "800", 
                                        padding: "4px 10px", 
                                        display: "inline-flex", 
                                        gap: "4px",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                                      }}
                                    >
                                      <Award size={12} /> Số 1
                                    </span>
                                  ) : (
                                    <span style={{ color: "var(--text-secondary)" }}>Số {turn.queueNumber}</span>
                                  )}
                                </td>

                                {/* 2. Staff Name */}
                                <td style={{ padding: "12px 16px", verticalAlign: "middle", fontWeight: "600" }}>
                                  {turn.staffName}
                                  {isNext && (
                                    <span style={{ display: "block", fontSize: "10px", color: "var(--color-primary)", fontWeight: "600", marginTop: "2px" }}>
                                      ★ Lượt tiếp theo nhận khách
                                    </span>
                                  )}
                                </td>

                                {/* 3. Role */}
                                <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                                  <span className="badge badge-secondary" style={{ backgroundColor: "#f1f5f9", color: "#475569" }}>
                                    {turn.role}
                                  </span>
                                </td>

                                {/* 4. Walk-in turns (inline excel inputs) */}
                                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                                  <ExcelInput
                                    type="number"
                                    value={getInlineTurnValue(turn, "walkin")}
                                    onChange={(val) => handleInlineTurnChange(turn.staffId, "walkin", val)}
                                    onBlur={() => handleAutoSaveTurn(turn.staffId, "walkin")}
                                    textAlign="center"
                                    fontWeight="600"
                                  />
                                </td>

                                {/* 5. Booked turns (inline excel inputs) */}
                                <td style={{ padding: 0, verticalAlign: "middle", height: "38px" }}>
                                  <ExcelInput
                                    type="number"
                                    value={getInlineTurnValue(turn, "booked")}
                                    onChange={(val) => handleInlineTurnChange(turn.staffId, "booked", val)}
                                    onBlur={() => handleAutoSaveTurn(turn.staffId, "booked")}
                                    textAlign="center"
                                    fontWeight="600"
                                  />
                                </td>

                                {/* 6. Total served */}
                                <td style={{ padding: "12px 16px", verticalAlign: "middle", textAlign: "center", fontWeight: "700", fontSize: "14px" }}>
                                  {turn.totalCustomersToday}
                                </td>

                                {/* 7. Last assigned at time */}
                                <td style={{ padding: "12px 16px", verticalAlign: "middle", color: "var(--text-secondary)", fontSize: "13px" }}>
                                  {formatTime(turn.lastAssignedAt)}
                                </td>

                                {/* 8. Quick Assign Buttons */}
                                <td style={{ padding: "4px 8px", verticalAlign: "middle" }}>
                                  <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                    <button
                                      className="btn btn-primary"
                                      style={{ 
                                        padding: "4px 10px", 
                                        fontSize: "11px", 
                                        borderRadius: "var(--radius-sm)",
                                        backgroundColor: isNext ? "var(--color-primary)" : "#64748b" 
                                      }}
                                      onClick={() => handleAssignTurn(turn.staffId, "walkin")}
                                      title="Nhận khách vãng lai (Tăng lượt + Đẩy xuống hàng đợi)"
                                    >
                                      <Play size={10} /> Khách Walk-in
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      style={{ padding: "4px 10px", fontSize: "11px", borderRadius: "var(--radius-sm)" }}
                                      onClick={() => handleAssignTurn(turn.staffId, "booked")}
                                      title="Nhận khách đặt trước chỉ định (Tăng lượt chỉ định)"
                                    >
                                      Đặt trước (Chỉ định)
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Queue guidelines explanation */}
                <div className="card" style={{ display: "flex", gap: "12px", alignItems: "flex-start", backgroundColor: "var(--color-primary-light)", border: "1px solid var(--border-focus)" }}>
                  <HelpCircle size={20} style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-primary)" }}>
                      Quy tắc vận hành xoay tua thợ:
                    </h4>
                    <ol style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px", paddingLeft: "16px" }}>
                      <li>Thợ có số lượt làm khách Walk-in ít nhất trong ngày được ưu tiên đứng lên đầu hàng đợi.</li>
                      <li>Trong trường hợp số lượt bằng nhau, thợ có thời gian gán khách lâu hơn (hoặc chưa làm khách nào) sẽ được xếp lên trước.</li>
                      <li>Khi một thợ được bấm <strong>Nhận khách Walk-in</strong>, hệ thống tự động tăng lượt Walk-in của thợ đó và đẩy họ xuống vị trí cuối hàng đợi một cách công bằng.</li>
                      <li>Khi thợ được gán khách đặt lịch có chỉ định đích danh (Booked), bấm **Đặt trước (Chỉ định)** để cộng lượt chỉ định mà không làm thay đổi thứ tự xếp hàng Walk-in.</li>
                    </ol>
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </div>

      {/* Creation & Editing Staff Modal */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "600px", position: "relative", maxHeight: "90vh", overflowY: "auto", padding: "28px" }}>
            <button 
              style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
              onClick={() => setIsModalOpen(false)}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              {modalMode === "create" ? (
                <>
                  <Users size={20} style={{ color: "var(--color-primary)" }} /> Thêm nhân viên mới
                </>
              ) : (
                <>
                  <Edit2 size={20} style={{ color: "var(--color-primary)" }} /> Chỉnh sửa tài khoản nhân sự
                </>
              )}
            </h2>

            <form onSubmit={handleModalSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Họ và tên nhân viên *</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    required 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email liên hệ *</label>
                  <input 
                    className="form-input" 
                    type="email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ví dụ: email@gmail.com"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Mật khẩu {modalMode === "create" ? "*" : "(để trống nếu giữ nguyên)"}</label>
                  <input 
                    className="form-input" 
                    type="password" 
                    required={modalMode === "create"}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={modalMode === "create" ? "Nhập mật khẩu" : "••••••••"}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Số điện thoại</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ví dụ: 0901234567"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Giới tính</label>
                  <select 
                    className="form-input"
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Chức vụ (Phân quyền)</label>
                  <select 
                    className="form-input"
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                  >
                    <option value="">-- Chọn vai trò --</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Mức lương cơ bản (VND)</label>
                  <PriceInputWithSuggestion
                    value={formatNumber(baseSalary)}
                    onChange={(val) => setBaseSalary(val)}
                    placeholder="Ví dụ: 8,000,000"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Trạng thái tài khoản</label>
                  <select 
                    className="form-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="ACTIVE">Hoạt động (Active)</option>
                    <option value="INACTIVE">Tạm khóa (Inactive)</option>
                  </select>
                </div>
              </div>

              {/* Chi nhánh hoạt động checkboxes */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Chi nhánh hoạt động (Được chọn nhiều)</label>
                <div 
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", 
                    gap: "10px", 
                    maxHeight: "150px", 
                    overflowY: "auto",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px",
                    background: "#f8fafc"
                  }}
                >
                  {branchList.length === 0 ? (
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
                      Chưa có chi nhánh nào được tạo
                    </span>
                  ) : (
                    branchList.map(b => {
                      const isChecked = selectedBranchIds.includes(b.id);
                      return (
                        <label 
                          key={b.id} 
                          style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px", 
                            fontSize: "13px", 
                            cursor: "pointer", 
                            userSelect: "none",
                            fontWeight: isChecked ? "600" : "400",
                            color: isChecked ? "var(--color-primary)" : "var(--text-primary)"
                          }}
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleBranchCheckboxChange(b.id)}
                            style={{ 
                              width: "16px", 
                              height: "16px",
                              cursor: "pointer"
                            }}
                          />
                          <span>{b.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ghi chú thêm</label>
                <textarea 
                  className="form-input"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú hoặc thông tin bổ sung về nhân sự..."
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: "120px" }}>
                  Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Role creation/editing modal */}
      {isRoleModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1001
        }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "420px", position: "relative", padding: "24px" }}>
            <button 
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
              onClick={() => setIsRoleModalOpen(false)}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Key size={18} style={{ color: "var(--color-primary)" }} />
              {roleModalMode === "create" ? "Thêm vai trò chức vụ mới" : "Chỉnh sửa vai trò"}
            </h2>

            <form onSubmit={handleRoleModalSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tên vai trò *</label>
                <input 
                  className="form-input" 
                  type="text" 
                  required 
                  value={roleName} 
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Ví dụ: Stylist Trưởng"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mô tả chức năng</label>
                <textarea 
                  className="form-input"
                  rows={3}
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Mô tả tóm tắt quyền hạn/công việc của vai trò..."
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsRoleModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingRole}>
                  {savingRole ? "Đang lưu..." : "Lưu chức vụ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Staff to Daily Turns Queue Modal */}
      {isAddStaffToQueueOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1002
        }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "420px", position: "relative", padding: "24px" }}>
            <button 
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
              onClick={() => setIsAddStaffToQueueOpen(false)}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <UserPlus size={18} style={{ color: "var(--color-primary)" }} />
              Thêm thợ vào hàng đợi hôm nay
            </h2>

            <form onSubmit={handleAddStaffToQueueSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Chọn nhân viên gán chi nhánh này</label>
                <select 
                  className="form-input"
                  value={staffToAddId}
                  onChange={(e) => setStaffToAddId(e.target.value)}
                >
                  {queueAddableStaff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role ? s.role.name : "Thợ"})
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Chỉ hiển thị các nhân sự thuộc chi nhánh hiện tại nhưng chưa có mặt trong hàng đợi.
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddStaffToQueueOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Thêm thợ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
