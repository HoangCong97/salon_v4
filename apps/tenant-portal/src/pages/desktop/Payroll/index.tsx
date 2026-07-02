import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, Upload } from "lucide-react";

import { PayrollHeader } from "./components/PayrollHeader";
import { PayrollTable } from "./components/PayrollTable";
import { ImportWizardModal } from "../../../components/desktop/ImportWizard/ImportWizardModal";
import { DragOverlay } from "../../../components/desktop/ui/DragOverlay";
import { EmptyState } from "../../../components/desktop/ui/EmptyState";
import { LoadingState } from "../../../components/desktop/ui/LoadingState";
import { ErrorState } from "../../../components/desktop/ui/ErrorState";

import { useAuthStore } from "../../../store/useAuthStore";
import { useFileDragAndDrop } from "../../../hooks/useFileDragAndDrop";
import { useConfirm } from "../../../components/desktop/ConfirmDialog";
import { useToast } from "../../../components/desktop/ToastProvider";

import { api } from "../../../utils/apiClient";
import { queryKeys } from "../../../utils/queryKeys";
import { ExportColumnMapping } from "../../../utils/exportData";

import { PayrollMember } from "./types";
import { TargetField } from "../../../hooks/useImportWizard";

import styles from "./Payroll.module.css";

export default function Payroll() {
  const { currentTenantId, currentBranchId, hasPermission } = useAuthStore();
  const confirm = useConfirm();
  const toast = useToast();
  const queryClient = useQueryClient();
  const canManage = hasPermission("staff.manage");

  // Date & Branch selection
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedBranch, setSelectedBranch] = useState<string>(currentBranchId || "");

  // Sync selectedBranch if currentBranchId changes in auth store
  React.useEffect(() => {
    if (currentBranchId) {
      setSelectedBranch(currentBranchId);
    }
  }, [currentBranchId]);

  // Derived / local state
  const [searchTerm, setSearchTerm] = useState("");
  const [inlineEdits, setInlineEdits] = useState<Record<string, Partial<PayrollMember>>>({});
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);

  // Fetch branches
  const { data: branches = [] } = useQuery<any[]>({
    queryKey: queryKeys.branches.list(currentTenantId!),
    queryFn: () => api.get(`/tenants/${currentTenantId}/branches`),
    enabled: !!currentTenantId,
  });

  // Drag & drop hook for import
  const { isDragActive } = useFileDragAndDrop((file) => {
    if (canManage) {
      setDroppedFile(file);
      setIsImportModalOpen(true);
    }
  });

  const periodStr = useMemo(() => {
    return `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  }, [selectedYear, selectedMonth]);

  const targetSchema = useMemo<TargetField[]>(() => [
    { field: "salaryPeriod", label: "Chu kỳ lương (YYYY-MM)", type: "string", required: true, description: "Chu kỳ tính lương (ví dụ: 2026-06)" },
    { field: "email", label: "Email nhân viên", type: "string", required: false, description: "Dùng để xác định tài khoản nhân viên" },
    { field: "phone", label: "Số điện thoại", type: "string", required: false, description: "Số điện thoại nhân viên" },
    { field: "name", label: "Tên nhân viên", type: "string", required: false, description: "Họ tên của nhân viên" },
    { field: "baseSalary", label: "Lương cơ bản", type: "number", required: false },
    { field: "allowance", label: "Phụ cấp", type: "number", required: false },
    { field: "commissionAmount", label: "Hoa hồng", type: "number", required: false },
    { field: "tipAmount", label: "Tiền Tip", type: "number", required: false },
    { field: "deductionAmount", label: "Khấu trừ", type: "number", required: false },
    { field: "finalSalary", label: "Thực nhận", type: "number", required: false },
    {
      field: "status",
      label: "Trạng thái",
      type: "select",
      required: false,
      options: [
        { value: "DRAFT", label: "Bản nháp" },
        { value: "PAID", label: "Đã thanh toán" }
      ]
    }
  ], []);

  // TanStack Query for payroll list
  const { data: payrolls = [], isLoading: payrollsLoading, error: queryError } = useQuery<PayrollMember[]>({
    queryKey: queryKeys.payrolls.list(currentTenantId!, selectedBranch || "all", periodStr),
    queryFn: () => {
      const url = selectedBranch
        ? `/tenants/${currentTenantId}/payrolls?period=${periodStr}&branchId=${selectedBranch}`
        : `/tenants/${currentTenantId}/payrolls?period=${periodStr}`;
      return api.get(url);
    },
    enabled: !!currentTenantId,
  });

  const loading = payrollsLoading || generating;
  const error = queryError ? (queryError as Error).message : null;

  const fetchPayrolls = useCallback(async (silent = false) => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.payrolls.list(currentTenantId!, selectedBranch || "all", periodStr)
    });
  }, [queryClient, currentTenantId, selectedBranch, periodStr]);

  const handleGeneratePayroll = async () => {
    if (!currentTenantId || !selectedBranch) {
      toast.error("Vui lòng chọn một chi nhánh cụ thể để lập bảng lương.");
      return;
    }
    setGenerating(true);
    try {
      await api.post(`/tenants/${currentTenantId}/payrolls/generate`, {
        period: periodStr,
        branchId: selectedBranch
      });
      toast.success("Khởi tạo bảng lương thành công!");
      await fetchPayrolls(true);
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  // Inline editing helpers
  const handleInlineChange = (payrollId: string, field: keyof PayrollMember, value: any) => {
    setInlineEdits((prev) => ({
      ...prev,
      [payrollId]: {
        ...prev[payrollId],
        [field]: value
      }
    }));
  };

  const handleNumericChange = (payrollId: string, field: keyof PayrollMember, valStr: string) => {
    const cleanNum = parseInt(valStr.replace(/\D/g, ""), 10) || 0;
    handleInlineChange(payrollId, field, cleanNum);
  };

  const getInlineValue = (item: PayrollMember, field: keyof PayrollMember) => {
    if (inlineEdits[item.id] && inlineEdits[item.id][field] !== undefined) {
      return inlineEdits[item.id][field];
    }
    return item[field];
  };

  const handleAutoSave = async (payrollId: string, updatedFields: Partial<PayrollMember>) => {
    const original = payrolls.find((p) => p.id === payrollId);
    if (!original) return;

    const merged = {
      ...original,
      ...inlineEdits[payrollId],
      ...updatedFields
    };

    // Calculate final salary dynamically: Base + Allowance + Commission + Tip - Deduction
    const finalSalary = merged.baseSalary + merged.allowance + merged.commissionAmount + merged.tipAmount - merged.deductionAmount;
    merged.finalSalary = finalSalary > 0 ? finalSalary : 0;

    // Check if there is actual change
    if (
      original.baseSalary === merged.baseSalary &&
      original.allowance === merged.allowance &&
      original.commissionAmount === merged.commissionAmount &&
      original.tipAmount === merged.tipAmount &&
      original.deductionAmount === merged.deductionAmount
    ) {
      return;
    }

    try {
      await api.put(`/tenants/${currentTenantId}/payrolls/${payrollId}`, {
        baseSalary: merged.baseSalary,
        allowance: merged.allowance,
        commissionAmount: merged.commissionAmount,
        tipAmount: merged.tipAmount,
        deductionAmount: merged.deductionAmount
      });

      // Clear edit cache
      setInlineEdits((prev) => {
        const copy = { ...prev };
        delete copy[payrollId];
        return copy;
      });

      toast.success("Lưu tự động thành công!");
      await fetchPayrolls(true);
    } catch (err: any) {
      toast.error("Lỗi lưu tự động: " + err.message);
      await fetchPayrolls(true);
    }
  };

  const handleMarkPaid = async (payrollId: string) => {
    if (!currentTenantId) return;
    if (
      !(await confirm({
        title: "Xác nhận thanh toán lương",
        message: "Bạn có chắc chắn muốn đánh dấu bảng lương này là ĐÃ THANH TOÁN? Thao tác này sẽ khóa số liệu lương.",
        type: "info",
        confirmText: "Xác nhận"
      }))
    )
      return;

    try {
      await api.put(`/tenants/${currentTenantId}/payrolls/${payrollId}`, { status: "PAID" });
      toast.success("Đã cập nhật thanh toán lương!");
      await fetchPayrolls(true);
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    }
  };

  const handleMarkAllPaid = async () => {
    if (!currentTenantId || payrolls.length === 0) return;
    const unpaid = payrolls.filter(p => p.status === "DRAFT");
    if (unpaid.length === 0) {
      toast.info("Tất cả bảng lương của tháng này đã được thanh toán.");
      return;
    }

    if (
      !(await confirm({
        title: "Thanh toán hàng loạt",
        message: `Bạn có chắc muốn thanh toán lương cho TOÀN BỘ ${unpaid.length} nhân viên chưa nhận lương trong tháng này?`,
        type: "info",
        confirmText: "Thanh toán tất cả"
      }))
    )
      return;

    try {
      const payload = unpaid.map(p => ({
        id: p.id,
        baseSalary: p.baseSalary,
        allowance: p.allowance,
        commissionAmount: p.commissionAmount,
        tipAmount: p.tipAmount,
        deductionAmount: p.deductionAmount,
        status: "PAID"
      }));

      await api.put(`/tenants/${currentTenantId}/payrolls/bulk`, { payrolls: payload });
      toast.success("Thanh toán lương hàng loạt thành công!");
      await fetchPayrolls(true);
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    }
  };

  const formatMoney = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === "") return "0";
    const num = typeof val === "number" ? val : parseInt(String(val).replace(/\D/g, ""), 10) || 0;
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter(
      (p) =>
        p.staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.staff.phone && p.staff.phone.includes(searchTerm))
    );
  }, [payrolls, searchTerm]);

  // Export mapping
  const exportColumns = useMemo<ExportColumnMapping[]>(() => [
    { key: "staff", header: "Tên nhân viên", transform: (val) => val?.name || "" },
    { key: "baseSalary", header: "Lương cơ bản", transform: (val) => Number(val) },
    { key: "allowance", header: "Phụ cấp", transform: (val) => Number(val || 0) },
    { key: "commissionAmount", header: "Hoa hồng", transform: (val) => Number(val || 0) },
    { key: "tipAmount", header: "Tiền Tip", transform: (val) => Number(val || 0) },
    { key: "deductionAmount", header: "Khấu trừ", transform: (val) => Number(val || 0) },
    { key: "finalSalary", header: "Thực nhận", transform: (val) => Number(val) },
    { key: "status", header: "Trạng thái", transform: (val) => val === "PAID" ? "Đã thanh toán" : "Bản nháp" },
    { key: "paidAt", header: "Ngày thanh toán", transform: (val) => val ? new Date(val).toLocaleDateString("vi-VN") : "" }
  ], []);

  const getInitials = (name: string): string => {
    if (!name) return "?";
    const words = name.trim().split(/\s+/);
    const lastWord = words[words.length - 1];
    return lastWord ? lastWord.charAt(0).toUpperCase() : "?";
  };

  return (
    <div
      className={`${isDragActive ? "flash-active" : "animate-fade-in"} ${styles.container}`}
    >
      {/* Header filters and controls */}
      <PayrollHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        branches={branches}
        canManage={canManage}
        onOpenImportModal={() => {
          setDroppedFile(null);
          setIsImportModalOpen(true);
        }}
        onMarkAllPaid={handleMarkAllPaid}
        filteredPayrolls={filteredPayrolls}
        periodStr={periodStr}
        exportColumns={exportColumns}
        onGeneratePayroll={handleGeneratePayroll}
      />

      {/* Main content table */}
      {loading ? (
        <LoadingState text="Đang tải dữ liệu bảng lương..." />
      ) : error ? (
        <ErrorState title="Không thể tải bảng lương" message={error} />
      ) : filteredPayrolls.length === 0 ? (
        <EmptyState
          title="Không tìm thấy dữ liệu lương"
          description={searchTerm ? "Không có kết quả phù hợp." : "Chưa lập bảng lương cho chu kỳ này. Vui lòng bấm 'Lập bảng lương' để bắt đầu."}
          icon={<Coins size={48} />}
        />
      ) : (
        <PayrollTable
          filteredPayrolls={filteredPayrolls}
          getInlineValue={getInlineValue}
          handleNumericChange={handleNumericChange}
          handleAutoSave={handleAutoSave}
          formatMoney={formatMoney}
          getInitials={getInitials}
          canManage={canManage}
          handleMarkPaid={handleMarkPaid}
        />
      )}

      {/* Drag and Drop dropzone background cue */}
      <DragOverlay
        isActive={isDragActive && canManage}
        title="Thả file Excel/CSV vào đây"
        description="Để bắt đầu quá trình nhập bảng lương tự động"
      />

      {/* Import Wizard Modal */}
      <ImportWizardModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setDroppedFile(null);
        }}
        onSuccess={() => {
          fetchPayrolls(true);
        }}
        entity="payroll"
        entityLabel="Bảng lương"
        droppedFile={droppedFile}
        targetSchema={targetSchema}
      />
    </div>
  );
}
