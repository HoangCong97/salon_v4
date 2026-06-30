import { Injectable } from "@nestjs/common";
import { prisma } from "@salon/database";
import { BaseImportStrategy } from "./base-import.strategy";

@Injectable()
export class StaffImportStrategy extends BaseImportStrategy {
  
  validate(row: any): string[] {
    const requiredFields = [
      { field: "name", label: "Tên nhân viên" },
      { field: "loginId", label: "ID đăng nhập" }
    ];
    
    const errors = this.validateRequired(row, requiredFields);

    if (row.baseSalary !== undefined && row.baseSalary !== null && row.baseSalary !== "") {
      const baseSalary = this.cleanNumber(row.baseSalary, -1);
      if (baseSalary < 0) {
        errors.push("Lương cơ bản phải là số dương hoặc bằng 0.");
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

    // Cache roles to speed up lookup and prevent duplicate role creation
    const roleCache = new Map<string, string>();
    const existingRoles = await prisma.role.findMany({
      where: { tenantId, deletedAt: null }
    });
    for (const role of existingRoles) {
      roleCache.set(role.name.toLowerCase().trim(), role.id);
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

        const name = this.cleanString(row.name);
        const loginId = this.cleanString(row.loginId || row.email).toLowerCase();
        const email = this.cleanString(row.email) || null;
        const phone = this.cleanString(row.phone) || null;
        const sex = this.cleanString(row.sex) || "Nam";
        const baseSalary = this.cleanNumber(row.baseSalary, 0);
        const note = this.cleanString(row.note) || null;
        const avatar = this.cleanString(row.avatar) || null;
        const status = this.cleanString(row.status) || "ACTIVE";

        // 2. Resolve Role
        let roleId = row.roleId || null;
        const roleName = this.cleanString(row.roleName || row.role);

        if (!roleId && roleName) {
          const key = roleName.toLowerCase().trim();
          if (roleCache.has(key)) {
            roleId = roleCache.get(key) || null;
          } else {
            // Auto create role if it doesn't exist
            const newRole = await prisma.role.create({
              data: {
                tenantId,
                name: roleName,
                description: `Chức vụ tạo tự động khi import nhân sự`
              }
            });
            roleId = newRole.id;
            roleCache.set(key, newRole.id);
          }
        }

        // 3. Create or Update (Upsert by loginId + tenantId)
        const existingUser = await prisma.user.findFirst({
          where: {
            tenantId,
            loginId,
            deletedAt: null
          }
        });

        let userId: string;

        if (existingUser) {
          userId = existingUser.id;
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name,
              loginId,
              email: email || undefined,
              phone,
              sex,
              baseSalary,
              roleId: roleId || undefined,
              status,
              note: note || undefined,
              avatar: avatar || undefined,
              updatedAt: new Date()
            }
          });
        } else {
          // Default password to 123456
          const defaultPassword = "123456";
          const newUser = await prisma.user.create({
            data: {
              tenantId,
              name,
              loginId,
              email,
              password: defaultPassword,
              phone,
              sex,
              baseSalary,
              roleId: roleId || undefined,
              status,
              note,
              avatar
            }
          });
          userId = newUser.id;

          // Create default settings for new user
          await prisma.userSetting.create({
            data: {
              userId: newUser.id,
              theme: "light",
              language: "vi"
            }
          });
        }

        // 4. Assign to Branch if branchId is provided
        if (branchId) {
          const existingBranchAssignment = await prisma.userBranch.findFirst({
            where: {
              userId,
              branchId,
              deletedAt: null
            }
          });

          if (!existingBranchAssignment) {
            await prisma.userBranch.create({
              data: {
                userId,
                branchId
              }
            });
          }
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
