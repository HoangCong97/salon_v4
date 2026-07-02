import { Injectable } from "@nestjs/common";
import { prisma } from "@salon/database";
import { BaseImportStrategy } from "./base-import.strategy";

@Injectable()
export class InventoryImportStrategy extends BaseImportStrategy {
  
  validate(row: any): string[] {
    const requiredFields = [
      { field: "name", label: "Tên sản phẩm" },
      { field: "sellPrice", label: "Giá bán" }
    ];
    
    const errors = this.validateRequired(row, requiredFields);

    const sellPrice = this.cleanNumber(row.sellPrice, -1);
    if (sellPrice < 0) {
      errors.push("Giá bán phải là số dương hoặc bằng 0.");
    }

    if (row.costPrice !== undefined && row.costPrice !== null && row.costPrice !== "") {
      const costPrice = this.cleanNumber(row.costPrice, -1);
      if (costPrice < 0) {
        errors.push("Giá vốn phải là số dương hoặc bằng 0.");
      }
    }

    if (row.quantity !== undefined && row.quantity !== null && row.quantity !== "") {
      const quantity = this.cleanNumber(row.quantity, -1);
      if (quantity < 0) {
        errors.push("Số lượng phải là số dương hoặc bằng 0.");
      }
    }

    if (row.discountPrice !== undefined && row.discountPrice !== null && row.discountPrice !== "") {
      const discountPrice = this.cleanNumber(row.discountPrice, -1);
      if (discountPrice < 0) {
        errors.push("Giá khuyến mãi phải là số dương hoặc bằng 0.");
      }
    }

    if (row.discountAmount !== undefined && row.discountAmount !== null && row.discountAmount !== "") {
      const discountAmount = this.cleanNumber(row.discountAmount, -1);
      if (discountAmount < 0) {
        errors.push("Mức giảm giá phải là số dương hoặc bằng 0.");
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
        const costPrice = this.cleanNumber(row.costPrice, 0);
        const sellPrice = this.cleanNumber(row.sellPrice, 0);
        const quantity = this.cleanNumber(row.quantity, 0);

        // 2. Compute discount values
        let discountAmount = 0;
        if (row.discountAmount !== undefined && row.discountAmount !== null && row.discountAmount !== "") {
          discountAmount = this.cleanNumber(row.discountAmount, 0);
        } else if (row.discountPrice !== undefined && row.discountPrice !== null && row.discountPrice !== "") {
          const discountPrice = this.cleanNumber(row.discountPrice, sellPrice);
          discountAmount = Math.max(0, sellPrice - discountPrice);
        }

        // 3. Create or Update (Upsert by name for this tenant and branch)
        const existingInventory = await prisma.inventory.findFirst({
          where: {
            tenantId,
            branchId,
            name,
            deletedAt: null
          }
        });

        if (existingInventory) {
          await prisma.inventory.update({
            where: { id: existingInventory.id },
            data: {
              costPrice: costPrice,
              sellPrice: sellPrice,
              discountAmount: discountAmount,
              quantity: quantity,
              updatedAt: new Date()
            }
          });
        } else {
          await prisma.inventory.create({
            data: {
              tenantId,
              branchId,
              name,
              costPrice: costPrice,
              sellPrice: sellPrice,
              discountAmount: discountAmount,
              quantity: quantity
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
