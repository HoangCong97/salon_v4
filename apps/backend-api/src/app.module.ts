import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SuperAdminController } from "./super-admin.controller";
import { BranchController } from "./branch.controller";
import { ServiceController } from "./service.controller";
import { InventoryController } from "./inventory.controller";
import { AuthController } from "./auth.controller";
import { ServiceCategoryController } from "./service-category.controller";

@Module({
  imports: [],
  controllers: [
    AppController, 
    SuperAdminController,
    BranchController,
    ServiceController,
    InventoryController,
    AuthController,
    ServiceCategoryController
  ],
  providers: [AppService],
})
export class AppModule {}
