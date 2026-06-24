import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { Users, Shield, RefreshCw, Info, Loader2 } from "lucide-react";
import { Role, Branch, StaffMember, SystemPermission, DailyTurn } from "./types";
import { StaffTable } from "./StaffTable";
import { RolePermissionPanel } from "./RolePermissionPanel";
import { DailyTurnsTable } from "./DailyTurnsTable";
import { StaffFormModal } from "./StaffFormModal";
import { RoleModal } from "./RoleModal";
import { AddStaffToQueueModal } from "./AddStaffToQueueModal";

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

  // Role Permission Assignment States
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [assignedPermissionIds, setAssignedPermissionIds] = useState<string[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Custom Role Modal States
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState<"create" | "edit">("create");

  // Manual Add Staff to Queue Modal State
  const [isAddStaffToQueueOpen, setIsAddStaffToQueueOpen] = useState(false);

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
        fetch(`http://localhost:3000/api/tenants/${currentTenantId}/permissions`),
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
    setInlineEdits((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [field]: value,
      },
    }));
  };

  const getInlineValue = (item: StaffMember, field: keyof StaffMember) => {
    if (inlineEdits[item.id] && inlineEdits[item.id][field] !== undefined) {
      return inlineEdits[item.id][field];
    }
    return item[field];
  };

  const handleAutoSave = async (staffId: string, updatedFields: Partial<StaffMember>) => {
    const originalStaff = staff.find((s) => s.id === staffId);
    if (!originalStaff) return;

    const mergedEdits = {
      ...inlineEdits[staffId],
      ...updatedFields,
    };

    const finalFields = {
      ...originalStaff,
      ...mergedEdits,
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
      const branchIdsToSave = finalFields.branches.map((b) => b.id);

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
          branchIds: branchIdsToSave,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Không thể tự động lưu");
      }

      await fetchStaffDataOnly();
      setInlineEdits((prev) => {
        const next = { ...prev };
        delete next[staffId];
        return next;
      });
    } catch (err: any) {
      alert(`Lưu tự động thất bại: ${err.message}`);
      await fetchStaffDataOnly();
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
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: StaffMember) => {
    setModalMode("edit");
    setSelectedStaffId(item.id);
    setIsModalOpen(true);
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản nhân viên này khỏi hệ thống?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/staff/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Lỗi khi xóa nhân viên");

      await fetchStaffAndRoles();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 4. DYNAMIC ROLES & PERMISSIONS OPERATIONS
  const handlePermissionCheckboxChange = (permissionId: string) => {
    const activeRole = roles.find((r) => r.id === selectedRoleId);
    if (activeRole && activeRole.name.toUpperCase() === "ADMIN") {
      alert("Quyền hạn của chức vụ Admin là tối cao và không thể thay đổi.");
      return;
    }

    setAssignedPermissionIds((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId]
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
          permissionIds: assignedPermissionIds,
        }),
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
    if (mode === "edit") {
      const activeRole = roles.find((r) => r.id === selectedRoleId);
      if (!activeRole) return;
      const isBuiltin = ["ADMIN", "MANAGER", "CASHIER", "EMPLOYEE"].includes(activeRole.name.toUpperCase());
      if (isBuiltin) {
        alert("Không thể sửa đổi thông tin của chức vụ hệ thống mặc định.");
        return;
      }
    }
    setIsRoleModalOpen(true);
  };

  const handleDeleteRole = async () => {
    if (!selectedRoleId) return;
    const activeRole = roles.find((r) => r.id === selectedRoleId);
    if (!activeRole) return;

    const isBuiltin = ["ADMIN", "MANAGER", "CASHIER", "EMPLOYEE"].includes(activeRole.name.toUpperCase());
    if (isBuiltin) {
      alert("Không thể xóa các chức vụ mặc định của hệ thống.");
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa chức vụ "${activeRole.name}"? Chức năng này không thể hoàn tác.`)) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/roles/${selectedRoleId}`, {
        method: "DELETE",
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
      const res = await fetch(
        `http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/daily-turns/assign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffId, turnType }),
        }
      );

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
      const res = await fetch(
        `http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/daily-turns/reset`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

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
    const turn = dailyTurns.find((t) => t.staffId === staffId);
    if (!turn) return;

    const currentLocal = turnEdits[staffId] || {
      walkin: turn.totalWalkinCount,
      booked: turn.totalBookedCount,
    };

    setTurnEdits((prev) => ({
      ...prev,
      [staffId]: {
        ...currentLocal,
        [field]: val,
      },
    }));
  };

  const getInlineTurnValue = (turn: DailyTurn, field: "walkin" | "booked"): number => {
    if (turnEdits[turn.staffId] && turnEdits[turn.staffId][field] !== undefined) {
      return turnEdits[turn.staffId][field];
    }
    return field === "walkin" ? turn.totalWalkinCount : turn.totalBookedCount;
  };

  const handleAutoSaveTurn = async (staffId: string, field: "walkin" | "booked") => {
    const turn = dailyTurns.find((t) => t.staffId === staffId);
    if (!turn) return;

    const edits = turnEdits[staffId];
    if (!edits) return;

    const originalVal = field === "walkin" ? turn.totalWalkinCount : turn.totalBookedCount;
    const currentVal = edits[field];
    if (originalVal === currentVal) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/tenants/${currentTenantId}/branches/${currentBranchId}/daily-turns/${staffId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            totalWalkinCount: edits.walkin,
            totalBookedCount: edits.booked,
          }),
        }
      );

      if (!res.ok) throw new Error("Không thể cập nhật lượt thủ công");

      await fetchDailyTurns(true);
      // Clear edits cache
      setTurnEdits((prev) => {
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
    const inQueueIds = dailyTurns.map((t) => t.staffId);
    const availableStaff = staff.filter(
      (s) => s.branches.some((b) => b.id === currentBranchId) && !inQueueIds.includes(s.id)
    );

    if (availableStaff.length === 0) {
      alert("Toàn bộ nhân sự chi nhánh đã có mặt trong hàng đợi hôm nay.");
      return;
    }

    setIsAddStaffToQueueOpen(true);
  };

  // Filter staff based on search query
  const filteredStaff = staff.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.phone && item.phone.includes(searchTerm)) ||
      (item.role && item.role.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate staff list gán chi nhánh này chưa có trong turns queue
  const inQueueIds = dailyTurns.map((t) => t.staffId);
  const queueAddableStaff = staff.filter(
    (s) => s.branches.some((b) => b.id === currentBranchId) && !inQueueIds.includes(s.id)
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
              transition: "all 0.2s",
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
              transition: "all 0.2s",
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
              transition: "all 0.2s",
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
            <h3
              style={{
                color: "var(--color-danger)",
                fontSize: "14px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Info size={16} /> Lỗi nạp dữ liệu
            </h3>
            <p style={{ color: "var(--color-danger)", fontSize: "13px", marginTop: "4px" }}>{error}</p>
          </div>
        ) : (
          <>
            {/* VIEW TAB 1: STAFF LIST */}
            {activeTab === "staff" && (
              <StaffTable
                filteredStaff={filteredStaff}
                roles={roles}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleOpenCreateModal={handleOpenCreateModal}
                handleOpenEditModal={handleOpenEditModal}
                handleDeleteStaff={handleDeleteStaff}
                inlineEdits={inlineEdits}
                handleInlineChange={handleInlineChange}
                handleSalaryChange={handleSalaryChange}
                handleAutoSave={handleAutoSave}
                getInlineValue={getInlineValue}
                formatNumber={formatNumber}
              />
            )}

            {/* VIEW TAB 2: DYNAMIC ROLES & PERMISSIONS */}
            {activeTab === "permissions" && (
              <RolePermissionPanel
                roles={roles}
                selectedRoleId={selectedRoleId}
                setSelectedRoleId={setSelectedRoleId}
                assignedPermissionIds={assignedPermissionIds}
                permissionsLoading={permissionsLoading}
                savingPermissions={savingPermissions}
                permissions={permissions}
                handleOpenRoleModal={handleOpenRoleModal}
                handleDeleteRole={handleDeleteRole}
                handlePermissionCheckboxChange={handlePermissionCheckboxChange}
                handleSavePermissions={handleSavePermissions}
              />
            )}

            {/* VIEW TAB 3: DAILY TURNS QUEUE */}
            {activeTab === "turns" && (
              <DailyTurnsTable
                dailyTurns={dailyTurns}
                loading={loading}
                branches={branches}
                currentBranchId={currentBranchId}
                handleOpenAddStaffToQueue={handleOpenAddStaffToQueue}
                handleResetTurns={handleResetTurns}
                handleAssignTurn={handleAssignTurn}
                handleInlineTurnChange={handleInlineTurnChange}
                handleAutoSaveTurn={handleAutoSaveTurn}
                getInlineTurnValue={getInlineTurnValue}
              />
            )}
          </>
        )}
      </div>

      {/* Creation & Editing Staff Modal */}
      <StaffFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        selectedStaffId={selectedStaffId}
        staff={staff}
        roles={roles}
        branchList={branchList}
        currentTenantId={currentTenantId}
        fetchStaffAndRoles={fetchStaffAndRoles}
      />

      {/* Custom Role creation/editing modal */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        mode={roleModalMode}
        selectedRoleId={selectedRoleId}
        roles={roles}
        currentTenantId={currentTenantId}
        fetchStaffAndRoles={fetchStaffAndRoles}
        onRoleCreated={(id) => setSelectedRoleId(id)}
      />

      {/* Manual Add Staff to Daily Turns Queue Modal */}
      <AddStaffToQueueModal
        isOpen={isAddStaffToQueueOpen}
        onClose={() => setIsAddStaffToQueueOpen(false)}
        queueAddableStaff={queueAddableStaff}
        currentTenantId={currentTenantId}
        currentBranchId={currentBranchId}
        fetchDailyTurns={fetchDailyTurns}
      />
    </>
  );
}
