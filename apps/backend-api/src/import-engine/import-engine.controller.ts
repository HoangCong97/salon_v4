import { Controller, Post, Body, Param, Query, HttpStatus, HttpException } from "@nestjs/common";
import { ImportEngineService } from "./import-engine.service";
import { NotificationGateway } from "../notification.gateway";

@Controller("api/import")
export class ImportEngineController {
  constructor(
    private readonly importEngineService: ImportEngineService,
    private readonly notificationGateway: NotificationGateway
  ) {}

  /**
   * Endpoint to analyze file headers using DeepSeek.
   * POST /api/import/analyze
   */
  @Post("analyze")
  async analyzeHeaders(
    @Body() body: {
      fileHeaders: string[];
      sampleRows: any[][];
      targetSchema: Array<{ field: string; label: string; type: string; required: boolean; description?: string }>;
    }
  ) {
    const { fileHeaders, sampleRows, targetSchema } = body;
    if (!fileHeaders || !Array.isArray(fileHeaders)) {
      throw new HttpException("fileHeaders must be an array of strings", HttpStatus.BAD_REQUEST);
    }
    if (!targetSchema || !Array.isArray(targetSchema)) {
      throw new HttpException("targetSchema must be an array of objects", HttpStatus.BAD_REQUEST);
    }

    return await this.importEngineService.analyzeMapping(
      fileHeaders,
      sampleRows || [],
      targetSchema
    );
  }

  /**
   * Endpoint to execute data import for a specific entity.
   * POST /api/import/execute/:entity
   */
  @Post("execute/:entity")
  async executeImport(
    @Query("tenantId") tenantId: string,
    @Query("branchId") branchId: string | null,
    @Param("entity") entity: string,
    @Body() body: {
      rawData: any[];
      mappings: Record<string, string>; // File header -> Target field name
      defaultValues?: Record<string, any>;
    }
  ) {
    const { rawData, mappings, defaultValues } = body;

    if (!tenantId) {
      throw new HttpException("tenantId query parameter is required", HttpStatus.BAD_REQUEST);
    }
    if (!rawData || !Array.isArray(rawData)) {
      throw new HttpException("rawData must be an array of objects", HttpStatus.BAD_REQUEST);
    }
    if (!mappings) {
      throw new HttpException("mappings object is required", HttpStatus.BAD_REQUEST);
    }

    const strategy = this.importEngineService.getStrategy(entity);
    if (!strategy) {
      throw new HttpException(`Entity type "${entity}" is not supported for import.`, HttpStatus.NOT_FOUND);
    }

    // 1. Transform raw file data using the mappings and default values
    const transformedData = rawData.map((row) => {
      const mappedRow: Record<string, any> = {};

      // Initialize default values
      if (defaultValues) {
        for (const [key, value] of Object.entries(defaultValues)) {
          mappedRow[key] = value;
        }
      }

      // Map file headers to system target fields
      for (const [fileHeader, targetField] of Object.entries(mappings)) {
        if (targetField && row.hasOwnProperty(fileHeader)) {
          mappedRow[targetField] = row[fileHeader];
        }
      }

      return mappedRow;
    });

    // 2. Delegate data saving to the strategy and broadcast updates
    try {
      const result = await strategy.execute(tenantId, branchId || null, transformedData);

      if (result && result.importedCount > 0) {
        let event = "";
        if (entity === "service") event = "services.updated";
        else if (entity === "inventory") event = "inventories.updated";
        else if (entity === "staff") event = "staff.updated";
        else if (entity === "customer") event = "customers.updated";
        else if (entity === "payroll") event = "payrolls.updated";

        if (event) {
          this.notificationGateway.broadcastToTenant(tenantId, event, {
            branchId,
            senderId: null, // Broadcast to all clients including the sender so they update
          });
        }
      }

      return result;
    } catch (err: any) {
      throw new HttpException(
        `Import execution failed: ${err.message || err}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
