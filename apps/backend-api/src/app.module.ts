import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SuperAdminController } from "./super-admin.controller";
import { BranchController } from "./branch.controller";
import { ServiceController } from "./service.controller";
import { InventoryController } from "./inventory.controller";
import { AuthController } from "./auth.controller";
import { ServiceCategoryController } from "./service-category.controller";
import { StaffController } from "./staff.controller";
import { ShiftsController } from "./shifts.controller";
import { TurnsController } from "./turns.controller";
import { InvoiceController } from "./invoice.controller";
import { TenantSubscriptionController } from "./tenant-subscription.controller";

@Module({
  imports: [],
  controllers: [
    AppController, 
    SuperAdminController,
    BranchController,
    ServiceController,
    InventoryController,
    AuthController,
    ServiceCategoryController,
    StaffController,
    ShiftsController,
    TurnsController,
    InvoiceController,
    TenantSubscriptionController
  ],
  providers: [AppService],
})
export class AppModule {}

