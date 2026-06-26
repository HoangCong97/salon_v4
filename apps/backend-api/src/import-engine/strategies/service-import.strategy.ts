import { Injectable } from "@nestjs/common";
import { prisma } from "@salon/database";
import { BaseImportStrategy } from "./base-import.strategy";

@Injectable()
export class ServiceImportStrategy extends BaseImportStrategy {
  
  validate(row: any): string[] {
    const requiredFields = [
      { field: "name", label: "Tên dịch vụ" },
      { field: "price", label: "Giá bán" }
    ];
    
    const errors = this.validateRequired(row, requiredFields);

    const price = this.cleanNumber(row.price, -1);
    if (price < 0) {
      errors.push("Giá bán phải là số dương hoặc bằng 0.");
    }

    if (row.discountPrice !== undefined && row.discountPrice !== null && row.discountPrice !== "") {
      const discountPrice = this.cleanNumber(row.discountPrice, -1);
      if (discountPrice < 0) {
        errors.push("Giá KM phải là số dương hoặc bằng 0.");
      }
    }

    if (row.discountAmount !== undefined && row.discountAmount !== null && row.discountAmount !== "") {
      const discountAmount = this.cleanNumber(row.discountAmount, -1);
      if (discountAmount < 0) {
        errors.push("Mức giảm giá phải là số dương hoặc bằng 0.");
      }
    }

    if (row.duration !== undefined && row.duration !== null && row.duration !== "") {
      const duration = this.cleanNumber(row.duration, -1);
      if (duration <= 0) {
        errors.push("Thời lượng phải lớn hơn 0 phút.");
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

    // Cache categories to speed up lookup and prevent duplicate category creation
    const categoryCache = new Map<string, string>();
    const existingCats = await prisma.serviceCategory.findMany({
      where: { tenantId, deletedAt: null }
    });
    for (const cat of existingCats) {
      categoryCache.set(cat.name.toLowerCase().trim(), cat.id);
    }

    // Process each row in sequence (using transaction/upsert style per row for clean error reporting)
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
        const price = this.cleanNumber(row.price);
        const duration = this.cleanNumber(row.duration, 30); // Defaults to 30 mins

        // 2. Compute discount values
        let discountAmount = 0;
        let discountPrice = price;

        if (row.discountAmount !== undefined && row.discountAmount !== null && row.discountAmount !== "") {
          discountAmount = this.cleanNumber(row.discountAmount);
          discountPrice = Math.max(0, price - discountAmount);
        } else if (row.discountPrice !== undefined && row.discountPrice !== null && row.discountPrice !== "") {
          discountPrice = this.cleanNumber(row.discountPrice);
          discountAmount = Math.max(0, price - discountPrice);
        }

        // 3. Resolve Category
        let categoryId: string | null = null;
        const categoryName = this.cleanString(row.categoryName || row.category);

        if (categoryName) {
          const key = categoryName.toLowerCase().trim();
          if (categoryCache.has(key)) {
            categoryId = categoryCache.get(key) || null;
          } else {
            // Auto create category if it doesn't exist
            const newCat = await prisma.serviceCategory.create({
              data: {
                tenantId,
                name: categoryName,
                color: "blue",
                defaultCommission: 10.0
              }
            });
            categoryId = newCat.id;
            categoryCache.set(key, newCat.id);
          }
        }

        // Determine derived category name (e.g. Cắt Tóc, Hóa Chất)
        let serviceCategory = "";
        if (categoryName) {
          if (categoryName.includes("Cắt Tóc")) {
            serviceCategory = "Cắt Tóc";
          } else if (categoryName.includes("Hóa Chất")) {
            serviceCategory = "Hóa Chất";
          } else if (categoryName.includes("Gội Đầu")) {
            serviceCategory = "Gội Đầu";
          } else {
            serviceCategory = categoryName;
          }
        }

        // 4. Create or Update (Upsert by name for this tenant and branch)
        const existingService = await prisma.service.findFirst({
          where: {
            tenantId,
            branchId,
            name,
            deletedAt: null
          }
        });

        if (existingService) {
          await prisma.service.update({
            where: { id: existingService.id },
            data: {
              categoryId: categoryId || undefined,
              serviceCategory: serviceCategory || undefined,
              price: price,
              discountPrice: discountPrice,
              discountAmount: discountAmount,
              duration: duration,
              updatedAt: new Date()
            }
          });
        } else {
          await prisma.service.create({
            data: {
              tenantId,
              branchId,
              name,
              categoryId: categoryId || undefined,
              serviceCategory: serviceCategory || undefined,
              price: price,
              discountPrice: discountPrice,
              discountAmount: discountAmount,
              duration: duration
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
