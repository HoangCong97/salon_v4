import { Module } from "@nestjs/common";
import { ImportEngineController } from "./import-engine.controller";
import { ImportEngineService } from "./import-engine.service";
import { ServiceImportStrategy } from "./strategies/service-import.strategy";
import { StaffImportStrategy } from "./strategies/staff-import.strategy";
import { CustomerImportStrategy } from "./strategies/customer-import.strategy";

@Module({
  controllers: [ImportEngineController],
  providers: [
    ImportEngineService,
    ServiceImportStrategy,
    StaffImportStrategy,
    CustomerImportStrategy
  ],
  exports: [ImportEngineService]
})
export class ImportEngineModule {}
