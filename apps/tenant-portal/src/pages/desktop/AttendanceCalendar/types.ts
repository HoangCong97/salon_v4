export interface Staff {
  id: string;
  name: string;
  avatar: string | null;
}

export interface AttendanceAnomaly {
  id: string;
  tenantId: string;
  branchId: string;
  staffId: string;
  workDate: string; // ISO string
  workStatus: string; // ABSENT, LATE, etc.
  lateMinutes: number;
  note: string | null;
  staff: Staff;
}

export interface CashAdvance {
  id: string;
  tenantId: string;
  branchId: string;
  staffId: string;
  advanceDate: string; // ISO string
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note: string | null;
  staff: Staff;
}

export type ModalMode = "create" | "edit";
export type DialogTab = "attendance" | "advance";

export const TYPE_OPTIONS = [
  { value: "ABSENT", label: "Vắng mặt (Không phép)", color: "var(--color-danger)" },
  { value: "LATE", label: "Đi muộn", color: "var(--color-warning)" },
  { value: "EARLY_OUT", label: "Về sớm", color: "hsl(24, 95%, 50%)" },
  { value: "LEAVE", label: "Nghỉ phép (Có phép)", color: "var(--color-primary)" },
  { value: "SICK", label: "Nghỉ bệnh", color: "hsl(180, 70%, 40%)" },
  { value: "ADVANCE_PENDING", label: "Tạm ứng (Chờ duyệt)", color: "var(--color-info)" },
  { value: "ADVANCE_APPROVED", label: "Tạm ứng (Đã duyệt)", color: "hsl(271, 81%, 56%)" },
  { value: "ADVANCE_REJECTED", label: "Tạm ứng (Từ chối)", color: "var(--text-muted)" },
];
