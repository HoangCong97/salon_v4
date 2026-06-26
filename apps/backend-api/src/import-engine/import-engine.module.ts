import { Module } from "@nestjs/common";
import { ImportEngineController } from "./import-engine.controller";
import { ImportEngineService } from "./import-engine.service";
import { ServiceImportStrategy } from "./strategies/service-import.strategy";

@Module({
  controllers: [ImportEngineController],
  providers: [
    ImportEngineService,
    ServiceImportStrategy
  ],
  exports: [ImportEngineService]
})
export class ImportEngineModule {}
