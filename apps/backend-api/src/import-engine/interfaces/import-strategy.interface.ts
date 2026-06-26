export interface ImportStrategy {
  /**
   * Validates a single parsed data row according to entity schema constraints.
   * @param row The row data containing mapped target keys and parsed values.
   * @returns Array of validation error strings. Empty if row is valid.
   */
  validate(row: any): string[];

  /**
   * Executes the import operation in database (insert or upsert).
   * @param tenantId The active tenant ID.
   * @param branchId The active branch ID (optional).
   * @param data The array of validated row objects.
   * @returns Result details with counts of successfully imported records.
   */
  execute(tenantId: string, branchId: string | null, data: any[]): Promise<{
    importedCount: number;
    failedCount: number;
    errors: Array<{ row: number; data: any; reason: string }>;
  }>;
}
