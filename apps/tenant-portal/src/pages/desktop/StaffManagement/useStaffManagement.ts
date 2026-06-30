/**
 * useStaffManagement Hook (v2 — TanStack Query + Optimistic UI)
 * ---
 * Toàn bộ data fetching sử dụng useQuery() với cache stale-while-revalidate.
 * Mutations sử dụng useMutation() với Optimistic Updates.
 * Error feedback dùng useToast() thay vì alert().
 */

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/useAuthStore";
import { Role, Branch, StaffMember, SystemPermission, DailyTurn, getAdminUser } from "./types";
import { TargetField } from "../../../hooks/useImportWizard";
import { useFileDragAndDrop } from "../../../hooks/useFileDragAndDrop";
import { useConfirm } from "../../../components/desktop/ConfirmDialog";
import { useToast } from "../../../components/desktop/ToastProvider";
import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";

export function useStaffManagement() {
  const { currentTenantId, currentBranchId, branches } = useAuthStore();
  const confirm = useConfirm();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<"staff" | "permissions" | "turns">("staff");

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

  // Custom Role Modal States
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState<"create" | "edit">("create");

  // Manual Add Staff to Queue Modal State
  const [isAddStaffToQueueOpen, setIsAddStaffToQueueOpen] = useState(false);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  // Drag and Drop Hook
  const { isDragActive } = useFileDragAndDrop((file) => {
    if (activeTab === "staff") {
      setDroppedFile(file);
      setIsImportModalOpen(true);
    }
  });

  // ==========================================================
  // 1. DATA FETCHING WITH useQuery (stale-while-revalidate)
  // ==========================================================

  /** Fetch danh sách nhân viên */
  const {
    data: staff = [],
    isLoading: staffLoading,
    error: staffError,
  } = useQuery<StaffMember[]>({
    queryKey: queryKeys.staff.list(currentTenantId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/staff`),
    enabled: !!currentTenantId,
  });

  /** Fetch danh sách chức vụ (roles) */
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: queryKeys.roles.list(currentTenantId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/roles`),
    enabled: !!currentTenantId,
    // Auto-select role đầu tiên nếu chưa chọn
    select: (data) => {
      if (data.length > 0 && !selectedRoleId) {
        // Side-effect trong select: defer to next tick
        setTimeout(() => setSelectedRoleId((prev) => prev ?? data[0].id), 0);
      }
      return data;
    },
  });

  /** Fetch danh sách chi nhánh */
  const { data: branchList = [] } = useQuery<Branch[]>({
    queryKey: queryKeys.branches.list(currentTenantId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/branches`),
    enabled: !!currentTenantId,
  });

  /** Fetch danh sách quyền hệ thống */
  const { data: permissions = [] } = useQuery<SystemPermission[]>({
    queryKey: queryKeys.permissions.list(currentTenantId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/permissions`),
    enabled: !!currentTenantId,
  });

  /** Fetch xoay tua thợ theo chi nhánh */
  const { data: dailyTurns = [], isLoading: turnsLoading } = useQuery<DailyTurn[]>({
    queryKey: queryKeys.dailyTurns.list(currentTenantId!, currentBranchId!),
    queryFn: () =>
      api.get(`/tenants/${currentTenantId}/branches/${currentBranchId}/daily-turns`),
    enabled: !!currentTenantId && !!currentBranchId,
  });

  /** Fetch quyền hạn của chức vụ được chọn */
  const { data: fetchedPermissionIds, isLoading: permissionsLoading } = useQuery<string[]>({
    queryKey: queryKeys.roles.permissions(currentTenantId!, selectedRoleId!),
    queryFn: () =>
      api.get(`/tenants/${currentTenantId}/roles/${selectedRoleId}/permissions`),
    enabled: !!currentTenantId && !!selectedRoleId && activeTab === "permissions",
    // Sync vào local state khi data thay đổi
  });

  // Sync fetched permission IDs to local state khi role thay đổi
  // Dùng pattern "controlled by query" — chỉ sync khi data mới về
  useMemo(() => {
    if (fetchedPermissionIds) {
      setAssignedPermissionIds(fetchedPermissionIds);
    }
  }, [fetchedPermissionIds]);

  // Composite loading/error state cho backward compatibility
  const loading = staffLoading || (activeTab === "turns" && turnsLoading);
  const error = staffError ? (staffError as Error).message : null;

  // ==========================================================
  // 2. INLINE EDIT HANDLERS (Excel-like table patterns)
  // ==========================================================

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

  // ==========================================================
  // 3. MUTATIONS WITH OPTIMISTIC UI
  // ==========================================================

  /** Mutation: Auto-save inline edit cho 1 nhân viên */
  const autoSaveMutation = useMutation({
    mutationFn: async ({ staffId, payload }: { staffId: string; payload: any }) => {
      return api.put(`/tenants/${currentTenantId}/staff/${staffId}`, payload);
    },
    onMutate: async ({ staffId, payload }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.staff.list(currentTenantId!) });

      // Snapshot previous value
      const previousStaff = queryClient.getQueryData<StaffMember[]>(
        queryKeys.staff.list(currentTenantId!)
      );

      // Optimistic update: cập nhật item trong cache ngay lập tức
      queryClient.setQueryData<StaffMember[]>(
        queryKeys.staff.list(currentTenantId!),
        (old) =>
          old?.map((s) =>
            s.id === staffId ? { ...s, ...payload } : s
          ) ?? []
      );

      return { previousStaff };
    },
    onError: (_err, { staffId }, context) => {
      // Rollback on failure
      if (context?.previousStaff) {
        queryClient.setQueryData(
          queryKeys.staff.list(currentTenantId!),
          context.previousStaff
        );
      }
      toast.error(`Lưu tự động thất bại: ${(_err as Error).message}`);
    },
    onSuccess: (_data, { staffId }) => {
      // Clear inline edits for this staff
      setInlineEdits((prev) => {
        const next = { ...prev };
        delete next[staffId];
        return next;
      });
    },
    onSettled: () => {
      // Refetch to ensure server truth
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all(currentTenantId!) });
    },
  });

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

    const roleIdToSave = finalFields.role ? finalFields.role.id : null;
    const branchIdsToSave = finalFields.branches.map((b) => b.id);

    autoSaveMutation.mutate({
      staffId,
      payload: {
        name: finalFields.name,
        loginId: finalFields.loginId,
        email: finalFields.email || "",
        password: finalFields.password,
        phone: finalFields.phone,
        sex: finalFields.sex,
        baseSalary: finalFields.baseSalary,
        roleId: roleIdToSave,
        status: finalFields.status,
        note: finalFields.note,
        branchIds: branchIdsToSave,
        avatar: finalFields.avatar,
      },
    });
  };

  // ==========================================================
  // 4. FULL MODAL OPERATIONS
  // ==========================================================

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

  /** Mutation: Xóa nhân viên — Optimistic UI */
  const deleteStaffMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/tenants/${currentTenantId}/staff/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.staff.list(currentTenantId!) });

      const previousStaff = queryClient.getQueryData<StaffMember[]>(
        queryKeys.staff.list(currentTenantId!)
      );

      // Optimistic: Xóa item khỏi UI ngay lập tức
      queryClient.setQueryData<StaffMember[]>(
        queryKeys.staff.list(currentTenantId!),
        (old) => old?.filter((s) => s.id !== id) ?? []
      );

      return { previousStaff };
    },
    onError: (_err, _id, context) => {
      // Rollback
      if (context?.previousStaff) {
        queryClient.setQueryData(
          queryKeys.staff.list(currentTenantId!),
          context.previousStaff
        );
      }
      toast.error("Xóa nhân viên thất bại!");
    },
    onSuccess: () => {
      toast.success("Đã xóa nhân viên thành công!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all(currentTenantId!) });
    },
  });

  const handleDeleteStaff = async (id: string) => {
    if (
      !(await confirm({
        title: "Xóa nhân sự",
        message: "Bạn có chắc chắn muốn xóa tài khoản nhân viên này khỏi hệ thống?",
        type: "danger",
        confirmText: "Xóa",
      }))
    )
      return;

    deleteStaffMutation.mutate(id);
  };

  /** Mutation: Tạo nhân sự mới với Optimistic UI */
  const createStaffMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post(`/tenants/${currentTenantId}/staff`, payload);
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.staff.list(currentTenantId!) });
      const previousStaff = queryClient.getQueryData<StaffMember[]>(
        queryKeys.staff.list(currentTenantId!)
      );

      const tempId = `temp-${Date.now()}`;
      const optimisticStaff: StaffMember = {
        id: tempId,
        name: payload.name,
        loginId: payload.loginId,
        email: payload.email || "",
        phone: payload.phone || "",
        sex: payload.sex || "Nam",
        baseSalary: payload.baseSalary || 0,
        status: payload.status || "ACTIVE",
        note: payload.note || "",
        avatar: payload.avatar || "",
        role: roles.find((r) => r.id === payload.roleId) || null,
        branches: branchList.filter((b) => payload.branchIds.includes(b.id)),
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<StaffMember[]>(
        queryKeys.staff.list(currentTenantId!),
        (old) => [...(old || []), optimisticStaff]
      );

      return { previousStaff };
    },
    onError: (err, payload, context) => {
      if (context?.previousStaff) {
        queryClient.setQueryData(
          queryKeys.staff.list(currentTenantId!),
          context.previousStaff
        );
      }
      toast.error(`Thêm nhân sự thất bại: ${(err as Error).message}`);
    },
    onSuccess: () => {
      toast.success("Thêm nhân sự mới thành công!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all(currentTenantId!) });
    },
  });

  /** Mutation: Cập nhật nhân sự với Optimistic UI */
  const updateStaffMutation = useMutation({
    mutationFn: async ({ staffId, payload }: { staffId: string; payload: any }) => {
      return api.put(`/tenants/${currentTenantId}/staff/${staffId}`, payload);
    },
    onMutate: async ({ staffId, payload }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.staff.list(currentTenantId!) });
      const previousStaff = queryClient.getQueryData<StaffMember[]>(
        queryKeys.staff.list(currentTenantId!)
      );

      queryClient.setQueryData<StaffMember[]>(
        queryKeys.staff.list(currentTenantId!),
        (old) =>
          old?.map((s) =>
            s.id === staffId
              ? {
                  ...s,
                  name: payload.name,
                  loginId: payload.loginId,
                  email: payload.email || "",
                  phone: payload.phone || "",
                  sex: payload.sex || "Nam",
                  baseSalary: payload.baseSalary || 0,
                  status: payload.status || "ACTIVE",
                  note: payload.note || "",
                  avatar: payload.avatar || "",
                  role: roles.find((r) => r.id === payload.roleId) || null,
                  branches: branchList.filter((b) => payload.branchIds.includes(b.id)),
                }
              : s
          ) ?? []
      );

      return { previousStaff };
    },
    onError: (err, { staffId }, context) => {
      if (context?.previousStaff) {
        queryClient.setQueryData(
          queryKeys.staff.list(currentTenantId!),
          context.previousStaff
        );
      }
      toast.error(`Cập nhật nhân sự thất bại: ${(err as Error).message}`);
    },
    onSuccess: () => {
      toast.success("Cập nhật nhân sự thành công!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all(currentTenantId!) });
    },
  });

  const handleSaveStaff = async (payload: any, mode: "create" | "edit", staffId?: string | null) => {
    if (mode === "create") {
      await createStaffMutation.mutateAsync(payload);
    } else if (mode === "edit" && staffId) {
      await updateStaffMutation.mutateAsync({ staffId, payload });
    }
  };

  // ==========================================================
  // 5. DYNAMIC ROLES & PERMISSIONS OPERATIONS
  // ==========================================================

  const handlePermissionCheckboxChange = (permissionId: string) => {
    const activeRole = roles.find((r) => r.id === selectedRoleId);
    if (activeRole && activeRole.name.toUpperCase() === "ADMIN") {
      toast.warning("Quyền hạn của chức vụ Admin là tối cao và không thể thay đổi.");
      return;
    }

    setAssignedPermissionIds((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId]
    );
  };

  /** Mutation: Lưu phân quyền chức vụ */
  const savePermissionsMutation = useMutation({
    mutationFn: () =>
      api.put(`/tenants/${currentTenantId}/roles/${selectedRoleId}/permissions`, {
        permissionIds: assignedPermissionIds,
      }),
    onSuccess: () => {
      toast.success("Cập nhật phân quyền chức vụ thành công!");
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.permissions(currentTenantId!, selectedRoleId!),
      });
    },
    onError: (err) => {
      toast.error((err as Error).message || "Đã xảy ra lỗi khi lưu phân quyền");
    },
  });

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    savePermissionsMutation.mutate();
  };

  // Create Custom Role
  const handleOpenRoleModal = (mode: "create" | "edit") => {
    setRoleModalMode(mode);
    if (mode === "edit") {
      const activeRole = roles.find((r) => r.id === selectedRoleId);
      if (!activeRole) return;
      const isBuiltin = ["ADMIN", "MANAGER", "CASHIER", "EMPLOYEE"].includes(activeRole.name.toUpperCase());
      if (isBuiltin) {
        toast.warning("Không thể sửa đổi thông tin của chức vụ hệ thống mặc định.");
        return;
      }
    }
    setIsRoleModalOpen(true);
  };

  /** Mutation: Xóa chức vụ tùy chỉnh — Optimistic UI */
  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) =>
      api.delete(`/tenants/${currentTenantId}/roles/${roleId}`),
    onMutate: async (roleId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.roles.list(currentTenantId!) });

      const previousRoles = queryClient.getQueryData<Role[]>(
        queryKeys.roles.list(currentTenantId!)
      );

      // Optimistic: Xóa role khỏi UI
      queryClient.setQueryData<Role[]>(
        queryKeys.roles.list(currentTenantId!),
        (old) => old?.filter((r) => r.id !== roleId) ?? []
      );

      return { previousRoles };
    },
    onError: (err, _roleId, context) => {
      if (context?.previousRoles) {
        queryClient.setQueryData(
          queryKeys.roles.list(currentTenantId!),
          context.previousRoles
        );
      }
      toast.error((err as Error).message || "Xóa chức vụ thất bại!");
    },
    onSuccess: () => {
      toast.success("Đã xóa chức vụ thành công!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all(currentTenantId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all(currentTenantId!) });
    },
  });

  const handleDeleteRole = async () => {
    if (!selectedRoleId) return;
    const activeRole = roles.find((r) => r.id === selectedRoleId);
    if (!activeRole) return;

    const isBuiltin = ["ADMIN", "MANAGER", "CASHIER", "EMPLOYEE"].includes(activeRole.name.toUpperCase());
    if (isBuiltin) {
      toast.warning("Không thể xóa các chức vụ mặc định của hệ thống.");
      return;
    }

    if (
      !(await confirm({
        title: "Xóa chức vụ",
        message: `Bạn có chắc chắn muốn xóa chức vụ "${activeRole.name}"? Chức năng này không thể hoàn tác.`,
        type: "danger",
        confirmText: "Xóa",
      }))
    )
      return;

    setSelectedRoleId(roles[0]?.id || null);
    deleteRoleMutation.mutate(selectedRoleId);
  };

  // ==========================================================
  // 6. DAILY TURNS LOGIC
  // ==========================================================

  /** Mutation: Gán lượt nhận khách — Optimistic UI */
  const assignTurnMutation = useMutation({
    mutationFn: ({ staffId, turnType }: { staffId: string; turnType: "walkin" | "booked" }) =>
      api.post(
        `/tenants/${currentTenantId}/branches/${currentBranchId}/daily-turns/assign`,
        { staffId, turnType }
      ),
    onMutate: async ({ staffId, turnType }) => {
      const turnsKey = queryKeys.dailyTurns.list(currentTenantId!, currentBranchId!);
      await queryClient.cancelQueries({ queryKey: turnsKey });

      const previousTurns = queryClient.getQueryData<DailyTurn[]>(turnsKey);

      // Optimistic: tăng count ngay lập tức
      queryClient.setQueryData<DailyTurn[]>(turnsKey, (old) =>
        old?.map((t) =>
          t.staffId === staffId
            ? {
                ...t,
                totalWalkinCount: turnType === "walkin" ? t.totalWalkinCount + 1 : t.totalWalkinCount,
                totalBookedCount: turnType === "booked" ? t.totalBookedCount + 1 : t.totalBookedCount,
                totalCustomersToday: t.totalCustomersToday + 1,
                lastAssignedAt: new Date().toISOString(),
              }
            : t
        ) ?? []
      );

      return { previousTurns };
    },
    onError: (err, _vars, context) => {
      const turnsKey = queryKeys.dailyTurns.list(currentTenantId!, currentBranchId!);
      if (context?.previousTurns) {
        queryClient.setQueryData(turnsKey, context.previousTurns);
      }
      toast.error((err as Error).message || "Lỗi gán lượt");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dailyTurns.list(currentTenantId!, currentBranchId!),
      });
    },
  });

  const handleAssignTurn = async (staffId: string, turnType: "walkin" | "booked") => {
    if (!currentTenantId || !currentBranchId) return;
    assignTurnMutation.mutate({ staffId, turnType });
  };

  /** Mutation: Reset xoay tua thợ */
  const resetTurnsMutation = useMutation({
    mutationFn: () =>
      api.post(
        `/tenants/${currentTenantId}/branches/${currentBranchId}/daily-turns/reset`
      ),
    onSuccess: () => {
      toast.success("Khởi tạo lại lượt xoay tua hôm nay thành công!");
      queryClient.invalidateQueries({
        queryKey: queryKeys.dailyTurns.list(currentTenantId!, currentBranchId!),
      });
    },
    onError: () => {
      toast.error("Reset lượt xoay tua thất bại");
    },
  });

  const handleResetTurns = async () => {
    if (!currentTenantId || !currentBranchId) return;
    if (
      !(await confirm({
        title: "Reset lượt nhận khách",
        message: "Bạn có chắc chắn muốn RESET toàn bộ lượt nhận khách hôm nay về 0?",
        type: "warning",
        confirmText: "Reset",
      }))
    )
      return;

    resetTurnsMutation.mutate();
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

  /** Mutation: Auto-save turn counts */
  const autoSaveTurnMutation = useMutation({
    mutationFn: ({ staffId, payload }: { staffId: string; payload: any }) =>
      api.put(
        `/tenants/${currentTenantId}/branches/${currentBranchId}/daily-turns/${staffId}`,
        payload
      ),
    onError: (err) => {
      toast.error((err as Error).message || "Không thể cập nhật lượt thủ công");
    },
    onSuccess: (_data, { staffId }) => {
      setTurnEdits((prev) => {
        const next = { ...prev };
        delete next[staffId];
        return next;
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dailyTurns.list(currentTenantId!, currentBranchId!),
      });
    },
  });

  const handleAutoSaveTurn = async (staffId: string, field: "walkin" | "booked") => {
    const turn = dailyTurns.find((t) => t.staffId === staffId);
    if (!turn) return;

    const edits = turnEdits[staffId];
    if (!edits) return;

    const originalVal = field === "walkin" ? turn.totalWalkinCount : turn.totalBookedCount;
    const currentVal = edits[field];
    if (originalVal === currentVal) return;

    autoSaveTurnMutation.mutate({
      staffId,
      payload: {
        totalWalkinCount: edits.walkin,
        totalBookedCount: edits.booked,
      },
    });
  };

  // Add staff cover to daily turns queue
  const handleOpenAddStaffToQueue = () => {
    // Filter staff members gán chi nhánh này nhưng chưa có trong dailyTurns
    const inQueueIds = dailyTurns.map((t) => t.staffId);
    const availableStaff = staff.filter(
      (s) => s.branches.some((b) => b.id === currentBranchId) && !inQueueIds.includes(s.id)
    );

    if (availableStaff.length === 0) {
      toast.info("Toàn bộ nhân sự chi nhánh đã có mặt trong hàng đợi hôm nay.");
      return;
    }

    setIsAddStaffToQueueOpen(true);
  };

  // ==========================================================
  // 7. DERIVED DATA (useMemo)
  // ==========================================================

  // Dynamic Staff Schema for Import Matcher
  const staffSchema = useMemo<TargetField[]>(() => [
    { field: "name", label: "Tên nhân viên", type: "string", required: true, description: "Họ và tên của nhân viên" },
    { field: "loginId", label: "ID đăng nhập", type: "string", required: true, description: "ID dùng để đăng nhập hệ thống" },
    { field: "email", label: "Email liên hệ", type: "string", required: false, description: "Email liên hệ (tùy chọn)" },
    { field: "phone", label: "Số điện thoại", type: "string", required: false, description: "Số điện thoại liên hệ" },
    {
      field: "sex",
      label: "Giới tính",
      type: "select",
      required: false,
      options: [
        { value: "Nam", label: "Nam" },
        { value: "Nữ", label: "Nữ" }
      ],
      description: "Giới tính của nhân viên"
    },
    { field: "baseSalary", label: "Lương cơ bản", type: "number", required: false, description: "Mức lương cơ bản của nhân viên (VND)" },
    {
      field: "roleName",
      label: "Chức vụ",
      type: "select",
      required: false,
      options: roles.map((r) => ({ value: r.name, label: r.name })),
      description: "Tên chức vụ. Nếu chưa tồn tại, hệ thống sẽ tự động tạo mới."
    }
  ], [roles]);

  // Find the admin user (either by isAdmin flag or fallback to oldest createdAt)
  const adminUser = getAdminUser(staff);
  const adminUserId = adminUser?.id;

  // Filter staff based on search query
  const filteredStaffBase = staff.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.loginId && item.loginId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.phone && item.phone.includes(searchTerm)) ||
      (item.role && item.role.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort: Admin user always goes first
  const filteredStaff = [...filteredStaffBase].sort((a, b) => {
    if (adminUserId) {
      if (a.id === adminUserId) return -1;
      if (b.id === adminUserId) return 1;
    }
    return 0;
  });

  // Calculate staff list gán chi nhánh này chưa có trong turns queue
  const inQueueIds = dailyTurns.map((t) => t.staffId);
  const queueAddableStaff = staff.filter(
    (s) => s.branches.some((b) => b.id === currentBranchId) && !inQueueIds.includes(s.id)
  );

  // ==========================================================
  // 8. BACKWARD-COMPATIBLE INVALIDATION HELPERS
  //    (Dùng cho modals con vẫn cần callback refetch)
  // ==========================================================

  /** Invalidate & refetch staff + roles + branches + permissions */
  const fetchStaffAndRoles = useCallback(
    async (silent?: boolean) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.staff.all(currentTenantId!) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.roles.all(currentTenantId!) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.branches.all(currentTenantId!) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all(currentTenantId!) }),
      ]);
    },
    [queryClient, currentTenantId]
  );

  /** Invalidate & refetch daily turns */
  const fetchDailyTurns = useCallback(
    async (silent?: boolean) => {
      if (currentTenantId && currentBranchId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.dailyTurns.all(currentTenantId, currentBranchId),
        });
      }
    },
    [queryClient, currentTenantId, currentBranchId]
  );

  return {
    currentTenantId,
    currentBranchId,
    branches,
    activeTab,
    setActiveTab,
    staff,
    roles,
    branchList,
    permissions,
    dailyTurns,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    inlineEdits,
    turnEdits,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    selectedStaffId,
    selectedRoleId,
    setSelectedRoleId,
    assignedPermissionIds,
    permissionsLoading,
    savingPermissions: savePermissionsMutation.isPending,
    isRoleModalOpen,
    setIsRoleModalOpen,
    roleModalMode,
    isAddStaffToQueueOpen,
    setIsAddStaffToQueueOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    droppedFile,
    setDroppedFile,
    isDragActive,
    staffSchema,
    fetchStaffAndRoles,
    fetchDailyTurns,
    formatNumber,
    handleSalaryChange,
    handleInlineChange,
    getInlineValue,
    handleAutoSave,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleDeleteStaff,
    handleSaveStaff,
    handlePermissionCheckboxChange,
    handleSavePermissions,
    handleOpenRoleModal,
    handleDeleteRole,
    handleAssignTurn,
    handleResetTurns,
    handleInlineTurnChange,
    getInlineTurnValue,
    handleAutoSaveTurn,
    handleOpenAddStaffToQueue,
    adminUserId,
    filteredStaff,
    queueAddableStaff,
  };
}
