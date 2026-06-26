import { ImportStrategy } from "../interfaces/import-strategy.interface";

export abstract class BaseImportStrategy implements ImportStrategy {
  abstract validate(row: any): string[];
  abstract execute(tenantId: string, branchId: string | null, data: any[]): Promise<{
    importedCount: number;
    failedCount: number;
    errors: Array<{ row: number; data: any; reason: string }>;
  }>;

  /**
   * Helper to parse and clean numbers (removes spaces, formatting characters, and maps NaN to default).
   */
  protected cleanNumber(val: any, fallback = 0): number {
    if (val === undefined || val === null || val === "") return fallback;
    if (typeof val === "number") return val;
    
    const cleaned = String(val).replace(/[^\d.-]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? fallback : parsed;
  }

  /**
   * Helper to clean strings (trim whitespace, defaults to empty string or null).
   */
  protected cleanString(val: any, fallback = ""): string {
    if (val === undefined || val === null) return fallback;
    return String(val).trim();
  }

  /**
   * Helper to validate that required fields exist and are not blank.
   */
  protected validateRequired(row: any, requiredFields: Array<{ field: string; label: string }>): string[] {
    const errors: string[] = [];
    for (const item of requiredFields) {
      const val = row[item.field];
      if (val === undefined || val === null || String(val).trim() === "") {
        errors.push(`Trường bắt buộc "${item.label}" không được để trống.`);
      }
    }
    return errors;
  }
}
