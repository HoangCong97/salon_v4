import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/useAuthStore";
import { Users, Plus, Loader2, Search, Upload, Download } from "lucide-react";
import { Customer } from "./types";
import { CustomerTable } from "./CustomerTable";
import { CustomerFormModal } from "./CustomerFormModal";
import { ImportWizardModal } from "../../../components/desktop/ImportWizard/ImportWizardModal";
import { TargetField } from "../../../hooks/useImportWizard";
import { useFileDragAndDrop } from "../../../hooks/useFileDragAndDrop";
import { ExportButton } from "../../../components/desktop/ExportButton";
import { ExportColumnMapping } from "../../../utils/exportData";
import { useConfirm } from "../../../components/desktop/ConfirmDialog";
import { useToast } from "../../../components/desktop/ToastProvider";
import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";

export default function Customers() {
  const { currentTenantId, currentBranchId, hasPermission } = useAuthStore();
  const canManage = hasPermission("customer.manage");
  const confirm = useConfirm();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Data State — useQuery (stale-while-revalidate cache)
  const { data: customers = [], isLoading: loading, error: customersError } = useQuery<Customer[]>({
    queryKey: queryKeys.customers.list(currentTenantId!, currentBranchId),
    queryFn: () => {
      const url = currentBranchId
        ? `/tenants/${currentTenantId}/customers?branchId=${currentBranchId}`
        : `/tenants/${currentTenantId}/customers`;
      return api.get(url);
    },
    enabled: !!currentTenantId,
  });

  const error = customersError ? (customersError as Error).message : null;

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");

  // Customer Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
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
  const customerSchema = useMemo<TargetField[]>(() => [
    { field: "name", label: "Tên khách hàng", type: "string", required: true, description: "Họ tên đầy đủ của khách hàng" },
    { field: "phone", label: "Số điện thoại", type: "string", required: false, description: "Số điện thoại liên lạc" },
    { field: "email", label: "Email", type: "string", required: false, description: "Địa chỉ hòm thư điện tử" },
    { field: "credibilityScore", label: "Điểm uy tín", type: "number", required: false, description: "Điểm số uy tín (0-100)" }
  ], []);

  // Export Columns Mapping for Customers
  const customerExportColumns = useMemo<ExportColumnMapping[]>(() => [
    { key: "name", header: "Tên khách hàng" },
    { key: "phone", header: "Số điện thoại" },
    { key: "email", header: "Email" },
    { key: "credibilityScore", header: "Điểm uy tín", transform: (val) => val !== null && val !== undefined ? Number(val) : 100 },
    { key: "createdAt", header: "Ngày tham gia", transform: (val) => val ? new Date(val).toLocaleDateString("vi-VN") : "" }
  ], []);

  // Inline editing helper states & functions
  const [inlineEdits, setInlineEdits] = useState<Record<string, Partial<Customer>>>({});

  const handleInlineChange = (customerId: string, field: keyof Customer, value: any) => {
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

      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all(currentTenantId!) });
    } catch (err: any) {
      console.error("Auto save failed:", err);
    }
  };

  /** Backward-compatible invalidation helper cho modals con */
  const fetchCustomers = useCallback(
    async (silent?: boolean) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.customers.all(currentTenantId!) });
    },
    [queryClient, currentTenantId]
  );

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

  // Actions
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
        message: "Bạn có chắc chắn muốn xóa khách hàng này? Các dữ liệu lịch sử liên quan vẫn được lưu giữ.",
        type: "danger",
        confirmText: "Xóa",
      }))
    )
      return;

    try {
      await api.delete(`/tenants/${currentTenantId}/customers/${id}`);
      toast.success("Đã xóa khách hàng thành công!");
      await fetchCustomers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-primary-light)",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
              QUẢN LÝ KHÁCH HÀNG
            </h2>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>
              Danh sách và hồ sơ khách hàng thành viên của salon
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          {canManage && (
            <button
              className="btn btn-secondary"
              onClick={() => setIsImportModalOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 14px" }}
            >
              <Upload size={14} /> Nhập Excel/CSV
            </button>
          )}
          
          <ExportButton
            data={filteredCustomers}
            fileName="danh_sach_khach_hang"
            columns={customerExportColumns}
          />

          {canManage && (
            <button
              className="btn btn-primary"
              onClick={handleOpenCreateModal}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 14px" }}
            >
              <Plus size={16} /> Thêm khách hàng
            </button>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      <div
        className="card"
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* Filters bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            gap: "12px",
          }}
        >
          {/* Search box */}
          <div style={{ position: "relative", width: "320px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(15, 23, 42, 0.4)",
              }}
            />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                border: "1.5px solid var(--border-color, #e2e8f0)",
                borderRadius: "8px",
                fontSize: "13.5px",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-color, #e2e8f0)")}
            />
          </div>
          
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>
            Tìm thấy <strong>{filteredCustomers.length}</strong> khách hàng
          </div>
        </div>

        {/* Content Table / Loading / Error states */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, gap: "10px" }}>
            <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>
              Đang tải danh sách khách hàng...
            </span>
          </div>
        ) : error ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexGrow: 1, color: "var(--color-danger)", fontWeight: "600", fontSize: "13.5px" }}>
            ⚠️ {error}
          </div>
        ) : (
          <div style={{ flexGrow: 1, overflowY: "auto" }}>
            <CustomerTable
              filteredCustomers={filteredCustomers}
              inlineEdits={inlineEdits}
              handleInlineChange={handleInlineChange}
              handleAutoSave={handleAutoSave}
              handleOpenEditModal={handleOpenEditModal}
              handleDelete={handleDelete}
              getInlineValue={getInlineValue}
            />
          </div>
        )}
      </div>

      {/* Drag & Drop Visual Overlay */}
      {isDragActive && canManage && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(59, 130, 246, 0.08)",
            border: "2px dashed var(--color-primary)",
            borderRadius: "12px",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              padding: "16px",
              borderRadius: "50%",
              background: "white",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Upload size={32} color="var(--color-primary)" />
          </div>
          <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--color-primary)" }}>
            Kéo thả file Excel/CSV vào đây để nhập khách hàng
          </span>
        </div>
      )}

      {/* Customer Create/Edit Modal */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        selectedCustomerId={selectedCustomerId}
        customers={customers}
        fetchCustomers={fetchCustomers}
        currentTenantId={currentTenantId}
        currentBranchId={currentBranchId}
      />

      {/* Import Wizard Modal */}
      <ImportWizardModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setDroppedFile(null);
        }}
        onSuccess={async () => {
          await fetchCustomers(true);
        }}
        entity="customer"
        entityLabel="Khách hàng"
        targetSchema={customerSchema}
        droppedFile={droppedFile}
      />
    </div>
  );
}
