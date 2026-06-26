import { Injectable } from "@nestjs/common";
import { prisma } from "@salon/database";
import { BaseImportStrategy } from "./base-import.strategy";

@Injectable()
export class CustomerImportStrategy extends BaseImportStrategy {
  
  validate(row: any): string[] {
    const requiredFields = [
      { field: "name", label: "Tên khách hàng" }
    ];
    
    const errors = this.validateRequired(row, requiredFields);

    const email = this.cleanString(row.email);
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push("Email không đúng định dạng.");
      }
    }

    if (row.credibilityScore !== undefined && row.credibilityScore !== null && row.credibilityScore !== "") {
      const credibilityScore = this.cleanNumber(row.credibilityScore, -1);
      if (credibilityScore < 0 || credibilityScore > 100) {
        errors.push("Điểm uy tín phải nằm trong khoảng từ 0 đến 100.");
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

        const name = this.cleanString(row.name);
        const email = this.cleanString(row.email) || null;
        const phone = this.cleanString(row.phone) || null;
        const credibilityScore = this.cleanNumber(row.credibilityScore, 100);

        // 2. Try to find existing customer by phone first, then by email
        let existingCustomer = null;

        if (phone) {
          existingCustomer = await prisma.customer.findFirst({
            where: {
              tenantId,
              phone,
              deletedAt: null
            }
          });
        }

        if (!existingCustomer && email) {
          existingCustomer = await prisma.customer.findFirst({
            where: {
              tenantId,
              email,
              deletedAt: null
            }
          });
        }

        if (existingCustomer) {
          await prisma.customer.update({
            where: { id: existingCustomer.id },
            data: {
              name,
              phone: phone || existingCustomer.phone,
              email: email || existingCustomer.email,
              credibilityScore,
              updatedAt: new Date()
            }
          });
        } else {
          await prisma.customer.create({
            data: {
              tenantId,
              branchId,
              name,
              phone,
              email,
              credibilityScore
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
