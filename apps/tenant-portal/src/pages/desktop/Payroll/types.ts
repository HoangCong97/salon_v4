export interface PayrollMember {
  id: string;
  tenantId: string;
  branchId: string;
  staffId: string;
  salaryPeriod: string;
  baseSalary: number;
  allowance: number;
  commissionAmount: number;
  tipAmount: number;
  deductionAmount: number;
  finalSalary: number;
  status: "DRAFT" | "PAID";
  paidAt: string | null;
  staff: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string | null;
  };
}
