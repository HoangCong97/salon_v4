import { Injectable } from "@nestjs/common";
import { prisma } from "@salon/database";
import { BaseImportStrategy } from "./base-import.strategy";

@Injectable()
export class PayrollImportStrategy extends BaseImportStrategy {

  validate(row: any): string[] {
    const requiredFields = [
      { field: "salaryPeriod", label: "Chu kỳ lương (YYYY-MM)" }
    ];

    const errors = this.validateRequired(row, requiredFields);

    const email = this.cleanString(row.email);
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push("Email nhân viên không đúng định dạng.");
      }
    }

    const period = this.cleanString(row.salaryPeriod);
    if (period) {
      const periodRegex = /^\d{4}-\d{2}$/;
      if (!periodRegex.test(period)) {
        errors.push("Chu kỳ lương phải đúng định dạng YYYY-MM (Ví dụ: 2026-06).");
      }
    }

    return errors;
  }

  async execute(
    tenantId: string,
    branchId: string | null,
    data: any[]
  ): Promise<{
    importedCount: number;
    failedCount: number;
    errors: Array<{ row: number; data: any; reason: string }>;
  }> {
    let importedCount = 0;
    let failedCount = 0;
    const errors: Array<{ row: number; data: any; reason: string }> = [];

    // Cache staff by email/phone/name to speed up lookup
    const staffEmailCache = new Map<string, string>();
    const staffPhoneCache = new Map<string, string>();
    const staffNameCache = new Map<string, string>();

    const allStaff = await prisma.user.findMany({
      where: { tenantId, deletedAt: null }
    });

    for (const s of allStaff) {
      if (s.email) staffEmailCache.set(s.email.toLowerCase().trim(), s.id);
      if (s.phone) staffPhoneCache.set(s.phone.trim(), s.id);
      staffNameCache.set(s.name.toLowerCase().trim(), s.id);
    }

    // Process each row in sequence
    for (let i = 0; i < data.length; i++) {
      const rowNum = i + 1;
      const row = data[i];

      try {
        // 1. Validation check
        const validationErrors = this.validate(row);
        if (validationErrors.length > 0) {
          failedCount++;
          errors.push({
            row: rowNum,
            data: row,
            reason: validationErrors.join(" ")
          });
          continue;
        }

        const email = this.cleanString(row.email || row.staffEmail).toLowerCase().trim();
        const phone = this.cleanString(row.phone || row.staffPhone || row.sdt).trim();
        const name = this.cleanString(row.name || row.staffName || row.nhanvien).toLowerCase().trim();
        const salaryPeriod = this.cleanString(row.salaryPeriod);

        // 2. Resolve Staff
        let staffId = "";
        if (email && staffEmailCache.has(email)) {
          staffId = staffEmailCache.get(email) || "";
        } else if (phone && staffPhoneCache.has(phone)) {
          staffId = staffPhoneCache.get(phone) || "";
        } else if (name && staffNameCache.has(name)) {
          staffId = staffNameCache.get(name) || "";
        }

        if (!staffId) {
          failedCount++;
          errors.push({
            row: rowNum,
            data: row,
            reason: "Không tìm thấy nhân viên tương ứng trong hệ thống (tìm theo email, sđt hoặc họ tên)."
          });
          continue;
        }

        // 3. Resolve Branch
        let targetBranchId = branchId;
        if (!targetBranchId) {
          // If branchId query param was not provided, look up user's primary/first branch
          const userBranch = await prisma.userBranch.findFirst({
            where: { userId: staffId, deletedAt: null }
          });
          if (userBranch) {
            targetBranchId = userBranch.branchId;
          } else {
            // Fallback: pick any branch in the tenant
            const fallbackBranch = await prisma.branch.findFirst({
              where: { tenantId, deletedAt: null }
            });
            if (fallbackBranch) {
              targetBranchId = fallbackBranch.id;
            }
          }
        }

        if (!targetBranchId) {
          failedCount++;
          errors.push({
            row: rowNum,
            data: row,
            reason: "Không xác định được chi nhánh áp dụng cho bảng lương."
          });
          continue;
        }

        // Clean salary details
        const baseSalary = this.cleanNumber(row.baseSalary || row.luongcoban, 0);
        const allowance = this.cleanNumber(row.allowance || row.phucap, 0);
        const commissionAmount = this.cleanNumber(row.commissionAmount || row.hoahong || row.commission, 0);
        const tipAmount = this.cleanNumber(row.tipAmount || row.tip, 0);
        const deductionAmount = this.cleanNumber(row.deductionAmount || row.khautru, 0);
        
        // Calculate finalSalary
        const calculatedFinal = baseSalary + allowance + commissionAmount + tipAmount - deductionAmount;
        const finalSalary = this.cleanNumber(row.finalSalary || row.thucnhan, calculatedFinal > 0 ? calculatedFinal : 0);

        const status = this.cleanString(row.status || row.trangthai) === "PAID" || this.cleanString(row.status || row.trangthai) === "Đã thanh toán" ? "PAID" : "DRAFT";

        // 4. Create or Update payroll record
        const existingPayroll = await prisma.employeeMonthlyPayroll.findFirst({
          where: {
            tenantId,
            branchId: targetBranchId,
            staffId,
            salaryPeriod,
            deletedAt: null
          }
        });

        if (existingPayroll) {
          await prisma.employeeMonthlyPayroll.update({
            where: { id: existingPayroll.id },
            data: {
              baseSalary,
              allowance,
              commissionAmount,
              tipAmount,
              deductionAmount,
              finalSalary,
              status,
              paidAt: status === "PAID" ? (existingPayroll.status === "PAID" ? existingPayroll.paidAt : new Date()) : null,
              updatedAt: new Date()
            }
          });
        } else {
          await prisma.employeeMonthlyPayroll.create({
            data: {
              tenantId,
              branchId: targetBranchId,
              staffId,
              salaryPeriod,
              baseSalary,
              allowance,
              commissionAmount,
              tipAmount,
              deductionAmount,
              finalSalary,
              status,
              paidAt: status === "PAID" ? new Date() : null
            }
          });
        }

        importedCount++;
      } catch (err: any) {
        failedCount++;
        errors.push({
          row: rowNum,
          data: row,
          reason: `Lỗi hệ thống: ${err.message || err}`
        });
      }
    }

    return {
      importedCount,
      failedCount,
      errors
    };
  }
}
