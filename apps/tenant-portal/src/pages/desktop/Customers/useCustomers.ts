import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/useAuthStore";
import { useConfirm } from "../../../components/desktop/ConfirmDialog";
import { useToast } from "../../../components/desktop/ToastProvider";
import { useFileDragAndDrop } from "../../../hooks/useFileDragAndDrop";
import { TargetField } from "../../../hooks/useImportWizard";
import { ExportColumnMapping } from "../../../utils/exportData";
import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";
import { Customer, ModalMode } from "./types";

export function useCustomers() {
  const { currentTenantId, currentBranchId, hasPermission } = useAuthStore();
  const canManage = hasPermission("customer.manage");
  const confirm = useConfirm();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Data State — useQuery
  const {
    data: customers = [],
    isLoading: loading,
    error: queryError,
  } = useQuery<Customer[]>({
    queryKey: queryKeys.customers.list(currentTenantId!, currentBranchId),
    queryFn: () => {
      const url = currentBranchId
        ? `/tenants/${currentTenantId}/customers?branchId=${currentBranchId}`
        : `/tenants/${currentTenantId}/customers`;
      return api.get(url);
    },
    enabled: !!currentTenantId,
  });

  const error = queryError ? (queryError as Error).message : null;

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");

  // Customer Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  const { isDragActive } = useFileDragAndDrop((file) => {
    if (canManage) {
      setDroppedFile(file);
      setIsImportModalOpen(true);
    }
  });

  // Dynamic Customer Schema for Import Matcher
  const customerSchema = useMemo<TargetField[]>(
    () => [
      {
        field: "name",
        label: "Tên khách hàng",
        type: "string",
        required: true,
        description: "Họ tên đầy đủ của khách hàng",
      },
      {
        field: "phone",
        label: "Số điện thoại",
        type: "string",
        required: false,
        description: "Số điện thoại liên lạc",
      },
      {
        field: "email",
        label: "Email",
        type: "string",
        required: false,
        description: "Địa chỉ hòm thư điện tử",
      },
      {
        field: "credibilityScore",
        label: "Điểm uy tín",
        type: "number",
        required: false,
        description: "Điểm số uy tín (0-100)",
      },
    ],
    []
  );

  // Export Columns Mapping for Customers
  const customerExportColumns = useMemo<ExportColumnMapping[]>(
    () => [
      { key: "name", header: "Tên khách hàng" },
      { key: "phone", header: "Số điện thoại" },
      { key: "email", header: "Email" },
      {
        key: "credibilityScore",
        header: "Điểm uy tín",
        transform: (val) => (val !== null && val !== undefined ? Number(val) : 100),
      },
      {
        key: "createdAt",
        header: "Ngày tham gia",
        transform: (val) => (val ? new Date(val as string).toLocaleDateString("vi-VN") : ""),
      },
    ],
    []
  );

  // Inline editing helper states & functions
  const [inlineEdits, setInlineEdits] = useState<Record<string, Partial<Customer>>>({});

  const handleInlineChange = (
    customerId: string,
    field: keyof Customer,
    value: string | number | undefined | null
  ) => {
    setInlineEdits((prev) => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [field]: value,
      },
    }));
  };

  const getInlineValue = (customer: Customer, field: keyof Customer) => {
    if (inlineEdits[customer.id] && inlineEdits[customer.id][field] !== undefined) {
      return inlineEdits[customer.id][field];
    }
    return customer[field];
  };

  const fetchCustomers = useCallback(
    async (silent?: boolean) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.customers.all(currentTenantId!),
      });
    },
    [queryClient, currentTenantId]
  );

  const handleAutoSave = async (customerId: string, updatedFields: Partial<Customer>) => {
    const originalCustomer = customers.find((c) => c.id === customerId);
    if (!originalCustomer) return;

    const mergedEdits = {
      ...inlineEdits[customerId],
      ...updatedFields,
    };

    const updatedCustomer = {
      ...originalCustomer,
      ...mergedEdits,
    };

    let hasChanges = false;
    for (const key of Object.keys(updatedFields) as Array<keyof Customer>) {
      if (updatedFields[key] !== originalCustomer[key]) {
        hasChanges = true;
        break;
      }
    }
    if (!hasChanges) return;

    const payload = {
      name: updatedCustomer.name,
      phone: updatedCustomer.phone || null,
      email: updatedCustomer.email || null,
      password: updatedCustomer.password || null,
      credibilityScore: Number(updatedCustomer.credibilityScore ?? 100),
      branchId: updatedCustomer.branchId || null,
    };

    try {
      await api.put(`/tenants/${currentTenantId}/customers/${customerId}`, payload);

      setInlineEdits((prev) => {
        const copy = { ...prev };
        delete copy[customerId];
        return copy;
      });

      toast.success("Lưu tự động thành công!");
      await fetchCustomers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Lỗi tự động lưu: " + msg);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setSelectedCustomerId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setModalMode("edit");
    setSelectedCustomerId(customer.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !(await confirm({
        title: "Xóa khách hàng",
        message:
          "Bạn có chắc chắn muốn xóa khách hàng này? Các dữ liệu lịch sử liên quan vẫn được lưu giữ.",
        type: "danger",
        confirmText: "Xóa",
      }))
    )
      return;

    try {
      await api.delete(`/tenants/${currentTenantId}/customers/${id}`);
      toast.success("Đã xóa khách hàng thành công!");
      await fetchCustomers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg);
    }
  };

  // Filter Logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const matchSearch =
        cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cust.phone && cust.phone.includes(searchTerm)) ||
        (cust.email && cust.email.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });
  }, [customers, searchTerm]);

  return {
    currentTenantId,
    currentBranchId,
    canManage,
    loading,
    error,
    customers,
    filteredCustomers,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    selectedCustomerId,
    isImportModalOpen,
    setIsImportModalOpen,
    droppedFile,
    setDroppedFile,
    isDragActive,
    customerSchema,
    customerExportColumns,
    inlineEdits,
    handleInlineChange,
    getInlineValue,
    handleAutoSave,
    fetchCustomers,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleDelete,
  };
}
